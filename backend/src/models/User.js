const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, unique: true, lowercase: true, trim: true },
  passwordHash: String,
  role:         { type: String, enum: ['student', 'alumni', 'admin', 'recruiter'], default: 'student' },

  // ── Personal Info ──────────────────────────────────────────────────────────
  personalInfo: {
    phone:   String,
    address: String,
    dob:     String,
    gender:  String,
    linkedin: String,
    github:   String,
    bio:      String,
  },

  // ── Education Info ─────────────────────────────────────────────────────────
  educationInfo: {
    institute:   String,
    institution: String,
    degree:      String,
    branch:      String,
    year:        String,
    cgpa:        String,
    studentId:   String,
  },

  // ── Professional Info (alumni / recruiter) ─────────────────────────────────
  professionalInfo: {
    currentCompany:   String,
    currentPosition:  String,
    experience:       String,
    linkedIn:         String,
    companyWebsite:   String,  // recruiter
    industry:         String,  // recruiter
  },

  // ── Skills (student / alumni) ──────────────────────────────────────────────
  skills: [{ type: String, trim: true }],

  // ── Projects ───────────────────────────────────────────────────────────────
  projects: [{
    title:       String,
    description: String,
    techStack:   String,
    link:        String,
    year:        String,
  }],

  // ── Experience ────────────────────────────────────────────────────────────
  experience: [{
    company:   String,
    role:      String,
    duration:  String,
    description: String,
  }],

  // ── Documents ─────────────────────────────────────────────────────────────
  certificates: [String],
  resumePath:   String,
  documents: [{
    filename: String,
    ipfsCid:  String,
    path:     String,
  }],

  // ── Verification ──────────────────────────────────────────────────────────
  isVerified:   { type: Boolean, default: false },
  walletAddress: String,
  verificationHashes: [{
    hash:      String,
    timestamp: Date,
    txHash:    String,
  }],

  // ── NFT Certificate ───────────────────────────────────────────────────────
  nftTokenId:  String,
  nftTxHash:   String,

  // ── Auth ──────────────────────────────────────────────────────────────────
  refreshToken: String,

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: [{
    message:   String,
    type:      { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],

}, { timestamps: true });

// Index for fast lookups (email index is implicit from unique:true)
userSchema.index({ role: 1, isVerified: 1 });
userSchema.index({ skills: 1 });

module.exports = mongoose.model('User', userSchema);
