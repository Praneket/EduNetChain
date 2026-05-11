const express  = require('express');
const bcrypt   = require('bcryptjs');
const auth     = require('../middleware/auth');
const User     = require('../models/User');
const Request  = require('../models/Request');

const router = express.Router();

function isSuperAdmin(req, res, next) {
  if (!req.user.isSuperAdmin) return res.status(403).json({ msg: 'Super admin access required' });
  next();
}

// ── POST /api/admin/create-super-admin ────────────────────────────────────────
// One-time bootstrap — protected by SUPER_ADMIN_KEY env variable
router.post('/create-super-admin', async (req, res) => {
  try {
    const { name, email, password, superAdminKey } = req.body;
    if (superAdminKey !== process.env.SUPER_ADMIN_KEY)
      return res.status(403).json({ msg: 'Invalid super admin key' });
    if (!email || !password || !name)
      return res.status(400).json({ msg: 'Name, email and password required' });

    const existing = await User.findOne({ email });
    if (existing) {
      existing.isSuperAdmin = true;
      existing.role = 'faculty';
      existing.isVerified = true;
      await existing.save();
      return res.json({ msg: 'Existing user promoted to super admin' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: 'faculty', isVerified: true, isSuperAdmin: true });
    res.json({ msg: 'Super admin created successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── POST /api/admin/super-admin-login ─────────────────────────────────────────
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, skip: () => process.env.NODE_ENV !== 'production' });

router.post('/super-admin-login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isSuperAdmin: true });
    if (!user) return res.status(400).json({ msg: 'No super admin account found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, isSuperAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, isSuperAdmin: true } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/admin/validators ─────────────────────────────────────────────────
router.get('/validators', auth, isSuperAdmin, async (req, res) => {
  try {
    const validators = await User.find({ isValidator: true })
      .select('name email role createdAt isVerified')
      .sort({ createdAt: -1 });
    res.json(validators);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── POST /api/admin/validators ────────────────────────────────────────────────
router.post('/validators', auth, isSuperAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: 'Name, email and password required' });

    const existing = await User.findOne({ email });
    if (existing) {
      existing.isValidator = true;
      if (existing.role === 'student') existing.role = 'faculty';
      existing.isVerified = true;
      await existing.save();
      return res.json({ msg: 'User promoted to validator' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: 'faculty', isVerified: true, isValidator: true });
    res.json({ msg: 'Validator created successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── DELETE /api/admin/validators/:id ─────────────────────────────────────────
router.delete('/validators/:id', auth, isSuperAdmin, async (req, res) => {
  try {
    const validator = await User.findById(req.params.id);
    if (!validator) return res.status(404).json({ msg: 'Validator not found' });
    if (validator.isSuperAdmin) return res.status(400).json({ msg: 'Cannot remove super admin' });

    validator.isValidator = false;
    await validator.save();
    res.json({ msg: 'Validator removed' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', auth, isSuperAdmin, async (req, res) => {
  try {
    const [totalStudents, verifiedStudents, pendingRequests, totalValidators, totalAlumni] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isVerified: true }),
      Request.countDocuments({ status: 'pending' }),
      User.countDocuments({ isValidator: true }),
      User.countDocuments({ role: 'alumni' }),
    ]);
    res.json({ totalStudents, verifiedStudents, pendingRequests, totalValidators, totalAlumni });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
