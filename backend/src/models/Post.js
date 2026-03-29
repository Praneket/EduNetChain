const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  authorCompany: String,
  
  type: { 
    type: String, 
    enum: ['job', 'referral', 'tip'], 
    required: true 
  },
  
  // Job/Referral fields
  title: String,
  company: String,
  location: String,
  jobType: String, // Full-time, Internship, Contract
  description: String,
  requirements: String,
  applyLink: String,
  
  // Tip fields
  tipCategory: String, // Technical, HR, Behavioral
  content: String,
  
  // Common
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applications: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    studentEmail: String,
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  }],
  
  isActive: { type: Boolean, default: true },
  blockchainHash: { type: String, default: null },
  blockchainTx:   { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
