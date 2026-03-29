const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const { hashDataKeccak } = require('../services/cryptoService');
const { storePostHashOnChain } = require('../services/chainService');
const router = express.Router();

// Get all posts (with filters)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    
    const posts = await Post.find(filter)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Create post (alumni only)
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'alumni')
      return res.status(403).json({ msg: 'Only alumni can create posts' });

    const post = new Post({
      ...req.body,
      authorId: req.user.id,
      authorName: user.name,
      authorCompany: user.professionalInfo?.currentCompany,
    });
    await post.save();

    // Store post integrity hash on blockchain (non-blocking)
    try {
      const postData = JSON.stringify({ id: post._id, title: post.title, author: req.user.id });
      const postHash = hashDataKeccak(postData);
      const txHash = await storePostHashOnChain(postHash);
      post.blockchainHash = postHash;
      post.blockchainTx = txHash;
      await post.save();
    } catch (bcErr) {
      console.warn('Blockchain post hash skipped:', bcErr.message);
    }

    res.json({ msg: 'Post created successfully', post });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Apply for job/referral
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const user = await User.findById(req.user.id);
    
    // Check if already applied
    const alreadyApplied = post.applications.some(
      app => app.studentId.toString() === req.user.id
    );
    if (alreadyApplied) {
      return res.status(400).json({ msg: 'Already applied' });
    }

    post.applications.push({
      studentId: req.user.id,
      studentName: user.name,
      studentEmail: user.email
    });

    await post.save();
    res.json({ msg: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get my posts (alumni)
router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get posts the current student has applied to
router.get('/my-applications', auth, async (req, res) => {
  try {
    const posts = await Post.find({ 'applications.studentId': req.user.id })
      .select('title company location jobType type authorName authorCompany createdAt applications')
      .sort({ createdAt: -1 });
    const result = posts.map(p => {
      const app = p.applications.find(a => a.studentId.toString() === req.user.id);
      return {
        _id: p._id,
        title: p.title,
        company: p.company,
        location: p.location,
        jobType: p.jobType,
        type: p.type,
        authorName: p.authorName,
        authorCompany: p.authorCompany,
        appliedAt: app?.appliedAt,
        status: app?.status || 'pending',
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get applicants for a post (alumni only, must be post owner)
router.get('/:id/applicants', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('applications.studentId', 'name email educationInfo personalInfo');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.authorId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized' });
    res.json(post.applications);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update applicant status (accept/reject) — alumni post owner only
router.put('/:id/applicants/:appId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status))
      return res.status(400).json({ msg: 'Status must be accepted or rejected' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.authorId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized' });

    const app = post.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ msg: 'Application not found' });

    app.status = status;
    await post.save();
    res.json({ msg: `Application ${status}` });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
