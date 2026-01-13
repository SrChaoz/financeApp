const prisma = require('../lib/prisma');



// Get all goals for the authenticated user
const getGoals = async (req, res) => {
    try {
        const goals = await prisma.goal.findMany({
            where: {
                userId: req.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ goals });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({
            error: { message: 'Error fetching goals' }
        });
    }
};

// Get a single goal
const getGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const goal = await prisma.goal.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!goal) {
            return res.status(404).json({
                error: { message: 'Goal not found' }
            });
        }

        res.json({ goal });
    } catch (error) {
        console.error('Get goal error:', error);
        res.status(500).json({
            error: { message: 'Error fetching goal' }
        });
    }
};

// Create a new goal
const createGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, deadline, description } = req.body;

        if (!name || !targetAmount) {
            return res.status(400).json({
                error: { message: 'Name and target amount are required' }
            });
        }

        const goal = await prisma.goal.create({
            data: {
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
                deadline: deadline ? new Date(deadline) : null,
                description: description || null,
                userId: req.userId
            }
        });

        res.status(201).json({
            message: 'Goal created successfully',
            goal
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({
            error: { message: 'Error creating goal' }
        });
    }
};

// Update a goal
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, targetAmount, currentAmount, deadline, description, isCompleted } = req.body;

        const existingGoal = await prisma.goal.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingGoal) {
            return res.status(404).json({
                error: { message: 'Goal not found' }
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount);
        if (currentAmount !== undefined) {
            updateData.currentAmount = parseFloat(currentAmount);
            // Auto-complete if target reached
            if (parseFloat(currentAmount) >= existingGoal.targetAmount && !existingGoal.isCompleted) {
                updateData.isCompleted = true;
                updateData.completedAt = new Date();
            }
        }
        if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
        if (description !== undefined) updateData.description = description;
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            if (isCompleted && !existingGoal.completedAt) {
                updateData.completedAt = new Date();
            }
        }

        const goal = await prisma.goal.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: 'Goal updated successfully',
            goal
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({
            error: { message: 'Error updating goal' }
        });
    }
};

// Delete a goal
const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const goal = await prisma.goal.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!goal) {
            return res.status(404).json({
                error: { message: 'Goal not found' }
            });
        }

        await prisma.goal.delete({
            where: { id }
        });

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({
            error: { message: 'Error deleting goal' }
        });
    }
};

// Mark goal as completed
const completeGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const goal = await prisma.goal.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!goal) {
            return res.status(404).json({
                error: { message: 'Goal not found' }
            });
        }

        if (goal.isCompleted) {
            return res.status(400).json({
                error: { message: 'Goal is already completed' }
            });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                isCompleted: true,
                completedAt: new Date()
            }
        });

        res.json({
            message: 'Goal marked as completed',
            goal: updatedGoal
        });
    } catch (error) {
        console.error('Complete goal error:', error);
        res.status(500).json({
            error: { message: 'Error completing goal' }
        });
    }
};

module.exports = {
    getGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal
};
