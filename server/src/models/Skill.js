const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    canonical: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    aliases: [{ type: String, lowercase: true }],
    category: {
      type: String,
      enum: [
        'programming_language',
        'framework',
        'library',
        'database',
        'cloud',
        'devops',
        'tool',
        'methodology',
        'soft_skill',
        'other',
      ],
      default: 'other',
    },
    subcategory: { type: String, default: '' },
    description: { type: String, default: '' },
    // Market data (from seed, NOT real-time)
    marketDemand: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'emerging'],
      default: 'medium',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    estimatedLearningHours: { type: Number, default: 40 },
    relatedSkills: [{ type: String }],
    usedInRoles: [{ type: String }],
    // Admin management
    isActive: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dictionaryVersion: { type: String, default: 'v1.2' },
  },
  { timestamps: true }
);

skillSchema.index({ canonical: 1 });
skillSchema.index({ aliases: 1 });
skillSchema.index({ category: 1 });

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;
