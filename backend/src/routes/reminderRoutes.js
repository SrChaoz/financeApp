const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    getUpcomingReminders
} = require('../controllers/reminderController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getReminders);
router.get('/upcoming', getUpcomingReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
