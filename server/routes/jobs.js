// server/routes/jobs.js
const express = require('express');
const router = express.Router();
const { codeQueue } = require('../workers/queue');

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'cpp'];

// ── POST /api/jobs – Submit code for execution ───────────────────
router.post('/', async (req, res) => {
  const { language, code, stdin = '' } = req.body;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: `Unsupported language. Use: ${SUPPORTED_LANGUAGES.join(', ')}` });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required and must be a string' });
  }
  if (code.length > 50_000) {
    return res.status(400).json({ error: 'Code too long (max 50,000 characters)' });
  }

  try {
    const job = await codeQueue.add({ language, code, stdin });
    return res.status(202).json({
      jobId: job.id,
      message: 'Job queued. Poll /api/jobs/:id for results.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to queue job' });
  }
});

// ── GET /api/jobs/:id – Poll job status / result ──────────────────
router.get('/:id', async (req, res) => {
  try {
    const job = await codeQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const state = await job.getState();

    if (state === 'completed') {
      return res.json({
        jobId: job.id,
        status: 'completed',
        result: job.returnvalue,
      });
    }

    if (state === 'failed') {
      return res.json({
        jobId: job.id,
        status: 'failed',
        error: job.failedReason || 'Execution failed',
      });
    }

    // still waiting or active
    return res.json({ jobId: job.id, status: state });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;
