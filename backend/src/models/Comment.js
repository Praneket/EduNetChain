const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['student', 'alumni'] },
  content:    { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
