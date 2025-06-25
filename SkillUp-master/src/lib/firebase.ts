// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeF80-EN1fwfOtRN1uCdWGNIcZ-OcV_ok",
  authDomain: "skillup-f5dad.firebaseapp.com",
  projectId: "skillup-f5dad",
  storageBucket: "skillup-f5dad.firebasestorage.app",
  messagingSenderId: "504287959804",
  appId: "1:504287959804:web:0d39e35432b4fe623b1579"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, firestore, googleProvider };
