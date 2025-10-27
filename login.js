document.addEventListener("DOMContentLoaded", function() {
    console.log("Login page loaded");
    
    const loginForm = document.getElementById("staffLoginForm");
    const errorMessage = document.getElementById("errorMessage");

    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        console.log("Login form submitted");

        const email = document.getElementById("staffId").value;
        const password = document.getElementById("password").value;

        console.log("Attempting login with:", email);

        try {
            // Check if auth is available
            if (typeof auth === 'undefined') {
                throw new Error("Firebase Auth not available");
            }

            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log("✅ Login successful:", userCredential.user.email);
            
            // Redirect to admin panel
            window.location.href = "admin-design.html";
            
        } catch (error) {
            console.error("❌ Login failed:", error);
            errorMessage.textContent = `Login failed: ${error.message}`;
            errorMessage.style.display = "block";
        }
    });
});
