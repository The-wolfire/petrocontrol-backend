import { Chart } from "@/components/ui/chart"
// ============================
// INVENTARIO DINÁMICO
// ============================

async function cargarInventarioDinamico() {
  const canvas = document.getElementById("inventory-chart")
  if (!canvas) {
    console.warn("No se encontró el elemento canvas con ID 'inventory-chart'")
    return
  }

  const ctx = canvas.getContext("2d")

  try {
    // Usar token consistente (primero 'token', luego 'authToken' como fallback)
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")

    if (!token) {
      console.error("No hay token de autenticación")
      mostrarErrorEnCanvas(ctx, "No autenticado")
      return
    }

    const response = await fetch(window.AppConfig.getApiUrl("/registros/inventario"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    // Verificar que tenemos datos válidos
    if (!Array.isArray(data) || data.length === 0) {
      mostrarErrorEnCanvas(ctx, "No hay datos disponibles")
      return
    }

    const labels = data.map((item) => item.tipoPetroleo || "Sin tipo")
    const valores = data.map((item) => Number(item.cantidad) || 0)

    // Destruir gráfico anterior si existe
    if (window.inventarioChart) {
      window.inventarioChart.destroy()
    }

    // Verificar que Chart.js esté disponible globalmente
    if (typeof Chart === "undefined") {
      console.error("Chart.js no está cargado. Asegúrate de incluir la librería Chart.js")
      mostrarErrorEnCanvas(ctx, "Chart.js no disponible")
      return
    }

    // Crear nuevo gráfico
    window.inventarioChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Inventario Actual (Litros)",
            data: valores,
            backgroundColor: [
              "rgba(46, 125, 50, 0.8)",
              "rgba(255, 143, 0, 0.8)",
              "rgba(25, 118, 210, 0.8)",
              "rgba(245, 124, 0, 0.8)",
              "rgba(156, 39, 176, 0.8)",
              "rgba(244, 67, 54, 0.8)",
            ],
            borderColor: [
              "rgba(46, 125, 50, 1)",
              "rgba(255, 143, 0, 1)",
              "rgba(25, 118, 210, 1)",
              "rgba(245, 124, 0, 1)",
              "rgba(156, 39, 176, 1)",
              "rgba(244, 67, 54, 1)",
            ],
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              callback: (value) => value.toLocaleString() + " L",
              font: {
                size: 12,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: {
                size: 14,
                weight: "bold",
              },
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "white",
            bodyColor: "white",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
            callbacks: {
              label: (context) => context.dataset.label + ": " + context.parsed.y.toLocaleString() + " L",
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    })

    console.log("Gráfico de inventario cargado exitosamente")
  } catch (err) {
    console.error("Error al cargar inventario dinámico:", err)
    mostrarErrorEnCanvas(ctx, "Error al cargar datos")
  }
}

// Función auxiliar para mostrar errores en el canvas
function mostrarErrorEnCanvas(ctx, mensaje) {
  const canvas = ctx.canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Fondo del error
  ctx.fillStyle = "#f8f9fa"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Borde del error
  ctx.strokeStyle = "#dc3545"
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

  // Texto del error
  ctx.fillStyle = "#dc3545"
  ctx.font = "16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(mensaje, canvas.width / 2, canvas.height / 2 - 10)

  ctx.font = "12px Arial"
  ctx.fillStyle = "#6c757d"
  ctx.fillText("Revisa la consola para más detalles", canvas.width / 2, canvas.height / 2 + 15)
}

// ============================
// SISTEMA DE REGISTRO DE USUARIOS
// ============================

function inicializarRegistro() {
  const registerForm = document.getElementById("register-form")
  if (!registerForm) return

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("register-username")?.value?.trim()
    const password = document.getElementById("register-password")?.value
    const confirmPassword = document.getElementById("confirm-password")?.value

    // Validaciones básicas
    if (!username || !password) {
      mostrarMensaje("Por favor, completa todos los campos", "error")
      return
    }

    if (username.length < 3) {
      mostrarMensaje("El nombre de usuario debe tener al menos 3 caracteres", "error")
      return
    }

    if (password.length < 6) {
      mostrarMensaje("La contraseña debe tener al menos 6 caracteres", "error")
      return
    }

    if (confirmPassword && password !== confirmPassword) {
      mostrarMensaje("Las contraseñas no coinciden", "error")
      return
    }

    // Deshabilitar el botón durante el envío
    const submitBtn = registerForm.querySelector('button[type="submit"]')
    const originalText = submitBtn?.textContent
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = "Registrando..."
    }

    try {
      const response = await fetch(window.AppConfig.getApiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        mostrarMensaje("Usuario registrado correctamente", "success")
        registerForm.reset()
        setTimeout(() => {
          window.location.href = "index.html"
        }, 1500)
      } else {
        mostrarMensaje("Error: " + (data.message || "Error desconocido"), "error")
      }
    } catch (error) {
      console.error("Error de registro:", error)
      mostrarMensaje("Error de conexión. Por favor, intenta nuevamente.", "error")
    } finally {
      // Rehabilitar el botón
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    }
  })
}

