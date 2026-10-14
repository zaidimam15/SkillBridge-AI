const axios = require('axios');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Analysis = require('../models/Analysis');
const UserProgress = require('../models/UserProgress');
const Notification = require('../models/Notification');
const LearningResource = require('../models/LearningResource');
const CapstoneProject = require('../models/CapstoneProject');
const CareerRole = require('../models/CareerRole');
const { AppError } = require('../utils/errors');
const logger = require('../config/logger');

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// @desc    Run ATS analysis
// @route   POST /api/analysis
// @access  Private (Student, Recruiter)
const runAnalysis = async (req, res, next) => {
  const { resumeId, jobId, jdText } = req.body;
  const startTime = Date.now();

  // Get resume
  const resume = await Resume.findOne({
    _id: resumeId,
    isDeleted: false,
  });

  if (!resume) {
    return next(new AppError('Resume not found.', 404));
  }

  // Ownership check
  if (
    resume.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'recruiter' &&
    req.user.role !== 'super_admin'
  ) {
    return next(new AppError('Access denied.', 403));
  }

  // Get job
  let job;

  if (jobId) {
    job = await Job.findById(jobId);

    if (!job) {
      return next(new AppError('Job not found.', 404));
    }
  } else if (jdText) {
    // Parse JD on the fly
    const jdResponse = await axios.post(
      `${AI_SERVICE}/parse/jd`,
      { text: jdText },
      { timeout: 30000 }
    );

    if (!jdResponse.data.success) {
      return next(
        new AppError('Failed to parse job description.', 422)
      );
    }

    const parsed = jdResponse.data.parsedData;

    job = await Job.create({
      createdBy: req.user._id,
      title: parsed.title || 'Ad-hoc Analysis',
      company: parsed.company || 'Not specified',
      description: jdText,
      parsedRequirements: parsed,
      requiredSkills: (parsed.allSkills || []).map((s) => ({
        skill: s,
        canonical: s,
      })),
      status: 'active',
    });
  } else {
    return next(
      new AppError(
        'Either a saved job ID or a job description text is required.',
        400
      )
    );
  }

  // ============================================================
  // CHECK RESUME PARSING STATUS
  // ============================================================

  console.log('🔍 ANALYSIS RESUME CHECK:', {
    resumeId: resume._id.toString(),
    parseStatus: resume.parseStatus,
    hasParsedData: !!resume.parsedData,
    hasNormalizedSkills: !!resume.parsedData?.normalizedSkills,
  });

  if (resume.parseStatus !== 'completed' || !resume.parsedData) {
    console.log('❌ RESUME PARSING CHECK FAILED:', {
      resumeId: resume._id.toString(),
      parseStatus: resume.parseStatus,
      hasParsedData: !!resume.parsedData,
    });

    return next(
      new AppError(
        'Resume has not been parsed yet. Please re-upload or wait for parsing to complete.',
        422
      )
    );
  }

  console.log('✅ RESUME PARSING CHECK PASSED:', {
    resumeId: resume._id.toString(),
    parseStatus: resume.parseStatus,
  });

  // ============================================================
  // PREPARE DATA FOR AI ANALYSIS
  // ============================================================

  const resumeText =
    resume.parsedData.rawText ||
    JSON.stringify(resume.parsedData);

  const resumeSkills =
    resume.parsedData.normalizedSkills || [];

  const jdSkills =
    job.parsedRequirements?.normalizedSkills ||
    job.parsedRequirements?.allSkills ||
    [];

  const jdSkillWeights =
    job.parsedRequirements?.skillWeights || {};

  // Call AI analysis
  let aiResult;

  try {
    const aiResponse = await axios.post(
      `${AI_SERVICE}/analyze`,
      {
        resumeText,
        jdText: job.description,
        resumeSkills,
        jdSkills,
        jdSkillWeights,
      },
      { timeout: 60000 }
    );

    if (!aiResponse.data.success) {
      throw new Error(
        aiResponse.data.error || 'AI analysis failed'
      );
    }

    aiResult = aiResponse.data.analysis;
  } catch (err) {
    logger.error('AI analysis error:', err.message);

    return next(
      new AppError(
        'Analysis service is currently unavailable. Please try again later.',
        503
      )
    );
  }

  const processingTime = Date.now() - startTime;

  // ============================================================
  // FETCH LEARNING RESOURCES FOR MISSING SKILLS
  // ============================================================

  const missingSkillNames =
    aiResult.skillAnalysis?.priority?.slice(0, 5) || [];

  const learningRecs = [];

  for (const skill of missingSkillNames) {
    const resources = await LearningResource.find({
      $or: [
        { skill },
        { skills: skill },
      ],
      isActive: true,
    }).limit(3);

    if (resources.length > 0) {
      learningRecs.push({
        skill,
        priority: 'high',
        estimatedHours: resources[0].estimatedHours,
        resources: resources.map((r) => ({
          title: r.title,
          provider: r.provider,
          url: r.url,
          type: r.type,
        })),
      });
    }
  }

  // ============================================================
  // FETCH CAPSTONE PROJECT RECOMMENDATIONS
  // ============================================================

  const projectRecs = [];

  for (const skill of missingSkillNames.slice(0, 3)) {
    const project = await CapstoneProject.findOne({
      $or: [
        { primarySkill: skill },
        { targetSkills: skill },
      ],
      isActive: true,
    });

    if (project) {
      projectRecs.push({
        title: project.title,
        difficulty: project.difficulty,
        targetSkill: skill,
        estimatedHours: project.estimatedHours,
        technologies: project.technologies,
      });
    }
  }

  // ============================================================
  // CAREER ROLE COMPATIBILITY
  // ============================================================

  const careerRoles = await CareerRole.find({
    isActive: true,
  }).limit(10);

  const careerCompatibility = careerRoles
    .map((role) => {
      const roleSkills = role.coreSkills.map(
        (cs) => cs.skill
      );

      const matched = resumeSkills.filter((s) =>
        roleSkills.some(
          (rs) =>
            rs.toLowerCase() === s.toLowerCase()
        )
      );

      const missing = roleSkills.filter(
        (rs) =>
          !resumeSkills.some(
            (s) =>
              s.toLowerCase() === rs.toLowerCase()
          )
      );

      const compatibility = Math.round(
        (matched.length /
          Math.max(roleSkills.length, 1)) *
        100
      );

      return {
        role: role.title,
        compatibility: Math.min(
          compatibility,
          100
        ),
        missingSkills: missing.slice(0, 5),
      };
    })
    .sort(
      (a, b) =>
        b.compatibility - a.compatibility
    );

  // ============================================================
  // BUILD ANALYSIS DOCUMENT
  // ============================================================

  const skillAnalysis = aiResult.skillAnalysis;

  const analysis = await Analysis.create({
    student: resume.user,
    resume: resume._id,
    job: job._id,

    triggeredBy:
      req.user.role === 'recruiter'
        ? req.user._id
        : null,

    algorithmVersion:
      aiResult.algorithmVersion,

    skillDictionaryVersion:
      aiResult.skillDictionaryVersion,

    atsScore: aiResult.atsScore,

    cosineSimilarity:
      aiResult.cosineSimilarity,

    matchedSkills:
      skillAnalysis.matched.map((s) => ({
        skill: s,
        canonical: s,
        tier: skillAnalysis.strong.includes(s)
          ? 'strong'
          : 'moderate',
        matchScore:
          skillAnalysis.strong.includes(s)
            ? 0.9
            : 0.6,
      })),

    missingSkills:
      skillAnalysis.missing.map((s) => ({
        skill: s,
        canonical: s,
        importance:
          skillAnalysis.priority.includes(s)
            ? 'priority'
            : 'recommended',
        weight:
          jdSkillWeights[s] || 1.0,
      })),

    skillBreakdown: {
      strong: skillAnalysis.strong,
      moderate: skillAnalysis.moderate,
      priority: skillAnalysis.priority,
      recommended: skillAnalysis.recommended,
    },

    scoreBreakdown: {
      ...aiResult.scoreBreakdown,
      resumeQuality:
        resume.qualityScore || 0,
    },

    explanation: {
      whyMatched:
        aiResult.explanation?.whyMatched || [],

      whatImproved:
        aiResult.explanation?.whatImproved || [],

      whatCanImprove:
        aiResult.explanation?.whatCanImprove || [],

      summary:
        aiResult.explanation?.summary || '',
    },

    resumeQualityScore:
      resume.qualityScore,

    resumeQualitySuggestions:
      resume.qualityAnalysis?.suggestions || [],

    careerCompatibility:
      careerCompatibility.slice(0, 8),

    learningRecommendations:
      learningRecs,

    projectRecommendations:
      projectRecs,

    targetRole:
      job.parsedRequirements?.roleCategory ||
      job.title,

    processingTime,
  });

  // ============================================================
  // UPDATE RESUME ANALYSIS COUNT
  // ============================================================

  await Resume.findByIdAndUpdate(
    resume._id,
    {
      $inc: {
        analysisCount: 1,
      },
    }
  );

  // ============================================================
  // UPDATE JOB ANALYSIS COUNT
  // ============================================================

  await Job.findByIdAndUpdate(
    job._id,
    {
      $inc: {
        analyzedCount: 1,
      },
    }
  );

  // ============================================================
  // UPDATE USER PROGRESS TIMELINE
  // ============================================================

  await UserProgress.findOneAndUpdate(
    {
      user: resume.user,
    },
    {
      $push: {
        timeline: {
          event: 'ATS Analysis Completed',
          description: `Analyzed resume against ${job.title} — Score: ${aiResult.atsScore}%`,
          type: 'analysis',
          icon: 'BarChart2',
        },
      },
    },
    {
      upsert: true,
    }
  );

  // ============================================================
  // NOTIFICATION
  // ============================================================

  await Notification.create({
    user: resume.user,
    type: 'analysis_complete',
    title: 'ATS Analysis Complete 📊',
    message: `Your ATS compatibility score for "${job.title}" is ${aiResult.atsScore}%. Check your skill gap report.`,
    link: `/analysis/${analysis._id}`,
    icon: 'BarChart2',
    data: {
      analysisId: analysis._id,
      score: aiResult.atsScore,
    },
  });

  // ============================================================
  // RESPONSE
  // ============================================================

  res.status(201).json({
    success: true,
    message:
      'ATS analysis completed successfully.',
    analysis: {
      ...analysis.toObject(),
      disclaimer: aiResult.disclaimer,
    },
  });
};

