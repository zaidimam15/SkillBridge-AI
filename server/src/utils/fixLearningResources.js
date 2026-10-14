const mongoose = require('mongoose');
require('dotenv').config();

const LearningResource = require('../models/LearningResource');

const fixResources = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // =========================================================
    // REACT
    // =========================================================
    await LearningResource.updateOne(
      {
        skill: 'React',
      },
      {
        $set: {
          title: 'React Official Learn',
          provider: 'React',
          skill: 'React',
          level: 'beginner',
          type: 'tutorial',
          url: 'https://react.dev/learn',
          estimatedHours: 12,
          isFree: true,
          rating: 4.9,
          description:
            'Official React learning path covering components, JSX, state, events, hooks and modern React development.',
          isActive: true,
        },
      }
    );

    console.log('✅ React resource updated successfully.');

    console.log('');
    console.log('========================================');
    console.log('Learning resources fixed');
    console.log('========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
};

fixResources();