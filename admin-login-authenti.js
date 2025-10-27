const STAFF_SESSION_KEY = "staffSession";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function checkStaffAuth() {
    const staffSession = localStorage.getItem(STAFF_SESSION_KEY);
    
    if (!staffSession) {
        redirectToLogin();
        return null;
    }
    
    try {
        const session = JSON.parse(staffSession);
        if (Date.now() - session.loginTime > SESSION_DURATION) {
            staffLogout();
            return null;
        }
        
        return session;
    } catch (error) {
        staffLogout();
        return null;
    }
}

function redirectToLogin() {
    window.location.href = "homepage.html";
}

function staffLogout() {
    localStorage.removeItem(STAFF_SESSION_KEY);
    redirectToLogin();
}

function getStaffRole() {
    const session = checkStaffAuth();
    return session ? session.role : null;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkStaffAuth, staffLogout, getStaffRole };
}