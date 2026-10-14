const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Job details
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 200,
    },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 5 },
      unit: { type: String, default: 'years' },
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      isVisible: { type: Boolean, default: true },
    },
    // Job description
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    // Skills
    requiredSkills: [
      {
        skill: { type: String, required: true },
        canonical: { type: String },
        importance: {
          type: String,
          enum: ['must-have', 'preferred', 'nice-to-have'],
          default: 'must-have',
        },
        weight: { type: Number, default: 1.0, min: 0, max: 3 },
      },
    ],
    // Parsed requirements
    parsedRequirements: {
      mustHave: [{ type: String }],
      preferred: [{ type: String }],
      niceToHave: [{ type: String }],
      normalizedSkills: [{ type: String }],
      educationRequired: { type: String, default: '' },
      keywords: [{ type: String }],
      roleCategory: { type: String, default: '' },
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'active',
    },
    applicantsCount: { type: Number, default: 0 },
    analyzedCount: { type: Number, default: 0 },
    // Algorithm version used for parsing
    algorithmVersion: { type: String, default: 'v1.0' },
    isDeleted: { type: Boolean, default: false },
    // Department/batch targeting (for T&P usage)
    targetDepartments: [{ type: String }],
    targetBatches: [{ type: String }],
  },
  { timestamps: true }
);

jobSchema.index({ createdBy: 1, status: 1 });
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
