const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');

router.use(protect, authorize('recruiter', 'super_admin'));

// Get recruiter's jobs
router.get('/jobs', async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id, isDeleted: false })
    .sort({ createdAt: -1 });
  res.json({ success: true, jobs });
});

// Get candidates for a job
router.get('/jobs/:jobId/candidates', async (req, res) => {
  const { sort = 'atsScore', filter } = req.query;
  const query = { job: req.params.jobId };
  if (filter === 'shortlisted') query.screeningStatus = 'shortlisted';
  if (filter === 'maybe') query.screeningStatus = 'maybe';

  const analyses = await Analysis.find(query)
    .populate('student', 'name email studentProfile')
    .populate('resume', 'title originalName parsedData.name')
    .select('atsScore matchedSkills missingSkills screeningStatus recruiterNotes targetRole createdAt scoreBreakdown')
    .sort({ [sort === 'atsScore' ? 'atsScore' : 'createdAt']: -1 });

  res.json({
    success: true,
    candidates: analyses,
    disclaimer: 'AI-assisted screening — human review required. Algorithm score is not a hiring guarantee.',
  });
});

// Update screening status
router.put('/candidates/:analysisId/status', async (req, res) => {
  const { status, notes } = req.body;
  const allowed = ['not_reviewed', 'shortlisted', 'maybe', 'rejected', 'hired'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const analysis = await Analysis.findByIdAndUpdate(
    req.params.analysisId,
    { screeningStatus: status, recruiterNotes: notes || '' },
    { new: true }
  );

  if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found.' });

  res.json({ success: true, message: `Candidate ${status}.`, analysis });
});

// Recruiter dashboard stats
router.get('/dashboard', async (req, res) => {
  const [activeJobs, totalAnalyses, shortlisted] = await Promise.all([
    Job.countDocuments({ createdBy: req.user._id, status: 'active', isDeleted: false }),
    Analysis.countDocuments({ triggeredBy: req.user._id }),
    Analysis.countDocuments({ triggeredBy: req.user._id, screeningStatus: 'shortlisted' }),
  ]);

  const avgScore = await Analysis.aggregate([
    { $match: { triggeredBy: req.user._id } },
    { $group: { _id: null, avg: { $avg: '$atsScore' } } },
  ]);

  res.json({
    success: true,
    stats: {
      activeJobs,
      totalAnalyses,
      shortlisted,
      avgAtsScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
    },
  });
});

module.exports = router;
