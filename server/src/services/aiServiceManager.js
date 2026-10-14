const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const logger = require('../config/logger');

let pythonProcess = null;

const checkAIHealth = async (aiUrl) => {
  try {
    const res = await axios.get(`${aiUrl}/health`, { timeout: 3000 });
    return res.status === 200 && res.data?.status === 'ok';
  } catch (err) {
    return false;
  }
};

const ensureAIServiceRunning = async () => {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  logger.info(`🔍 Checking AI NLP Service at ${aiUrl}...`);

  const isHealthy = await checkAIHealth(aiUrl);
  if (isHealthy) {
    logger.info(`✅ AI NLP Service is active and healthy at ${aiUrl}`);
    return;
  }

  // Only auto-spawn if pointing to local loopback (127.0.0.1 or localhost)
  const isLocal = aiUrl.includes('127.0.0.1') || aiUrl.includes('localhost');
  if (!isLocal) {
    logger.warn(`⚠️ Remote AI NLP Service at ${aiUrl} is not responding. Please verify server deployment.`);
    return;
  }

  logger.info('🚀 Local AI NLP Service not detected. Spawning Python Flask service on port 8000...');

  const aiDir = path.join(__dirname, '../../ai');

  const winVenvPython = path.join(aiDir, 'venv', 'Scripts', 'python.exe');
  const nixVenvPython = path.join(aiDir, 'venv', 'bin', 'python');

  let pythonCmd = null;
  if (fs.existsSync(winVenvPython)) {
    pythonCmd = winVenvPython;
  } else if (fs.existsSync(nixVenvPython)) {
    pythonCmd = nixVenvPython;
  } else if (process.env.PYTHON_EXECUTABLE && fs.existsSync(process.env.PYTHON_EXECUTABLE)) {
    pythonCmd = process.env.PYTHON_EXECUTABLE;
  } else {
    pythonCmd = process.env.PYTHON_EXECUTABLE || 'python';
  }

  logger.info(`🐍 Using Python executable: ${pythonCmd}`);

  try {
    pythonProcess = spawn(pythonCmd, ['app.py'], {
      cwd: aiDir,
      env: { ...process.env, PYTHONUNBUFFERED: '1', FLASK_ENV: 'development' },
      shell: false,
    });

    if (pythonProcess.stdout) {
      pythonProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) logger.info(`🤖 [Python AI]: ${msg}`);
      });
    }

    if (pythonProcess.stderr) {
      pythonProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) logger.info(`🤖 [Python AI Log]: ${msg}`);
      });
    }

    pythonProcess.on('error', (err) => {
      logger.error(`❌ Failed to start Python AI service: ${err.message}`);
    });

    pythonProcess.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        logger.warn(`⚠️ Python AI service exited with code ${code}`);
      }
    });

    // Wait up to 12 seconds for Python Flask service to become healthy
    let attempts = 0;
    while (attempts < 12) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      const healthy = await checkAIHealth(aiUrl);
      if (healthy) {
        logger.info(`✅ Python AI service started successfully on port 8000!`);
        break;
      }
    }
  } catch (err) {
    logger.error(`❌ Exception spawning Python AI service: ${err.message}`);
  }
};

// Cleanup child process on Node exit
process.on('exit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});

module.exports = { ensureAIServiceRunning, checkAIHealth };
