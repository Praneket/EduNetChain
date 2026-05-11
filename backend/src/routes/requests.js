const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');
const Vote = require('../models/Vote');
const CredentialVersion = require('../models/CredentialVersion');
const { hashDataKeccak, createWallet } = require('../services/cryptoService');
const { issueCredential, storeOnChain, getVerifications } = require('../services/chainService');
const { hasMajority, isRejectedByMajority, getRequiredApprovals } = require('../services/consensusService');

const router = express.Router();

const ZERO_BYTES32 = '0x' + '0'.repeat(64);

function isValidator(req, res, next) {
  if (!req.user.isValidator) return res.status(403).json({ msg: 'Validator access required' });
  next();
}

async function notify(userId, message, type = 'info') {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: { notifications: { message, type, read: false, createdAt: new Date() } }
    });
  } catch {}
}

function buildDataHash(student) {
  const fullData = JSON.stringify({
    name:        student.name,
    email:       student.email,
    degree:      student.educationInfo?.degree,
    institution: student.educationInfo?.institution || student.educationInfo?.institute,
    branch:      student.educationInfo?.branch,
    year:        student.educationInfo?.year,
    studentId:   student.educationInfo?.studentId,
    skills:      student.skills,
  });
  return {
    dataHash:        hashDataKeccak(fullData),
    nameHash:        hashDataKeccak(student.name || ''),
    emailHash:       hashDataKeccak(student.email || ''),
    degreeHash:      hashDataKeccak(student.educationInfo?.degree || ''),
    institutionHash: hashDataKeccak(student.educationInfo?.institution || student.educationInfo?.institute || ''),
    resumeHash:      student.resumePath ? hashDataKeccak(student.resumePath) : ZERO_BYTES32,
  };
}

