// api.js

// ¡NO DEFINIR BaseURL aquí!
// Ya está definida en config.js, que se carga primero en index.html

class ApiService {
    // static baseURL = 'http://localhost:3000/api'; // <-- ELIMINADO

    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken(); // Asumimos que AuthManager está en script.js
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            // ✅ USA LA VARIABLE GLOBAL CORRECTA DE config.js
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config); 
            
            if (response.status === 401) {
                AuthManager.redirectToLogin(); // Asumimos que AuthManager existe
                throw new Error('No autorizado');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            
            if (response.status === 204) { // Manejar respuesta "Sin Contenido"
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en API call ${endpoint}:`, error);
            throw error;
        }
    }

    // Métodos específicos (el resto de tu archivo api.js)
    static async getRegistros() { return this.request('/registros'); }
    static async createRegistro(data) { return this.request('/registros', { method: 'POST', body: JSON.stringify(data) }); }
    static async getCamiones() { return this.request('/camiones'); }
    static async createCamion(data) { return this.request('/camiones', { method: 'POST', body: JSON.stringify(data) }); }
    static async getCamioneros() { return this.request('/camioneros'); }
    static async createCamionero(data) { return this.request('/camioneros', { method: 'POST', body: JSON.stringify(data) }); }
    static async getMantenimientos() { return this.request('/mantenimientos'); }
    static async createMantenimiento(data) { return this.request('/mantenimientos', { method: 'POST', body: JSON.stringify(data) }); }
}

// Manager simple para manejar el token (usado por ApiService)
const AuthManager = {
    getToken: () => localStorage.getItem('token') || localStorage.getItem('authToken'), //
    redirectToLogin: () => {
        if (!window.location.pathname.endsWith("index.html")) {
            window.location.href = 'index.html';
        }
    }
};