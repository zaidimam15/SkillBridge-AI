const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

const {
  resolveResourcesForSkill,
} = require('../services/resourceResolver');

// ============================================================
// GET /api/roadmap
// ============================================================
router.get('/', protect, async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user._id,
    }).populate(
      'projectProgress.project',
      'title difficulty technologies estimatedHours'
    );

    // No roadmap yet
    if (!progress) {
      return res.json({
        success: true,
        progress: {
          skillProgress: [],
          projectProgress: [],
          timeline: [],
        },
      });
    }

    // ========================================================
    // DYNAMIC RESOURCE RESOLUTION
    //
    // Every user's skills are processed independently.
    // ========================================================
    const skillProgressWithResources = await Promise.all(
      (progress.skillProgress || []).map(async (item) => {
        const resources = await resolveResourcesForSkill(item.skill);

        return {
          ...item.toObject(),
          resources,
        };
      })
    );

    return res.json({
      success: true,
      progress: {
        ...progress.toObject(),
        skillProgress: skillProgressWithResources,
      },
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    next(error);
  }
});

// ============================================================
// POST /api/roadmap/:skill
// Add a skill to current user's roadmap
// ============================================================
router.post('/:skill', protect, async (req, res, next) => {
  try {
    const skill = decodeURIComponent(req.params.skill).trim();

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required.',
      });
    }

    let progress = await UserProgress.findOne({
      user: req.user._id,
    });

    if (!progress) {
      progress = await UserProgress.create({
        user: req.user._id,
        skillProgress: [],
        projectProgress: [],
        timeline: [],
      });
    }

    const existingSkill = progress.skillProgress?.find(
      (item) =>
        String(item.skill).trim().toLowerCase() ===
        skill.toLowerCase()
    );

    if (existingSkill) {
      const resources = await resolveResourcesForSkill(
        existingSkill.skill
      );

      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: `"${existingSkill.skill}" is already in your learning roadmap.`,
        resources,
        progress,
      });
    }

    progress.skillProgress.unshift({
      skill,
      status: 'in_progress',
      startedAt: new Date(),
    });

    await progress.save();

    // Resolve resources immediately
    const resources = await resolveResourcesForSkill(skill);

    return res.status(201).json({
      success: true,
      alreadyExists: false,
      message: `"${skill}" added to the top of your learning roadmap.`,
      resources,
      progress,
    });
  } catch (error) {
    console.error('Add roadmap skill error:', error);
    next(error);
  }
});

// ============================================================
// PUT /api/roadmap/:skill/status
// ============================================================
router.put('/:skill/status', protect, async (req, res, next) => {
  try {
    const skill = decodeURIComponent(req.params.skill).trim();
    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'in_progress',
      'completed',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(
          ', '
        )}`,
      });
    }

    const progress = await UserProgress.findOne({
      user: req.user._id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.',
      });
    }

    const skillEntry = progress.skillProgress?.find(
      (item) =>
        String(item.skill).trim().toLowerCase() ===
        skill.toLowerCase()
    );

    if (!skillEntry) {
      return res.status(404).json({
        success: false,
        message: `Skill "${skill}" is not present in your roadmap.`,
      });
    }

    skillEntry.status = status;

    if (status === 'in_progress' && !skillEntry.startedAt) {
      skillEntry.startedAt = new Date();
    }

    if (status === 'completed') {
      skillEntry.completedAt = new Date();

      if (!skillEntry.startedAt) {
        skillEntry.startedAt = new Date();
      }
    }

    if (status !== 'completed') {
      skillEntry.completedAt = undefined;
    }

    await progress.save();

    return res.status(200).json({
      success: true,
      message: `"${skillEntry.skill}" status updated to ${status}.`,
      progress,
    });
  } catch (error) {
    console.error('Update roadmap status error:', error);
    next(error);
  }
});

module.exports = router;