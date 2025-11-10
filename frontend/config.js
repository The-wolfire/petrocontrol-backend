// Archivo: frontend/config.js

const BACKEND_PROD_URL = "https://petrocontrol-backend.vercel.app/api";

const API_CONFIG = {
  // Detectar si estamos en producción (Vercel) o desarrollo (localhost)
  getBaseURL: () => {
    // Si estamos en localhost o 127.0.0.1, usar el servidor local
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3000/api"
    }

    return BACKEND_PROD_URL;
  },
}

const API_BASE_URL = API_CONFIG.getBaseURL()

console.log("🌐 API Base URL configurada:", API_BASE_URL)