const mongoose = require('mongoose');

const AssignedActionSchema = new mongoose.Schema({
  task: { type: String, required: true },
  status: { type: String, enum: ['assigned', 'in_progress', 'completed', 'failed'], default: 'assigned' },
  assignedDate: { type: Date, default: Date.now },
  completedDate: { type: Date }
});

const RemediationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  riskScore: { type: Number, default: 0 },
  reasons: [{ type: String }],
  assignedActions: [AssignedActionSchema],
  mentorRemarks: { type: String },
  lastEvaluated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Remediation', RemediationSchema);
