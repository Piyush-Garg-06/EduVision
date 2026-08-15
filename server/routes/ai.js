const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const groqService = require('../services/groqService');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const AcademicMark = require('../models/AcademicMark');
const Remediation = require('../models/Remediation');

// @route   POST api/ai/action-plan
// @desc    Generate an AI recovery plan via Groq
// @access  Private (Student, Faculty, or Admin)
router.post('/action-plan', auth, async (req, res) => {
  const { studentId } = req.body;
  const targetId = studentId || req.user.id; // Default to self

  try {
    const student = await Student.findOne({ userId: targetId }).populate('userId', 'firstName lastName email');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ studentId: targetId });
    const marks = await AcademicMark.find({ studentId: targetId });

    // Call Groq AI service
    const plan = await groqService.generateActionPlan(student, attendance, marks);

    // Save generated actions directly to the student's remediation log
    let remediation = await Remediation.findOne({ studentId: targetId });
    if (!remediation) {
      remediation = new Remediation({ studentId: targetId });
    }

    // Overwrite previous AI suggestions with new ones, keeping custom tasks if any
    const customTasks = remediation.assignedActions.filter(a => !a.task.startsWith('[AI]'));
    
    const newAiTasks = (plan.actions || []).map(action => ({
      task: `[AI] ${action.task}: ${action.reason} (${action.priority.toUpperCase()})`,
      status: 'assigned',
      assignedDate: new Date()
    }));

    remediation.assignedActions = [...customTasks, ...newAiTasks];
    remediation.mentorRemarks = `AI generated recovery plan updated. Recommendation summary: ${plan.summary}`;
    await remediation.save();

    res.json({
      plan,
      remediation
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error generating AI action plan');
  }
});

// @route   POST api/ai/skill-gap
// @desc    Perform Career Role Skill Gap analysis
// @access  Private (Student)
router.post('/skill-gap', auth, async (req, res) => {
  const { targetRole } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const currentSkills = student.skills || [];
    
    // Call Groq AI service
    const analysis = await groqService.analyzeSkillGap(targetRole, currentSkills);

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error generating skill gap report');
  }
});

// @route   POST api/ai/chat
// @desc    Converse with AI Counselor about a student's profile context
// @access  Private
router.post('/chat', auth, async (req, res) => {
  const { studentId, message, chatHistory } = req.body;
  const targetId = studentId || req.user.id;

  try {
    const student = await Student.findOne({ userId: targetId }).populate('userId', 'firstName lastName email');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const [attendance, marks, remediation] = await Promise.all([
      Attendance.find({ studentId: targetId }),
      AcademicMark.find({ studentId: targetId }),
      Remediation.findOne({ studentId: targetId })
    ]);

    const { response, isAiPowered } = await groqService.chatWithAi(
      student,
      attendance,
      marks,
      remediation,
      message,
      chatHistory
    );

    res.json({ response, isAiPowered });
  } catch (err) {
    console.error('Error in AI Chat route:', err);
    res.status(500).send('Server Error in AI Counselor Chat');
  }
});

module.exports = router;
