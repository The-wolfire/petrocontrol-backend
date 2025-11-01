document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token")
  const API_BASE_URL = "http://localhost:3000/api"

  // Formulario de entrada
  const formEntrada = document.getElementById("form-entrada")
  if (formEntrada) {
    formEntrada.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Mostrar loading
      const submitBtn = formEntrada.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'
      submitBtn.disabled = true

      const data = {
        camionId: document.getElementById("camion-id-entrada").value,
        conductor: document.getElementById("conductor-entrada").value,
        fechaHora: document.getElementById("fecha-entrada").value,
        tipoPetroleo: document.getElementById("tipo-petroleo-entrada").value,
        cantidad: Number.parseFloat(document.getElementById("cantidad-entrada").value),
        origen: document.getElementById("origen-entrada").value,
        observaciones: document.getElementById("observaciones-entrada").value,
        tipo: "entrada",
      }

      try {
        console.log("Enviando entrada:", data)

        const response = await fetch(`${API_BASE_URL}/registros`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("Entrada guardada:", result)

        // Limpiar formulario
        formEntrada.reset()

        // Restablecer fecha actual
        const fechaEntrada = document.getElementById("fecha-entrada")
        if (fechaEntrada) {
          const ahora = new Date()
          fechaEntrada.value = ahora.toISOString().slice(0, 16)
        }

        // Recargar registros
        await cargarRegistros()

        // Mostrar mensaje de éxito
        showMessage("Entrada registrada exitosamente", "success")

        // Scroll hacia la tabla de entradas
        scrollToTable("entradas")
      } catch (error) {
        console.error("Error al guardar entrada:", error)
        showMessage("Error al guardar la entrada: " + error.message, "error")
      } finally {
        // Restaurar botón
        submitBtn.textContent = originalText
        submitBtn.disabled = false
      }
    })
  }

  // Formulario de salida
  const formSalida = document.getElementById("form-salida")
  if (formSalida) {
    formSalida.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Mostrar loading
      const submitBtn = formSalida.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'
      submitBtn.disabled = true

      const data = {
        camionId: document.getElementById("camion-id-salida").value,
        conductor: document.getElementById("conductor-salida").value,
        fechaHora: document.getElementById("fecha-salida").value,
        tipoPetroleo: document.getElementById("tipo-petroleo-salida").value,
        cantidad: Number.parseFloat(document.getElementById("cantidad-salida").value),
        destino: document.getElementById("destino-salida").value,
        observaciones: document.getElementById("observaciones-salida").value,
        tipo: "salida",
      }

      try {
        console.log("Enviando salida:", data)

        const response = await fetch(`${API_BASE_URL}/registros`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("Salida guardada:", result)

        // Limpiar formulario
        formSalida.reset()

        // Restablecer fecha actual
        const fechaSalida = document.getElementById("fecha-salida")
        if (fechaSalida) {
          const ahora = new Date()
          fechaSalida.value = ahora.toISOString().slice(0, 16)
        }

        // Recargar registros
        await cargarRegistros()

        // Mostrar mensaje de éxito
        showMessage("Salida registrada exitosamente", "success")

        // Scroll hacia la tabla de salidas
        scrollToTable("salidas")
      } catch (error) {
        console.error("Error al guardar salida:", error)
        showMessage("Error al guardar la salida: " + error.message, "error")
      } finally {
        // Restaurar botón
        submitBtn.textContent = originalText
        submitBtn.disabled = false
      }
    })
  }

  // Cargar registros al inicializar
  cargarRegistros()
})

