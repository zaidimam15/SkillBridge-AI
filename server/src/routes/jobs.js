const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const { AppError } = require('../utils/errors');
const axios = require('axios');

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// GET /api/jobs — public list
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, search, status = 'active' } = req.query;
  const filter = { isDeleted: false, status };
  if (search) filter.$text = { $search: search };
  const jobs = await Job.find(filter)
    .populate('createdBy', 'name recruiterProfile.company')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await Job.countDocuments(filter);
  res.json({ success: true, jobs, total });
});

// GET /api/jobs/:id
router.get('/:id', async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false })
    .populate('createdBy', 'name recruiterProfile');
  if (!job) return next(new AppError('Job not found.', 404));
  res.json({ success: true, job });
});

// POST /api/jobs — create job (recruiter/admin)
router.post('/', protect, authorize('recruiter', 'tp_admin', 'super_admin'), async (req, res, next) => {
  const { title, company, location, jobType, description, requiredSkills, experience, salary, targetDepartments, targetBatches } = req.body;

  if (!title || !description) {
    return next(new AppError('Job title and description are required.', 400));
  }

  // Parse JD via AI service
  let parsedRequirements = {};
  try {
    const aiRes = await axios.post(`${AI_SERVICE}/parse/jd`, { text: description }, { timeout: 30000 });
    if (aiRes.data.success) {
      parsedRequirements = aiRes.data.parsedData;
    }
  } catch (err) {
    // Non-fatal — continue without AI parsing
  }

  const job = await Job.create({
    createdBy: req.user._id,
    title,
    company: company || req.user.recruiterProfile?.company || '',
    location: location || '',
    jobType: jobType || 'full-time',
    description,
    requiredSkills: requiredSkills || [],
    experience: experience || { min: 0, max: 3 },
    salary: salary || {},
    parsedRequirements,
    targetDepartments: targetDepartments || [],
    targetBatches: targetBatches || [],
  });

  res.status(201).json({ success: true, message: 'Job created successfully.', job });
});

// PUT /api/jobs/:id
router.put('/:id', protect, authorize('recruiter', 'tp_admin', 'super_admin'), async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
    return next(new AppError('Access denied.', 403));
  }
  Object.assign(job, req.body);
  await job.save();
  res.json({ success: true, message: 'Job updated.', job });
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, authorize('recruiter', 'super_admin'), async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
  if (!job) return next(new AppError('Job not found.', 404));
  if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
    return next(new AppError('Access denied.', 403));
  }
  job.isDeleted = true;
  await job.save();
  res.json({ success: true, message: 'Job deleted.' });
});

module.exports = router;
