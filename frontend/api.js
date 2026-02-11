// api.js - Sin redirect automático en 401 (para ver el error real del backend)

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
                throw new Error("API_BASE_URL no definida");
            }
            
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, config); 
            
            // QUITAMOS EL REDIRECT AUTOMÁTICO PARA VER EL ERROR REAL
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || `Error ${response.status} ${response.statusText}`;
                throw new Error(message);
            }
            
            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            console.error(`Error en API ${endpoint}:`, error.message || error);
            throw error; // Lanzamos el error para que la página lo maneje
        }
    },

    // Tus métodos (no cambian)
    getRegistros: async function() { return this.request('/registros'); },
    createRegistro: async function(data) { return this.request('/registros', { method: 'POST', body: JSON.stringify(data) }); },
    getCamiones: async function() { return this.request('/camiones'); },
    createCamion: async function(data) { return this.request('/camiones', { method: 'POST', body: JSON.stringify(data) }); },
    getCamioneros: async function() { return this.request('/camioneros'); },
    createCamionero: async function(data) { return this.request('/camioneros', { method: 'POST', body: JSON.stringify(data) }); },
    getMantenimientos: async function() { return this.request('/mantenimientos'); },
    createMantenimiento: async function(data) { return this.request('/mantenimientos', { method: 'POST', body: JSON.stringify(data) }); },
};