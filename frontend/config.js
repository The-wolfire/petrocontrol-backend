const API_CONFIG = {
  // URL del backend en produccion (Vercel)
  PRODUCTION_BACKEND: "https://petrocontrol-backend.vercel.app/api",
  
  // URL del backend en desarrollo (localhost)
  DEVELOPMENT_BACKEND: "http://localhost:3000/api",
  
  // Detectar si estamos en produccion o desarrollo
  getBaseURL: () => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return API_CONFIG.DEVELOPMENT_BACKEND
    }
    return API_CONFIG.PRODUCTION_BACKEND
  },
}

// Exportar la URL base para usar en todos los archivos
const API_BASE_URL = API_CONFIG.getBaseURL()

console.log("API Base URL configurada:", API_BASE_URL)
