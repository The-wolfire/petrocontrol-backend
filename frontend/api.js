// api.js - Versión segura con objeto literal (sin class ni let/const duplicados)

console.log("API_BASE_URL en api.js:", window.API_BASE_URL || "ERROR: no definida");

const ApiService = {
    async request(endpoint, options = {}) {
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
            if (!window.API_BASE_URL) {
                throw new Error("API_BASE_URL no está definida - revisa config.js");
            }
            
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, config); 
            
            if (response.status === 401) {
                console.warn("401 - Sesión expirada o acceso denegado");
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
            console.error(`Error en llamada API a ${endpoint}:`, error.message || error);
            throw error;
        }
    },

    // Tus métodos específicos
    getRegistros: async function() { return this.request('/registros'); },
    createRegistro: async function(data) { return this.request('/registros', { method: 'POST', body: JSON.stringify(data) }); },
    getCamiones: async function() { return this.request('/camiones'); },
    createCamion: async function(data) { return this.request('/camiones', { method: 'POST', body: JSON.stringify(data) }); },
    getCamioneros: async function() { return this.request('/camioneros'); },
    createCamionero: async function(data) { return this.request('/camioneros', { method: 'POST', body: JSON.stringify(data) }); },
    getMantenimientos: async function() { return this.request('/mantenimientos'); },
    createMantenimiento: async function(data) { return this.request('/mantenimientos', { method: 'POST', body: JSON.stringify(data) }); },
    // Agrega aquí los demás métodos que tengas (getInventario, etc.)
};