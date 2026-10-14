const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const aiDir = path.join(__dirname, '../../ai');
const pythonExe = path.join(aiDir, 'venv', 'Scripts', 'python.exe');

console.log('Testing Python spawn directly:');
console.log('pythonExe:', pythonExe);
console.log('fs.existsSync(pythonExe):', fs.existsSync(pythonExe));

const py = spawn(pythonExe, ['app.py'], {
  cwd: aiDir,
  env: { ...process.env, PYTHONUNBUFFERED: '1' },
});

py.stdout.on('data', (data) => {
  console.log('[PYTHON STDOUT]:', data.toString());
});

py.stderr.on('data', (data) => {
  console.log('[PYTHON STDERR]:', data.toString());
});

py.on('error', (err) => {
  console.error('[PYTHON ERROR]:', err);
});

py.on('exit', (code) => {
  console.log('[PYTHON EXIT CODE]:', code);
});

setTimeout(() => {
  console.log('Stopping test process...');
  py.kill();
  process.exit(0);
}, 5000);
