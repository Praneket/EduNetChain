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

// GET /api/users/:id — public profile view (any authenticated user)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email role educationInfo professionalInfo personalInfo skills walletAddress createdAt isVerified');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
