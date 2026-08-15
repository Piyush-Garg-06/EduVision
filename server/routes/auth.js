const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password, email, role, firstName, lastName, phone, department, collegeId } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    user = new User({ username, password, email, role, firstName, lastName, phone });
    await user.save();

    // If role is student, create student profile
    if (role === 'student') {
      const student = new Student({
        userId: user._id,
        collegeId: collegeId || `C-${Math.floor(Math.random() * 90000 + 10000)}`,
        department: department || 'General Engineering',
        semester: 1,
        cgpa: 0,
        sgpaHistory: [],
        skills: [],
        portfolio: { projects: [], certifications: [], internships: [] },
        gamification: { xp: 100, level: 1, badges: ['Newbie'] }
      });
      await student.save();
    }

    // Return JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey1234',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const normalizedUsername = username.toLowerCase().trim();
    let user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey1234',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id })
        .populate('mentorId', 'firstName lastName email')
        .populate('parentId', 'firstName lastName email');
    } else if (user.role === 'parent') {
      profile = await Student.findOne({ parentId: user._id })
        .populate('userId', 'firstName lastName email')
        .populate('mentorId', 'firstName lastName email');
    }

    res.json({ user, profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
