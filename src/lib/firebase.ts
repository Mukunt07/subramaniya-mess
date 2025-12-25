// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCXGYqJwIIOgg-RxxhQa6ezz_ZeuA0PQrg",
    authDomain: "subramaniya-mess.firebaseapp.com",
    projectId: "subramaniya-mess",
    storageBucket: "subramaniya-mess.firebasestorage.app",
    messagingSenderId: "190800409214",
    appId: "1:190800409214:web:1be6bbd14460464e4dde2f",
    measurementId: "G-KLYFP4V0N0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); 

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence with multi-tab support
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.warn("Firebase persistence failed: Multiple tabs open");
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn("Firebase persistence not supported");
    }
});

export default app;
