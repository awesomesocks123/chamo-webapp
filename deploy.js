const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Update firebase.json to use public instead of out
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase.json', 'utf8'));
firebaseConfig.hosting.public = 'public';
fs.writeFileSync('./firebase.json', JSON.stringify(firebaseConfig, null, 2));

console.log('Updated firebase.json to use public directory');

// Copy index.html to public directory
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chamo - School Project</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f2f5;
      color: #333;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 {
      color: #4CAF50;
      margin-bottom: 1rem;
    }
    p {
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #3e8e41;
    }
    .note {
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Chamo</h1>
    <p>This is a school project chat application with restricted access.</p>
    <p>Only approved test users can access this application.</p>
    <a href="https://github.com/login/oauth/authorize" class="button">Sign in with Google</a>
    <p class="note">Note: This application is in testing mode and only approved users can sign in. If you need access, please contact the administrator.</p>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
console.log('Created index.html in public directory');

// Deploy to Firebase
try {
  console.log('Deploying to Firebase...');
  execSync('firebase deploy --only hosting', { stdio: 'inherit' });
  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error);
}
