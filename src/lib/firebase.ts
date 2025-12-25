// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

export default app;