// ============================
// SISTEMA DE LOGIN
// ============================

function inicializarLogin() {
  const loginForm = document.getElementById("login-form")
  if (!loginForm) return

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("login-username")?.value?.trim()
    const password = document.getElementById("login-password")?.value

    if (!username || !password) {
      mostrarMensaje("Por favor, completa todos los campos", "error")
      return
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]')
    const originalText = submitBtn?.textContent
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = "Iniciando sesión..."
    }

    try {
      const response = await fetch(window.AppConfig.getApiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token)
        mostrarMensaje("Inicio de sesión exitoso", "success")
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } else {
        mostrarMensaje("Error: " + (data.message || "Credenciales incorrectas"), "error")
      }
    } catch (error) {
      console.error("Error de login:", error)
      mostrarMensaje("Error de conexión. Por favor, intenta nuevamente.", "error")
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    }
  })
}

// ============================
// SISTEMA DE MENSAJES
// ============================

function mostrarMensaje(mensaje, tipo = "info") {
  // Remover mensaje anterior si existe
  const mensajeAnterior = document.querySelector(".mensaje-sistema")
  if (mensajeAnterior) {
    mensajeAnterior.remove()
  }

  // Crear nuevo mensaje
  const div = document.createElement("div")
  div.className = `mensaje-sistema mensaje-${tipo}`
  div.textContent = mensaje

  // Estilos básicos
  div.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  `

  // Colores según el tipo
  switch (tipo) {
    case "success":
      div.style.backgroundColor = "#28a745"
      break
    case "error":
      div.style.backgroundColor = "#dc3545"
      break
    case "warning":
      div.style.backgroundColor = "#ffc107"
      div.style.color = "#212529"
      break
    default:
      div.style.backgroundColor = "#17a2b8"
  }

  document.body.appendChild(div)

  // Remover después de 4 segundos
  setTimeout(() => {
    if (div.parentNode) {
      div.style.opacity = "0"
      div.style.transform = "translateX(100%)"
      setTimeout(() => div.remove(), 300)
    }
  }, 4000)
}

// ============================
// INICIALIZACIÓN AUTOMÁTICA
// ============================

document.addEventListener("DOMContentLoaded", () => {
  // Detectar página actual y ejecutar funciones correspondientes
  const currentPage = window.location.pathname.toLowerCase()

  console.log("Inicializando script-update.js en:", currentPage)

  // Inventario dinámico
  if (currentPage.includes("inventario.html") || currentPage.includes("dashboard.html")) {
    const chartElement = document.getElementById("inventory-chart")
    if (chartElement) {
      console.log("Cargando gráfico de inventario...")
      cargarInventarioDinamico()
      // Actualizar cada 30 segundos
      setInterval(cargarInventarioDinamico, 30000)
    } else {
      console.warn("Elemento canvas 'inventory-chart' no encontrado")
    }
  }

  // Sistema de registro
  if (currentPage.includes("registro.html") || currentPage.includes("register.html")) {
    console.log("Inicializando sistema de registro...")
    inicializarRegistro()
  }

  // Sistema de login
  if (currentPage.includes("login.html") || currentPage.includes("index.html")) {
    console.log("Inicializando sistema de login...")
    inicializarLogin()
  }

  // Verificar autenticación en páginas protegidas
  const paginasProtegidas = ["dashboard.html", "camiones.html", "inventario.html", "registros.html"]
  const paginaActual = currentPage.split("/").pop()

  if (paginasProtegidas.some((pagina) => paginaActual.includes(pagina))) {
    const token = localStorage.getItem("token")
    if (!token) {
      mostrarMensaje("Sesión expirada. Redirigiendo al login...", "warning")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
      return
    }
  }
})

// ============================
// FUNCIONES UTILITARIAS
// ============================

// Función para limpiar el localStorage en caso de errores
function limpiarSesion() {
  localStorage.removeItem("token")
  localStorage.removeItem("authToken")
  mostrarMensaje("Sesión cerrada", "info")
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

// Función para verificar si el token es válido
async function verificarToken() {
  const token = localStorage.getItem("token")
  if (!token) return false

  try {
    const response = await fetch(window.AppConfig.getApiUrl("/auth/verify"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status === 401) {
      limpiarSesion()
      return false
    }

    return response.ok
  } catch (error) {
    console.error("Error verificando token:", error)
    return false
  }
}

// Función para refrescar datos del inventario manualmente
function refrescarInventario() {
  const chartElement = document.getElementById("inventory-chart")
  if (chartElement) {
    mostrarMensaje("Actualizando inventario...", "info")
    cargarInventarioDinamico()
  }
}

// Exportar funciones para uso global si es necesario
window.ScriptUpdate = {
  cargarInventarioDinamico,
  inicializarRegistro,
  inicializarLogin,
  limpiarSesion,
  verificarToken,
  refrescarInventario,
  mostrarMensaje,
}
