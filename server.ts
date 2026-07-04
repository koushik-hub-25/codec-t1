import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Import DB and Chatbot logic
import { db } from './src/server/db';
import { handleBotChat } from './src/server/chatbot';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Log API requests
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ================= API ENDPOINTS =================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
  });

  // 2. Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message content is required.' });
        return;
      }

      // Check if user is asking for repair status explicitly with a JOB ID
      const jobMatch = message.match(/\bJOB\d{3,5}\b/gi);
      if (jobMatch) {
        const jobId = jobMatch[0].toUpperCase();
        const statusRecord = db.getRepairStatus(jobId);
        if (statusRecord) {
          res.json({
            text: `🔍 **Repair Status Found for Job ID ${jobId}:**\n- **Customer:** ${statusRecord.customer_name}\n- **Current Status:** 📌 **${statusRecord.status}**\n\nNeed further assistance? We're on it!`,
            mode: 'rules'
          });
          return;
        } else {
          res.json({
            text: `🔍 **Repair Status Search:**\nI couldn't find a repair job with ID **${jobId}**. Please double-check your Job ID or contact our front desk at **+91-9876543210** to get a manual update.`,
            mode: 'rules'
          });
          return;
        }
      }

      const botReply = await handleBotChat(message);
      res.json(botReply);
    } catch (err) {
      console.error('Error handling chat:', err);
      res.status(500).json({ error: 'Failed to process chat message.' });
    }
  });

  // 3. Appointments endpoints
  app.get('/api/appointments', (req, res) => {
    try {
      const list = db.getAppointments();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve appointments.' });
    }
  });

  app.post('/api/appointments', (req, res) => {
    try {
      const { name, phone, brand, model, issue, appointment_date } = req.body;
      if (!name || !phone || !brand || !model || !issue || !appointment_date) {
        res.status(400).json({ error: 'All fields (name, phone, brand, model, issue, appointment_date) are required.' });
        return;
      }

      const newAppt = db.addAppointment({
        name,
        phone,
        brand,
        model,
        issue,
        appointment_date
      });

      // Automatically register a repair status ticket in parallel for tracking demo!
      db.addRepairStatus({
        job_id: `JOB${newAppt.id.replace('APT', '')}`, // Map APT1001 -> JOB1001
        customer_name: name,
        status: 'Pending'
      });

      res.status(201).json({
        ...newAppt,
        job_id: `JOB${newAppt.id.replace('APT', '')}`
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to book appointment.' });
    }
  });

  // 4. Tracking endpoints
  app.get('/api/tracking', (req, res) => {
    try {
      res.json(db.getRepairStatuses());
    } catch (err) {
      res.status(500).json({ error: 'Failed to load tracking list.' });
    }
  });

  app.get('/api/tracking/:jobId', (req, res) => {
    try {
      const { jobId } = req.params;
      const statusRecord = db.getRepairStatus(jobId);
      if (statusRecord) {
        res.json(statusRecord);
      } else {
        res.status(404).json({ error: `Repair job with ID ${jobId} not found.` });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error checking tracking status.' });
    }
  });

  app.post('/api/tracking', (req, res) => {
    try {
      const { job_id, customer_name, status } = req.body;
      if (!job_id || !customer_name || !status) {
        res.status(400).json({ error: 'job_id, customer_name, and status are required.' });
        return;
      }
      db.addRepairStatus({ job_id, customer_name, status });
      res.json({ message: 'Repair status updated successfully.', record: { job_id, customer_name, status } });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update tracking.' });
    }
  });

  app.patch('/api/tracking/:jobId', (req, res) => {
    try {
      const { jobId } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'Status is required.' });
        return;
      }
      const updated = db.updateRepairStatus(jobId, status);
      if (updated) {
        res.json({ message: 'Repair status updated successfully.', record: updated });
      } else {
        res.status(404).json({ error: `Job ${jobId} not found.` });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update job status.' });
    }
  });

  // 5. Feedback endpoints
  app.get('/api/feedback', (req, res) => {
    try {
      res.json(db.getFeedback());
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve feedback.' });
    }
  });

  app.post('/api/feedback', (req, res) => {
    try {
      const { rating, comments } = req.body;
      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Valid rating (1-5 stars) is required.' });
        return;
      }
      const newFeedback = db.addFeedback(rating, comments || '');
      res.status(201).json(newFeedback);
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit feedback.' });
    }
  });

  // 6. Statistics dashboard endpoint
  app.get('/api/stats', (req, res) => {
    try {
      const appts = db.getAppointments();
      const repairs = db.getRepairStatuses();
      const feeds = db.getFeedback();

      const activeRepairsCount = repairs.filter(r => r.status !== 'Delivered').length;
      const avgRating = feeds.length > 0 
        ? parseFloat((feeds.reduce((acc, f) => acc + f.rating, 0) / feeds.length).toFixed(1)) 
        : 5.0;

      res.json({
        totalAppointments: appts.length,
        activeRepairs: activeRepairsCount,
        totalFeedback: feeds.length,
        averageRating: avgRating
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to gather statistics.' });
    }
  });

  // ================= VITE OR STATIC SERVING =================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Mobile Service Support Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to start the backend Express server:', err);
});
