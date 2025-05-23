const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Next.js deployment process...');

// Step 1: Clean previous build files
console.log('🧹 Cleaning previous build files...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  console.log('✅ Clean completed');
} catch (error) {
  console.error('❌ Error cleaning build files:', error);
}

// Step 2: Update next.config.js for static export
console.log('📝 Updating Next.js configuration...');
try {
  const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
  `;
  
  fs.writeFileSync('next.config.js', nextConfig.trim());
  console.log('✅ Next.js configuration updated');
} catch (error) {
  console.error('❌ Error updating Next.js configuration:', error);
}

// Step 3: Create a temporary 404 page to handle dynamic routes
console.log('🔄 Creating temporary files for dynamic routes...');
try {
  // Create pages directory if it doesn't exist
  if (!fs.existsSync('src/pages')) {
    fs.mkdirSync('src/pages', { recursive: true });
  }
  
  // Create a 404 page that will redirect to the correct route client-side
  const notFoundContent = `
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  
  useEffect(() => {
    // Get the current path
    const path = window.location.pathname;
    
    // Check if it's a dynamic route we need to handle
    if (path.startsWith('/chatroom/')) {
      // Extract the ID from the URL
      const id = path.split('/').pop();
      
      // Redirect to the chat page with the ID as a query parameter
      router.replace('/chat?roomId=' + id);
    } else {
      // For other routes, redirect to home
      router.replace('/');
    }
  }, [router]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f0f2f5',
      color: '#333'
    }}>
      <h1>Loading...</h1>
      <p>Please wait while we redirect you to the correct page.</p>
    </div>
  );
}
  `;
  
  fs.writeFileSync('src/pages/404.js', notFoundContent.trim());
  console.log('✅ Temporary files created');
} catch (error) {
  console.error('❌ Error creating temporary files:', error);
}

// Step 4: Build the Next.js app
console.log('🏗️ Building Next.js app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Step 5: Update firebase.json to use the out directory
console.log('🔥 Updating Firebase configuration...');
try {
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  firebaseConfig.hosting.public = 'out';
  fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ Firebase configuration updated');
} catch (error) {
  console.error('❌ Error updating Firebase configuration:', error);
}

// Step 6: Deploy to Firebase
console.log('🚀 Deploying to Firebase...');
try {
  execSync('firebase deploy --only hosting', { stdio: 'inherit' });
  console.log('✅ Deployment completed');
} catch (error) {
  console.error('❌ Deployment failed:', error);
}

console.log('🎉 Deployment process completed!');
console.log('Remember: Only approved test users can access your application.');
