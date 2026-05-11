const express = require('express');
const auth    = require('../middleware/auth');
const User    = require('../models/User');
const Post    = require('../models/Post');
const router  = express.Router();

// ─── Skill Gap Detection ──────────────────────────────────────────────────────
// Compares student skills against job requirements and returns missing skills
router.get('/skill-gap', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skills educationInfo');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const studentSkills = (user.skills || []).map(s => s.toLowerCase());

    // Fetch active job posts and extract requirements
    const jobs = await Post.find({ type: { $in: ['job', 'referral'] }, isActive: true })
      .select('title company requirements description')
      .limit(50);

    // Extract skill keywords from job requirements
    const COMMON_SKILLS = [
      'javascript', 'python', 'java', 'react', 'node.js', 'nodejs', 'sql', 'mongodb',
      'aws', 'docker', 'git', 'typescript', 'html', 'css', 'express', 'rest api',
      'machine learning', 'data analysis', 'communication', 'teamwork', 'leadership',
      'problem solving', 'c++', 'c#', 'php', 'ruby', 'kotlin', 'swift', 'flutter',
      'angular', 'vue', 'django', 'spring boot', 'kubernetes', 'linux', 'agile', 'scrum',
    ];

    const demandMap = {};
    jobs.forEach(job => {
      const text = `${job.requirements || ''} ${job.description || ''}`.toLowerCase();
      COMMON_SKILLS.forEach(skill => {
        if (text.includes(skill)) {
          demandMap[skill] = (demandMap[skill] || 0) + 1;
        }
      });
    });

    // Skills in demand that student is missing
    const gaps = Object.entries(demandMap)
      .filter(([skill]) => !studentSkills.includes(skill))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, demandCount: count }));

    // Skills student has that are in demand
    const strengths = studentSkills
      .filter(s => demandMap[s])
      .map(s => ({ skill: s, demandCount: demandMap[s] }))
      .sort((a, b) => b.demandCount - a.demandCount);

    res.json({
      studentSkills,
      gaps,
      strengths,
      totalJobsAnalyzed: jobs.length,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── Job Recommendations ──────────────────────────────────────────────────────
// Returns jobs ranked by skill match score
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skills educationInfo');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const studentSkills = (user.skills || []).map(s => s.toLowerCase());
    const degree = (user.educationInfo?.degree || '').toLowerCase();

    const jobs = await Post.find({ type: { $in: ['job', 'referral'] }, isActive: true })
      .sort({ createdAt: -1 })
      .limit(100);

    // Score each job by skill overlap
    const scored = jobs.map(job => {
      const text = `${job.requirements || ''} ${job.description || ''} ${job.title || ''}`.toLowerCase();
      let score = 0;
      studentSkills.forEach(skill => { if (text.includes(skill)) score += 10; });
      if (degree && text.includes(degree)) score += 5;
      return { ...job.toObject(), matchScore: score };
    });

    const recommendations = scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ recommendations, studentSkills });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ─── Resume Analyzer (keyword extraction) ────────────────────────────────────
router.post('/analyze-resume', auth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ msg: 'resumeText is required' });

    const SKILL_KEYWORDS = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'mongodb', 'aws',
      'docker', 'git', 'typescript', 'html', 'css', 'express', 'machine learning',
      'data analysis', 'c++', 'c#', 'php', 'ruby', 'kotlin', 'flutter', 'angular',
      'vue', 'django', 'spring', 'kubernetes', 'linux', 'agile', 'scrum', 'rest',
      'graphql', 'redis', 'postgresql', 'firebase', 'tensorflow', 'pytorch',
    ];

    const text = resumeText.toLowerCase();
    const detected = SKILL_KEYWORDS.filter(skill => text.includes(skill));

    // Update user skills automatically
    const user = await User.findById(req.user.id);
    const merged = [...new Set([...(user.skills || []).map(s => s.toLowerCase()), ...detected])];
    user.skills = merged;
    await user.save();

    res.json({
      detectedSkills: detected,
      totalDetected: detected.length,
      msg: `Detected ${detected.length} skills and updated your profile.`,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
