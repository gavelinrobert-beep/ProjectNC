#!/usr/bin/env node
/**
 * Pre-flight check script to verify dependencies are installed
 * before running development commands
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function printError(message) {
  console.error(`${colors.red}✗ ${message}${colors.reset}`);
}

function printWarning(message) {
  console.warn(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function printSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function printInfo(message) {
  console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

function checkDirectory(dirPath, packageName) {
  const localNodeModules = path.join(dirPath, 'node_modules');
  const rootNodeModules = path.join(__dirname, '..', 'node_modules');
  
  // Helper to safely check if directory exists and has content
  const hasContent = (dir) => {
    try {
      return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
    } catch (err) {
      return false;
    }
  };
  
  const hasLocalModules = hasContent(localNodeModules);
  const hasRootModules = hasContent(rootNodeModules);
  
  if (!hasLocalModules && !hasRootModules) {
    return { exists: false, message: `${packageName} dependencies not installed` };
  }
  return { exists: true, message: `${packageName} dependencies found` };
}

function checkNestCLI() {
  const rootDir = path.join(__dirname, '..');
  
  // Check for nest CLI in both package-level and root node_modules (for workspaces)
  const locations = [
    path.join(rootDir, 'packages', 'api', 'node_modules', '.bin', 'nest'),
    path.join(rootDir, 'packages', 'api', 'node_modules', '.bin', 'nest.cmd'),
    path.join(rootDir, 'node_modules', '.bin', 'nest'),
    path.join(rootDir, 'node_modules', '.bin', 'nest.cmd'),
  ];
  
  for (const location of locations) {
    if (fs.existsSync(location)) {
      return { exists: true, message: 'NestJS CLI found' };
    }
  }
  
  return { exists: false, message: 'NestJS CLI not found' };
}

function main() {
  const packageToCheck = process.argv[2]; // 'api', 'frontend', 'shared', or 'all'
  
  console.log('');
  printInfo('Checking dependencies...');
  console.log('');
  
  let hasErrors = false;
  const rootDir = path.join(__dirname, '..');
  
  if (!packageToCheck || packageToCheck === 'all' || packageToCheck === 'api') {
    const apiCheck = checkDirectory(path.join(rootDir, 'packages', 'api'), 'API');
    if (!apiCheck.exists) {
      printError(apiCheck.message);
      hasErrors = true;
    } else {
      printSuccess(apiCheck.message);
      
      // Check for nest CLI specifically
      const nestCheck = checkNestCLI();
      if (!nestCheck.exists) {
        printError(nestCheck.message);
        hasErrors = true;
      } else {
        printSuccess(nestCheck.message);
      }
    }
  }
  
  if (!packageToCheck || packageToCheck === 'all' || packageToCheck === 'frontend') {
    const frontendCheck = checkDirectory(path.join(rootDir, 'packages', 'frontend'), 'Frontend');
    if (!frontendCheck.exists) {
      printError(frontendCheck.message);
      hasErrors = true;
    } else {
      printSuccess(frontendCheck.message);
    }
  }
  
  if (!packageToCheck || packageToCheck === 'all' || packageToCheck === 'shared') {
    const sharedCheck = checkDirectory(path.join(rootDir, 'packages', 'shared'), 'Shared');
    if (!sharedCheck.exists) {
      printError(sharedCheck.message);
      hasErrors = true;
    } else {
      printSuccess(sharedCheck.message);
    }
  }
  
  if (hasErrors) {
    console.log('');
    printError('Dependencies are missing!');
    console.log('');
    printInfo('Please run one of the following commands to install dependencies:');
    console.log('');
    console.log('  1. Automated setup (recommended):');
    console.log('     npm run setup         (Linux/Mac)');
    console.log('     npm run setup:windows (Windows)');
    console.log('');
    console.log('  2. Manual installation:');
    console.log('     npm run install:all');
    console.log('');
    process.exit(1);
  }
  
  console.log('');
  printSuccess('All dependencies are installed!');
  console.log('');
  process.exit(0);
}

main();
