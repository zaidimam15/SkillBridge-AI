const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CapstoneProject = require('../models/CapstoneProject');
const UserProject = require('../models/UserProject');
const UserProgress = require('../models/UserProgress');
const { protect, authorize } = require('../middleware/auth');
const { defaultRecommendedProjects } = require('../utils/capstoneDefaults');

// Helper: Ensure the default recommended projects exist in the database
async function ensureRecommendedProjectsSeeded() {
  try {
    for (const def of defaultRecommendedProjects) {
      const exists = await CapstoneProject.findOne({
        $or: [{ stableId: def.stableId }, { title: def.title }],
      });
      if (!exists) {
        await CapstoneProject.create({
          stableId: def.stableId,
          title: def.title,
          category: def.category,
          difficulty: def.difficulty.toLowerCase(),
          estimatedHours: def.estimatedHours,
          primarySkill: def.primarySkill,
          description: def.description,
          targetSkills: def.targetSkills,
          technologies: def.technologies,
          requiredFeatures: def.requiredFeatures,
          features: def.features,
          objectives: def.objectives,
          milestones: def.milestones,
          isActive: true,
        });
      }
    }
  } catch (err) {
    console.error('Error seeding default capstone projects:', err);
  }
}

// ============================================================
// GET /api/projects
// Get all available capstone project templates
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    await ensureRecommendedProjectsSeeded();

    const { skill, difficulty, category } = req.query;
    const filter = { isActive: true };

    if (skill) filter.$or = [{ primarySkill: skill }, { targetSkills: skill }];
    if (difficulty) filter.difficulty = difficulty.toLowerCase();
    if (category) filter.category = category.toLowerCase();

    let projects = await CapstoneProject.find(filter).sort({ title: 1 });

    // Fallback if none found
    if (!projects || projects.length === 0) {
      projects = defaultRecommendedProjects;
    }

    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/projects/user/started & /api/projects/my-projects
