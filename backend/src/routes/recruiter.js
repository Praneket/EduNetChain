const express = require('express');
const auth    = require('../middleware/auth');
const User    = require('../models/User');
const router  = express.Router();

function isRecruiterOrAdmin(req, res, next) {
  if (!['recruiter', 'admin'].includes(req.user.role))
    return res.status(403).json({ msg: 'Recruiter or Admin access required' });
  next();
}

// ─── GET /recruiter/students ──────────────────────────────────────────────────
// Search verified students with optional filters
router.get('/students', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { skill, degree, year, name, page = 1, limit = 20 } = req.query;

    const filter = { role: 'student', isVerified: true };

    if (name)   filter.name = { $regex: name, $options: 'i' };
    if (degree) filter['educationInfo.degree'] = { $regex: degree, $options: 'i' };
    if (year)   filter['educationInfo.year']   = year;
    if (skill)  filter.skills = { $in: [new RegExp(skill, 'i')] };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .select('name email educationInfo skills walletAddress verificationHashes nftTokenId createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ students, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── GET /recruiter/students/:id ──────────────────────────────────────────────
// View a single student's full verified profile
router.get('/students/:id', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student', isVerified: true })
      .select('-passwordHash -refreshToken -notifications');
    if (!student) return res.status(404).json({ msg: 'Student not found or not verified' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── GET /recruiter/verify/:walletAddress ─────────────────────────────────────
// Quick blockchain verification check by wallet
router.get('/verify/:walletAddress', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const student = await User.findOne({ walletAddress: req.params.walletAddress, isVerified: true })
      .select('name email educationInfo walletAddress verificationHashes nftTokenId');
    if (!student) return res.status(404).json({ msg: 'No verified student found for this wallet' });
    res.json({
      verified: student.verificationHashes?.length > 0,
      student,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
