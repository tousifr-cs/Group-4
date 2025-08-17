# Firebase Setup Guide for Job Board

## Prerequisites
- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Firebase project with Authentication, Firestore Database, and Storage enabled

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app icon (</>)
7. Register your app if you haven't already
8. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 2: Set Up Environment Variables

1. Create a `.env` file in your project root (same level as package.json)
2. Add your Firebase configuration values:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important:** 
- All environment variables must start with `REACT_APP_`
- Restart your development server after adding the `.env` file
- Never commit your `.env` file to version control

## Step 3: Enable Firebase Services

### Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" authentication
3. Optionally enable other providers (Google, GitHub, etc.)

### Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" for development
3. Select a location close to your users
4. Set up security rules (start with test mode for development)

### Storage (Optional)
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" for development
3. Select a location

## Step 4: Security Rules

### Firestore Rules (Basic)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users
    match /jobPostings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to create/update their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules (Basic)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 5: Test Your Setup

1. Start your development server: `npm start`
2. You should see the Firebase Example component with:
   - Authentication buttons (Sign In/Sign Up)
   - Job posting form (after authentication)
   - Job listings display

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check your API key in the `.env` file
   - Ensure the `.env` file is in the project root
   - Restart your development server

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console
   - For development, add `localhost` to authorized domains

3. **"Firebase: Error (firestore/permission-denied)"**
   - Check your Firestore security rules
   - Ensure you're authenticated if required

4. **Environment variables not loading**
   - Verify all variables start with `REACT_APP_`
   - Restart your development server
   - Check for typos in variable names

## Next Steps

- Customize the FirebaseExample component for your needs
- Implement proper error handling and loading states
- Add form validation
- Implement user profile management
- Add image upload functionality using Firebase Storage
- Set up proper security rules for production

## Useful Firebase Documentation

- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Authentication Documentation](https://firebase.google.com/docs/auth)
- [Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules](https://firebase.google.com/docs/rules)
