const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const Post = require('../models/Post');
const router = express.Router();

// Helper: check if sender is allowed to message receiver
async function canMessage(senderId, senderRole, receiverId, receiverRole) {
  // Alumni ↔ Alumni: always allowed
  if (senderRole === 'alumni' && receiverRole === 'alumni') return true;
  // Student ↔ Student: allowed (both verified on platform)
  if (senderRole === 'student' && receiverRole === 'student') return true;

  // Student → Alumni: only if alumni accepted the student on any post
  if (senderRole === 'student' && receiverRole === 'alumni') {
    const accepted = await Post.findOne({
      authorId: receiverId,
      'applications.studentId': senderId,
      'applications.status': 'accepted',
    });
    return !!accepted;
  }

  // Alumni → Student: only if alumni accepted that student on any of their posts
  if (senderRole === 'alumni' && receiverRole === 'student') {
    const accepted = await Post.findOne({
      authorId: senderId,
      'applications.studentId': receiverId,
      'applications.status': 'accepted',
    });
    return !!accepted;
  }

  return false;
}

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim())
      return res.status(400).json({ msg: 'Receiver and content are required' });

    const receiver = await User.findById(receiverId).select('role');
    if (!receiver) return res.status(404).json({ msg: 'Receiver not found' });

    const allowed = await canMessage(req.user.id, req.user.role, receiverId, receiver.role);
    if (!allowed)
      return res.status(403).json({ msg: 'You can only message alumni who have accepted your application.' });

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content: content.trim(),
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get conversation between current user and another user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get inbox — list of unique people the current user has chatted with
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    }).sort({ createdAt: -1 });

    // Build unique conversation list
    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const otherId = msg.senderId.toString() === req.user.id
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      if (!seen.has(otherId)) {
        seen.add(otherId);
        const other = await User.findById(otherId).select('name role professionalInfo');
        const unread = await Message.countDocuments({
          senderId: otherId,
          receiverId: req.user.id,
          isRead: false,
        });
        conversations.push({
          userId: otherId,
          name: other?.name,
          role: other?.role,
          company: other?.professionalInfo?.currentCompany,
          position: other?.professionalInfo?.currentPosition,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unread,
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Check if current user can message another user
router.get('/can-message/:userId', auth, async (req, res) => {
  try {
    const receiver = await User.findById(req.params.userId).select('role');
    if (!receiver) return res.status(404).json({ allowed: false });
    const allowed = await canMessage(req.user.id, req.user.role, req.params.userId, receiver.role);
    res.json({ allowed });
  } catch (err) {
    res.status(500).json({ allowed: false });
  }
});

// Get alumni the current student is allowed to message (accepted applicants only)
router.get('/alumni-list', auth, async (req, res) => {
  try {
    const { search } = req.query;

    // For students: only alumni who accepted them
    if (req.user.role === 'student') {
      const acceptedPosts = await Post.find({
        'applications.studentId': req.user.id,
        'applications.status': 'accepted',
      }).select('authorId');

      const alumniIds = [...new Set(acceptedPosts.map(p => p.authorId.toString()))];
      if (alumniIds.length === 0) return res.json([]);

      const filter = { _id: { $in: alumniIds } };
      if (search) filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'professionalInfo.currentCompany': new RegExp(search, 'i') },
      ];
      const alumni = await User.find(filter).select('name email professionalInfo educationInfo');
      return res.json(alumni);
    }

    // For alumni/admin: return all verified alumni
    const filter = { role: 'alumni', isVerified: true };
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { 'professionalInfo.currentCompany': new RegExp(search, 'i') },
    ];
    const alumni = await User.find(filter).select('name email professionalInfo educationInfo');
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
