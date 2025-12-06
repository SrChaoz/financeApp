const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all accounts for the authenticated user
const getAccounts = async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
            where: {
                userId: req.userId
            },
            include: {
                _count: {
                    select: { transactions: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ accounts });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({
            error: { message: 'Error fetching accounts' }
        });
    }
};

// Get a single account
const getAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const account = await prisma.account.findFirst({
            where: {
                id,
                userId: req.userId
            },
            include: {
                transactions: {
                    orderBy: {
                        date: 'desc'
                    },
                    take: 10
                }
            }
        });

        if (!account) {
            return res.status(404).json({
                error: { message: 'Account not found' }
            });
        }

        res.json({ account });
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({
            error: { message: 'Error fetching account' }
        });
    }
};

// Create a new account
const createAccount = async (req, res) => {
    try {
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                error: { message: 'Name and type are required' }
            });
        }

        const account = await prisma.account.create({
            data: {
                name,
                type,
                userId: req.userId
            }
        });

        res.status(201).json({
            message: 'Account created successfully',
            account
        });
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({
            error: { message: 'Error creating account' }
        });
    }
};

// Update an account
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;

        const existingAccount = await prisma.account.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingAccount) {
            return res.status(404).json({
                error: { message: 'Account not found' }
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (type) updateData.type = type;

        const account = await prisma.account.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: 'Account updated successfully',
            account
        });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({
            error: { message: 'Error updating account' }
        });
    }
};

// Delete an account
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const account = await prisma.account.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!account) {
            return res.status(404).json({
                error: { message: 'Account not found' }
            });
        }

        await prisma.account.delete({
            where: { id }
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            error: { message: 'Error deleting account' }
        });
    }
};

module.exports = {
    getAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount
};
