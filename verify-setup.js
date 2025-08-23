#!/usr/bin/env node

// Quick setup verification script for hackathon demo
const http = require('http');
const path = require('path');
const fs = require('fs');

console.log('🚀 Verifying Logistics AI Workflow Builder Setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'turbo.json',
  'packages/engine/package.json',
  'apps/web/package.json',
  'apps/web/app/page.tsx',
  'packages/engine/src/engine.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Setup incomplete. Please run the setup again.');
  process.exit(1);
}

console.log('\n🔍 Checking if development server is running...');

// Check if localhost:3000 is responding
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
}, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Development server is running at http://localhost:3000');
    console.log('\n🎯 Setup verification complete! You can:');
    console.log('   • Open http://localhost:3000 in your browser');
    console.log('   • Try the demo scenarios');
    console.log('   • Generate AI workflows');
    console.log('   • Execute workflows with real-time progress');
    console.log('\n🏆 Ready for your hackathon presentation!');
  } else {
    console.log(`⚠️  Server responded with status: ${res.statusCode}`);
    console.log('   Try running: npm run dev');
  }
});

req.on('error', (err) => {
  console.log('⚠️  Development server not accessible');
  console.log('   Please run: npm run dev');
  console.log('   Then open: http://localhost:3000');
});

req.on('timeout', () => {
  console.log('⚠️  Server request timed out');
  console.log('   Please run: npm run dev');
});

req.end();