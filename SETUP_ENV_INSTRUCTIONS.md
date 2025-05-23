# Environment Setup Instructions

To secure your Firebase configuration, please create a `.env.local` file in the root of your project with the following environment variables:

```
# Firebase Configuration - Replace with your actual values
NEXT_PUBLIC_FIREBASE_API_KEY=your_new_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chamo-98469.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chamo-98469
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chamo-98469.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=586073073911
NEXT_PUBLIC_FIREBASE_APP_ID=1:586073073911:web:5b8866acc83ce7caaa8bf2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-SEVG44RDNT
```

## Important Security Notes:

1. The `.env.local` file is automatically excluded from Git, keeping your secrets safe.
2. You should generate a new API key in the Firebase console to replace the exposed one.
3. Never commit API keys or other secrets to your repository.
4. The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

## How to Generate a New Firebase API Key:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "chamo-98469"
3. Go to Project Settings
4. In the "General" tab, scroll down to "Your apps" section
5. Click on the web app
6. Click "Manage API key" or go to the Google Cloud Console link
7. Create a new API key or restrict the existing one

After creating the `.env.local` file, restart your development server for the changes to take effect.
