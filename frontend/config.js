// config.js - Configuración de API dinámica (producción y desarrollo)

const API_CONFIG = {
  PRODUCTION_BACKEND: "https://petrocontrol-backend.vercel.app/api",
  DEVELOPMENT_BACKEND: "http://localhost:3000/api",

  getBaseURL: () => {
    // Detecta si estamos en Vercel (producción) o localhost (desarrollo)
    if (location.hostname.includes("vercel.app") || location.hostname === "petrocontrol-frontend.vercel.app") {
      return API_CONFIG.PRODUCTION_BACKEND;
    }
    return API_CONFIG.DEVELOPMENT_BACKEND;
  }
};

// URL base global para que todos los scripts la usen
const API_BASE_URL = API_CONFIG.getBaseURL();

console.log("🌐 API Base URL configurada:", API_BASE_URL);

// Exponer globalmente (importante para que auth.js y otros lo lean)
window.API_BASE_URL = API_BASE_URL;