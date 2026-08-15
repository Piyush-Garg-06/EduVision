const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const AcademicMark = require('../models/AcademicMark');
const Student = require('../models/Student');
const Remediation = require('../models/Remediation');
const Notification = require('../models/Notification');
const User = require('../models/User');

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

module.exports = router;
