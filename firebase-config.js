// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvvhMpf_WitusAfR-sqI8pMLIAPqygOOY",
    authDomain: "everpeak-df533.firebaseapp.com",   
    projectId: "everpeak-df533",
    storageBucket: "everpeak-df533.firebasestorage.app",
    messagingSenderId: "314009845647",
    appId: "1:314009845647:web:60381fba9cbecb51c395fa",
    measurementId: "G-0XEXF5JSZ8"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Export Firebase services
window.firebase = firebase;
window.auth = auth;
window.db = db;

console.log("Firebase initialized successfully");
