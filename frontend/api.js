// api.js - Usa SOLO la variable global de config.js (sin redeclarar nada)

console.log("API_BASE_URL usada en api.js:", window.API_BASE_URL || "NO DEFINIDA - ERROR");

class ApiService {
    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            // Usa la global directamente
            if (!window.API_BASE_URL) {
                throw new Error("API_BASE_URL no definida - revisa config.js");
            }
            
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, config); 
            
            if (response.status === 401) {
                console.warn("401 - Sesión expirada");
                AuthManager.redirectToLogin();
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            
            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            console.error(`Error en API ${endpoint}:`, error.message || error);
            throw error;
        }
    }

    // Tus métodos específicos (agrega los que tengas)
    static async getRegistros() { return this.request('/registros'); }
    static async createRegistro(data) { return this.request('/registros', { method: 'POST', body: JSON.stringify(data) }); }
    static async getCamiones() { return this.request('/camiones'); }
    static async createCamion(data) { return this.request('/camiones', { method: 'POST', body: JSON.stringify(data) }); }
    static async getCamioneros() { return this.request('/camioneros'); }
    static async createCamionero(data) { return this.request('/camioneros', { method: 'POST', body: JSON.stringify(data) }); }
    static async getMantenimientos() { return this.request('/mantenimientos'); }
    static async createMantenimiento(data) { return this.request('/mantenimientos', { method: 'POST', body: JSON.stringify(data) }); }
}