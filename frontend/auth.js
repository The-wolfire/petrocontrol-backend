// auth.js - Autenticación completa y única (sin duplicados)

class AuthManager {
    static getToken() {
        return localStorage.getItem("token") || localStorage.getItem("authToken");
    }

    static setToken(token) {
        localStorage.setItem("token", token);
        localStorage.setItem("authToken", token); // Compatibilidad
    }

    static removeTokens() {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
    }

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                console.warn("Token expirado");
                this.removeTokens();
                return false;
            }
            return true;
        } catch (e) {
            console.error("Token inválido:", e);
            this.removeTokens();
            return false;
        }
    }

    static getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    static redirectToLogin() {
        this.removeTokens();
        window.location.href = "index.html";
    }

    static logout() {
        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            this.redirectToLogin();
        }
    }
}

// Funciones globales para botones
window.logout = () => AuthManager.logout();