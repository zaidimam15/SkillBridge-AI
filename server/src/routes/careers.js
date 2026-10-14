const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { getCareerPathways } = require('../controllers/careers');

// ============================================================
// CAREER PATHWAYS ROUTES
// ============================================================

// GET /api/careers
// ------------------------------------------------------------
// Returns personalized career recommendations for the
// currently logged-in user.
//
// The controller:
// 1. Finds the user's latest successfully parsed resume
// 2. Extracts the user's skills
// 3. Compares those skills against career benchmarks
// 4. Calculates match percentage
// 5. Returns matched + missing mandatory skills
// 6. Returns matched + missing bonus skills
// 7. Sorts careers from highest match to lowest match
// ------------------------------------------------------------
router.get('/', protect, getCareerPathways);

module.exports = router;