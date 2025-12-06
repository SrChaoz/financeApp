const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal
} = require('../controllers/goalController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getGoals);
router.get('/:id', getGoal);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.post('/:id/complete', completeGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
