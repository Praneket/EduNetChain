const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { uploadToIPFS } = require('../services/ipfs');
const { verifyHash } = require('../services/chainService');
const router = express.Router();

// ensure upload folder exists
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

// Student uploads documents
router.post('/upload', auth, upload.array('docs', 5), async (req, res) => {
  try {
    console.log("UPLOAD route hit");
    console.log("req.files:", req.files);

    const files = req.files || [];
    const ipfsItems = [];

    for (const f of files) {
      const ipfs = await uploadToIPFS(f.path, f.originalname);
      ipfsItems.push({
        filename: f.originalname,
        ipfsCid: ipfs.cid,
        path: ipfs.path || f.path
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.documents.push(...ipfsItems);
    await user.save();

    console.log("UPLOAD success for", user.email);
    res.json({ msg: 'Uploaded', docs: ipfsItems });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Request verification by admin (creates verification entry)
router.post('/request/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const v = new Verification({ studentId, status: 'pending' });
    await v.save();
    res.json({ msg: 'Verification requested', verification: v });
  } catch (err) {
    console.error("REQUEST ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
);
// Admin fetches all verification requests
router.get('/requests', auth, async (req, res) => {
  try {
    const list = await Verification.find()
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("GET REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// Public credential verification endpoint
router.get('/check', async (req, res) => {
  try {
    const { wallet, hash } = req.query;
    if (!wallet || !hash) return res.status(400).json({ msg: 'wallet and hash are required' });

    const verified = await verifyHash(wallet, hash);
    res.json({ verified });
  } catch (err) {
    console.error('VERIFY CHECK ERROR:', err);
    res.status(500).json({ verified: false, msg: 'Blockchain query failed. Ensure node is running.' });
  }
});

module.exports = router;
