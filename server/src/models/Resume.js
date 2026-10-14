const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'My Resume',
      maxlength: 100,
    },
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: false },
    // File info
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    fileSize: { type: Number, required: true },
    // Parsed data
    parsedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      summary: { type: String, default: '' },
      // Education
      education: [
        {
          degree: { type: String },
          institution: { type: String },
          year: { type: String },
          cgpa: { type: String },
          field: { type: String },
        },
      ],
      // Experience
      experience: [
        {
          title: { type: String },
          company: { type: String },
          duration: { type: String },
          description: { type: String },
          technologies: [{ type: String }],
        },
      ],
      // Skills
      skills: {
        technical: [{ type: String }],
        programming: [{ type: String }],
        frameworks: [{ type: String }],
        tools: [{ type: String }],
        databases: [{ type: String }],
        cloud: [{ type: String }],
        soft: [{ type: String }],
        other: [{ type: String }],
      },
      // Normalized skills (canonical names)
      normalizedSkills: [{ type: String }],
      // Projects
      projects: [
        {
          title: { type: String },
          description: { type: String },
          technologies: [{ type: String }],
          links: [{ type: String }],
        },
      ],
      // Certifications
      certifications: [
        {
          name: { type: String },
          issuer: { type: String },
          year: { type: String },
        },
      ],
      // Achievements
      achievements: [{ type: String }],
      // Raw text (for re-processing)
      rawText: { type: String, select: false },
    },
    // Parse status
    parseStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    parseError: { type: String, default: null },
    // Quality metrics
    qualityScore: { type: Number, default: null },
    qualityAnalysis: {
      hasContactInfo: { type: Boolean, default: false },
      hasEmail: { type: Boolean, default: false },
      hasPhone: { type: Boolean, default: false },
      hasSummary: { type: Boolean, default: false },
      hasSkills: { type: Boolean, default: false },
      hasProjects: { type: Boolean, default: false },
      hasExperience: { type: Boolean, default: false },
      hasEducation: { type: Boolean, default: false },
      hasCertifications: { type: Boolean, default: false },
      hasGithub: { type: Boolean, default: false },
      hasLinkedin: { type: Boolean, default: false },
      skillsCount: { type: Number, default: 0 },
      projectsCount: { type: Number, default: 0 },
      suggestions: [{ type: String }],
    },
    // Analysis count
    analysisCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ user: 1, isLatest: 1 });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
