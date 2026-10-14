const express = require('express');
const router = express.Router();

const LearningResource = require('../models/LearningResource');

const {
  resolveResourcesForSkill,
} = require('../services/resourceResolver');

const { protect, authorize } = require('../middleware/auth');

// ============================================================
// GET /api/resources
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const {
      skill,
      type,
      level,
      limit = 20,
    } = req.query;

    // If skill is provided, use dynamic resolver
    if (skill) {
      const resources = await resolveResourcesForSkill(skill);

      return res.json({
        success: true,
        resources: resources.slice(0, parseInt(limit)),
      });
    }

    const filter = {
      isActive: true,
    };

    if (type) {
      filter.type = type;
    }

    if (level) {
      filter.level = level;
    }

    const resources = await LearningResource.find(filter)
      .limit(parseInt(limit))
      .sort({
        rating: -1,
      })
      .lean();

    return res.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error('Get resources error:', error);
    next(error);
  }
});

// ============================================================
// GET /api/resources/:skill
// ============================================================
router.get('/:skill', async (req, res, next) => {
  try {
    const skill = decodeURIComponent(req.params.skill).trim();

    const resources = await resolveResourcesForSkill(skill);

    return res.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error('Get skill resources error:', error);
    next(error);
  }
});

// ============================================================
// POST /api/resources
// Admin only
// ============================================================
router.post(
  '/',
  protect,
  authorize('super_admin', 'tp_admin'),
  async (req, res, next) => {
    try {
      const resource = await LearningResource.create(req.body);

      return res.status(201).json({
        success: true,
        resource,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// PUT /api/resources/:id
// Admin only
// ============================================================
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'tp_admin'),
  async (req, res, next) => {
    try {
      const resource =
        await LearningResource.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      return res.json({
        success: true,
        resource,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;