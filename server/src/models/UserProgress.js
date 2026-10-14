const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Skill progress
    skillProgress: [
      {
        skill: { type: String, required: true },
        status: {
          type: String,
          enum: ['not_started', 'in_progress', 'completed'],
          default: 'not_started',
        },
        startedAt: { type: Date },
        completedAt: { type: Date },
        hoursSpent: { type: Number, default: 0 },
        notes: { type: String, default: '' },
      },
    ],
    // Project progress
    projectProgress: [
      {
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CapstoneProject',
        },
        status: {
          type: String,
          enum: ['saved', 'in_progress', 'completed'],
          default: 'saved',
        },
        startedAt: { type: Date },
        completedAt: { type: Date },
        githubLink: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],
    // Career readiness score (composite)
    careerReadinessScore: { type: Number, default: 0 },
    careerReadinessBreakdown: {
      skillCoverage: { type: Number, default: 0 },
      resumeHealth: { type: Number, default: 0 },
      projectReadiness: { type: Number, default: 0 },
      learningProgress: { type: Number, default: 0 },
      targetRoleAlignment: { type: Number, default: 0 },
    },
    // Target role
    targetRole: { type: String, default: '' },
    // Timeline events
    timeline: [
      {
        event: { type: String },
        description: { type: String },
        date: { type: Date, default: Date.now },
        icon: { type: String },
        type: {
          type: String,
          enum: ['resume', 'analysis', 'skill', 'project', 'improvement'],
          default: 'analysis',
        },
      },
    ],
  },
  { timestamps: true }
);

userProgressSchema.index({ user: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
module.exports = UserProgress;
