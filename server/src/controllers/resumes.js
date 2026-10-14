const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errors');
const logger = require('../config/logger');

const AI_SERVICE =
  process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// @desc    Upload and parse resume
// @route   POST /api/resumes/upload
// @access  Private (Student)
const uploadResume = async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError(
        'Please upload a resume file.',
        400
      )
    );
  }

  const { title } = req.body;
  const file = req.file;

  const ext = path
    .extname(file.originalname)
    .toLowerCase()
    .slice(1);

  // Validate file extension
  if (!['pdf', 'docx', 'txt'].includes(ext)) {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      logger.warn(
        'Could not delete unsupported file:',
        err.message
      );
    }

    return next(
      new AppError(
        'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
        400
      )
    );
  }

  // Count existing resumes for version
  const count = await Resume.countDocuments({
    user: req.user._id,
    isDeleted: false,
  });

  // Create resume document (isLatest defaults to false until parsing succeeds)
  const resume = await Resume.create({
    user: req.user._id,
    title: title || `Resume v${count + 1}`,
    version: count + 1,
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    fileType: ext,
    fileSize: file.size,
    parseStatus: 'processing',
    isLatest: false,
  });

  // ============================================================
  // CALL AI SERVICE TO PARSE RESUME
  // ============================================================

  try {
    console.log('🤖 Sending resume to AI parser:', {
      resumeId: resume._id.toString(),
      filePath: file.path,
      fileType: ext,
      aiService: AI_SERVICE,
    });

    const aiResponse = await axios.post(
      `${AI_SERVICE}/parse/resume`,
      {
        filePath: file.path,
        fileType: ext,
      },
      {
        timeout: 180000,
      }
    );

    console.log('🤖 AI parser response:', {
      status: aiResponse.status,
      success: aiResponse.data?.success,
    });

    if (aiResponse.data?.success) {
      const {
        parsedData,
        qualityAnalysis,
        summary,
      } = aiResponse.data;

      // Mark all previous resumes for user as not latest
      await Resume.updateMany(
        {
          user: req.user._id,
          _id: { $ne: resume._id },
          isDeleted: false,
        },
        {
          isLatest: false,
        }
      );

      // Save parsed information & promote as latest active resume
      resume.parsedData = parsedData;
      resume.qualityScore = qualityAnalysis?.qualityScore || 0;
      resume.qualityAnalysis = qualityAnalysis || {};
      resume.parseStatus = 'completed';
      resume.parseError = undefined;
      resume.isLatest = true;

      await resume.save();

      console.log('✅ Resume parsed successfully:', {
        resumeId: resume._id.toString(),
        parseStatus: resume.parseStatus,
        hasParsedData: !!resume.parsedData,
        hasNormalizedSkills:
          !!resume.parsedData?.normalizedSkills,
      });

      // Notification
      await Notification.create({
        user: req.user._id,
        type: 'analysis_complete',
        title: 'Resume Parsed Successfully ✅',
        message: `Your resume was parsed. Found ${
          summary?.skillsDetected || 0
        } skills, ${summary?.projectsDetected || 0} projects, and ${
          summary?.educationRecords || 0
        } education records.`,
        link: `/resumes/${resume._id}`,
        icon: 'FileText',
      });

      return res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully.',
        resume: {
          ...resume.toObject(),
          parseSummary: summary,
        },
      });
    }

    // AI service responded but reported failure
    throw new Error(
      aiResponse.data?.error || 'AI resume parsing failed.'
    );
  } catch (aiError) {
    // ============================================================
    // AI PARSING FAILED
    // ============================================================

    const isConnectionError =
      aiError.code === 'ECONNREFUSED' ||
      aiError.code === 'ENOTFOUND' ||
      aiError.code === 'ETIMEDOUT';

    const statusCode = isConnectionError ? 503 : 422;

    const aiErrorMessage = isConnectionError
      ? 'Resume parsing service is currently unavailable. Please ensure the Python AI service is running and try again.'
      : aiError.response?.data?.error ||
        aiError.response?.data?.message ||
        aiError.message ||
        'Unknown AI parsing error';

    console.error('❌ AI RESUME PARSE ERROR:', {
      message: aiErrorMessage,
      code: aiError.code,
      responseStatus: aiError.response?.status,
      responseData: aiError.response?.data,
      resumeId: resume._id.toString(),
      filePath: file.path,
      fileType: ext,
    });

    logger.error(
      `AI parse error for resume ${resume._id}: ${aiErrorMessage}`
    );

    // Mark resume as failed without altering previous active latest resume
    resume.parseStatus = 'failed';
    resume.parseError = aiErrorMessage;
    resume.isLatest = false;

    await resume.save();

    // Notification
    try {
      await Notification.create({
        user: req.user._id,
        type: 'resume_parse_failed',
        title: 'Resume Parsing Failed ❌',
        message: isConnectionError
          ? 'Resume parsing service is temporarily unavailable.'
          : 'Your resume was uploaded, but AI parsing failed. Please try uploading a valid text-based file.',
        link: '/dashboard/upload',
        icon: 'AlertCircle',
      });
    } catch (notificationError) {
      logger.warn(
        'Could not create resume parse failure notification:',
        notificationError.message
      );
    }

    // Return status code (503 for connection error, 422 for invalid text parsing)
    return res.status(statusCode).json({
      success: false,
      message: aiErrorMessage,
      resume: resume.toObject(),
      parseWarning: aiErrorMessage,
    });
  }
};

// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res) => {
  const resumes = await Resume.find({
    user: req.user._id,
    isDeleted: false,
  })
    .select('-parsedData.rawText')
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,
    count: resumes.length,
    resumes,
  });
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
const getResume = async (req, res, next) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).select('-parsedData.rawText');

  if (!resume) {
    return next(new AppError('Resume not found.', 404));
  }

  // Ownership check
  if (
    resume.user.toString() !== req.user._id.toString() &&
    !['recruiter', 'tp_admin', 'super_admin'].includes(req.user.role)
  ) {
    return next(new AppError('Access denied.', 403));
  }

  res.json({
    success: true,
    resume,
  });
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
    isDeleted: false,
  });

  if (!resume) {
    return next(new AppError('Resume not found.', 404));
  }

  const wasLatest = resume.isLatest;

  // Soft delete
  resume.isDeleted = true;
  resume.isLatest = false;
  await resume.save();

  // If deleted resume was active latest, promote the most recent completed resume
  if (wasLatest) {
    const previousLatest = await Resume.findOne({
      user: req.user._id,
      isDeleted: false,
      parseStatus: 'completed',
    }).sort({ createdAt: -1 });

    if (previousLatest) {
      previousLatest.isLatest = true;
      await previousLatest.save();
    }
  }

  // Try to delete physical file
  try {
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
  } catch (err) {
    logger.warn('Could not delete resume file:', err.message);
  }

  res.json({
    success: true,
    message: 'Resume deleted successfully.',
  });
};

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
};