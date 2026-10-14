const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../utils/errors');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `resume_${req.user._id}_${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const allowedExts = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// Bulk upload for recruiter
const bulkUploadDir = path.join(__dirname, '../../uploads/bulk');
if (!fs.existsSync(bulkUploadDir)) {
  fs.mkdirSync(bulkUploadDir, { recursive: true });
}

const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bulkUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `bulk_${req.user._id}_${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const bulkUpload = multer({
  storage: bulkStorage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024,
    files: 20,
  },
});

module.exports = { upload, bulkUpload };
