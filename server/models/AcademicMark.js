const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['internal_1', 'internal_2', 'practical', 'assignment', 'final_semester'], 
    required: true 
  },
  maxMarks: { type: Number, required: true },
  obtained: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const AcademicMarkSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  evaluations: [EvaluationSchema]
});

// Ensure a student has one marks document per course
AcademicMarkSchema.index({ studentId: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('AcademicMark', AcademicMarkSchema);
