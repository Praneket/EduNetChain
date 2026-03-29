const mongoose = require('mongoose');
const VerificationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hash: String,
  txHash: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Verification', VerificationSchema);
