const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// GET profile
router.get('/', async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toSafeObject() });
});

// PUT profile
router.put('/', async (req, res) => {
  const { name, studentProfile, recruiterProfile, adminProfile, preferences } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (studentProfile) updateData.studentProfile = { ...req.user.studentProfile?.toObject?.() || {}, ...studentProfile };
  if (recruiterProfile) updateData.recruiterProfile = { ...req.user.recruiterProfile?.toObject?.() || {}, ...recruiterProfile };
  if (adminProfile) updateData.adminProfile = { ...req.user.adminProfile?.toObject?.() || {}, ...adminProfile };
  if (preferences) updateData.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated.', user: user.toSafeObject() });
});

module.exports = router;