// ── POST /api/requests — student submits ADD request ─────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ msg: 'User not found' });
    if (student.role !== 'student') return res.status(400).json({ msg: 'Only students can submit requests' });

    const existing = await Request.findOne({ studentId: student._id, status: 'pending', type: 'ADD' });
    if (existing) return res.status(400).json({ msg: 'Pending request already exists' });

    const request = new Request({
      studentId: student._id,
      type: 'ADD',
      data: { name: student.name, email: student.email, educationInfo: student.educationInfo, skills: student.skills },
    });
    await request.save();
    res.status(201).json({ msg: 'Verification request submitted', requestId: request._id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/requests — validators see requests by status ─────────────────────
router.get('/', auth, isValidator, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const requests = await Request.find({ status })
      .populate('studentId', 'name email educationInfo skills certificates resumePath')
      .sort({ createdAt: -1 });
    const required = await getRequiredApprovals();
    res.json({ requests, requiredApprovals: required });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/requests/student-votes/:studentId — get request + votes for a student
// Used by student profile to show validator voting status
router.get('/student-votes/:studentId', auth, async (req, res) => {
  try {
    const request = await Request.findOne({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });
    if (!request) return res.json({ request: null, votes: [], requiredApprovals: 0 });

    const votes = await Vote.find({ requestId: request._id })
      .populate('validatorId', 'name role');
    const required = await getRequiredApprovals();

    res.json({ request, votes, requiredApprovals: required });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/requests/history/:userId — credential version history ────────────
// MUST be before /:id to avoid route conflict
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const versions = await CredentialVersion.find({ userId: req.params.userId })
      .sort({ version: 1 });
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/requests/tamper-check/:studentId — tamper detection against blockchain ──
router.get('/tamper-check/:studentId', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!student.isVerified || !student.verificationHashes?.length) {
      return res.json({ status: 'unverified', msg: 'No blockchain record found' });
    }

    const hashes      = buildDataHash(student);
    const currentHash = hashes.dataHash;
    const mongoHash   = student.verificationHashes.at(-1).hash;

    // Query blockchain directly as source of truth
    let blockchainHash = null;
    let blockchainMatch = false;
    try {
      const onChainHashes = await getVerifications(student.walletAddress);
      if (onChainHashes?.length > 0) {
        blockchainHash  = onChainHashes[onChainHashes.length - 1];
        blockchainMatch = currentHash === blockchainHash;
      }
    } catch (bcErr) {
      console.error('Blockchain query failed:', bcErr.message);
    }

    const mongoMatch = currentHash === mongoHash;

    let status, msg;
    if (blockchainHash) {
      if (blockchainMatch) {
        status = 'valid';
        msg    = '✅ Data matches blockchain record';
      } else if (mongoMatch && !blockchainMatch) {
        status = 'tampered';
        msg    = '⚠️ MongoDB hash matches but blockchain differs — blockchain tampered or wrong wallet';
      } else {
        status = 'tampered';
        msg    = '⚠️ Data mismatch — possible tampering detected';
      }
    } else {
      status = mongoMatch ? 'valid' : 'tampered';
      msg    = mongoMatch
        ? '✅ Data matches stored hash (blockchain unavailable)'
        : '⚠️ Data mismatch — possible tampering detected';
    }

    res.json({ status, msg, currentHash, mongoHash, blockchainHash });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── GET /api/requests/:id — get single request with votes ─────────────────────
router.get('/:id', auth, isValidator, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('studentId', 'name email educationInfo skills');
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    const votes = await Vote.find({ requestId: request._id })
      .populate('validatorId', 'name role');
    const myVote = votes.find(v => v.validatorId._id.toString() === req.user.id);

    res.json({ request, votes, myVote: myVote?.vote || null });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── POST /api/requests/:id/vote — validator casts vote ───────────────────────
router.post('/:id/vote', auth, isValidator, async (req, res) => {
  try {
    const { vote } = req.body;
    if (!['approve', 'reject'].includes(vote)) return res.status(400).json({ msg: 'Invalid vote' });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ msg: 'Request already finalized' });

    try {
      await Vote.create({ requestId: request._id, validatorId: req.user.id, vote });
    } catch (dupErr) {
      if (dupErr.code === 11000) return res.status(400).json({ msg: 'You have already voted on this request' });
      throw dupErr;
    }

    if (vote === 'approve') request.approvalCount += 1;
    else request.rejectCount += 1;

    if (await hasMajority(request.approvalCount)) {
      await finalizeApproval(request);
    } else if (await isRejectedByMajority(request.rejectCount)) {
      request.status = 'rejected';
      await request.save();
      await notify(request.studentId, '❌ Your verification request was rejected by validators.', 'error');
    } else {
      await request.save();
    }

    res.json({ msg: `Vote cast: ${vote}`, approvalCount: request.approvalCount, rejectCount: request.rejectCount, status: request.status });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ── Finalize approval: issue credential on blockchain (ADD only) ─────────────
async function finalizeApproval(request) {
  const student = await User.findById(request.studentId);
  if (!student) return;

  if (!student.walletAddress) {
    const wallet = createWallet();
    student.walletAddress = wallet.address;
  }

  const hashes = buildDataHash(student);
  const previousHash = student.verificationHashes?.at(-1)?.hash || null;

  let txHash = 'pending';
  try {
    txHash = await issueCredential(student.walletAddress, hashes);
  } catch (bcErr) {
    try { txHash = await storeOnChain(student.walletAddress, hashes.dataHash); } catch {}
  }

  const versionCount = await CredentialVersion.countDocuments({ userId: student._id });
  await CredentialVersion.create({
    userId:       student._id,
    version:      versionCount + 1,
    data:         request.data,
    hash:         hashes.dataHash,
    previousHash: previousHash,
    txHash,
  });

  student.isVerified = true;
  student.verificationHashes.push({ hash: hashes.dataHash, timestamp: new Date(), txHash });
  await student.save();

  request.status   = 'approved';
  request.txHash   = txHash;
  request.dataHash = hashes.dataHash;
  await request.save();

  await notify(student._id, '🎉 Your credentials have been verified and stored on blockchain!', 'success');
}

module.exports = router;
