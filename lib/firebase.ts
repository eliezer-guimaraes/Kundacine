import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "mineral-xenolalia-5sjh2",
  appId: "1:900933347822:web:b97da41c1f8423743346ff",
  apiKey: "AIzaSyAOzpA-hAz_PJEbdmYw0LAVThiFrRAoq88",
  authDomain: "mineral-xenolalia-5sjh2.firebaseapp.com",
  storageBucket: "mineral-xenolalia-5sjh2.firebasestorage.app",
  messagingSenderId: "900933347822",
  measurementId: ""
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the databaseId provided in our configuration file
const firestoreDatabaseId = "ai-studio-881dddb6-f4a5-4b81-b811-88c1c8f711df";

export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);
