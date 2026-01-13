const prisma = require('../lib/prisma');



// Get all budgets for the authenticated user
const getBudgets = async (req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: {
                userId: req.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ budgets });
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({
            error: { message: 'Error fetching budgets' }
        });
    }
};

// Create a new budget
const createBudget = async (req, res) => {
    try {
        const { category, limitAmount } = req.body;

        if (!category || !limitAmount) {
            return res.status(400).json({
                error: { message: 'Category and limitAmount are required' }
            });
        }

        const budget = await prisma.budget.create({
            data: {
                category,
                limitAmount: parseFloat(limitAmount),
                userId: req.userId
            }
        });

        res.status(201).json({
            message: 'Budget created successfully',
            budget
        });
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({
            error: { message: 'Error creating budget' }
        });
    }
};

// Update a budget
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, limitAmount } = req.body;

        const existingBudget = await prisma.budget.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingBudget) {
            return res.status(404).json({
                error: { message: 'Budget not found' }
            });
        }

        const updateData = {};
        if (category) updateData.category = category;
        if (limitAmount !== undefined) updateData.limitAmount = parseFloat(limitAmount);

        const budget = await prisma.budget.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: 'Budget updated successfully',
            budget
        });
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({
            error: { message: 'Error updating budget' }
        });
    }
};

// Delete a budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const budget = await prisma.budget.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!budget) {
            return res.status(404).json({
                error: { message: 'Budget not found' }
            });
        }

        await prisma.budget.delete({
            where: { id }
        });

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({
            error: { message: 'Error deleting budget' }
        });
    }
};

module.exports = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
};
