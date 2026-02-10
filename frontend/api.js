// api.js - Solo llamadas API (usa AuthManager de auth.js)

class ApiService {
    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken(); // Usa el de auth.js
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config); 
            
            if (response.status === 401) {
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
            console.error(`Error en API ${endpoint}:`, error);
            throw error;
        }
    }

    // Tus métodos específicos
    static async getRegistros() { return this.request('/registros'); }
    static async createRegistro(data) { return this.request('/registros', { method: 'POST', body: JSON.stringify(data) }); }
    static async getCamiones() { return this.request('/camiones'); }
    static async createCamion(data) { return this.request('/camiones', { method: 'POST', body: JSON.stringify(data) }); }
    static async getCamioneros() { return this.request('/camioneros'); }
    static async createCamionero(data) { return this.request('/camioneros', { method: 'POST', body: JSON.stringify(data) }); }
    static async getMantenimientos() { return this.request('/mantenimientos'); }
    static async createMantenimiento(data) { return this.request('/mantenimientos', { method: 'POST', body: JSON.stringify(data) }); }
    // Agrega los demás si tienes más
}