#!/usr/bin/env node
/**
 * Pre-flight check script to verify database prerequisites
 * before running Prisma migrations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
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

function printHeader(message) {
  console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', 'packages', 'api', '.env');
  const envExamplePath = path.join(__dirname, '..', 'packages', 'api', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    return {
      success: false,
      message: '.env file not found in packages/api/',
      solution: [
        'Create the .env file by copying from .env.example:',
        '',
        'Linux/Mac:',
        '  cd packages/api',
        '  cp .env.example .env',
        '',
        'Windows PowerShell:',
        '  cd packages\\api',
        '  Copy-Item .env.example .env',
        '',
        'Or run the automated setup:',
        '  npm run setup          (Linux/Mac)',
        '  npm run setup:windows  (Windows)'
      ]
    };
  }
  
  // Check if DATABASE_URL exists in .env
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('DATABASE_URL')) {
    return {
      success: false,
      message: 'DATABASE_URL not found in packages/api/.env',
      solution: [
        'Add DATABASE_URL to packages/api/.env:',
        '',
        'DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"'
      ]
    };
  }
  
  return { success: true, message: '.env file found' };
}

function checkDockerRunning() {
  try {
    // Try to run docker ps
    execSync('docker ps', { stdio: 'pipe' });
    return { success: true, available: true };
  } catch (error) {
    return { success: false, available: false };
  }
}

function checkPostgresContainer() {
  try {
    const output = execSync('docker ps --filter "name=mmorpg-postgres" --format "{{.Names}}"', { 
      stdio: 'pipe',
      encoding: 'utf8'
    }).trim();
    
    if (output.includes('mmorpg-postgres')) {
      return { success: true, message: 'PostgreSQL container is running' };
    }
    
    return {
      success: false,
      message: 'PostgreSQL container is not running',
      solution: [
        'Start the PostgreSQL container:',
        '  npm run docker:db:start',
        '',
        'Wait a few seconds for the container to start, then check status:',
        '  docker ps',
        '',
        'View container logs if there are issues:',
        '  npm run docker:db:logs'
      ]
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unable to check Docker containers',
      solution: [
        'Make sure Docker is installed and running.',
        'Then start the PostgreSQL container:',
        '  npm run docker:db:start'
      ]
    };
  }
}

function checkLocalPostgres() {
  try {
    // Try to check if PostgreSQL is running locally
    execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
    return { success: true, message: 'Local PostgreSQL is running' };
  } catch (error) {
    return { success: false };
  }
}

function main() {
  console.log('');
  printHeader('═══════════════════════════════════════════════════════════');
  printHeader('  Database Prerequisites Check');
  printHeader('═══════════════════════════════════════════════════════════');
  console.log('');
  
  let hasErrors = false;
  let solutions = [];
  
  // Check 1: .env file
  printInfo('Checking for .env file...');
  const envCheck = checkEnvFile();
  if (!envCheck.success) {
    printError(envCheck.message);
    solutions.push({
      issue: envCheck.message,
      steps: envCheck.solution
    });
    hasErrors = true;
  } else {
    printSuccess(envCheck.message);
  }
  console.log('');
  
  // Check 2: Database availability
  printInfo('Checking database availability...');
  
  // First, check if Docker is available
  const dockerCheck = checkDockerRunning();
  
  if (dockerCheck.available) {
    // Check if the mmorpg-postgres container is running
    const containerCheck = checkPostgresContainer();
    if (!containerCheck.success) {
      printError(containerCheck.message);
      solutions.push({
        issue: containerCheck.message,
        steps: containerCheck.solution
      });
      hasErrors = true;
    } else {
      printSuccess(containerCheck.message);
    }
  } else {
    // Docker not available, check for local PostgreSQL
    printWarning('Docker is not available or not running');
    const localPgCheck = checkLocalPostgres();
    
    if (!localPgCheck.success) {
      printError('No PostgreSQL database detected (Docker or local)');
      solutions.push({
        issue: 'No PostgreSQL database is running',
        steps: [
          'Option 1 (Recommended): Use Docker',
          '  1. Install Docker Desktop from https://docker.com',
          '  2. Start Docker',
          '  3. Run: npm run docker:db:start',
          '',
          'Option 2: Use local PostgreSQL',
          '  1. Install PostgreSQL 15+ from https://postgresql.org',
          '  2. Start PostgreSQL service',
          '  3. Create database: createdb mmorpg',
          '  4. Update packages/api/.env with your credentials'
        ]
      });
      hasErrors = true;
    } else {
      printSuccess(localPgCheck.message);
    }
  }
  console.log('');
  
  // Print results
  if (hasErrors) {
    printHeader('═══════════════════════════════════════════════════════════');
    printError('❌ Prerequisites check FAILED');
    printHeader('═══════════════════════════════════════════════════════════');
    console.log('');
    
    printInfo('Please fix the following issues before running migrations:');
    console.log('');
    
    solutions.forEach((solution, index) => {
      console.log(`${colors.yellow}${index + 1}. ${solution.issue}${colors.reset}`);
      console.log('');
      solution.steps.forEach(step => {
        console.log(`   ${step}`);
      });
      console.log('');
    });
    
    printInfo('For more help, see:');
    console.log('  - TROUBLESHOOTING.md (section: Database Issues)');
    console.log('  - QUICKSTART.md');
    console.log('  - README.md (section: Database Setup)');
    console.log('');
    
    process.exit(1);
  } else {
    printHeader('═══════════════════════════════════════════════════════════');
    printSuccess('✓ All prerequisites satisfied!');
    printHeader('═══════════════════════════════════════════════════════════');
    console.log('');
    printInfo('You can now run the Prisma migrations.');
    console.log('');
    process.exit(0);
  }
}

main();
