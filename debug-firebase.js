// Firebase Connection Debug Script
console.log("=== FIREBASE CONNECTION CHECK ===");

// Check if Firebase SDK is loaded
console.log("Firebase SDK loaded:", typeof firebase !== 'undefined');

if (typeof firebase !== 'undefined') {
    console.log("Firebase apps count:", firebase.apps.length);
    console.log("Default app name:", firebase.apps[0]?.name);
    
    // Check individual services
    console.log("Auth service:", typeof auth !== 'undefined');
    console.log("Firestore service:", typeof db !== 'undefined');
    
    // Test Firestore connection
    if (typeof db !== 'undefined') {
        console.log("Testing Firestore connection...");
        db.collection('test').doc('connection').get()
            .then((doc) => {
                console.log("✅ Firestore connection SUCCESSFUL");
            })
            .catch((error) => {
                console.error("❌ Firestore connection FAILED:", error);
            });
    }
    
    // Test Auth connection
    if (typeof auth !== 'undefined') {
        console.log("Auth current user:", auth.currentUser);
        console.log("Auth state ready");
    }
} else {
    console.error("❌ Firebase SDK not loaded properly");
}

console.log("=== END CONNECTION CHECK ===");
