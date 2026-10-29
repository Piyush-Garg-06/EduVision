const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const AcademicMark = require('../models/AcademicMark');
const Student = require('../models/Student');
const Remediation = require('../models/Remediation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ParentInquiry = require('../models/ParentInquiry');

// Helper function to recalculate risk scores
async function evaluateRiskForStudent(studentId) {
  try {
    const student = await Student.findOne({ userId: studentId }).populate('userId');
    if (!student) return;

    const attendance = await Attendance.find({ studentId });
    const marks = await AcademicMark.find({ studentId });

    let riskScore = 0;
    const reasons = [];

    // 1. Attendance Check
    let totalClasses = 0;
    let attendedClasses = 0;
    attendance.forEach(a => {
      a.records.forEach(r => {
        totalClasses++;
        if (r.status === 'present') attendedClasses++;
      });
    });

    const overallAttendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;
    if (overallAttendance < 75) {
      riskScore += 45;
      reasons.push(`Critical overall attendance shortage (${overallAttendance.toFixed(1)}%)`);
    } else if (overallAttendance < 85) {
      riskScore += 20;
      reasons.push(`Attendance below recommended target (${overallAttendance.toFixed(1)}%)`);
    }

    // 2. Midterm Assessment Check
    let poorGradeCount = 0;
    marks.forEach(m => {
      m.evaluations.forEach(e => {
        const pct = e.obtained / e.maxMarks;
        if (pct < 0.5 && (e.type === 'internal_1' || e.type === 'internal_2' || e.type === 'final_semester')) {
          poorGradeCount++;
        }
      });
    });

    if (poorGradeCount > 0) {
      riskScore += Math.min(poorGradeCount * 15, 35);
      reasons.push(`Underperformed in ${poorGradeCount} evaluations/exams`);
    }

    // Determine risk tier
    let riskLevel = 'low';
    if (riskScore >= 65) riskLevel = 'high';
    else if (riskScore >= 35) riskLevel = 'medium';

    // Update Remediation Log
    let remediation = await Remediation.findOne({ studentId });
    if (!remediation) {
      remediation = new Remediation({ studentId });
    }

    remediation.riskLevel = riskLevel;
    remediation.riskScore = riskScore;
    remediation.reasons = reasons;
    remediation.lastEvaluated = new Date();
    await remediation.save();

    // Trigger Notifications on High Risk changes
    if (riskLevel === 'high') {
      const msg = `Academic alert: Student ${student.userId.firstName} ${student.userId.lastName} is flagged as HIGH RISK. Score: ${riskScore.toFixed(0)}%. Reasons: ${reasons.join('; ')}`;
      
      // Notify Student
      await new Notification({ recipientId: studentId, type: 'warning', message: msg }).save();
      // Notify Parent
      if (student.parentId) {
        await new Notification({ recipientId: student.parentId, type: 'warning', message: `Parent Warning: Your ward is flagged as HIGH RISK due to: ${reasons.join(', ')}` }).save();
      }
      // Notify Mentor
      if (student.mentorId) {
        await new Notification({ recipientId: student.mentorId, type: 'warning', message: `Mentor Notice: ${student.userId.firstName} is in HIGH RISK zone.` }).save();
      }
    }
  } catch (err) {
    console.error('Error evaluating student risk status:', err);
  }
}

// @route   GET api/academic/attendance/:studentId
// @desc    Get student attendance records
router.get('/attendance/:studentId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId });
    res.json(attendance);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/academic/attendance
// @desc    Add or Update attendance log
router.post('/attendance', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  const { studentId, courseCode, courseName, records } = req.body;

  try {
    let attendance = await Attendance.findOne({ studentId, courseCode });
    if (!attendance) {
      attendance = new Attendance({ studentId, courseCode, courseName, records: [] });
    }

    // Merge or add records
    records.forEach(newRec => {
      const existingIdx = attendance.records.findIndex(
        r => new Date(r.date).toDateString() === new Date(newRec.date).toDateString()
      );
      if (existingIdx > -1) {
        attendance.records[existingIdx].status = newRec.status;
      } else {
        attendance.records.push(newRec);
      }
    });

    await attendance.save();

    // Reward XP for attending class
    const presentAdded = records.filter(r => r.status === 'present').length;
    if (presentAdded > 0) {
      const student = await Student.findOne({ userId: studentId });
      if (student) {
        student.gamification.xp += presentAdded * 10;
        student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
        
        // Add badges
        if (student.gamification.xp >= 500 && !student.gamification.badges.includes('Rising Star')) {
          student.gamification.badges.push('Rising Star');
        }
        await student.save();
      }
    }

    await evaluateRiskForStudent(studentId);
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/academic/marks/:studentId
// @desc    Get student academic marks
router.get('/marks/:studentId', auth, async (req, res) => {
  try {
    const marks = await AcademicMark.find({ studentId: req.params.studentId });
    res.json(marks);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/academic/marks
// @desc    Add or Update academic evaluation marks
router.post('/marks', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  const { studentId, courseCode, courseName, evaluations } = req.body;

  try {
    let markDoc = await AcademicMark.findOne({ studentId, courseCode });
    if (!markDoc) {
      markDoc = new AcademicMark({ studentId, courseCode, courseName, evaluations: [] });
    }

    evaluations.forEach(newEval => {
      const existingIdx = markDoc.evaluations.findIndex(e => e.type === newEval.type);
      if (existingIdx > -1) {
        markDoc.evaluations[existingIdx].obtained = newEval.obtained;
        markDoc.evaluations[existingIdx].maxMarks = newEval.maxMarks;
        markDoc.evaluations[existingIdx].date = newEval.date || new Date();
      } else {
        markDoc.evaluations.push(newEval);
      }
    });

    await markDoc.save();

    // Reward XP for passing marks
    const passedEvals = evaluations.filter(e => e.obtained / e.maxMarks >= 0.75).length;
    if (passedEvals > 0) {
      const student = await Student.findOne({ userId: studentId });
      if (student) {
        student.gamification.xp += passedEvals * 30;
        student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
        if (student.gamification.xp >= 1000 && !student.gamification.badges.includes('Scholar Badge')) {
          student.gamification.badges.push('Scholar Badge');
        }
        await student.save();
      }
    }

    await evaluateRiskForStudent(studentId);
    res.json(markDoc);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/academic/portfolio/skills
// @desc    Add/Update student skills
router.post('/portfolio/skills', auth, async (req, res) => {
  const { name, level } = req.body;
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const existingIdx = student.skills.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingIdx > -1) {
      student.skills[existingIdx].level = level;
    } else {
      student.skills.push({ name, level, verified: false });
    }

    // Award minor XP for updating skills
    student.gamification.xp += 15;
    await student.save();

    res.json(student);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/academic/portfolio/achievement
// @desc    Add project/certification/internship
router.post('/portfolio/achievement', auth, async (req, res) => {
  const { category, title, description, url, issuer, date, company, duration } = req.body;
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    if (category === 'project') {
      student.portfolio.projects.push({ title, description, url });
      student.gamification.xp += 50; // Bigger reward
    } else if (category === 'certification') {
      student.portfolio.certifications.push({ title, issuer, date: date || new Date() });
      student.gamification.xp += 75;
    } else if (category === 'internship') {
      student.portfolio.internships.push({ company, role: title, duration });
      student.gamification.xp += 100;
    }

    student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/academic/remediation/:studentId
// @desc    Get remediation details for student
router.get('/remediation/:studentId', auth, async (req, res) => {
  try {
    const remediation = await Remediation.findOne({ studentId: req.params.studentId });
    if (!remediation) {
      return res.json({ riskLevel: 'low', riskScore: 0, reasons: [], assignedActions: [] });
    }
    res.json(remediation);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/academic/remediation/action
// @desc    Assign or update task in improvement plan
router.post('/remediation/action', auth, async (req, res) => {
  const { studentId, taskId, taskText, status } = req.body;
  try {
    let remediation = await Remediation.findOne({ studentId });
    if (!remediation) {
      remediation = new Remediation({ studentId, assignedActions: [] });
    }

    if (taskId) {
      // Update existing action
      const action = remediation.assignedActions.id(taskId);
      if (action) {
        action.status = status;
        if (status === 'completed') {
          action.completedDate = new Date();
          // Reward student for completing action plan task
          const student = await Student.findOne({ userId: studentId });
          if (student) {
            student.gamification.xp += 100;
            student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
            await student.save();
          }
        }
      }
    } else if (taskText) {
      // Add new action
      remediation.assignedActions.push({ task: taskText, status: 'assigned' });
    }

    await remediation.save();
    res.json(remediation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/academic/remediation/remark
// @desc    Update mentor remarks for improvement plan
router.post('/remediation/remark', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  const { studentId, remarks } = req.body;
  try {
    let remediation = await Remediation.findOne({ studentId });
    if (!remediation) {
      remediation = new Remediation({ studentId });
    }
    remediation.mentorRemarks = remarks;
    await remediation.save();
    res.json(remediation);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/academic/notifications
// @desc    Get notification feed for user
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/academic/notifications/read/:id
// @desc    Mark notification as read
router.post('/notifications/read/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.recipientId.toString() === req.user.id) {
      notification.isRead = true;
      await notification.save();
      return res.json(notification);
    }
    res.status(404).json({ message: 'Notification not found' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/academic/notifications/read-all
// @desc    Mark all user notifications as read
router.post('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/academic/attendance/bulk
// @desc    1-Click Bulk Attendance entry for an entire class register
router.post('/attendance/bulk', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  const { courseCode, courseName, date, records } = req.body;
  // records: [ { studentId: "...", status: "present" | "absent" | "excused" } ]

  if (!courseCode || !records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Invalid payload: courseCode and records array are required' });
  }

  const attendanceDate = date ? new Date(date) : new Date();

  try {
    const results = [];
    for (const item of records) {
      const { studentId, status } = item;
      if (!studentId || !status) continue;

      let attendance = await Attendance.findOne({ studentId, courseCode });
      if (!attendance) {
        attendance = new Attendance({
          studentId,
          courseCode,
          courseName: courseName || courseCode,
          records: []
        });
      }

      // Check if entry for this date already exists
      const existingIdx = attendance.records.findIndex(
        r => new Date(r.date).toDateString() === attendanceDate.toDateString()
      );

      if (existingIdx > -1) {
        attendance.records[existingIdx].status = status;
      } else {
        attendance.records.push({ date: attendanceDate, status });
      }

      await attendance.save();

      // Award XP if present
      if (status === 'present') {
        const student = await Student.findOne({ userId: studentId });
        if (student) {
          student.gamification.xp = (student.gamification.xp || 0) + 10;
          student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
          await student.save();
        }
      }

      // Recalculate risk in background
      evaluateRiskForStudent(studentId);
      results.push({ studentId, status: 'updated' });
    }

    res.json({
      success: true,
      message: `Successfully logged attendance for ${results.length} students in ${courseCode}`,
      updatedCount: results.length
    });
  } catch (err) {
    console.error('Error in bulk attendance:', err);
    res.status(500).json({ message: 'Server error processing bulk attendance' });
  }
});

// @route   POST api/academic/marks/bulk
// @desc    1-Click Bulk Marks entry matrix for an entire class
router.post('/marks/bulk', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  const { courseCode, courseName, type, maxMarks, date, studentMarks } = req.body;
  // studentMarks: [ { studentId: "...", obtained: 18 } ]

  if (!courseCode || !type || !maxMarks || !studentMarks || !Array.isArray(studentMarks)) {
    return res.status(400).json({ message: 'Invalid payload: courseCode, type, maxMarks, studentMarks required' });
  }

  try {
    const results = [];
    for (const item of studentMarks) {
      const { studentId, obtained } = item;
      if (!studentId || obtained === undefined || obtained === null) continue;

      let markDoc = await AcademicMark.findOne({ studentId, courseCode });
      if (!markDoc) {
        markDoc = new AcademicMark({
          studentId,
          courseCode,
          courseName: courseName || courseCode,
          evaluations: []
        });
      }

      const existingIdx = markDoc.evaluations.findIndex(e => e.type === type);
      const evalData = {
        type,
        maxMarks: Number(maxMarks),
        obtained: Number(obtained),
        date: date ? new Date(date) : new Date()
      };

      if (existingIdx > -1) {
        markDoc.evaluations[existingIdx] = evalData;
      } else {
        markDoc.evaluations.push(evalData);
      }

      await markDoc.save();

      // Award XP if scored >= 75%
      if (Number(obtained) / Number(maxMarks) >= 0.75) {
        const student = await Student.findOne({ userId: studentId });
        if (student) {
          student.gamification.xp = (student.gamification.xp || 0) + 35;
          student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
          await student.save();
        }
      }

      evaluateRiskForStudent(studentId);
      results.push({ studentId, status: 'updated' });
    }

    res.json({
      success: true,
      message: `Successfully recorded ${type} marks for ${results.length} students`,
      updatedCount: results.length
    });
  } catch (err) {
    console.error('Error in bulk marks:', err);
    res.status(500).json({ message: 'Server error processing bulk marks' });
  }
});

// @route   POST api/academic/parent/inquiry
// @desc    Parent sends message or requests consultation with student's mentor
router.post('/parent/inquiry', auth, async (req, res) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ message: 'Only parents can initiate parent inquiries' });
  }

  const { subject, message, category, urgency, meetingRequested, preferredTime } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }

  try {
    const student = await Student.findOne({ parentId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'No student linked to this parent account' });
    }

    let mentorId = student.mentorId;
    if (!mentorId) {
      const fallbackFaculty = await User.findOne({ role: 'faculty' });
      if (fallbackFaculty) {
        mentorId = fallbackFaculty._id;
        student.mentorId = mentorId;
        await student.save();
      } else {
        return res.status(400).json({ message: 'No mentor faculty assigned to your ward yet' });
      }
    }

    const inquiry = new ParentInquiry({
      studentId: student.userId,
      parentId: req.user.id,
      mentorId,
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
      urgency: urgency || 'normal',
      meetingRequested: Boolean(meetingRequested),
      preferredTime: preferredTime ? preferredTime.trim() : '',
      status: 'pending'
    });

    await inquiry.save();

    // Populate for response
    await inquiry.populate('studentId', 'firstName lastName email');
    await inquiry.populate('parentId', 'firstName lastName email phone');
    await inquiry.populate('mentorId', 'firstName lastName email phone');

    // Notify mentor faculty
    const parentUser = await User.findById(req.user.id);
    const parentName = parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : 'A parent';
    const urgencyPrefix = urgency === 'urgent' ? '[URGENT] ' : '';
    await new Notification({
      recipientId: mentorId,
      type: urgency === 'urgent' ? 'alert' : 'info',
      message: `${urgencyPrefix}Parent Note: ${parentName} sent an inquiry regarding ward: "${subject}"`
    }).save();

    res.json({ success: true, inquiry });
  } catch (err) {
    console.error('Error creating parent inquiry:', err);
    res.status(500).json({ message: 'Server error creating inquiry' });
  }
});

// @route   GET api/academic/parent/inquiries
// @desc    Get parent-faculty inquiries (for Parent or Faculty)
router.get('/parent/inquiries', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'parent') {
      query = { parentId: req.user.id };
    } else if (req.user.role === 'faculty') {
      query = { mentorId: req.user.id };
    } else if (req.user.role === 'admin') {
      query = {};
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    const rawInquiries = await ParentInquiry.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('parentId', 'firstName lastName email phone')
      .populate('mentorId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    // Enhance inquiries with student profile telemetry (collegeId, department, cgpa)
    const inquiries = await Promise.all(rawInquiries.map(async (inq) => {
      const inqObj = inq.toObject();
      if (inq.studentId && inq.studentId._id) {
        const studentProfile = await Student.findOne({ userId: inq.studentId._id }).select('collegeId department semester cgpa');
        if (studentProfile) {
          inqObj.studentProfile = studentProfile;
        }
      }
      return inqObj;
    }));

    res.json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving inquiries' });
  }
});

// @route   POST api/academic/parent/inquiry/:id/reply
// @desc    Faculty replies to a parent inquiry
router.post('/parent/inquiry/:id/reply', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only faculty can reply to parent inquiries' });
  }

  const { response } = req.body;
  if (!response || !response.trim()) {
    return res.status(400).json({ message: 'Response message is required' });
  }

  try {
    const inquiry = await ParentInquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.response = response.trim();
    inquiry.status = 'responded';
    inquiry.respondedAt = new Date();
    await inquiry.save();

    await inquiry.populate('studentId', 'firstName lastName email');
    await inquiry.populate('parentId', 'firstName lastName email phone');
    await inquiry.populate('mentorId', 'firstName lastName email phone');

    // Notify parent
    const facultyUser = await User.findById(req.user.id);
    const facultyName = facultyUser ? `${facultyUser.firstName} ${facultyUser.lastName}` : 'Mentor Faculty';
    await new Notification({
      recipientId: inquiry.parentId,
      type: 'info',
      message: `Mentor Reply: ${facultyName} answered your academic inquiry: "${inquiry.subject}"`
    }).save();

    res.json({ success: true, inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error responding to inquiry' });
  }
});

// @route   POST api/academic/parent/inquiry/:id/resolve
// @desc    Mark inquiry as resolved
router.post('/parent/inquiry/:id/resolve', auth, async (req, res) => {
  try {
    const inquiry = await ParentInquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.status = 'resolved';
    await inquiry.save();
    res.json({ success: true, inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resolving inquiry' });
  }
});

// @route   DELETE api/academic/portfolio/skill/:name
// @desc    Remove skill from student portfolio
router.delete('/portfolio/skill/:name', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    student.skills = student.skills.filter(s => s.name.toLowerCase() !== decodeURIComponent(req.params.name).toLowerCase());
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error removing skill' });
  }
});

// @route   DELETE api/academic/portfolio/project/:id
// @desc    Remove project from student portfolio
router.delete('/portfolio/project/:id', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    student.portfolio.projects = student.portfolio.projects.filter(p => p._id.toString() !== req.params.id);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error removing project' });
  }
});

// @route   DELETE api/academic/portfolio/certification/:id
// @desc    Remove certification from student portfolio
router.delete('/portfolio/certification/:id', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    student.portfolio.certifications = student.portfolio.certifications.filter(c => c._id.toString() !== req.params.id);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error removing certification' });
  }
});

// @route   DELETE api/academic/portfolio/internship/:id
// @desc    Remove internship from student portfolio
router.delete('/portfolio/internship/:id', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    student.portfolio.internships = student.portfolio.internships.filter(i => i._id.toString() !== req.params.id);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error removing internship' });
  }
});

// @route   POST api/academic/study-plan/toggle-day
// @desc    Toggle completion of a daily study plan milestone & award XP
router.post('/study-plan/toggle-day', auth, async (req, res) => {
  const { dayIndex } = req.body;
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student || !student.aiStudyPlan || !student.aiStudyPlan.weeklySchedule) {
      return res.status(404).json({ message: 'No active study plan schedule' });
    }

    const item = student.aiStudyPlan.weeklySchedule[dayIndex];
    if (item) {
      item.isCompleted = !item.isCompleted;
      if (item.isCompleted) {
        student.gamification.xp = (student.gamification.xp || 0) + 40;
        student.gamification.level = Math.floor(student.gamification.xp / 500) + 1;
      }
      await student.save();
    }

    res.json(student.aiStudyPlan);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating study plan' });
  }
});

module.exports = router;
