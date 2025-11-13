async function apiCall(endpoint, options = {}) {
  // index.html usa 'token', script.js usa 'authToken'. Unificamos.
  const token = localStorage.getItem("token") || localStorage.getItem("authToken"); 
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  try {
    //  USA LA VARIABLE GLOBAL CORRECTA DE config.js
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    if (res.status === 401) {
        handleLogout(); // Si el token es inválido, desloguear
        throw new Error('Sesión expirada o inválida');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Error en la petición");
    return data;
  } catch (err) {
    console.error(`Error en ${endpoint}:`, err);
    throw err;
  }
}

// =========================
// Login (Referenciado desde index.html)
// =========================
async function loginUser(username, password) {
  return await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

// =========================
// Registro (Referenciado desde index.html)
// =========================
async function registerUser(userData) {
  return await apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });
}

// =========================
// Logout
// =========================
function handleLogout() {
  localStorage.removeItem("authToken"); //
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userRole");
  localStorage.removeItem("token"); //
  window.location.href = "index.html";
}

// =========================
// Cargar registros (usado en otras páginas)
// =========================
async function cargarRegistros() {
  try {
    const registros = await apiCall("/registros"); //
    const tbody = document.querySelector("#tabla-registros tbody");
    if (!tbody) return;
    tbody.innerHTML = ""; // Limpiar tabla

    registros.forEach(reg => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reg.fecha || ""}</td>
        <td>${reg.tipo || ""}</td>
        <td>${reg.descripcion || ""}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error al cargar registros.');
  }
}

// =========================
// Protección de rutas
// =========================
function checkAuth() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (!token && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
}

// =========================
// Inicializar al cargar
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // La lógica de login/register ya está en el script inline de index.html
  // Solo necesitamos checkAuth y el botón de logout
  
  checkAuth();
  
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});

// NOTA: La función showMessage está definida en el script inline de index.html
// y también en el script.js original.
// La versión de index.html es la que se usa en esa página.