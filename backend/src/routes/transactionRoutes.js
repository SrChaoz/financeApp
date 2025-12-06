const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStatistics
} = require('../controllers/transactionController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getTransactions);
router.get('/statistics', getStatistics);
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
