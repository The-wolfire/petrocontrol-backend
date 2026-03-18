const API_BASE_URL = window.API_BASE_URL || "https://petrocontrol-backend.vercel.app/api";

let camionerosActivos = [];

// Cargar camioneros activos (disponibles para viaje)
async function cargarCamionerosActivos() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/camioneros`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Error al cargar camioneros");
        const data = await response.json();
        const todos = data.camioneros || [];

        const ahora = new Date();
        const activos = todos.filter(c => {
            if (c.estado === 'inactivo') return false;
            if (!c.ultimoViaje) return true; // Nunca ha viajado, activo
            const ultimo = new Date(c.ultimoViaje);
            const horasPasadas = (ahora - ultimo) / (1000 * 60 * 60);
            return horasPasadas >= 8; // Solo activos si han pasado 8h o más
        });

        camionerosActivos = activos;
        llenarSelectConductores(activos);
    } catch (error) {
        console.error("Error cargando camioneros activos:", error);
    }
}

function llenarSelectConductores(activos) {
    const selectEntrada = document.getElementById("conductor-entrada");
    if (selectEntrada) {
        selectEntrada.innerHTML = '<option value="">Seleccionar conductor...</option>';
        activos.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.nombre} ${c.apellido} (${c.cedula})`;
            selectEntrada.appendChild(option);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás autenticado. Redirigiendo al login...");
        window.location.href = "index.html";
        return;
    }

    cargarCamionerosActivos();
    cargarRegistros();

    // Formulario de entrada
    const formEntrada = document.getElementById("form-entrada");
    if (formEntrada) {
        formEntrada.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = formEntrada.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;

            const conductorId = document.getElementById("conductor-entrada").value;
            if (!conductorId) {
                showMessage("Debe seleccionar un conductor", "error");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            const conductor = camionerosActivos.find(c => c.id == conductorId);
            const conductorNombre = conductor ? `${conductor.nombre} ${conductor.apellido}` : '';

            const data = {
                camionId: document.getElementById("camion-id-entrada").value,
                conductorId: conductorId,
                conductor: conductorNombre,
                fechaHora: document.getElementById("fecha-entrada").value,
                tipoPetroleo: document.getElementById("tipo-petroleo-entrada").value,
                cantidad: Number.parseFloat(document.getElementById("cantidad-entrada").value),
                origen: document.getElementById("origen-entrada").value,
                observaciones: document.getElementById("observaciones-entrada").value,
                tipo: "entrada",
            };

            try {
                const response = await fetch(`${API_BASE_URL}/registros`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error ${response.status}`);
                }

                formEntrada.reset();
                establecerFechaActual();
                await cargarRegistros();
                // Recargar camioneros activos (el conductor usado ya no debe aparecer)
                await cargarCamionerosActivos();
                showMessage("Entrada registrada exitosamente", "success");
                scrollToTable("entradas");
            } catch (error) {
                console.error("Error al guardar entrada:", error);
                showMessage("Error al guardar la entrada: " + error.message, "error");
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Formulario de salida (sin cambios)
    const formSalida = document.getElementById("form-salida");
    if (formSalida) {
        formSalida.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = formSalida.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;

            const data = {
                camionId: document.getElementById("camion-id-salida").value,
                conductor: document.getElementById("conductor-salida").value,
                fechaHora: document.getElementById("fecha-salida").value,
                tipoPetroleo: document.getElementById("tipo-petroleo-salida").value,
                cantidad: Number.parseFloat(document.getElementById("cantidad-salida").value),
                destino: document.getElementById("destino-salida").value,
                observaciones: document.getElementById("observaciones-salida").value,
                tipo: "salida",
            };

            try {
                const response = await fetch(`${API_BASE_URL}/registros`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error ${response.status}`);
                }

                formSalida.reset();
                establecerFechaActual();
                await cargarRegistros();
                showMessage("Salida registrada exitosamente", "success");
                scrollToTable("salidas");
            } catch (error) {
                console.error("Error al guardar salida:", error);
                showMessage("Error al guardar la salida: " + error.message, "error");
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

function establecerFechaActual() {
    const fechaEntrada = document.getElementById('fecha-entrada');
    const fechaSalida = document.getElementById('fecha-salida');
    const ahora = new Date();
    const fechaFormateada = ahora.toISOString().slice(0, 16);
    if (fechaEntrada) fechaEntrada.value = fechaFormateada;
    if (fechaSalida) fechaSalida.value = fechaFormateada;
}

// Función para cargar registros (sin cambios, igual que antes)
async function cargarRegistros() {
    try {
        console.log("Cargando registros...");
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/registros`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const registros = data.registros || [];

        const entradas = registros.filter(reg => reg.tipo === "entrada");
        const salidas = registros.filter(reg => reg.tipo === "salida");

        // Renderizar entradas
        const entradasTbody = document.getElementById("entradas-table-body");
        if (entradasTbody) {
            if (entradas.length === 0) {
                entradasTbody.innerHTML = `<tr><td colspan="7" class="sin-registros">No hay entradas registradas</td></tr>`;
            } else {
                entradas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
                entradasTbody.innerHTML = entradas.map(reg => `
                    <tr>
                        <td><strong>${reg.camion?.camionId || reg.camionId || "N/A"}</strong></td>
                        <td>${reg.fechaHora ? new Date(reg.fechaHora).toLocaleString("es-ES") : "N/A"}</td>
                        <td>${reg.conductor || "N/A"}</td>
                        <td><span class="fuel-type">${reg.tipoPetroleo || reg.combustible || "N/A"}</span></td>
                        <td><strong>${reg.cantidad || 0} L</strong></td>
                        <td>${reg.origen || "N/A"}</td>
                        <td>
                            <button class="btn-small btn-danger" onclick="eliminarRegistro(${reg.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join("");
            }
        }

        // Renderizar salidas
        const salidasTbody = document.getElementById("salidas-table-body");
        if (salidasTbody) {
            if (salidas.length === 0) {
                salidasTbody.innerHTML = `<tr><td colspan="7" class="sin-registros">No hay salidas registradas</td></tr>`;
            } else {
                salidas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
                salidasTbody.innerHTML = salidas.map(reg => `
                    <tr>
                        <td><strong>${reg.camion?.camionId || reg.camionId || "N/A"}</strong></td>
                        <td>${reg.fechaHora ? new Date(reg.fechaHora).toLocaleString("es-ES") : "N/A"}</td>
                        <td>${reg.conductor || "N/A"}</td>
                        <td><span class="fuel-type">${reg.tipoPetroleo || reg.combustible || "N/A"}</span></td>
                        <td><strong>${reg.cantidad || 0} L</strong></td>
                        <td>${reg.destino || "N/A"}</td>
                        <td>
                            <button class="btn-small btn-danger" onclick="eliminarRegistro(${reg.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join("");
            }
        }
        console.log(`${entradas.length} entradas y ${salidas.length} salidas cargadas`);
    } catch (error) {
        console.error("Error al cargar registros:", error);
        const mensaje = error.message.includes('Failed to fetch')
            ? "No se pudo conectar al servidor. Verifica el backend."
            : error.message;
        document.getElementById("entradas-table-body").innerHTML = `<tr><td colspan="7" style="color: red;">Error: ${mensaje}</td></tr>`;
        document.getElementById("salidas-table-body").innerHTML = `<tr><td colspan="7" style="color: red;">Error: ${mensaje}</td></tr>`;
    }
}

function scrollToTable(tipo) {
    setTimeout(() => {
        const tableSection = document.querySelector(`#${tipo}-table-body`).closest('.tabla-contenedor');
        if (tableSection) tableSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 500);
}

async function eliminarRegistro(id) {
    if (!confirm("¿Está seguro de que desea eliminar este registro?")) return;
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_BASE_URL}/registros/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        showMessage("Registro eliminado exitosamente", "success");
        await cargarRegistros();
    } catch (error) {
        console.error("Error al eliminar registro:", error);
        showMessage("Error al eliminar el registro: " + error.message, "error");
    }
}

function showMessage(message, type = "info") {
    const existingMessages = document.querySelectorAll(".floating-message");
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement("div");
    messageDiv.className = `floating-message message-${type}`;
    messageDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
        </div>
    `;
    messageDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 12px;
        color: white; font-weight: 500; z-index: 1000; max-width: 400px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2); animation: slideIn 0.3s ease-out;
    `;
    messageDiv.style.backgroundColor = type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#2196f3";

    document.body.appendChild(messageDiv);
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = "slideIn 0.3s ease-out reverse";
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 5000);
}