const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, enum: ['ADD'], default: 'ADD' },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  data:          { type: mongoose.Schema.Types.Mixed },
  approvalCount: { type: Number, default: 0 },
  rejectCount:   { type: Number, default: 0 },
  // Blockchain result (filled after consensus approval)
  txHash:        { type: String, default: null },
  dataHash:      { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
