const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, markProfileCompleted } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/complete', markProfileCompleted);

module.exports = router;
