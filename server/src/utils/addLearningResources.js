const mongoose = require('mongoose');
require('dotenv').config();

const LearningResource = require('../models/LearningResource');

const resources = [
  {
    title: 'React - The Complete Guide',
    provider: 'Udemy',
    skill: 'React',
    level: 'intermediate',
    type: 'course',
    url: 'https://www.udemy.com',
    estimatedHours: 48,
    isFree: false,
    rating: 4.7,
    description:
      'Learn React from fundamentals to advanced concepts and build practical applications.',
    isActive: true,
  },

  {
    title: 'TypeScript Handbook',
    provider: 'TypeScript Official',
    skill: 'TypeScript',
    level: 'intermediate',
    type: 'documentation',
    url: 'https://www.typescriptlang.org/docs/',
    estimatedHours: 12,
    isFree: true,
    rating: 4.6,
    description:
      'Official TypeScript documentation covering types, interfaces, functions, classes, generics and more.',
    isActive: true,
  },

  {
    title: 'Docker Getting Started',
    provider: 'Docker Docs',
    skill: 'Docker',
    level: 'beginner',
    type: 'documentation',
    url: 'https://docs.docker.com/get-started/',
    estimatedHours: 8,
    isFree: true,
    rating: 4.5,
    description:
      'Learn Docker fundamentals including containers, images, Dockerfiles and basic workflows.',
    isActive: true,
  },

  {
    title: 'AWS Cloud Practitioner Essentials',
    provider: 'AWS Training',
    skill: 'AWS',
    level: 'beginner',
    type: 'course',
    url: 'https://aws.amazon.com/training/',
    estimatedHours: 15,
    isFree: true,
    rating: 4.6,
    description:
      'Learn the fundamentals of AWS cloud services, architecture, security and pricing.',
    isActive: true,
  },

  {
    title: 'Node.js Official Documentation',
    provider: 'Node.js',
    skill: 'Node.js',
    level: 'intermediate',
    type: 'documentation',
    url: 'https://nodejs.org/docs/latest/api/',
    estimatedHours: 10,
    isFree: true,
    rating: 4.4,
    description:
      'Official Node.js documentation for learning APIs, modules, asynchronous programming and backend development.',
    isActive: true,
  },

  {
    title: 'MongoDB University Free Courses',
    provider: 'MongoDB',
    skill: 'MongoDB',
    level: 'beginner',
    type: 'course',
    url: 'https://learn.mongodb.com/',
    estimatedHours: 20,
    isFree: true,
    rating: 4.5,
    description:
      'Learn MongoDB databases, CRUD operations, data modeling and application development.',
    isActive: true,
  },

  {
    title: 'GitHub Actions Documentation',
    provider: 'GitHub',
    skill: 'CI/CD',
    level: 'intermediate',
    type: 'documentation',
    url: 'https://docs.github.com/en/actions',
    estimatedHours: 8,
    isFree: true,
    rating: 4.5,
    description:
      'Learn GitHub Actions and the fundamentals of continuous integration and continuous deployment.',
    isActive: true,
  },

  {
    title: 'HTML MDN Web Docs',
    provider: 'MDN Web Docs',
    skill: 'HTML',
    level: 'beginner',
    type: 'documentation',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    estimatedHours: 8,
    isFree: true,
    rating: 4.8,
    description:
      'Learn HTML elements, semantic markup, forms, accessibility and modern web standards.',
    isActive: true,
  },

  {
    title: 'Git Documentation',
    provider: 'Git SCM',
    skill: 'Git',
    level: 'beginner',
    type: 'documentation',
    url: 'https://git-scm.com/doc',
    estimatedHours: 6,
    isFree: true,
    rating: 4.7,
    description:
      'Learn Git version control, repositories, branches, commits, merging and collaboration.',
    isActive: true,
  },

  {
    title: 'Express.js Official Guide',
    provider: 'Express.js',
    skill: 'Express.js',
    level: 'intermediate',
    type: 'documentation',
    url: 'https://expressjs.com/',
    estimatedHours: 8,
    isFree: true,
    rating: 4.6,
    description:
      'Learn Express.js routing, middleware, APIs, error handling and backend development.',
    isActive: true,
  },

  {
    title: 'Tailwind CSS Documentation',
    provider: 'Tailwind CSS',
    skill: 'Tailwind CSS',
    level: 'beginner',
    type: 'documentation',
    url: 'https://tailwindcss.com/docs',
    estimatedHours: 10,
    isFree: true,
    rating: 4.7,
    description:
      'Learn utility-first CSS and build responsive modern user interfaces with Tailwind CSS.',
    isActive: true,
  },

  {
    title: 'PostgreSQL Official Documentation',
    provider: 'PostgreSQL',
    skill: 'PostgreSQL',
    level: 'beginner',
    type: 'documentation',
    url: 'https://www.postgresql.org/docs/',
    estimatedHours: 15,
    isFree: true,
    rating: 4.7,
    description:
      'Learn PostgreSQL databases, SQL queries, tables, relationships and database management.',
    isActive: true,
  },

  {
    title: 'Redux Official Essentials Tutorial',
    provider: 'Redux',
    skill: 'Redux',
    level: 'intermediate',
    type: 'tutorial',
    url: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts',
    estimatedHours: 10,
    isFree: true,
    rating: 4.6,
    description:
      'Learn Redux state management and how to use Redux Toolkit in modern React applications.',
    isActive: true,
  },

  {
    title: 'Jest Documentation',
    provider: 'Jest',
    skill: 'Jest',
    level: 'beginner',
    type: 'documentation',
    url: 'https://jestjs.io/docs/getting-started',
    estimatedHours: 6,
    isFree: true,
    rating: 4.6,
    description:
      'Learn JavaScript testing with Jest including test cases, matchers, mocks and coverage.',
    isActive: true,
  },

  {
    title: 'GraphQL Official Documentation',
    provider: 'GraphQL',
    skill: 'GraphQL',
    level: 'intermediate',
    type: 'documentation',
    url: 'https://graphql.org/learn/',
    estimatedHours: 10,
    isFree: true,
    rating: 4.6,
    description:
      'Learn GraphQL queries, mutations, schemas, resolvers and API development.',
    isActive: true,
  },

  {
    title: 'Unit Testing Fundamentals',
    provider: 'freeCodeCamp',
    skill: 'Unit Testing',
    level: 'beginner',
    type: 'tutorial',
    url: 'https://www.freecodecamp.org/learn/',
    estimatedHours: 8,
    isFree: true,
    rating: 4.5,
    description:
      'Learn unit testing fundamentals and how to write reliable automated tests.',
    isActive: true,
  },

  {
    title: 'Testing JavaScript Applications',
    provider: 'Testing Library',
    skill: 'Testing',
    level: 'intermediate',
    type: 'documentation',
    url: 'https://testing-library.com/docs/',
    estimatedHours: 8,
    isFree: true,
    rating: 4.6,
    description:
      'Learn practical testing approaches for modern JavaScript and frontend applications.',
    isActive: true,
  },
];

// ============================================================
// INSERT ONLY MISSING RESOURCES
// ============================================================
const addResources = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully.');

    let added = 0;
    let skipped = 0;

    for (const resource of resources) {
      const existing = await LearningResource.findOne({
        skill: resource.skill,
        title: resource.title,
      });

      if (existing) {
        console.log(`⏭️ Already exists: ${resource.skill}`);
        skipped++;
        continue;
      }

      await LearningResource.create(resource);

      console.log(`✅ Added: ${resource.skill} - ${resource.title}`);
      added++;
    }

    console.log('');
    console.log('========================================');
    console.log('Learning resources update completed');
    console.log('========================================');
    console.log(`✅ Added: ${added}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📚 Total checked: ${resources.length}`);
    console.log('========================================');

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add learning resources:', error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

addResources();