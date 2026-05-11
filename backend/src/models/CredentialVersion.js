const mongoose = require('mongoose');

const credentialVersionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  version:      { type: Number, required: true },
  data:         { type: mongoose.Schema.Types.Mixed },
  hash:         { type: String, required: true },
  previousHash: { type: String, default: null },
  txHash:       { type: String, default: null },
}, { timestamps: true });

credentialVersionSchema.index({ userId: 1, version: 1 });

module.exports = mongoose.model('CredentialVersion', credentialVersionSchema);
