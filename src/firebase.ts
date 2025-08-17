// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPChCEwrZIPvIwWuTiwp7FISmQz5bxjJE",
  authDomain: "job-board-c0e94.firebaseapp.com",
  projectId: "job-board-c0e94",
  storageBucket: "job-board-c0e94.firebasestorage.app",
  messagingSenderId: "782217235255",
  appId: "1:782217235255:web:4196da5a7dd2b3108aa8b2",
  measurementId: "G-J850XCKPWT"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  console.log('🚀 Initializing Firebase...');
  console.log('Config:', firebaseConfig);
  
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
  
  analytics = getAnalytics(app);
  console.log('✅ Analytics initialized:', analytics);
  
  auth = getAuth(app);
  console.log('✅ Auth initialized:', auth);
  
  db = getFirestore(app);
  console.log('✅ Firestore initialized:', db);
  
  storage = getStorage(app);
  console.log('✅ Storage initialized:', storage);
  
  console.log('🎉 All Firebase services initialized successfully!');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase services
export { auth, db, storage, analytics };
export default app;
