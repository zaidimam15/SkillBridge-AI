const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { runAnalysis, getAnalysis, getHistory } = require('../controllers/analysis');

router.use(protect);
router.post('/', authorize('student', 'recruiter', 'super_admin'), runAnalysis);
router.get('/history', getHistory);
router.get('/:id', getAnalysis);

module.exports = router;
