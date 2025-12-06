const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                gender: true,
                birthDate: true,
                profileCompleted: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: { message: 'Error fetching profile' }
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { email, firstName, lastName, gender, birthDate } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (email !== undefined) updateData.email = email;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (gender !== undefined) updateData.gender = gender;
        if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                gender: true,
                birthDate: true,
                profileCompleted: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: { message: 'Error updating profile' }
        });
    }
};

const markProfileCompleted = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profileCompleted: true },
            select: {
                id: true,
                username: true,
                profileCompleted: true
            }
        });

        res.json({
            message: 'Profile marked as completed',
            user
        });
    } catch (error) {
        console.error('Mark profile completed error:', error);
        res.status(500).json({
            error: { message: 'Error marking profile as completed' }
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    markProfileCompleted
};
