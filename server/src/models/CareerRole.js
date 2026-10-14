const mongoose = require('mongoose');

const careerRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['development', 'data', 'devops', 'security', 'qa', 'design', 'management'],
      default: 'development',
    },
    // Skills required for this role
    coreSkills: [
      {
        skill: { type: String, required: true },
        weight: { type: Number, default: 1.0, min: 0, max: 3 },
        importance: {
          type: String,
          enum: ['must-have', 'preferred', 'nice-to-have'],
          default: 'must-have',
        },
      },
    ],
    // Market info (seed data, not real-time)
    marketDemand: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'emerging'],
      default: 'high',
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      unit: { type: String, default: 'per_annum' },
      source: { type: String, default: 'Seed Data — Not real-time market data' },
    },
    experienceLevels: [
      {
        level: { type: String, enum: ['fresher', 'junior', 'mid', 'senior'] },
        yearsRequired: { type: String },
        keySkills: [{ type: String }],
      },
    ],
    learningPath: [
      {
        order: { type: Number },
        skill: { type: String },
        estimatedHours: { type: Number },
        resources: [{ type: String }],
      },
    ],
    icon: { type: String, default: 'Code' },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CareerRole = mongoose.model('CareerRole', careerRoleSchema);
module.exports = CareerRole;