// Función para cargar registros
async function cargarRegistros() {
  try {
    console.log("Cargando registros...")

    const token = localStorage.getItem("token")
    const API_BASE_URL = "http://localhost:3000/api"

    const response = await fetch(`${API_BASE_URL}/registros`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Respuesta del servidor:", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Datos recibidos:", data)

    const registros = data.registros || []

    // Separar registros por tipo
    const entradas = registros.filter(reg => reg.tipo === "entrada")
    const salidas = registros.filter(reg => reg.tipo === "salida")

    // Cargar tabla de entradas
    const entradasTbody = document.getElementById("entradas-table-body")
    if (!entradasTbody) {
      console.error("No se encontró el elemento entradas-table-body")
      return
    }

    if (entradas.length === 0) {
      entradasTbody.innerHTML = `
        <tr>
          <td colspan="7" class="sin-registros">
            No hay entradas registradas
          </td>
        </tr>
      `
    } else {
      // Ordenar por fecha más reciente primero
      entradas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))

      entradasTbody.innerHTML = entradas
        .map((reg, index) => {
          try {
            // Destacar el registro más reciente
            const isRecent = index === 0
            const rowClass = isRecent ? 'style="background-color: #e8f5e8;"' : ""

            return `
              <tr ${rowClass}>
                <td><strong>${reg.camion ? reg.camion.camionId : (reg.camionId || "N/A")}</strong></td>
                <td>${reg.fechaHora ? new Date(reg.fechaHora).toLocaleString("es-ES") : "N/A"}</td>
                <td>${reg.conductor || "N/A"}</td>
                <td>
                  <span class="fuel-type">${reg.tipoPetroleo || reg.combustible || "N/A"}</span>
                </td>
                <td><strong>${reg.cantidad || 0} L</strong></td>
                <td>${reg.origen || "N/A"}</td>
                <td>
                  <button class="btn-small btn-danger" onclick="eliminarRegistro(${reg.id})">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            `
          } catch (error) {
            console.error("Error formateando registro:", reg, error)
            return `
              <tr>
                <td colspan="7" style="color: red; text-align: center;">
                  Error al mostrar registro ID: ${reg.id}
                </td>
              </tr>
            `
          }
        })
        .join("")
    }

    // Cargar tabla de salidas
    const salidasTbody = document.getElementById("salidas-table-body")
    if (!salidasTbody) {
      console.error("No se encontró el elemento salidas-table-body")
      return
    }

    if (salidas.length === 0) {
      salidasTbody.innerHTML = `
        <tr>
          <td colspan="7" class="sin-registros">
            No hay salidas registradas
          </td>
        </tr>
      `
    } else {
      // Ordenar por fecha más reciente primero
      salidas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))

      salidasTbody.innerHTML = salidas
        .map((reg, index) => {
          try {
            // Destacar el registro más reciente
            const isRecent = index === 0
            const rowClass = isRecent ? 'style="background-color: #e6f7ff;"' : "" // Azul claro para salidas

            return `
              <tr ${rowClass}>
                <td><strong>${reg.camion ? reg.camion.camionId : (reg.camionId || "N/A")}</strong></td>
                <td>${reg.fechaHora ? new Date(reg.fechaHora).toLocaleString("es-ES") : "N/A"}</td>
                <td>${reg.conductor || "N/A"}</td>
                <td>
                  <span class="fuel-type">${reg.tipoPetroleo || reg.combustible || "N/A"}</span>
                </td>
                <td><strong>${reg.cantidad || 0} L</strong></td>
                <td>${reg.destino || "N/A"}</td>
                <td>
                  <button class="btn-small btn-danger" onclick="eliminarRegistro(${reg.id})">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            `
          } catch (error) {
            console.error("Error formateando registro:", reg, error)
            return `
              <tr>
                <td colspan="7" style="color: red; text-align: center;">
                  Error al mostrar registro ID: ${reg.id}
                </td>
              </tr>
            `
          }
        })
        .join("")
    }

    console.log(`${entradas.length} entradas y ${salidas.length} salidas cargadas correctamente`)
  } catch (error) {
    console.error("Error al cargar registros:", error)

    const entradasTbody = document.getElementById("entradas-table-body")
    const salidasTbody = document.getElementById("salidas-table-body")
    
    if (entradasTbody) {
      entradasTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px; color: red;">
            Error al cargar entradas: ${error.message}
          </td>
        </tr>
      `
    }
    
    if (salidasTbody) {
      salidasTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px; color: red;">
            Error al cargar salidas: ${error.message}
          </td>
        </tr>
      `
    }

    showMessage("Error al cargar registros: " + error.message, "error")
  }
}

// Función para hacer scroll hacia la tabla específica
function scrollToTable(tipo) {
  setTimeout(() => {
    const tableSection = document.querySelector(`#${tipo}-table-body`).closest('.tabla-contenedor');
    if (tableSection) {
      tableSection.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, 500)
}

// Función para eliminar registros
async function eliminarRegistro(id) {
  if (!confirm("¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.")) {
    return;
  }

  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:3000/api";

  try {
    const response = await fetch(`${API_BASE_URL}/registros/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Registro eliminado:", result);
    showMessage("Registro eliminado exitosamente", "success");

    // Recargar los registros para actualizar las tablas
    await cargarRegistros();
  } catch (error) {
    console.error("Error al eliminar registro:", error);
    showMessage("Error al eliminar el registro: " + error.message, "error");
  }
}

// Función para mostrar mensajes
function showMessage(message, type = "info") {
  // Remover mensajes anteriores
  const existingMessages = document.querySelectorAll(".floating-message")
  existingMessages.forEach((msg) => msg.remove())

  // Crear elemento de mensaje
  const messageDiv = document.createElement("div")
  messageDiv.className = `floating-message message-${type}`
  messageDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
    </div>
  `

  // Agregar estilos
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 400px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `

  // Colores según el tipo
  if (type === "success") {
    messageDiv.style.backgroundColor = "#4caf50"
  } else if (type === "error") {
    messageDiv.style.backgroundColor = "#f44336"
  } else {
    messageDiv.style.backgroundColor = "#2196f3"
  }

  // Agregar animación CSS
  if (!document.getElementById("message-styles")) {
    const style = document.createElement("style")
    style.id = "message-styles"
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }
      .badge-success { background-color: #4caf50; color: white; }
      .badge-warning { background-color: #ff9800; color: white; }
      .fuel-type {
        background-color: #e3f2fd;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 12px;
      }
      .btn-small {
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        margin: 2px;
      }
      .btn-danger {
        background-color: #dc3545;
        color: white;
      }
      .btn-danger:hover {
        background-color: #c82333;
      }
    `
    document.head.appendChild(style)
  }

  // Agregar al DOM
  document.body.appendChild(messageDiv)

  // Remover después de 5 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.animation = "slideIn 0.3s ease-out reverse"
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv)
        }
      }, 300)
    }
  }, 5000)
}