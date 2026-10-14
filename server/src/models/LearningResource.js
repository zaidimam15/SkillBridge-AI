const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true },
    skill: { type: String, required: true, index: true },
    skills: [{ type: String }], // Multiple skills covered
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'beginner',
    },
    type: {
      type: String,
      enum: ['course', 'tutorial', 'documentation', 'book', 'video', 'project', 'article'],
      default: 'course',
    },
    url: { type: String, default: '' },
    estimatedHours: { type: Number, default: 10 },
    isFree: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
module.exports = LearningResource;
