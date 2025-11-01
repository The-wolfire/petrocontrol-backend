const API_CONFIG = {
  // Detectar si estamos en producción (Vercel) o desarrollo (localhost)
getBaseURL: () => {
    // Si estamos en localhost, usar el servidor local
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api"
    }

    // Si estamos en producción, usar la URL de producción
    // Vercel automáticamente proporciona la URL correcta
    return window.location.origin + "/api"
},
}

// Exportar la URL base para usar en todos los archivos
const API_BASE_URL = API_CONFIG.getBaseURL()

console.log("🌐 API Base URL configurada:", API_BASE_URL)
