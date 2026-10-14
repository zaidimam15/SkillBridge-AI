const express = require('express');

const router = express.Router();

// ============================================================
// CONTROLLERS
// ============================================================

const {
    uploadResume,
    getResumes,
    getResume,
    deleteResume,
} = require('../controllers/resumes');

// ============================================================
// MIDDLEWARE
// ============================================================

const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ============================================================
// AUTHENTICATION
// ============================================================

router.use(protect);

// ============================================================
// RESUME ROUTES
// ============================================================

// Upload resume
// POST /api/resumes/upload
router.post(
    '/upload',
    upload.single('resume'),
    uploadResume
);

// Get all resumes
// GET /api/resumes
router.get(
    '/',
    getResumes
);

// Get single resume
// GET /api/resumes/:id
router.get(
    '/:id',
    getResume
);

// Delete resume
// DELETE /api/resumes/:id
router.delete(
    '/:id',
    deleteResume
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;