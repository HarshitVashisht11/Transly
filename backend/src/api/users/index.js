const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// Get the current user profile
router.get('/me', async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get usage statistics
    const transcriptionCount = await prisma.transcriptionJob.count({
      where: { userId },
    });
    
    const completedJobs = await prisma.transcriptionJob.count({
      where: { 
        userId,
        status: 'COMPLETED'
      },
    });
    
    return res.json({
      user,
      stats: {
        totalJobs: transcriptionCount,
        completedJobs,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.patch('/me', async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    
    // If email is being updated, check if it's already in use
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      updateData.email = email;
    }
    
    // If password is being updated, verify current password
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return res.json({
      message: 'User profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Failed to update user profile' });
  }
});

module.exports = router;
