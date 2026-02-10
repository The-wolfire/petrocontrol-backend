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

const API_BASE_URL = API_CONFIG.getBaseURL();

console.log("🌐 API Base URL configurada en config.js:", API_BASE_URL);

window.API_BASE_URL = API_BASE_URL;