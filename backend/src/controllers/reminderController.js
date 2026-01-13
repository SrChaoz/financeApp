const prisma = require('../lib/prisma');



// Get all reminders for the authenticated user
const getReminders = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {
            userId: req.userId
        };

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ reminders });
    } catch (error) {
        console.error('Get reminders error:', error);
        res.status(500).json({
            error: { message: 'Error fetching reminders' }
        });
    }
};

// Create a new reminder
const createReminder = async (req, res) => {
    try {
        const { title, amount, dueDate, frequency, category, notes } = req.body;

        if (!title || !dueDate || !frequency || !category) {
            return res.status(400).json({
                error: { message: 'Title, due date, frequency, and category are required' }
            });
        }

        const reminder = await prisma.reminder.create({
            data: {
                title,
                amount: amount ? parseFloat(amount) : null,
                dueDate: new Date(dueDate),
                frequency,
                category,
                notes: notes || null,
                userId: req.userId
            }
        });

        res.status(201).json({
            message: 'Reminder created successfully',
            reminder
        });
    } catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({
            error: { message: 'Error creating reminder' }
        });
    }
};

// Update a reminder
const updateReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, dueDate, frequency, category, notes, isActive } = req.body;

        const existingReminder = await prisma.reminder.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!existingReminder) {
            return res.status(404).json({
                error: { message: 'Reminder not found' }
            });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (amount !== undefined) updateData.amount = amount ? parseFloat(amount) : null;
        if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
        if (frequency !== undefined) updateData.frequency = frequency;
        if (category !== undefined) updateData.category = category;
        if (notes !== undefined) updateData.notes = notes;
        if (isActive !== undefined) updateData.isActive = isActive;

        const reminder = await prisma.reminder.update({
            where: { id },
            data: updateData
        });

        res.json({
            message: 'Reminder updated successfully',
            reminder
        });
    } catch (error) {
        console.error('Update reminder error:', error);
        res.status(500).json({
            error: { message: 'Error updating reminder' }
        });
    }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;

        const reminder = await prisma.reminder.findFirst({
            where: {
                id,
                userId: req.userId
            }
        });

        if (!reminder) {
            return res.status(404).json({
                error: { message: 'Reminder not found' }
            });
        }

        await prisma.reminder.delete({
            where: { id }
        });

        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Delete reminder error:', error);
        res.status(500).json({
            error: { message: 'Error deleting reminder' }
        });
    }
};

// Get upcoming reminders (next 7 days)
const getUpcomingReminders = async (req, res) => {
    try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const reminders = await prisma.reminder.findMany({
            where: {
                userId: req.userId,
                isActive: true,
                dueDate: {
                    gte: today,
                    lte: nextWeek
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        res.json({ reminders });
    } catch (error) {
        console.error('Get upcoming reminders error:', error);
        res.status(500).json({
            error: { message: 'Error fetching upcoming reminders' }
        });
    }
};

module.exports = {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    getUpcomingReminders
};
