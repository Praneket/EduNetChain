const express   = require('express');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const Joi       = require('joi');
const multer    = require('multer');
const path      = require('path');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const User      = require('../models/User');
const auth      = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { msg: 'Too many login attempts, please try again in 15 minutes.' },
});

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Use memory storage — files go to Supabase, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and images allowed'));
  },
});

async function uploadToSupabase(file) {
  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const { error } = await supabase.storage
    .from('edunetchain')
    .upload(fileName, file.buffer, { contentType: file.mimetype });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('edunetchain').getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── Validation Schemas ───────────────────────────────────────────────────────
const registerSchema = Joi.object({
  name:            Joi.string().min(2).max(100).required(),
  email:           Joi.string().email().required(),
  password:        Joi.string().min(6).max(128).required(),
  role:            Joi.string().valid('student', 'alumni', 'recruiter').default('student'),
  personalInfo:    Joi.string().optional(),
  educationInfo:   Joi.string().optional(),
  professionalInfo:Joi.string().optional(),
  skills:          Joi.string().optional(),
}).unknown(true);

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Token Helpers ────────────────────────────────────────────────────────────
function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ─── POST /register ───────────────────────────────────────────────────────────
router.post('/register', loginLimiter, upload.fields([
  { name: 'certificates', maxCount: 10 },
  { name: 'resume',       maxCount: 1  },
]), async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { name, email, password, role } = value;

    const personalInfo    = req.body.personalInfo    ? JSON.parse(req.body.personalInfo)    : {};
    const educationInfo   = req.body.educationInfo   ? JSON.parse(req.body.educationInfo)   : {};
    const professionalInfo= req.body.professionalInfo? JSON.parse(req.body.professionalInfo): {};
    const skills          = req.body.skills          ? JSON.parse(req.body.skills)          : [];

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);

    // Upload files to Supabase
    const certFiles = req.files?.certificates || [];
    const certPaths = await Promise.all(certFiles.map(f => uploadToSupabase(f)));

    const resumeFile = req.files?.resume?.[0] || null;
    const resumePath = resumeFile ? await uploadToSupabase(resumeFile) : null;

    const user = new User({
      name, email, passwordHash,
      role: role || 'student',
      personalInfo, educationInfo, professionalInfo,
      skills,
      certificates: certPaths,
      resumePath,
      isVerified: ['alumni', 'recruiter'].includes(role) ? true : false,
    });

    await user.save();
    res.status(201).json({ msg: 'Registration successful. Await admin verification.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({ msg: 'Account not verified by admin yet' });

    const payload = { id: user._id, role: user.role, email: user.email };
    const token        = signAccess(payload);
    const refreshToken = signRefresh({ id: user._id });

    user.refreshToken = await bcrypt.hash(refreshToken, 8);
    await user.save();

    res.json({
      token,
      refreshToken,
      user: { id: user._id, name: user.name, role: user.role, walletAddress: user.walletAddress },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── POST /refresh ────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) return res.status(401).json({ msg: 'Invalid refresh token' });

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) return res.status(401).json({ msg: 'Invalid refresh token' });

    const payload  = { id: user._id, role: user.role, email: user.email };
    const newToken = signAccess(payload);
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ msg: 'Refresh token expired or invalid' });
  }
});

// ─── POST /admin-login ────────────────────────────────────────────────────────
router.post('/admin-login', loginLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const admin = await User.findOne({ email: value.email, role: 'admin' });
    if (!admin) return res.status(400).json({ msg: 'No admin account found' });

    const isMatch = await bcrypt.compare(value.password, admin.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = signAccess({ id: admin._id, role: admin.role, email: admin.email });
    res.json({ token, user: { id: admin._id, name: admin.name, role: admin.role } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── POST /logout ─────────────────────────────────────────────────────────────
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -refreshToken');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── PUT /profile ─────────────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, personalInfo, educationInfo, professionalInfo, skills, projects, experience } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (!user.isVerified) {
      if (name)          user.name          = name.trim();
      if (educationInfo) user.educationInfo = { ...user.educationInfo._doc || user.educationInfo, ...educationInfo };
    }
    if (personalInfo)     user.personalInfo    = { ...user.personalInfo._doc || user.personalInfo,    ...personalInfo };
    if (professionalInfo) user.professionalInfo= { ...user.professionalInfo._doc || user.professionalInfo, ...professionalInfo };
    if (Array.isArray(skills))     user.skills     = skills.map(s => s.trim()).filter(Boolean);
    if (Array.isArray(projects))   user.projects   = projects;
    if (Array.isArray(experience)) user.experience = experience;

    await user.save();
    const updated = user.toObject();
    delete updated.passwordHash;
    delete updated.refreshToken;
    res.json({ msg: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── GET /notifications ───────────────────────────────────────────────────────
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── PUT /notifications/read ──────────────────────────────────────────────────
router.put('/notifications/read', auth, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── POST /create-admin ───────────────────────────────────────────────────────
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    let admin = await User.findOne({ email });
    if (admin) return res.status(400).json({ msg: 'Admin already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    admin = new User({ name: name || 'Admin', email, passwordHash, role: 'admin', isVerified: true });
    await admin.save();
    res.json({ msg: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
