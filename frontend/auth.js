// auth.js
class AuthManager {
    static getToken() {
        return localStorage.getItem("token") || localStorage.getItem("authToken");
    }

    static setToken(token) {
        localStorage.setItem("token", token);
        // Mantener sincronizado por si acaso
        localStorage.setItem("authToken", token);
    }

    static removeTokens() {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static async verifyToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch('http://localhost:3000/api/auth/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static redirectToLogin() {
        this.removeTokens();
        window.location.href = 'index.html';
    }
}