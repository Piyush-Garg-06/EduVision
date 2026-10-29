const mongoose = require('mongoose');
require('./User');

const ParentInquirySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['academic_marks', 'attendance', 'counseling', 'meeting_request', 'general'], 
    default: 'general' 
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  meetingRequested: { type: Boolean, default: false },
  preferredTime: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'responded', 'resolved'], default: 'pending' },
  response: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
});

module.exports = mongoose.model('ParentInquiry', ParentInquirySchema);
