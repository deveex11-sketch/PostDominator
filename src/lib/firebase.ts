// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsdq9Tn4jsnLuC15zhQJYZEMXcWvDRgYo",
  authDomain: "postdominator-d31ec.firebaseapp.com",
  projectId: "postdominator-d31ec",
  storageBucket: "postdominator-d31ec.firebasestorage.app",
  messagingSenderId: "696819752528",
  appId: "1:696819752528:web:608a00bb0554ffc7e53b55",
  measurementId: "G-F3ZYWC5PSE",
};

// Initialize Firebase (avoid multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (only in browser)
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics };
