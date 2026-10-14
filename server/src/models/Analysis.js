const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    // Recruiter who triggered analysis (optional, for bulk screening)
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Algorithm versioning for reproducibility
    algorithmVersion: { type: String, default: 'v1.0' },
    skillDictionaryVersion: { type: String, default: 'v1.2' },
    // ATS Score (0-100)
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    cosineSimilarity: { type: Number, min: 0, max: 1 },
    // Skill analysis
    matchedSkills: [
      {
        skill: String,
        canonical: String,
        tier: {
          type: String,
          enum: ['strong', 'moderate'],
        },
        matchScore: Number,
        evidence: String, // context from resume
      },
    ],
    missingSkills: [
      {
        skill: String,
        canonical: String,
        importance: {
          type: String,
          enum: ['priority', 'recommended'],
        },
        weight: Number,
        category: String,
      },
    ],
    // Skill classification
    skillBreakdown: {
      strong: [{ type: String }],
      moderate: [{ type: String }],
      priority: [{ type: String }],
      recommended: [{ type: String }],
    },
    // Score breakdown
    scoreBreakdown: {
      skillCoverage: { type: Number, default: 0 },
      keywordAlignment: { type: Number, default: 0 },
      educationAlignment: { type: Number, default: 0 },
      experienceAlignment: { type: Number, default: 0 },
      resumeQuality: { type: Number, default: 0 },
    },
    // Explainability
    explanation: {
      whyMatched: [{ type: String }],
      whatImproved: [{ type: String }],
      whatCanImprove: [{ type: String }],
      summary: { type: String },
    },
    // Resume quality at time of analysis
    resumeQualityScore: { type: Number },
    resumeQualitySuggestions: [{ type: String }],
    // Career role compatibility
    careerCompatibility: [
      {
        role: String,
        compatibility: Number,
        missingSkills: [String],
      },
    ],
    // Recommendations
    learningRecommendations: [
      {
        skill: String,
        priority: String,
        estimatedHours: Number,
        resources: [
          {
            title: String,
            provider: String,
            url: String,
            type: String,
          },
        ],
      },
    ],
    projectRecommendations: [
      {
        title: String,
        difficulty: String,
        targetSkill: String,
        estimatedHours: Number,
        technologies: [String],
      },
    ],
    // Status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    processingTime: { type: Number }, // ms
    // For recruiter screening
    screeningStatus: {
      type: String,
      enum: ['not_reviewed', 'shortlisted', 'maybe', 'rejected', 'hired'],
      default: 'not_reviewed',
    },
    recruiterNotes: { type: String, default: '' },
    // Target role for this analysis
    targetRole: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

analysisSchema.index({ student: 1, createdAt: -1 });
analysisSchema.index({ job: 1, atsScore: -1 });
analysisSchema.index({ student: 1, job: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
