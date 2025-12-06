const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all transactions for the authenticated user
const getTransactions = async (req, res) => {
    try {
        const { startDate, endDate, type, category, accountId } = req.query;

        const where = {
            userId: req.userId
        };

        // Add optional filters
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }
        if (type) where.type = type;
        if (category) where.category = category;
        if (accountId) where.accountId = accountId;

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                account: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.json({ transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            error: { message: 'Error fetching transactions' }
        });
    }
};

// Get a single transaction
const getTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.userId
            },
            include: {
                account: true
            }
        });

        if (!transaction) {
            return res.status(404).json({
                error: { message: 'Transaction not found' }
            });
        }

        res.json({ transaction });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            error: { message: 'Error fetching transaction' }
        });
    }
};

// Create a new transaction
const createTransaction = async (req, res) => {
    try {
        const { amount, type, date, category, notes, isRecurring, accountId } = req.body;

        // Validation
        if (!amount || !type || !category || !accountId) {
            return res.status(400).json({
                error: { message: 'Amount, type, category, and accountId are required' }
            });
        }

        // Verify account belongs to user
        const account = await prisma.account.findFirst({
            where: {
                id: accountId,
                userId: req.userId
            }
        });

        if (!account) {
            return res.status(404).json({
                error: { message: 'Account not found' }
            });
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                date: date ? new Date(date) : new Date(),
                category,
                notes: notes || null,
                isRecurring: isRecurring || false,
                accountId,
                userId: req.userId
            },
            include: {
                account: true
            }
        });

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            error: { message: 'Error creating transaction' }
        });
    }
};

// Update a transaction
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, date, category, notes, isRecurring, accountId } = req.body;

        // Check if transaction exists and belongs to user
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({
                error: { message: 'Transaction not found' }
            });
        }

        // If accountId is being changed, verify new account belongs to user
        if (accountId && accountId !== existingTransaction.accountId) {
            const account = await prisma.account.findFirst({
                where: {
                    id: accountId,
                    userId: req.userId
                }
            });

            if (!account) {
                return res.status(404).json({
                    error: { message: 'Account not found' }
                });
            }
        }

        const updateData = {};
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (type) updateData.type = type;
        if (date) updateData.date = new Date(date);
        if (category) updateData.category = category;
        if (notes !== undefined) updateData.notes = notes;
        if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
        if (accountId) updateData.accountId = accountId;

        const transaction = await prisma.transaction.update({
            where: { id },
            data: updateData,
            include: {
                account: true
            }
        });

        res.json({
            message: 'Transaction updated successfully',
            transaction
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({
            error: { message: 'Error updating transaction' }
        });
    }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if transaction exists and belongs to user
        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!transaction) {
            return res.status(404).json({
                error: { message: 'Transaction not found' }
            });
        }

        await prisma.transaction.delete({
            where: { id }
        });

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            error: { message: 'Error deleting transaction' }
        });
    }
};

// Get transaction statistics
const getStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {
            userId: req.userId
        };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const transactions = await prisma.transaction.findMany({
            where
        });

        const totalIncome = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const balance = totalIncome - totalExpenses;

        const expensesByCategory = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
                return acc;
            }, {});

        res.json({
            statistics: {
                totalIncome,
                totalExpenses,
                balance,
                expensesByCategory,
                transactionCount: transactions.length
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            error: { message: 'Error fetching statistics' }
        });
    }
};

module.exports = {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStatistics
};
