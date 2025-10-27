document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("staffLoginForm");
    const errorMessage = document.getElementById("errorMessage");

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.includes("admin-login.html")) {
            window.location.href = "admin-design.html";
        }
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const staffEmail = document.getElementById("staffId").value.trim();
        const password = document.getElementById("password").value;

        try {
            // Sign in with Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(staffEmail, password);
            const user = userCredential.user;

            // Store session in localStorage for quick access
            const staffSession = {
                uid: user.uid,
                email: user.email,
                loginTime: new Date().toISOString(),
                isAuthenticated: true
            };
            
            localStorage.setItem("staffSession", JSON.stringify(staffSession));
            window.location.href = "admin-design.html";
            
        } catch (error) {
            console.error("Login error:", error);
            errorMessage.textContent = "Invalid email or password. Please try again.";
            errorMessage.style.display = "block";
            document.getElementById("password").value = "";
            
            setTimeout(() => {
                errorMessage.style.display = "none";
            }, 3000);
        }
    });
});

// Enhanced auth check function
function checkStaffAuth() {
    const staffSession = localStorage.getItem("staffSession");
    const user = auth.currentUser;
    
    if (!staffSession || !user) {
        window.location.href = "admin-login.html";
        return null;
    }
    
    try {
        const session = JSON.parse(staffSession);
        const loginTime = new Date(session.loginTime);
        const currentTime = new Date();
        const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            staffLogout();
            return null;
        }
        
        return session;
    } catch (error) {
        staffLogout();
        return null;
    }
}

function staffLogout() {
    auth.signOut().then(() => {
        localStorage.removeItem("staffSession");
        window.location.href = "admin-login.html";
    });
}
