const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { hashDataKeccak, hashFileKeccak, createWallet } = require('../services/cryptoService');
const { issueCredential, storeOnChain } = require('../services/chainService');
const router = express.Router();

// Helper: push in-app notification to a user
async function notify(userId, message, type = 'info') {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: { notifications: { message, type, read: false, createdAt: new Date() } }
    });
  } catch {}
}

// Only admin middleware check
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  next();
}

router.post('/approve/:verificationId', auth, isAdmin, async (req, res) => {
  try {
    const ver = await Verification.findById(req.params.verificationId);
    if (!ver) return res.status(404).json({ msg: 'Verification not found' });

    const student = await User.findById(ver.studentId);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    // Step 1: Build full credential hash + individual field hashes
    const fullData = JSON.stringify({
      name:        student.name,
      email:       student.email,
      degree:      student.educationInfo?.degree,
      institution: student.educationInfo?.institution || student.educationInfo?.institute,
      branch:      student.educationInfo?.branch,
      year:        student.educationInfo?.year,
      studentId:   student.educationInfo?.studentId,
      skills:      student.skills,
      documents:   student.documents,
    });
    const dataHash        = hashDataKeccak(fullData);
    const nameHash        = hashDataKeccak(student.name || '');
    const emailHash       = hashDataKeccak(student.email || '');
    const degreeHash      = hashDataKeccak(student.educationInfo?.degree || '');
    const institutionHash = hashDataKeccak(student.educationInfo?.institution || student.educationInfo?.institute || '');
    const resumeHash      = student.resumePath ? hashDataKeccak(student.resumePath) : ('0x' + '0'.repeat(64));
    console.log('✅ Keccak-256 hash generated:', dataHash);

    // 🪪 Step 2: Ensure student wallet exists (create if missing)
    if (!student.walletAddress) {
      const wallet = createWallet();
      student.walletAddress = wallet.address;
      console.log("🪙 New wallet created for student:", wallet.address);
    } else {
      console.log("📂 Existing wallet found:", student.walletAddress);
    }

    // Step 3: Store immutable credential on blockchain
    let txHash = 'pending';
    try {
      console.log('⛓️  Sending credential to blockchain...');
      txHash = await issueCredential(student.walletAddress, {
        dataHash, nameHash, emailHash, degreeHash, institutionHash, resumeHash
      });
      console.log('✅ Credential issued on blockchain! Tx hash:', txHash);
    } catch (bcErr) {
      // fallback to legacy storeOnChain if issueCredential fails (e.g. already issued)
      try {
        txHash = await storeOnChain(student.walletAddress, dataHash);
        console.log('✅ Fallback storeOnChain succeeded:', txHash);
      } catch (e) {
        console.error('❌ Blockchain error (continuing with DB update):', e.message);
      }
    }

    // Step 4: Update MongoDB
    student.verificationHashes.push({ hash: dataHash, timestamp: new Date(), txHash });
    await student.save();

    ver.status = 'approved';
    ver.txHash = txHash;
    ver.hash   = dataHash;
    ver.adminId = req.user.id;
    await ver.save();

    // Push in-app notification to student
    await notify(student._id, '🎉 Your credentials have been verified and stored on blockchain!', 'success');

    res.json({
      msg: '✅ Verification approved and stored on blockchain',
      txHash,
      walletAddress: student.walletAddress,
      studentId: student._id,
    });
  } catch (err) {
    console.error("❌ Error in approve route:", err);
    res.status(500).json({ err: err.message });
  }
});

// ─── Middleware: alumni or admin ─────────────────────────────────────────────
function isAlumniOrAdmin(req, res, next) {
  if (!['alumni', 'admin'].includes(req.user.role)) return res.status(403).json({ msg: 'Forbidden' });
  next();
}

// Get verified students list (alumni + admin)
router.get('/students', auth, isAlumniOrAdmin, async (req, res) => {
  try {
    const { search, degree, year, skill, role } = req.query;
    const filter = { isVerified: true };
    filter.role = ['alumni', 'recruiter'].includes(role) ? role : 'student';
    if (degree) filter['educationInfo.degree'] = new RegExp(degree, 'i');
    if (year)   filter['educationInfo.year']   = year;
    if (skill)  filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (search) filter.$or = [
      { name:  new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { 'professionalInfo.currentCompany': new RegExp(search, 'i') },
    ];
    const users = await User.find(filter)
      .select('name email educationInfo professionalInfo skills walletAddress createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all pending students (not yet verified)
router.get("/pending-students", auth, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: "student", isVerified: false });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.put("/verify-student/:id", auth, isAdmin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    student.isVerified = true;

    // Create wallet if missing
    if (!student.walletAddress) {
      const wallet = createWallet();
      student.walletAddress = wallet.address;
    }

    // Issue immutable credential on blockchain
    const fullData = JSON.stringify({
      name: student.name, email: student.email,
      degree: student.educationInfo?.degree,
      institution: student.educationInfo?.institution || student.educationInfo?.institute,
      branch: student.educationInfo?.branch,
      year: student.educationInfo?.year,
      studentId: student.educationInfo?.studentId,
      skills: student.skills,
    });
    const dataHash        = hashDataKeccak(fullData);
    const nameHash        = hashDataKeccak(student.name || '');
    const emailHash       = hashDataKeccak(student.email || '');
    const degreeHash      = hashDataKeccak(student.educationInfo?.degree || '');
    const institutionHash = hashDataKeccak(student.educationInfo?.institution || student.educationInfo?.institute || '');
    const resumeHash      = student.resumePath ? hashDataKeccak(student.resumePath) : ('0x' + '0'.repeat(64));

    let txHash = 'pending';
    try {
      txHash = await issueCredential(student.walletAddress, {
        dataHash, nameHash, emailHash, degreeHash, institutionHash, resumeHash
      });
    } catch (bcErr) {
      try { txHash = await storeOnChain(student.walletAddress, dataHash); } catch {}
    }

    student.verificationHashes.push({ hash: dataHash, timestamp: new Date(), txHash });
    await student.save();

    await notify(student._id, '✅ Your credentials have been verified and stored on blockchain!', 'success');
    res.json({ msg: "Student verified and credential issued on blockchain", txHash });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Reject student registration
router.put("/reject-student/:id", auth, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Delete the student record or mark as rejected
    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: "Student rejected", reason });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
