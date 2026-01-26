import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { RegistroES } from "../entities/RegistroES"
import { Camion } from "../entities/Camion"

const registroRepository = AppDataSource.getRepository(RegistroES)
const camionRepository = AppDataSource.getRepository(Camion)

// ✅ GET Registros
export const getRegistros = async (req: Request, res: Response) => {
  try {
    console.log("📋 [Registros] GET /api/registros")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
      })
    }

    const registros = await registroRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "DESC" },
    })

    console.log(`✅ [Registros] Encontrados: ${registros.length}`)

    res.json({
      success: true,
      message: "Registros obtenidos exitosamente",
      registros,
      total: registros.length,
    })
  } catch (error) {
    console.error("❌ [Registros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener registros",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Registro por ID
export const getRegistroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🔍 [Registros] GET /api/registros/${id}`)

    const registro = await registroRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
      relations: ["camion"],
    })

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      })
    }

    console.log("✅ [Registros] Registro encontrado")

    res.json({
      success: true,
      message: "Registro obtenido exitosamente",
      registro,
    })
  } catch (error) {
    console.error("❌ [Registros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ POST Crear Registro
export const createRegistro = async (req: Request, res: Response) => {
  try {
    console.log("📝 [Registros] POST /api/registros")

    const { camionId, conductor, fechaHora, tipoPetroleo, cantidad, tipo, origen, destino, observaciones } = req.body

    if (!camionId || !conductor || !tipoPetroleo || !cantidad || !tipo) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: camionId, conductor, tipoPetroleo, cantidad, tipo",
      })
    }

    if (!["entrada", "salida"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo debe ser 'entrada' o 'salida'",
      })
    }

    // Verificar que el camión existe
    const camion = await camionRepository.findOne({
      where: { camionId: camionId },
    })

    if (!camion) {
      return res.status(404).json({
        success: false,
        message: "Camión no encontrado",
      })
    }

    const registro = registroRepository.create({
      camionId: camion.camionId,
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

    console.log("✅ [Registros] Registro creado")

    res.status(201).json({
      success: true,
      message: "Registro creado exitosamente",
      registro: registroCompleto,
    })
  } catch (error) {
    console.error("❌ [Registros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ PUT Actualizar Registro
export const updateRegistro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`📝 [Registros] PUT /api/registros/${id}`)

    const registro = await registroRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
      relations: ["camion"],
    })

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      })
    }

    const { camionId, conductor, fechaHora, tipoPetroleo, cantidad, tipo, origen, destino, observaciones } = req.body

    if (camionId) {
      const camion = await camionRepository.findOne({
        where: { camionId: camionId },
      })

      if (!camion) {
        return res.status(404).json({
          success: false,
          message: "Camión no encontrado",
        })
      }

      registro.camionId = camion.camionId
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

    console.log("✅ [Registros] Registro actualizado")

    res.json({
      success: true,
      message: "Registro actualizado exitosamente",
      registro: updatedRegistro,
    })
  } catch (error) {
    console.error("❌ [Registros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ DELETE Eliminar Registro
export const deleteRegistro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🗑️ [Registros] DELETE /api/registros/${id}`)

    const registro = await registroRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
    })

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      })
    }

    await registroRepository.remove(registro)

    console.log("✅ [Registros] Registro eliminado")

    res.json({
      success: true,
      message: "Registro eliminado exitosamente",
    })
  } catch (error) {
    console.error("❌ [Registros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar registro",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Inventario Actual
export const getInventarioActual = async (req: Request, res: Response) => {
  try {
    console.log("📊 [Registros] GET /api/registros/inventario")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
      })
    }

    const registros = await registroRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "ASC" },
    })

    // Calcular inventario por tipo de petróleo
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

    const totalEntradas = registros
      .filter((r) => r.tipo === "entrada")
      .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

    const totalSalidas = registros
      .filter((r) => r.tipo === "salida")
      .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

    const inventarioTotal = inventario.reduce((sum, item) => sum + item.cantidad, 0)

    console.log("✅ [Registros] Inventario calculado")

    res.json({
      success: true,
      message: "Inventario calculado exitosamente",
      inventario,
      estadisticas: {
        totalEntradas,
        totalSalidas,
        inventarioTotal,
        cantidadRegistros: registros.length,
      },
      total: registros.length,
    })
  } catch (error) {
    console.error("❌ [Registros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al calcular inventario",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
