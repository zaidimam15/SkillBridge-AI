const LearningResource = require('../models/LearningResource');

// ============================================================
// Normalize skill name
// ============================================================
const normalizeSkill = (skill) => {
  return String(skill || '')
    .trim()
    .replace(/\s+/g, ' ');
};

// ============================================================
// Create safe URL query
// ============================================================
const encodeSkill = (skill) => {
  return encodeURIComponent(normalizeSkill(skill));
};

// ============================================================
// Build dynamic fallback resources
//
// These work for ANY skill.
// No manual skill-by-skill database entry is required.
// ============================================================
const buildDynamicResources = (skill) => {
  const cleanSkill = normalizeSkill(skill);

  if (!cleanSkill) {
    return [];
  }

  const encodedSkill = encodeSkill(cleanSkill);

  return [
    {
      title: `${cleanSkill} Learning Roadmap`,
      provider: 'roadmap.sh',
      skill: cleanSkill,
      level: 'beginner',
      type: 'tutorial',
      url: `https://roadmap.sh/roadmaps/?g=${encodedSkill}`,
      estimatedHours: 10,
      isFree: true,
      rating: 4.7,
      description:
        `Explore a structured learning roadmap and resources for ${cleanSkill}.`,
      isActive: true,
    },

    {
      title: `${cleanSkill} Tutorials`,
      provider: 'freeCodeCamp',
      skill: cleanSkill,
      level: 'beginner',
      type: 'tutorial',
      url: `https://www.freecodecamp.org/news/search/?query=${encodedSkill}`,
      estimatedHours: 8,
      isFree: true,
      rating: 4.6,
      description:
        `Find free tutorials and learning articles related to ${cleanSkill}.`,
      isActive: true,
    },

    {
      title: `${cleanSkill} Beginner Tutorials`,
      provider: 'YouTube',
      skill: cleanSkill,
      level: 'beginner',
      type: 'video',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${cleanSkill} tutorial for beginners`
      )}`,
      estimatedHours: 8,
      isFree: true,
      rating: 4.5,
      description:
        `Find beginner-friendly video tutorials and practical explanations for ${cleanSkill}.`,
      isActive: true,
    },
  ];
};

// ============================================================
// Find existing resources for a skill
// ============================================================
const findExistingResources = async (skill) => {
  const cleanSkill = normalizeSkill(skill);

  if (!cleanSkill) {
    return [];
  }

  return LearningResource.find({
    isActive: true,
    $or: [
      {
        skill: {
          $regex: `^${cleanSkill.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          )}$`,
          $options: 'i',
        },
      },
      {
        skills: {
          $regex: `^${cleanSkill.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          )}$`,
          $options: 'i',
        },
      },
    ],
  })
    .sort({
      rating: -1,
      level: 1,
    })
    .limit(5)
    .lean();
};

// ============================================================
// Create dynamic resources only when skill is new
// ============================================================
const createDynamicResources = async (skill) => {
  const cleanSkill = normalizeSkill(skill);

  if (!cleanSkill) {
    return [];
  }

  const dynamicResources = buildDynamicResources(cleanSkill);

  const savedResources = [];

  for (const resource of dynamicResources) {
    const existing = await LearningResource.findOne({
      skill: cleanSkill,
      title: resource.title,
    });

    if (existing) {
      savedResources.push(existing.toObject());
      continue;
    }

    const created = await LearningResource.create(resource);

    savedResources.push(created.toObject());

    console.log(
      `✅ Dynamic learning resource created: ${cleanSkill} → ${resource.provider}`
    );
  }

  return savedResources;
};

// ============================================================
// MAIN RESOURCE RESOLVER
//
// 1. Check MongoDB
// 2. If resources exist → return them
// 3. If not → create dynamic resources
// 4. Return resources
// ============================================================
const resolveResourcesForSkill = async (skill) => {
  const cleanSkill = normalizeSkill(skill);

  if (!cleanSkill) {
    return [];
  }

  try {
    // --------------------------------------------------------
    // FIRST: Check database
    // --------------------------------------------------------
    const existingResources = await findExistingResources(cleanSkill);

    if (existingResources.length > 0) {
      return existingResources;
    }

    // --------------------------------------------------------
    // SECOND: No resource found
    // Create dynamic resources
    // --------------------------------------------------------
    console.log(
      `🔎 No learning resources found for "${cleanSkill}". Creating dynamic resources...`
    );

    return await createDynamicResources(cleanSkill);
  } catch (error) {
    console.error(
      `❌ Resource resolver failed for "${cleanSkill}":`,
      error.message
    );

    // --------------------------------------------------------
    // FINAL FALLBACK
    //
    // Even if MongoDB insertion fails, return usable
    // dynamic links to the frontend.
    // --------------------------------------------------------
    return buildDynamicResources(cleanSkill);
  }
};

// ============================================================
// Resolve resources for multiple skills
// ============================================================
const resolveResourcesForSkills = async (skills = []) => {
  const uniqueSkills = [
    ...new Set(
      skills
        .map(normalizeSkill)
        .filter(Boolean)
        .map((skill) => skill.toLowerCase())
    ),
  ];

  const results = {};

  for (const normalizedSkill of uniqueSkills) {
    const originalSkill =
      skills.find(
        (skill) =>
          normalizeSkill(skill).toLowerCase() === normalizedSkill
      ) || normalizedSkill;

    results[originalSkill] =
      await resolveResourcesForSkill(originalSkill);
  }

  return results;
};

module.exports = {
  normalizeSkill,
  buildDynamicResources,
  findExistingResources,
  createDynamicResources,
  resolveResourcesForSkill,
  resolveResourcesForSkills,
};