const mongoose = require('mongoose');

const milestoneItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CapstoneProject',
      default: null,
    },
    templateKey: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'fullstack',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    technologies: [{ type: String }],
    skills: [{ type: String }],
    difficulty: {
      type: String,
      default: 'Intermediate',
    },
    estimatedHours: {
      type: Number,
      default: 25,
    },
    status: {
      type: String,
      enum: ['Not Started', 'Planning', 'In Progress', 'Testing', 'Completed'],
      default: 'Planning',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [milestoneItemSchema],
    requirements: [{ type: String }],
    features: [{ type: String }],
    githubRepoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userProjectSchema.index({ user: 1, templateKey: 1 });
userProjectSchema.index({ user: 1, title: 1 });

const UserProject = mongoose.model('UserProject', userProjectSchema);
module.exports = UserProject;
