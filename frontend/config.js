// Archivo: frontend/config.js

// ✅ 1. Definir la URL de producción del BACKEND
const BACKEND_PROD_URL = "https://petrocontrol-backend.vercel.app/api";

const API_CONFIG = {
  getBaseURL: () => {
    // Si estamos en localhost o 127.0.0.1, usar el servidor local
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3000/api"
    }
    
    // ✅ 2. Siempre usar la URL ABSOLUTA del backend para el despliegue en Vercel
    return BACKEND_PROD_URL; 
  },
}

const API_BASE_URL = API_CONFIG.getBaseURL()

console.log("🌐 API Base URL configurada:", API_BASE_URL)