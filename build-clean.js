const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting clean build process...');

// Step 1: Try to clean previous build files
console.log('Cleaning previous build files...');
try {
  if (fs.existsSync('.next')) {
    console.log('Removing .next directory...');
    try {
      // On Windows, sometimes we need to close any processes that might be using the files
      execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    } catch (e) {
      // It's okay if this fails
    }
    
    // Wait a moment for processes to close
    setTimeout(() => {
      try {
        fs.rmSync('.next', { recursive: true, force: true });
        console.log('✅ .next directory removed');
      } catch (error) {
        console.log('⚠️ Could not remove .next directory, but we will continue anyway');
      }
      
      // Step 2: Run the build with a clean cache
      console.log('🏗️ Building Next.js app with clean cache...');
      try {
        execSync('npx next build --no-lint', { stdio: 'inherit' });
        console.log('✅ Build completed successfully');
      } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
      }
    }, 1000);
  } else {
    console.log('.next directory does not exist, proceeding with build');
    // Run the build directly
    try {
      execSync('npx next build --no-lint', { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Error during build process:', error);
  process.exit(1);
}