// @desc    Get analysis by ID
// @route   GET /api/analysis/:id
// @access  Private
const getAnalysis = async (
  req,
  res,
  next
) => {
  const analysis =
    await Analysis.findById(req.params.id)
      .populate(
        'resume',
        'title originalName parsedData.name parsedData.email'
      )
      .populate(
        'job',
        'title company location'
      );

  if (!analysis) {
    return next(
      new AppError(
        'Analysis not found.',
        404
      )
    );
  }

  // Access check
  if (
    analysis.student.toString() !==
    req.user._id.toString() &&
    ![
      'recruiter',
      'tp_admin',
      'super_admin',
    ].includes(req.user.role)
  ) {
    return next(
      new AppError(
        'Access denied.',
        403
      )
    );
  }

  res.json({
    success: true,
    analysis,
  });
};

// @desc    Get analysis history
// @route   GET /api/analysis/history
// @access  Private
const getHistory = async (
  req,
  res
) => {
  const {
    page = 1,
    limit = 10,
  } = req.query;

  const skip =
    (page - 1) * limit;

  const filter = {
    student: req.user._id,
    isDeleted: false,
  };

  const [
    analyses,
    total,
  ] = await Promise.all([
    Analysis.find(filter)
      .populate(
        'resume',
        'title version'
      )
      .populate(
        'job',
        'title company'
      )
      .select(
        '-matchedSkills -missingSkills -learningRecommendations -projectRecommendations'
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(
        parseInt(limit)
      ),

    Analysis.countDocuments(filter),
  ]);

  res.json({
    success: true,
    analyses,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(
        total / limit
      ),
    },
  });
};

module.exports = {
  runAnalysis,
  getAnalysis,
  getHistory,
};