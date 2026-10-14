const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const AuditLog = require('../models/AuditLog');
const Skill = require('../models/Skill');

router.use(protect, authorize('tp_admin', 'super_admin'));

// T&P Analytics Overview
router.get('/analytics/overview', async (req, res) => {
  const [totalStudents, studentsScreened, analyses, avgScore] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    Analysis.distinct('student').then(ids => ids.length),
    Analysis.countDocuments(),
    Analysis.aggregate([{ $group: { _id: null, avg: { $avg: '$atsScore' } } }]),
  ]);

  // Most common missing skills
  const missingSkillsAgg = await Analysis.aggregate([
    { $unwind: '$missingSkills' },
    { $group: { _id: '$missingSkills.skill', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents,
      studentsScreened,
      totalAnalyses: analyses,
      avgAtsScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
      mostCommonSkillGap: missingSkillsAgg[0]?._id || 'N/A',
      topMissingSkills: missingSkillsAgg.map(s => ({ skill: s._id, count: s.count })),
    },
  });
});

// Role-wise readiness
router.get('/analytics/roles', async (req, res) => {
  const roleReadiness = await Analysis.aggregate([
    { $group: { _id: '$targetRole', avgScore: { $avg: '$atsScore' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  res.json({ success: true, roleReadiness });
});

// Skill gap frequency
router.get('/analytics/skills', async (req, res) => {
  const skillGaps = await Analysis.aggregate([
    { $unwind: '$missingSkills' },
    { $group: { _id: '$missingSkills.skill', count: { $sum: 1 }, avgImportance: { $first: '$missingSkills.importance' } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  const strongSkills = await Analysis.aggregate([
    { $unwind: '$matchedSkills' },
    { $group: { _id: '$matchedSkills.skill', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  res.json({ success: true, skillGaps, strongSkills });
});

// Student list (T&P view)
router.get('/students', async (req, res) => {
  const { page = 1, limit = 20, department, batch } = req.query;
  const filter = { role: 'student', isActive: true };
  if (department) filter['studentProfile.department'] = department;
  if (batch) filter['studentProfile.batch'] = batch;

  const [students, total] = await Promise.all([
    User.find(filter)
      .select('name email studentProfile createdAt lastLogin')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  // Attach latest analysis score
  const studentsWithScore = await Promise.all(
    students.map(async (student) => {
      const latestAnalysis = await Analysis.findOne({ student: student._id })
        .sort({ createdAt: -1 })
        .select('atsScore targetRole createdAt');
      return { ...student.toObject(), latestAnalysis };
    })
  );

  res.json({ success: true, students: studentsWithScore, total, page: parseInt(page) });
});

// Training priorities
router.get('/analytics/training-priorities', async (req, res) => {
  const priorities = await Analysis.aggregate([
    { $unwind: '$missingSkills' },
    {
      $match: { 'missingSkills.importance': 'priority' },
    },
    {
      $group: {
        _id: '$missingSkills.skill',
        affectedStudents: { $addToSet: '$student' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        skill: '$_id',
        affectedStudentCount: { $size: '$affectedStudents' },
        count: 1,
      },
    },
    { $sort: { affectedStudentCount: -1 } },
    { $limit: 10 },
  ]);

  res.json({ success: true, priorities });
});

// Admin routes (super_admin only)
router.get('/users', authorize('super_admin'), async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await User.countDocuments(filter);
  res.json({ success: true, users, total });
});

router.put('/users/:id/role', authorize('super_admin'), async (req, res) => {
  const { role } = req.body;
  const allowed = ['student', 'recruiter', 'tp_admin', 'super_admin'];
  if (!allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role.' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json({ success: true, user: user.toSafeObject() });
});

router.put('/users/:id/active', authorize('super_admin'), async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  res.json({ success: true, user: user.toSafeObject() });
});

router.get('/audit-logs', authorize('super_admin'), async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const logs = await AuditLog.find()
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await AuditLog.countDocuments();
  res.json({ success: true, logs, total });
});

module.exports = router;
