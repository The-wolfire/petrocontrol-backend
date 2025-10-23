import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { RegistroES } from "../entities/RegistroES"
import { Camion } from "../entities/Camion"

const registroRepository = AppDataSource.getRepository(RegistroES)
const camionRepository = AppDataSource.getRepository(Camion)

export const getRegistros = async (req: Request, res: Response) => {
  try {
    console.log("🔍 Obteniendo registros...")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        message: "Base de datos no disponible",
      })
    }

    const registros = await registroRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "DESC" },
    })

    console.log(`✅ Encontrados ${registros.length} registros`)

    res.json({
      message: "Registros obtenidos exitosamente",
      registros,
      total: registros.length,
    })
  } catch (error) {
    console.error("❌ Error al obtener registros:", error)
    res.status(500).json({
      message: "Error al obtener registros",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const getRegistroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🔍 Obteniendo registro con ID: ${id}`)

    const registro = await registroRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["camion"],
    })

    if (!registro) {
      return res.status(404).json({
        message: "Registro no encontrado",
      })
    }

    console.log("✅ Registro encontrado")

    res.json({
      message: "Registro obtenido exitosamente",
      registro,
    })
  } catch (error) {
    console.error("❌ Error al obtener registro:", error)
    res.status(500).json({
      message: "Error al obtener registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const createRegistro = async (req: Request, res: Response) => {
  try {
    console.log("📥 Creando nuevo registro:", req.body)

    const { camionId, conductor, fechaHora, tipoPetroleo, cantidad, tipo, origen, destino, observaciones } = req.body

    if (!camionId || !conductor || !tipoPetroleo || !cantidad || !tipo) {
      return res.status(400).json({
        message: "Faltan campos requeridos: camionId, conductor, tipoPetroleo, cantidad, tipo",
      })
    }

    if (!["entrada", "salida"].includes(tipo)) {
      return res.status(400).json({
        message: "Tipo debe ser 'entrada' o 'salida'",
      })
    }

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(camionId) },
    })

    if (!camion) {
      return res.status(404).json({
        message: "Camión no encontrado",
      })
    }

    const registro = registroRepository.create({
      camion,
      conductor,
      fechaHora: fechaHora ? new Date(fechaHora) : new Date(),
      tipoPetroleo,
      cantidad: Number.parseFloat(cantidad),
      tipo,
      origen,
      destino,
      observaciones,
    })

    const savedRegistro = await registroRepository.save(registro)

    const registroCompleto = await registroRepository.findOne({
      where: { id: savedRegistro.id },
      relations: ["camion"],
    })

    console.log("✅ Registro creado exitosamente:", savedRegistro.id)

    res.status(201).json({
      message: "Registro creado exitosamente",
      registro: registroCompleto,
    })
  } catch (error) {
    console.error("❌ Error al crear registro:", error)
    res.status(500).json({
      message: "Error al crear registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const updateRegistro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`📝 Actualizando registro con ID: ${id}`, req.body)

    const registro = await registroRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["camion"],
    })

    if (!registro) {
      return res.status(404).json({
        message: "Registro no encontrado",
      })
    }

    const { camionId, conductor, fechaHora, tipoPetroleo, cantidad, tipo, origen, destino, observaciones } = req.body

    if (camionId) {
      const camion = await camionRepository.findOne({
        where: { id: Number.parseInt(camionId) },
      })

      if (!camion) {
        return res.status(404).json({
          message: "Camión no encontrado",
        })
      }

      registro.camion = camion
    }

    if (conductor) registro.conductor = conductor
    if (fechaHora) registro.fechaHora = new Date(fechaHora)
    if (tipoPetroleo) registro.tipoPetroleo = tipoPetroleo
    if (cantidad !== undefined) registro.cantidad = Number.parseFloat(cantidad)
    if (tipo) registro.tipo = tipo
    if (origen !== undefined) registro.origen = origen
    if (destino !== undefined) registro.destino = destino
    if (observaciones !== undefined) registro.observaciones = observaciones

    const updatedRegistro = await registroRepository.save(registro)

    console.log("✅ Registro actualizado exitosamente")

    res.json({
      message: "Registro actualizado exitosamente",
      registro: updatedRegistro,
    })
  } catch (error) {
    console.error("❌ Error al actualizar registro:", error)
    res.status(500).json({
      message: "Error al actualizar registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const deleteRegistro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🗑️ Eliminando registro con ID: ${id}`)

    const registro = await registroRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!registro) {
      return res.status(404).json({
        message: "Registro no encontrado",
      })
    }

    await registroRepository.remove(registro)

    console.log("✅ Registro eliminado exitosamente")

    res.json({
      message: "Registro eliminado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error al eliminar registro:", error)
    res.status(500).json({
      message: "Error al eliminar registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const getInventarioActual = async (req: Request, res: Response) => {
  try {
    console.log("📊 Calculando inventario actual...")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        message: "Base de datos no disponible",
      })
    }

    const registros = await registroRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "ASC" },
    })

    const resumen: { [key: string]: number } = {}

    registros.forEach((reg) => {
      const tipo = reg.tipoPetroleo?.toLowerCase() || "desconocido"
      const cantidad = Number.parseFloat(reg.cantidad?.toString() || "0")

      if (!resumen[tipo]) resumen[tipo] = 0

      if (reg.tipo === "entrada") {
        resumen[tipo] += cantidad
      } else if (reg.tipo === "salida") {
        resumen[tipo] -= cantidad
      }
    })

    const inventario = Object.entries(resumen).map(([tipoPetroleo, cantidad]) => ({
      tipoPetroleo,
      cantidad: Math.max(0, cantidad),
    }))

    const hoy = new Date()
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)

    const historialPorDia: { [fecha: string]: { [tipo: string]: number } } = {}

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000)
      const fechaStr = fecha.toISOString().split("T")[0]
      historialPorDia[fechaStr] = {}
    }

    const inventarioPorTipoPorFecha: { [fecha: string]: { [tipo: string]: number } } = {}

    registros
      .sort((a, b) => {
        const fechaA = a.fechaHora || a.fechaCreacion
        const fechaB = b.fechaHora || b.fechaCreacion
        return new Date(fechaA).getTime() - new Date(fechaB).getTime()
      })
      .forEach((reg) => {
        const fecha = reg.fechaHora || reg.fechaCreacion
        if (!fecha) return

        const fechaStr = new Date(fecha).toISOString().split("T")[0]
        const tipo = reg.tipoPetroleo?.toLowerCase() || "desconocido"
        const cantidad = Number.parseFloat(reg.cantidad?.toString() || "0")

        if (!inventarioPorTipoPorFecha[fechaStr]) {
          const fechas = Object.keys(inventarioPorTipoPorFecha).sort()
          const ultimaFecha = fechas[fechas.length - 1]
          inventarioPorTipoPorFecha[fechaStr] = ultimaFecha ? { ...inventarioPorTipoPorFecha[ultimaFecha] } : {}
        }

        if (!inventarioPorTipoPorFecha[fechaStr][tipo]) {
          inventarioPorTipoPorFecha[fechaStr][tipo] = 0
        }

        if (reg.tipo === "entrada") {
          inventarioPorTipoPorFecha[fechaStr][tipo] += cantidad
        } else if (reg.tipo === "salida") {
          inventarioPorTipoPorFecha[fechaStr][tipo] -= cantidad
        }
      })

    const fechasOrdenadas = Object.keys(historialPorDia).sort()
    let ultimoInventario: { [tipo: string]: number } = {}

    fechasOrdenadas.forEach((fechaStr) => {
      if (inventarioPorTipoPorFecha[fechaStr]) {
        ultimoInventario = { ...inventarioPorTipoPorFecha[fechaStr] }
      }
      historialPorDia[fechaStr] = { ...ultimoInventario }
    })

    const totalEntradas = registros
      .filter((r) => r.tipo === "entrada")
      .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

    const totalSalidas = registros
      .filter((r) => r.tipo === "salida")
      .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

    const inventarioTotal = inventario.reduce((sum, item) => sum + item.cantidad, 0)

    console.log("✅ Inventario calculado exitosamente")

    res.json({
      message: "Inventario calculado exitosamente",
      inventario,
      historial: historialPorDia,
      registros: registros.slice(-10),
      estadisticas: {
        totalEntradas,
        totalSalidas,
        inventarioTotal,
        cantidadRegistros: registros.length,
      },
      total: registros.length,
    })
  } catch (error) {
    console.error("❌ Error al calcular inventario:", error)
    res.status(500).json({
      message: "Error al calcular inventario",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
