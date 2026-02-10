// auth.js - Manejo de autenticación robusto y seguro

class AuthManager {
    static getToken() {
        return localStorage.getItem("token") || localStorage.getItem("authToken");
    }

    static setToken(token) {
        localStorage.setItem("token", token);
        localStorage.setItem("authToken", token); // Compatibilidad vieja
    }

    static removeTokens() {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
    }

    // Chequea si hay token y si no está expirado
    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Si el token tiene expiración y ya expiró
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

    // Obtiene datos del usuario del token (username, role, etc.)
    static getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Redirige al login limpiando tokens
    static redirectToLogin() {
        this.removeTokens();
        window.location.href = "index.html";
    }

    // Logout manual
    static logout() {
        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            this.redirectToLogin();
        }
    }
}

// Hacer funciones globales para usar en onclick
window.logout = () => AuthManager.logout();