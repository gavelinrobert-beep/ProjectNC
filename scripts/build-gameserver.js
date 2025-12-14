#!/usr/bin/env node
// Cross-platform script to build the game server
const { execSync } = require('child_process');
const path = require('path');
const process = require('process');
const os = require('os');

const gameserverDir = path.join(__dirname, '..', 'packages', 'gameserver');
const isWindows = os.platform() === 'win32';
const outputName = isWindows ? 'gameserver.exe' : 'gameserver';
const command = `go build -o ${outputName} cmd/server/main.go`;

try {
  execSync(command, { 
    cwd: gameserverDir, 
    stdio: 'inherit',
    shell: true
  });
  console.log(`\nGame server built successfully: packages/gameserver/${outputName}`);
} catch (error) {
  process.exit(error.status || 1);
}