// Get all projects started by the authenticated user
// ============================================================
const getUserProjectsHandler = async (req, res, next) => {
  try {
    const projects = await UserProject.find({ user: req.user._id })
      .populate('templateProject', 'title category difficulty estimatedHours')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

router.get('/user/started', protect, getUserProjectsHandler);
router.get('/my-projects', protect, getUserProjectsHandler);

// ============================================================
// POST /api/projects/:id/start
// Start a capstone project for the authenticated user
// ============================================================
router.post('/:id/start', protect, async (req, res, next) => {
  try {
    await ensureRecommendedProjectsSeeded();

    const projectId = req.params.id;
    let template = null;

    // 1. Try finding by Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      template = await CapstoneProject.findById(projectId);
    }

    // 2. Try finding by stableId (e.g. 'proj-1', 'proj-2')
    if (!template) {
      template = await CapstoneProject.findOne({ stableId: projectId });
    }

    // 3. Try finding by exact title
    if (!template) {
      template = await CapstoneProject.findOne({
        title: new RegExp(`^${projectId.replace(/[-_]/g, ' ')}$`, 'i'),
      });
    }

    // 4. Try matching in default list
    if (!template) {
      const match = defaultRecommendedProjects.find(
        (p) =>
          p.stableId === projectId ||
          p.title.toLowerCase() === projectId.toLowerCase() ||
          p.stableId.toLowerCase() === projectId.toLowerCase()
      );
      if (match) {
        template = match;
      }
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        message: `Project template with identifier "${projectId}" not found.`,
      });
    }

    const templateStableId = template.stableId || projectId;
    const templateTitle = template.title;

    // 5. Check for duplicate project start by the same user
    const existing = await UserProject.findOne({
      user: req.user._id,
      $or: [
        ...(template._id ? [{ templateProject: template._id }] : []),
        { templateKey: templateStableId },
        { title: templateTitle },
      ],
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyStarted: true,
        message: `Project "${existing.title}" is already in your active workspace.`,
        project: existing,
      });
    }

    // 6. Build milestones list
    const milestones =
      template.milestones && template.milestones.length > 0
        ? template.milestones.map((m, idx) => ({
            id: m.id || `m${idx + 1}`,
            title: m.title,
            description: m.description || '',
            completed: false,
            completedAt: null,
          }))
        : [
            {
              id: 'm1',
              title: 'Project Setup & Architecture Blueprint',
              description: 'Initialize repository, dependencies, and environment configurations.',
              completed: false,
              completedAt: null,
            },
            {
              id: 'm2',
              title: 'Data Modeling & API Foundation',
              description: 'Implement schemas, services, and route scaffolding.',
              completed: false,
              completedAt: null,
            },
            {
              id: 'm3',
              title: 'Core Feature Development',
              description: 'Build primary business logic, endpoints, and frontend components.',
              completed: false,
              completedAt: null,
            },
            {
              id: 'm4',
              title: 'Testing & Integration Verification',
              description: 'Run unit, integration, and security checks.',
              completed: false,
              completedAt: null,
            },
            {
              id: 'm5',
              title: 'Deployment & Documentation',
              description: 'Containerize and publish deliverables with a comprehensive README.',
              completed: false,
              completedAt: null,
            },
          ];

    // 7. Create persistent UserProject record
    const newProject = await UserProject.create({
      user: req.user._id,
      templateProject: template._id && mongoose.Types.ObjectId.isValid(template._id) ? template._id : null,
      templateKey: templateStableId,
      title: template.title,
      category: template.category || 'fullstack',
      description: template.description,
      technologies: template.technologies || [],
      skills: template.skills || template.targetSkills || [],
      difficulty: template.difficulty || 'Intermediate',
      estimatedHours: template.estimatedHours || 25,
      status: 'Planning',
      progress: 0,
      milestones,
      requirements: template.objectives || template.requirements || [],
      features: template.features || template.requiredFeatures || [],
      githubRepoUrl: '',
      liveDemoUrl: '',
      notes: '',
      startedAt: new Date(),
    });

    // 8. Update UserProgress model for dashboard synchronization
    try {
      await UserProgress.findOneAndUpdate(
        { user: req.user._id },
        {
          $addToSet: {
            projectProgress: {
              project: template._id && mongoose.Types.ObjectId.isValid(template._id) ? template._id : null,
              status: 'in_progress',
              startedAt: new Date(),
              notes: `Started project: ${template.title}`,
            },
          },
          $push: {
            timeline: {
              event: `Started project: ${template.title}`,
              description: 'Initialized capstone build workspace',
              date: new Date(),
              icon: 'Code2',
              type: 'project',
            },
          },
        },
        { upsert: true }
      );
    } catch (progressErr) {
      console.warn('UserProgress sync notice:', progressErr.message);
    }

    return res.status(201).json({
      success: true,
      alreadyStarted: false,
      message: `Project "${newProject.title}" started! Your workspace is ready.`,
      project: newProject,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/projects/user/:id
// Get user's started project details
// ============================================================
router.get('/user/:id', protect, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    const project = await UserProject.findById(req.params.id).populate(
      'templateProject',
      'title category difficulty estimatedHours'
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project record not found.',
      });
    }

    // Security Check: Enforce user isolation
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access another user\'s project.',
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// PATCH /api/projects/user/:id
// Update user project milestones, repository links, or notes
// ============================================================
router.patch('/user/:id', protect, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    const project = await UserProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project record not found.',
      });
    }

    // Security Check: Ownership verification
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to modify this project.',
      });
    }

    const { milestoneId, completed, githubRepoUrl, liveDemoUrl, notes, status } = req.body;

    // Toggle or set milestone state
    if (milestoneId) {
      const milestone = project.milestones.find((m) => m.id === milestoneId);
      if (milestone) {
        milestone.completed = typeof completed === 'boolean' ? completed : !milestone.completed;
        milestone.completedAt = milestone.completed ? new Date() : null;
      }
    }

    // Recalculate progress based on actual completed milestones
    if (project.milestones && project.milestones.length > 0) {
      const completedCount = project.milestones.filter((m) => m.completed).length;
      project.progress = Math.round((completedCount / project.milestones.length) * 100);

      if (project.progress === 100) {
        project.status = 'Completed';
        project.completedAt = project.completedAt || new Date();
      } else if (project.progress > 0) {
        project.status = 'In Progress';
      } else {
        project.status = 'Planning';
      }
    }

    if (githubRepoUrl !== undefined) {
      project.githubRepoUrl = String(githubRepoUrl).trim();
    }
    if (liveDemoUrl !== undefined) {
      project.liveDemoUrl = String(liveDemoUrl).trim();
    }
    if (notes !== undefined) {
      project.notes = String(notes);
    }
    if (status && ['Not Started', 'Planning', 'In Progress', 'Testing', 'Completed'].includes(status)) {
      project.status = status;
      if (status === 'Completed' && !project.completedAt) {
        project.completedAt = new Date();
      }
    }

    await project.save();

    // If completed, update UserProgress as well
    if (project.status === 'Completed') {
      try {
        await UserProgress.findOneAndUpdate(
          {
            user: req.user._id,
            'projectProgress.project': project.templateProject,
          },
          {
            $set: {
              'projectProgress.$.status': 'completed',
              'projectProgress.$.completedAt': new Date(),
              'projectProgress.$.githubLink': project.githubRepoUrl || '',
            },
          }
        );
      } catch (e) {
        // Ignore non-fatal UserProgress sync
      }
    }

    res.json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// PUT /api/projects/:id/complete
// Legacy route support: Mark project complete with github link
// ============================================================
router.put('/:id/complete', protect, async (req, res, next) => {
  try {
    const { githubLink } = req.body;
    const projectId = req.params.id;

    if (mongoose.Types.ObjectId.isValid(projectId)) {
      const userProj = await UserProject.findOne({
        _id: projectId,
        user: req.user._id,
      });

      if (userProj) {
        userProj.status = 'Completed';
        userProj.progress = 100;
        userProj.completedAt = new Date();
        if (githubLink) userProj.githubRepoUrl = githubLink;
        userProj.milestones.forEach((m) => {
          m.completed = true;
          m.completedAt = m.completedAt || new Date();
        });
        await userProj.save();
      }
    }

    await UserProgress.findOneAndUpdate(
      { user: req.user._id, 'projectProgress.project': projectId },
      {
        $set: {
          'projectProgress.$.status': 'completed',
          'projectProgress.$.completedAt': new Date(),
          'projectProgress.$.githubLink': githubLink || '',
        },
      }
    );

    res.json({
      success: true,
      message: 'Project marked as completed! Great work!',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/projects/:id
// Public project template details
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let project = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      project = await CapstoneProject.findById(id);
    }

    if (!project) {
      project = await CapstoneProject.findOne({ stableId: id });
    }

    if (!project) {
      project = defaultRecommendedProjects.find((p) => p.stableId === id || p._id === id);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Admin: create project template
// ============================================================
router.post('/', protect, authorize('super_admin', 'tp_admin'), async (req, res, next) => {
  try {
    const project = await CapstoneProject.create(req.body);
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
