const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount
} = require('../controllers/accountController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
