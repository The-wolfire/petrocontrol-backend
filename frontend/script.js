// =========================
// Configuración Base
// =========================

// Función central para llamadas API
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("authToken"); // Tu script.js usa 'authToken'
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  try {
    // ✅ USA LA VARIABLE GLOBAL CORRECTA DE config.js
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
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
// Estas funciones son necesarias para el script inline de index.html
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
  localStorage.removeItem("userId");
  localStorage.removeItem("token"); // (Limpiamos ambos por si acaso)
  window.location.href = "index.html";
}

// =========================
// Cargar registros
// =========================
async function cargarRegistros() {
  try {
    const registros = await apiCall("/registros"); //
    const tbody = document.querySelector("#tabla-registros tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

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
    // No usamos showMessage aquí porque el index.html no tiene el div 'message'
    console.error('Error al cargar registros.');
  }
}

// =========================
// Inicializar formularios de registro
// =========================
// NO inicializar formularios aquí, index.html ya lo hace.
// document.getElementById("login-form")?.addEventListener("submit", handleLogin);
// document.getElementById("register-form")?.addEventListener("submit", handleRegister);
// document.getElementById("logout-btn")?.addEventListener("click", handleLogout);


// =========================
// Mostrar mensajes
// =========================
// Esta función es llamada por el script inline de index.html
function showMessage(type, text) {
  const msgDiv = document.getElementById("message-container"); //
  if (!msgDiv) {
    alert(text);
    return;
  }
  msgDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(() => (msgDiv.innerHTML = ""), 5000); //
}

// =========================
// Protección de rutas
// =========================
function checkAuth() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken"); // Revisamos ambos tokens
  if (!token && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
}

// =========================
// Inicializar al cargar
// =========================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  // Asignar Logout si el botón existe
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  
  // La lógica de login/register ya está en el script inline de index.html
});