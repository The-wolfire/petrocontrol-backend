// api.js - SIN redirección automática (muestra error real)

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
                throw new Error(message);
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error en API ${endpoint}:`, error.message);
            throw error; // Solo lanzamos error – NO redirigimos
        }
    },

    getMantenimientos: async () => ApiService.request('/mantenimientos'),
    getCamioneros: async () => ApiService.request('/camioneros'),
    // Tus otros métodos
};