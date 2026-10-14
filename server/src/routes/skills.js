const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { category, search, limit = 50 } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.canonical = { $regex: search, $options: 'i' };
  const skills = await Skill.find(filter).limit(parseInt(limit)).sort({ canonical: 1 });
  res.json({ success: true, skills });
});

router.get('/:id', async (req, res, next) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
  res.json({ success: true, skill });
});

// Admin-only: create/update/delete
router.post('/', protect, authorize('super_admin', 'tp_admin'), async (req, res) => {
  const skill = await Skill.create({ ...req.body, addedBy: req.user._id });
  res.status(201).json({ success: true, skill });
});

router.put('/:id', protect, authorize('super_admin', 'tp_admin'), async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, skill });
});

router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
  await Skill.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Skill deactivated.' });
});

module.exports = router;
