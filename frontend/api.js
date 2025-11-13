// api.js
class ApiService {
    //static baseURL = 'http://localhost:3000/api';

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
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            // Si no está autorizado, redirigir al login
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

    // Métodos específicos para cada entidad
    static async getRegistros() {
        return this.request('/registros');
    }

static async createRegistro(data) {
        return this.request('/registros', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async getCamiones() {
        return this.request('/camiones');
    }

// ... (el resto de los métodos de api.js siguen igual)
    static async createCamion(data) {
        return this.request('/camiones', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async getCamioneros() {
        return this.request('/camioneros');
    }

    static async createCamionero(data) {
        return this.request('/camioneros', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async getMantenimientos() {
        return this.request('/mantenimientos');
    }

    static async createMantenimiento(data) {
        return this.request('/mantenimientos', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Asumimos que AuthManager está definido en script.js o aquí
const AuthManager = {
    getToken: () => localStorage.getItem('token'),
    redirectToLogin: () => window.location.href = 'index.html'
};