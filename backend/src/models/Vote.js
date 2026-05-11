const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  requestId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  validatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vote:        { type: String, enum: ['approve', 'reject'], required: true },
}, { timestamps: true });

// One vote per validator per request
voteSchema.index({ requestId: 1, validatorId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
