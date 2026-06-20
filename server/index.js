// server/index.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
require('dotenv').config();

const jobRoutes = require('./routes/jobs');
const { codeQueue } = require('./workers/queue');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rate limiter: 30 submissions per 15 min per IP
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many submissions. Please wait before running more code.' },
});

// ── Bull Board (queue monitoring dashboard) ─────────────────────
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({ queues: [new BullAdapter(codeQueue)], serverAdapter });
app.use('/admin/queues', serverAdapter.getRouter());

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/jobs', submitLimiter, jobRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => {
  console.log(`🚀 Execify API running on http://localhost:${PORT}`);
  console.log(`📊 Queue dashboard: http://localhost:${PORT}/admin/queues`);
});
