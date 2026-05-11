const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// GET /api/users/file?url=&token= — proxy old Cloudinary files or redirect Supabase URLs
router.get('/file', (req, res, next) => {
  if (req.query.token) req.headers.authorization = `Bearer ${req.query.token}`;
  next();
}, auth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ msg: 'Missing url' });

    // Supabase URLs are public — redirect directly
    if (url.includes('supabase.co')) return res.redirect(url);

    // Cloudinary — transform to attachment download URL (bypasses untrusted restriction)
    if (url.startsWith('https://res.cloudinary.com/')) {
      const downloadUrl = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      return res.redirect(downloadUrl);
    }

    res.status(400).json({ msg: 'Invalid file URL' });
  } catch (err) {
    console.error('File proxy error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch file' });
  }
});

// GET /api/users/students — verified students list (alumni + recruiter)
router.get('/students', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    if (!['alumni', 'recruiter', 'faculty'].includes(req.user.role))
      return res.status(403).json({ msg: 'Access denied' });

    const filter = { role: 'student', isVerified: true };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      User.find(filter)
        .select('name email educationInfo skills walletAddress verificationHashes createdAt')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/users/:id — public profile view (any authenticated user)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email role educationInfo professionalInfo personalInfo skills walletAddress createdAt isVerified projects experience certificates resumePath profileViews');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    // Increment view count only when someone else views the profile
    if (req.user.id !== req.params.id) {
      await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
