// Archivo: frontend/config.js

// URL de producción del BACKEND - SIN "/api" al final
const BACKEND_PROD_URL = "https://petrocontrol-backend.vercel.app";

const API_CONFIG = {
  getBaseURL: () => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3000"; //  Sin /api
    }
    
    // URL ABSOLUTA del backend SIN /api
    return BACKEND_PROD_URL; 
  },
}

const API_BASE_URL = API_CONFIG.getBaseURL();
console.log("🌐 API Base URL configurada:", API_BASE_URL);