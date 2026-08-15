const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const AcademicMark = require('../models/AcademicMark');
const Remediation = require('../models/Remediation');
const User = require('../models/User');

// @route   GET api/analytics/admin
// @desc    Get system-wide analytics for college administrator
// @access  Private (Admin only)
router.get('/admin', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  try {
    const totalStudents = await Student.countDocuments();
    const students = await Student.find().populate('userId', 'firstName lastName email');
    const remediations = await Remediation.find();

    // 1. Calculate Average CGPA
    let sumCGPA = 0;
    students.forEach(s => { sumCGPA += s.cgpa || 0; });
    const avgCGPA = totalStudents > 0 ? (sumCGPA / totalStudents) : 0;

    // 2. High-Risk Student Count & List
    const highRiskRem = remediations.filter(r => r.riskLevel === 'high');
    const highRiskCount = highRiskRem.length;

    // Get details of high risk students
    const highRiskList = [];
    for (const hr of highRiskRem) {
      const stud = students.find(s => s.userId._id.toString() === hr.studentId.toString());
      if (stud) {
        highRiskList.push({
          studentId: hr.studentId,
          name: `${stud.userId.firstName} ${stud.userId.lastName}`,
          collegeId: stud.collegeId,
          cgpa: stud.cgpa,
          riskScore: hr.riskScore,
          reasons: hr.reasons
        });
      }
    }

    // 3. Average Attendance
    const allAttendance = await Attendance.find();
    let totalClasses = 0;
    let attendedClasses = 0;
    let belowThresholdCount = 0;

    // Map to count attendance per student
    const studentAttendancePct = {};
    allAttendance.forEach(att => {
      const studentId = att.studentId.toString();
      if (!studentAttendancePct[studentId]) {
        studentAttendancePct[studentId] = { present: 0, total: 0 };
      }
      
      att.records.forEach(r => {
        totalClasses++;
        studentAttendancePct[studentId].total++;
        if (r.status === 'present') {
          attendedClasses++;
          studentAttendancePct[studentId].present++;
        }
      });
    });

    Object.keys(studentAttendancePct).forEach(sId => {
      const data = studentAttendancePct[sId];
      const pct = data.total > 0 ? (data.present / data.total) * 100 : 100;
      if (pct < 75) belowThresholdCount++;
    });

    const avgAttendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

    // 4. Department Performance Breakdown
    const deptStats = {};
    students.forEach(s => {
      const dept = s.department || 'Other';
      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, cgpaSum: 0 };
      }
      deptStats[dept].total++;
      deptStats[dept].cgpaSum += s.cgpa || 0;
    });

    const departmentBreakdown = Object.keys(deptStats).map(dept => ({
      department: dept,
      averageCgpa: (deptStats[dept].cgpaSum / deptStats[dept].total).toFixed(2),
      studentCount: deptStats[dept].total
    }));

    // 5. Subject Performance Analysis (identifying tough subjects)
    const allMarks = await AcademicMark.find();
    const subjectStats = {};

    allMarks.forEach(m => {
      if (!subjectStats[m.courseCode]) {
        subjectStats[m.courseCode] = { name: m.courseName, sumPct: 0, count: 0, failureCount: 0 };
      }
      m.evaluations.forEach(e => {
        if (e.type === 'final_semester' || e.type === 'internal_1' || e.type === 'internal_2') {
          const pct = e.obtained / e.maxMarks;
          subjectStats[m.courseCode].sumPct += pct;
          subjectStats[m.courseCode].count++;
          if (pct < 0.5) {
            subjectStats[m.courseCode].failureCount++;
          }
        }
      });
    });

    const subjectPerformance = Object.keys(subjectStats).map(code => {
      const item = subjectStats[code];
      const avgGrade = item.count > 0 ? (item.sumPct / item.count) * 100 : 100;
      const failureRate = item.count > 0 ? (item.failureCount / item.count) * 100 : 0;
      return {
        courseCode: code,
        courseName: item.name,
        averageGrade: avgGrade.toFixed(1),
        failureRate: failureRate.toFixed(1)
      };
    }).sort((a, b) => parseFloat(b.failureRate) - parseFloat(a.failureRate)); // worst subjects first

    // 6. Skill Distribution Analysis
    const skillCounts = {};
    students.forEach(s => {
      (s.skills || []).forEach(sk => {
        const name = sk.name;
        skillCounts[name] = (skillCounts[name] || 0) + 1;
      });
    });

    const skillDistribution = Object.keys(skillCounts).map(name => ({
      name,
      count: skillCounts[name]
    })).sort((a, b) => b.count - a.count).slice(0, 10); // top 10 skills

    res.json({
      totalStudents,
      avgCGPA: avgCGPA.toFixed(2),
      avgAttendance: avgAttendance.toFixed(1),
      belowThresholdCount,
      highRiskCount,
      highRiskList,
      departmentBreakdown,
      subjectPerformance,
      skillDistribution
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/faculty
// @desc    Get dashboard analytics for Faculty/Mentors
// @access  Private (Faculty or Admin only)
router.get('/faculty', auth, async (req, res) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized role' });
  }

  try {
    // Find all students assigned to this mentor
    const students = await Student.find({ mentorId: req.user.id }).populate('userId', 'firstName lastName email');
    const studentIds = students.map(s => s.userId._id);

    const remediations = await Remediation.find({ studentId: { $in: studentIds } });
    const attendanceLogs = await Attendance.find({ studentId: { $in: studentIds } });
    const markLogs = await AcademicMark.find({ studentId: { $in: studentIds } });

    const studentSummary = [];

    for (const stud of students) {
      const rem = remediations.find(r => r.studentId.toString() === stud.userId._id.toString());
      const sAtt = attendanceLogs.filter(a => a.studentId.toString() === stud.userId._id.toString());
      const sMarks = markLogs.filter(m => m.studentId.toString() === stud.userId._id.toString());

      // Calculate attendance percentage
      let total = 0;
      let present = 0;
      sAtt.forEach(a => {
        a.records.forEach(r => {
          total++;
          if (r.status === 'present') present++;
        });
      });
      const attendancePct = total > 0 ? (present / total) * 100 : 100;

      // Extract active failing subjects
      const weakSubjects = [];
      sMarks.forEach(m => {
        m.evaluations.forEach(e => {
          if (e.obtained / e.maxMarks < 0.5) {
            weakSubjects.push(m.courseName);
          }
        });
      });

      studentSummary.push({
        studentId: stud.userId._id,
        name: `${stud.userId.firstName} ${stud.userId.lastName}`,
        collegeId: stud.collegeId,
        semester: stud.semester,
        cgpa: stud.cgpa,
        attendance: attendancePct.toFixed(1),
        riskLevel: rem ? rem.riskLevel : 'low',
        riskScore: rem ? rem.riskScore : 0,
        weakSubjects: [...new Set(weakSubjects)],
        remediationStatus: rem && rem.assignedActions.length > 0
          ? `${rem.assignedActions.filter(a => a.status === 'completed').length}/${rem.assignedActions.length} Completed`
          : 'None assigned'
      });
    }

    res.json({
      mentoredCount: students.length,
      highRiskCount: studentSummary.filter(s => s.riskLevel === 'high').length,
      averageAttendance: (studentSummary.reduce((acc, curr) => acc + parseFloat(curr.attendance), 0) / (students.length || 1)).toFixed(1),
      students: studentSummary
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
