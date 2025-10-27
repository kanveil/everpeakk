document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("staffLoginForm");
    const errorMessage = document.getElementById("errorMessage");
    const validStaffAccounts = [
        { id: "admin001", password: "Everpeak2025!", role: "admin" },
        { id: "staff001", password: "Staff123!", role: "staff" },
        { id: "manager001", password: "Manager2025!", role: "manager" }
    ];

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const staffId = document.getElementById("staffId").value.trim();
        const password = document.getElementById("password").value;
        const staffAccount = validStaffAccounts.find(account => 
            account.id === staffId && account.password === password
        );
        
        if (staffAccount) {
            const staffSession = {
                id: staffAccount.id,
                role: staffAccount.role,
                loginTime: new Date().toISOString(),
                isAuthenticated: true
            };
            localStorage.setItem("staffSession", JSON.stringify(staffSession));
            window.location.href = "admin-design.html";
        } else {
            errorMessage.style.display = "block";
            document.getElementById("password").value = "";
            setTimeout(() => {
                errorMessage.style.display = "none";
            }, 3000);
        }
    });
});

function checkStaffAuth() {
    const staffSession = localStorage.getItem("staffSession");
    
    if (!staffSession) {
        window.location.href = "admin-login.html";
        return null;
    }
    
    try {
        const session = JSON.parse(staffSession);
        const loginTime = new Date(session.loginTime);
        const currentTime = new Date();
        const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            localStorage.removeItem("staffSession");
            window.location.href = "admin-login.html";
            return null;
        }
        
        return session;
    } catch (error) {
        localStorage.removeItem("staffSession");
        window.location.href = "admin-login.html";
        return null;
    }
}
function staffLogout() {
    localStorage.removeItem("staffSession");
    window.location.href = "admin-login.html";
}