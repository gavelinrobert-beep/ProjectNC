#!/usr/bin/env node
// Cross-platform script to run the game server
const { execSync } = require('child_process');
const path = require('path');
const process = require('process');

const gameserverDir = path.join(__dirname, '..', 'packages', 'gameserver');
const command = 'go run cmd/server/main.go';

try {
  execSync(command, { 
    cwd: gameserverDir, 
    stdio: 'inherit',
    shell: true
  });
} catch (error) {
  process.exit(error.status || 1);
}
