document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token")

  if (!token) {
    alert("No estás autenticado. Redirigiendo al login...")
    window.location.href = "index.html"
    return
  }

  // Cargar camiones al abrir camiones.html
  if (window.location.pathname.includes("camiones.html")) {
    cargarCamiones(token)

    const form = document.getElementById("camion-form")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        guardarCamion(token)
      })
    }
  }
})

async function cargarCamiones(token) {
  try {
    const res = await fetch(window.AppConfig.getApiUrl("/camiones"), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Error al cargar camiones")

    const camiones = await res.json()
    const contenedor = document.getElementById("camiones-list")

    if (contenedor) {
      contenedor.innerHTML = camiones
        .map(
          (camion) => `
        <tr>
          <td>${camion.camionId}</td>
          <td>${camion.marca}</td>
          <td>${camion.modelo}</td>
          <td>${camion.capacidad}</td>
        </tr>
      `,
        )
        .join("")
    }
  } catch (err) {
    console.error(err)
    alert("No se pudieron cargar los camiones")
  }
}

async function guardarCamion(token) {
  try {
    const camionId = document.getElementById("camionId").value
    const marca = document.getElementById("marca").value
    const modelo = document.getElementById("modelo").value
    const capacidad = document.getElementById("capacidad").value

    const res = await fetch(window.AppConfig.getApiUrl("/camiones"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ camionId, marca, modelo, capacidad }),
    })

    if (!res.ok) throw new Error("Error al guardar el camión")

    alert("Camión guardado con éxito")
    document.getElementById("camion-form").reset()
    cargarCamiones(token)
  } catch (err) {
    console.error(err)
    alert("No se pudo guardar el camión")
  }
}
