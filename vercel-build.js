// Cross-platform build script for Vercel deployment
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Vercel build process...');

// Install root dependencies
console.log('Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Install client dependencies
console.log('Installing client dependencies...');
const clientDir = path.join(__dirname, 'client');
process.chdir(clientDir);
execSync('npm install', { stdio: 'inherit' });

// Build client with CI=false to prevent treating warnings as errors
console.log('Building client application...');
process.env.CI = 'false';
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed successfully!');