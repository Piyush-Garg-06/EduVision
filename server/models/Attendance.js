const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'excused'], required: true }
});

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  records: [AttendanceRecordSchema]
});

// Compound index for fast queries
AttendanceSchema.index({ studentId: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
