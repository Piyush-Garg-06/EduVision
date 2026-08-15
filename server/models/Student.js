const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  collegeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: Number, default: 1 },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cgpa: { type: Number, default: 0 },
  sgpaHistory: [
    {
      semester: { type: Number, required: true },
      sgpa: { type: Number, required: true }
    }
  ],
  skills: [
    {
      name: { type: String, required: true },
      level: { type: Number, required: true, min: 1, max: 5 },
      verified: { type: Boolean, default: false }
    }
  ],
  portfolio: {
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String },
        url: { type: String }
      }
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuer: { type: String },
        date: { type: Date }
      }
    ],
    internships: [
      {
        company: { type: String, required: true },
        role: { type: String },
        duration: { type: String }
      }
    ]
  },
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }]
  }
});

module.exports = mongoose.model('Student', StudentSchema);
