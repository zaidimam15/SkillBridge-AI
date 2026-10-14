const mongoose = require('mongoose');

const capstoneProjectSchema = new mongoose.Schema(
  {
    stableId: { type: String, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      lowercase: true,
      default: 'intermediate',
    },
    targetSkills: [{ type: String }], // Skills this project helps learn
    primarySkill: { type: String, default: 'General' },
    technologies: [{ type: String }],
    estimatedHours: { type: Number, default: 20 },
    objectives: [{ type: String }],
    requiredFeatures: [{ type: String }],
    features: [{ type: String }],
    milestones: [
      {
        id: { type: String },
        title: { type: String, required: true },
        description: { type: String },
      },
    ],
    apiEndpoints: [{ type: String }],
    databaseRequirements: [{ type: String }],
    learningOutcomes: [{ type: String }],
    // Category
    category: {
      type: String,
      lowercase: true,
      default: 'fullstack',
    },
    tags: [{ type: String }],
    githubTemplate: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CapstoneProject = mongoose.model('CapstoneProject', capstoneProjectSchema);
module.exports = CapstoneProject;
