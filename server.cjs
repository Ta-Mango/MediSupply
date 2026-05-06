const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Start vite dev server
const vitePath = require.resolve('vite');
const viteProcess = exec(`node "${vitePath}" --port 3000 --host 127.0.0.1`, { 
  cwd: 'C:\\Users\\Carter\\Documents\\MediSupply\\pharmachain-pwa (1)',
  shell: true 
});

viteProcess.stdout.on('data', (d) => {
  const s = d.toString();
  console.log('[vite]', s);
  if (s.includes('ready')) {
    console.log('Vite dev server is ready on http://127.0.0.1:3000');
  }
});
viteProcess.stderr.on('data', (d) => console.error('[vite]', d.toString()));

// Keep alive
setInterval(() => {}, 1000000);