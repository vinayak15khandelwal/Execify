// server/workers/queue.js
const Bull = require('bull');
const { runCode } = require('./runner');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create the execution queue
const codeQueue = new Bull('code-execution', REDIS_URL, {
  defaultJobOptions: {
    attempts: 1,          // Don't retry failed jobs (could be user error)
    timeout: 15000,       // Kill job if it takes > 15s
    removeOnComplete: 50, // Keep last 50 completed jobs in memory
    removeOnFail: 20,
  },
});

// ── Worker: processes one job at a time ─────────────────────────
// concurrency: 3 means 3 containers can run simultaneously
codeQueue.process(3, async (job) => {
  const { language, code, stdin } = job.data;
  console.log(`[queue] Processing job ${job.id} | lang: ${language}`);
  const result = await runCode(language, code, stdin);
  return result; // Bull stores this as job.returnvalue
});

codeQueue.on('completed', (job) => {
  console.log(`[queue] Job ${job.id} completed`);
});

codeQueue.on('failed', (job, err) => {
  console.error(`[queue] Job ${job.id} failed:`, err.message);
});

module.exports = { codeQueue };
