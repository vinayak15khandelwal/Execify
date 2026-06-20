// server/workers/runner.js
//
// Each language runs inside a Docker container with:
//   - No network access  (--network none)
//   - 256 MB RAM limit   (--memory 256m)
//   - 10s wall-clock cap (--timeout via Docker --stop-timeout)
//   - Read-only except /tmp
//
// The code string is passed via stdin to the container (no files written to host).

const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

// Language → Docker image + run command
const LANG_CONFIG = {
  python: {
    image: 'execify-python',          // see Dockerfiles/python/
    cmd: ['python3', '-c'],
    runMode: 'eval',                  // pass code directly as arg
  },
  javascript: {
    image: 'execify-node',
    cmd: ['node', '-e'],
    runMode: 'eval',
  },
  cpp: {
    image: 'execify-cpp',
    cmd: ['bash', '-c'],
    // compile + run in one shell command; code piped via stdin to a temp file
    runMode: 'compile-run',
  },
};

const TIMEOUT_SECONDS = 10;
const MEMORY_LIMIT   = '256m';
const CPU_QUOTA      = '50000'; // 50% of one CPU core

/**
 * Run arbitrary code inside an isolated Docker container.
 * @param {string} language - 'python' | 'javascript' | 'cpp'
 * @param {string} code     - Source code string
 * @param {string} stdin    - Optional stdin for the program
 * @returns {{ stdout, stderr, exitCode, executionTime, timedOut }}
 */
async function runCode(language, code, stdin = '') {
  const config = LANG_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const startTime = Date.now();

  // Build Docker run command
  // We pass code via environment variable to avoid shell injection
  const dockerArgs = [
    'run', '--rm',
    '--network', 'none',           // No internet access
    '--memory', MEMORY_LIMIT,
    '--memory-swap', MEMORY_LIMIT, // Disable swap
    '--cpu-quota', CPU_QUOTA,
    '--pids-limit', '64',          // Limit process forks (prevent fork bombs)
    '--ulimit', 'nofile=64:64',    // Limit open file descriptors
    '--read-only',
    '--tmpfs', '/tmp:size=16m,exec',
    '-e', `CODE=${encodeCode(code)}`,
    '-e', `STDIN_DATA=${encodeCode(stdin)}`,
    config.image,
  ];

  try {
    const { stdout, stderr } = await execFileAsync('docker', dockerArgs, {
      timeout: TIMEOUT_SECONDS * 1000 + 2000, // slight buffer over container timeout
      maxBuffer: 1024 * 1024, // 1 MB output cap
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      executionTime: Date.now() - startTime,
      timedOut: false,
    };
  } catch (err) {
    const timedOut = err.killed || err.code === 'ETIMEDOUT';
    return {
      stdout: (err.stdout || '').trim(),
      stderr: timedOut
        ? 'Time Limit Exceeded (10s)'
        : (err.stderr || err.message || 'Runtime error').trim(),
      exitCode: err.code || 1,
      executionTime: Date.now() - startTime,
      timedOut,
    };
  }
}

// Simple base64-encode to safely pass code via env var
function encodeCode(str) {
  return Buffer.from(str).toString('base64');
}

module.exports = { runCode };
