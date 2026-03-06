// config.js
const API_CONFIG = {
  PRODUCTION_BACKEND: "https://petrocontrol-backend.vercel.app/api",
  DEVELOPMENT_BACKEND: "http://localhost:3000/api",

  getBaseURL: () => {
    if (location.hostname.includes("vercel.app") || location.hostname === "petrocontrol-frontend.vercel.app" || location.hostname.includes("petrocontrol")) {
      return API_CONFIG.PRODUCTION_BACKEND;
    }
    return API_CONFIG.DEVELOPMENT_BACKEND;
  }
};

// Asignar directamente a window, sin crear una variable global adicional
window.API_BASE_URL = API_CONFIG.getBaseURL();

console.log(" API Base URL configurada en config.js:", window.API_BASE_URL);