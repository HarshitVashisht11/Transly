const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Accept audio and video files
    const allowedMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'), false);
    }
  }
});

// Create a new transcription job
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { model = 'base', language = 'auto', translate = false } = req.body;
    const { userId } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create transcription job
    const job = await prisma.transcriptionJob.create({
      data: {
        status: 'PENDING',
        model,
        language,
        translate: translate === 'true',
        userId,
        audioFileKey: req.file.filename, // Use filename as "S3 key" placeholder
      },
    });
    
    // Start processing the file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('model', model);
    formData.append('language', language);
    formData.append('translate', translate === 'true' ? 'true' : 'false');
    
    // Update job to processing
    await prisma.transcriptionJob.update({
      where: { id: job.id },
      data: { status: 'PROCESSING' },
    });
    
    try {
      // Send to whisper service
      const whisperUrl = process.env.WHISPER_SERVICE_URL || 'http://whisper:8000';
      const response = await axios.post(`${whisperUrl}/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        maxBodyLength: Infinity,
      });
      
      // Update job with results
      await prisma.transcriptionJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          transcript: response.data.transcript,
          processingTime: response.data.processing_time,
          // In a real implementation, you'd upload to S3 and store the key
          transcriptKey: `${job.id}-transcript.txt`,
        },
      });
      
      return res.status(200).json({
        id: job.id,
        status: 'COMPLETED',
        transcript: response.data.transcript,
        processingTime: response.data.processing_time,
      });
    } catch (error) {
      console.error('Transcription processing error:', error.message);
      
      let errorMessage = 'Transcription processing failed';
      let statusCode = 500;
      
      // Check if error is due to model download in progress
      if (error.response && error.response.data && 
          error.response.data.error && 
          error.response.data.error.includes('download')) {
        errorMessage = `Model download in progress. Please try again in a few minutes: ${error.response.data.error}`;
        statusCode = 503; // Service Unavailable
      }
      
      // Update job with failure status
      await prisma.transcriptionJob.update({
        where: { id: job.id },
        data: { status: 'FAILED' },
      });
      
      return res.status(statusCode).json({
        message: errorMessage,
        jobId: job.id,
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Transcription request error:', error);
    return res.status(500).json({ message: 'Failed to create transcription job' });
  }
});

// Get all transcription jobs for the user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.user;
    
    const jobs = await prisma.transcriptionJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json(jobs);
  } catch (error) {
    console.error('Error fetching transcription jobs:', error);
    return res.status(500).json({ message: 'Failed to fetch transcription jobs' });
  }
});

// Get a specific transcription job
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const job = await prisma.transcriptionJob.findUnique({
      where: { id },
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Transcription job not found' });
    }
    
    if (job.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this transcription' });
    }
    
    return res.json(job);
  } catch (error) {
    console.error('Error fetching transcription job:', error);
    return res.status(500).json({ message: 'Failed to fetch transcription job' });
  }
});

// Delete a transcription job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const job = await prisma.transcriptionJob.findUnique({
      where: { id },
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Transcription job not found' });
    }
    
    if (job.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this transcription' });
    }
    
    // Delete associated audio file if it exists
    if (job.audioFileKey) {
      const audioPath = path.join(__dirname, '../../../uploads', job.audioFileKey);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    
    // Delete job from database
    await prisma.transcriptionJob.delete({
      where: { id },
    });
    
    return res.json({ message: 'Transcription job deleted successfully' });
  } catch (error) {
    console.error('Error deleting transcription job:', error);
    return res.status(500).json({ message: 'Failed to delete transcription job' });
  }
});

module.exports = router;
