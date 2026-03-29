const express = require('express');
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = express.Router();

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Add a comment
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ msg: 'Comment cannot be empty' });

    const user = await User.findById(req.user.id).select('name role');
    const comment = await Comment.create({
      postId: req.params.postId,
      authorId: req.user.id,
      authorName: user.name,
      authorRole: user.role,
      content: content.trim(),
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete a comment (own comment only)
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.authorId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized' });

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
