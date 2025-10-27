// Firebase Configuration with Connection Testing
console.log("🚀 Starting Firebase initialization...");

// Check if Firebase SDK is loaded
if (typeof firebase === 'undefined') {
    console.error("❌ CRITICAL: Firebase SDK not loaded!");
    alert("Firebase SDK failed to load. Check your internet connection.");
} else {
    console.log("✅ Firebase SDK loaded successfully");
    
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
            console.log("✅ Firebase App Initialized");
        } else {
            app = firebase.app();
            console.log("✅ Firebase App Already Exists");
        }

        // Initialize services
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        window.firebase = firebase;

        console.log("🔥 SERVICES INITIALIZED:");
        console.log("   - Auth:", typeof window.auth);
        console.log("   - Firestore:", typeof window.db);
        console.log("   - Project:", app.options.projectId);

        // Test connection
        testFirebaseConnection();

    } catch (error) {
        console.error("❌ Firebase Initialization Failed:", error);
        alert("Firebase initialization failed: " + error.message);
    }
}

// Test Firebase Connection
async function testFirebaseConnection() {
    console.log("🔍 Testing Firebase Connection...");
    
    const statusElement = document.getElementById('firebase-status');
    
    try {
        // Test Firestore
        await db.collection('connectionTests').doc('test').set({
            timestamp: new Date(),
            status: 'connected',
            project: 'everpeak-df533'
        }, { merge: true });
        
        // Test read
        const doc = await db.collection('connectionTests').doc('test').get();
        
        console.log("🎉 FIREBASE CONNECTION SUCCESSFUL!");
        console.log("   - Write: ✅ Successful");
        console.log("   - Read: ✅ Successful");
        console.log("   - Data:", doc.data());
        
        // Update status display
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: #4CAF50; color: white; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>✅ Firebase Connected!</strong>
                    <br>Project: everpeak-df533
                    <br>Services: Auth ✅ Firestore ✅
                </div>
            `;
        }
        
    } catch (error) {
        console.error("💥 FIREBASE CONNECTION FAILED:", error);
        
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>❌ Firebase Connection Failed</strong>
                    <br>Error: ${error.message}
                    <br>Code: ${error.code}
                </div>
            `;
        }
    }
}

// Make function globally available
window.testFirebaseConnection = testFirebaseConnection;
