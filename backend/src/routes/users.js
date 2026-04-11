const express = require('express');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/users/file?url=&token= — generate signed Cloudinary URL and redirect
router.get('/file', (req, res, next) => {
  if (req.query.token) req.headers.authorization = `Bearer ${req.query.token}`;
  next();
}, auth, (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !url.startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ msg: 'Invalid file URL' });
    }
    // Extract public_id: everything after /upload/v123/ or /upload/
    const match = url.match(/\/(?:raw|image|video)\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return res.status(400).json({ msg: 'Cannot parse Cloudinary URL' });

    const publicId = match[1].replace(/\.[^/.]+$/, ''); // strip extension
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300, // 5 min expiry
    });
    res.redirect(signedUrl);
  } catch (err) {
    console.error('File proxy error:', err.message);
    res.status(500).json({ msg: 'Failed to generate file URL' });
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
