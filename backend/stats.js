require('dotenv').config();
process.on('uncaughtException', e => { console.error('ERR:', e.message); process.exit(1); });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User             = require('./src/models/User');
  const Request          = require('./src/models/Request');
  const Vote             = require('./src/models/Vote');
  const CredentialVersion= require('./src/models/CredentialVersion');
  const Post             = require('./src/models/Post');
  const Message          = require('./src/models/Message');
  const Comment          = require('./src/models/Comment');

  const allStudents      = await User.find({ role: 'student' }).select('isVerified skills verificationHashes walletAddress createdAt');
  const verifiedStudents = allStudents.filter(s => s.isVerified);
  const votes            = await Vote.find().select('vote');
  const posts            = await Post.find().select('type applications likes blockchainTx');
  const versions         = await CredentialVersion.find().select('txHash hash previousHash version');
  const messages         = await Message.countDocuments();
  const comments         = await Comment.countDocuments();

  const approveVotes     = votes.filter(v => v.vote === 'approve').length;
  const rejectVotes      = votes.filter(v => v.vote === 'reject').length;
  const jobPosts         = posts.filter(p => p.type === 'job').length;
  const referralPosts    = posts.filter(p => p.type === 'referral').length;
  const tipPosts         = posts.filter(p => p.type === 'tip').length;
  const totalApplications= posts.reduce((a, p) => a + (p.applications || []).length, 0);
  const totalLikes       = posts.reduce((a, p) => a + (p.likes || []).length, 0);
  const postsWithBcHash  = posts.filter(p => p.blockchainTx).length;
  const skillsAll        = verifiedStudents.flatMap(s => s.skills || []);
  const uniqueSkills     = [...new Set(skillsAll.map(s => s.toLowerCase()))];
  const totalHashes      = verifiedStudents.reduce((a, s) => a + (s.verificationHashes || []).length, 0);
  const withWallet       = allStudents.filter(s => s.walletAddress).length;
  const versTxReal       = versions.filter(v => v.txHash && v.txHash !== 'pending').length;

  const result = {
    users: {
      totalStudents:      allStudents.length,
      verifiedStudents:   verifiedStudents.length,
      unverifiedStudents: allStudents.length - verifiedStudents.length,
      verificationRate:   ((verifiedStudents.length / allStudents.length) * 100).toFixed(1) + '%',
      studentsWithWallet: withWallet,
      totalHashesInDB:    totalHashes,
    },
    consensus: {
      totalVotes:    votes.length,
      approveVotes,
      rejectVotes,
    },
    blockchain: {
      credentialVersions:       versions.length,
      versionsWithRealTxHash:   versTxReal,
      sampleTxHash:             versions[0] ? versions[0].txHash : 'none',
      postsWithBlockchainHash:  postsWithBcHash,
    },
    community: {
      totalPosts: posts.length,
      jobPosts, referralPosts, tipPosts,
      totalApplications,
      totalLikes,
      totalMessages: messages,
      totalComments: comments,
    },
    skills: {
      uniqueSkillsAcrossStudents: uniqueSkills.length,
      avgSkillsPerVerifiedStudent: verifiedStudents.length
        ? (skillsAll.length / verifiedStudents.length).toFixed(1)
        : 0,
    },
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
