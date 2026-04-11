const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// GET /api/users/file?url=... — proxy Cloudinary file to avoid untrusted customer error
router.get('/file', auth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !url.startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ msg: 'Invalid file URL' });
    }
    const response = await axios.get(url, { responseType: 'stream' });
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    response.data.pipe(res);
  } catch (err) {
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
