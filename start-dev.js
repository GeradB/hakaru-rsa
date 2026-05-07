import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import config from './vite.config.js';

async function start() {
  console.log('Starting Vite server...');
  const server = await createServer(config);
  await server.listen();
  console.log('Server running at:', server.resolvedUrls.local[0]);
}

start();

// Keep alive
setInterval(() => {}, 1000);
