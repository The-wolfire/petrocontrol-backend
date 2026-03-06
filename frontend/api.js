// api.js - Sin redirect en 401 (muestra error real)

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
            const response = await fetch(`${window.API_BASE_URL}${endpoint}`, config); 

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || `Error ${response.status}`;
                throw new Error(message); // Lanzamos error para mostrar en el script
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error en API ${endpoint}:`, error.message);
            throw error; // No redirigimos aquí
        }
    },

    getMantenimientos: async () => ApiService.request('/mantenimientos'),
    getCamioneros: async () => ApiService.request('/camioneros'),
    // Otros métodos
};