// =========================
// Configuración Base
// =========================
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000/api"
  : "https://tudominio.com/api";

// Función central para llamadas API
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  try {
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
// Login
// =========================
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!username || !password) {
    showMessage('error', 'Complete los campos.');
    return;
  }

  try {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("currentUser", data.user?.username || "");
    localStorage.setItem("userRole", data.user?.role || "");

    showMessage('success', 'Inicio de sesión exitoso');
    window.location.href = "dashboard.html";
  } catch (err) {
    showMessage('error', err.message);
  }
}

// =========================
// Registro de usuario
// =========================
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username')?.value.trim();
  const password = document.getElementById('reg-password')?.value;

  if (!username || !password) {
    showMessage('error', 'Complete los campos.');
    return;
  }

  try {
    await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    showMessage('success', 'Usuario registrado con éxito.');
    document.getElementById('register-form')?.reset();
  } catch (err) {
    showMessage('error', err.message);
  }
}

// =========================
// Logout
// =========================
function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  window.location.href = "index.html";
}

// =========================
// Cargar registros
// =========================
async function cargarRegistros() {
  try {
    const registros = await apiCall("/registros");
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
    showMessage('error', 'Error al cargar registros.');
  }
}

// =========================
// Inicializar formularios de registro
// =========================
function inicializarFormulariosRegistro() {
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  document.getElementById("register-form")?.addEventListener("submit", handleRegister);
  document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
}

// =========================
// Mostrar mensajes
// =========================
function showMessage(type, text) {
  const msgDiv = document.getElementById("message");
  if (!msgDiv) {
    alert(text);
    return;
  }
  msgDiv.textContent = text;
  msgDiv.className = type === "error" ? "msg-error" : "msg-success";
  setTimeout(() => msgDiv.textContent = "", 3000);
}

// =========================
// Protección de rutas
// =========================
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token && !window.location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
}

// =========================
// Inicializar al cargar
// =========================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  inicializarFormulariosRegistro();
});
