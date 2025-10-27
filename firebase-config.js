// Firebase configuration for Everpeak Nature Camp
console.log("Loading Firebase configuration...");

// Wait for Firebase to load
if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded!");
} else {
    console.log("Firebase SDK found, initializing...");
    
    const firebaseConfig = {
        apiKey: "AIzaSyAvvhMpf_WitusAfR-sqI8pMLIAPqygOOY",
        authDomain: "everpeak-df533.firebaseapp.com",
        projectId: "everpeak-df533",
        storageBucket: "everpeak-df533.firebasestorage.app",
        messagingSenderId: "314009845647",
        appId: "1:314009845647:web:60381fba9cbecb51c395fa",
        measurementId: "G-0XEXF5JSZ8"
    };

    try {
        // Initialize Firebase
        let app;
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized successfully");
        } else {
            app = firebase.app();
            console.log("✅ Firebase already initialized");
        }

        // Initialize services
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Export to global scope
        window.auth = auth;
        window.db = db;
        window.firebaseApp = app;

        console.log("✅ Firebase services initialized:");
        console.log("   - Auth:", typeof auth !== 'undefined');
        console.log("   - Firestore:", typeof db !== 'undefined');
        console.log("   - Project ID:", app.options.projectId);

    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
    }
}
