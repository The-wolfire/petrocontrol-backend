import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { Mantenimiento } from "../entities/Mantenimiento"
import { Camion } from "../entities/Camion"

const mantenimientoRepository = AppDataSource.getRepository(Mantenimiento)
const camionRepository = AppDataSource.getRepository(Camion)

// ✅ Función para normalizar valores decimales
function parseMantenimiento(m: Mantenimiento) {
  return {
    ...m,
    costoManoObra: Number.parseFloat(m.costoManoObra as any) || 0,
    costoRepuestos: Number.parseFloat(m.costoRepuestos as any) || 0,
    costoTotal: Number.parseFloat(m.costoTotal as any) || 0,
  }
}

// ✅ GET Mantenimientos
export const getMantenimientos = async (req: Request, res: Response) => {
  try {
    console.log("🔧 [Mantenimientos] GET /api/mantenimientos")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
      })
    }

    const mantenimientos = await mantenimientoRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "DESC" },
    })

    console.log(`✅ [Mantenimientos] Encontrados: ${mantenimientos.length}`)

    res.json({
      success: true,
      message: "Mantenimientos obtenidos exitosamente",
      mantenimientos: mantenimientos.map(parseMantenimiento),
      total: mantenimientos.length,
    })
  } catch (error) {
    console.error("❌ [Mantenimientos] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener mantenimientos",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Mantenimiento por ID
export const getMantenimientoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🔍 [Mantenimientos] GET /api/mantenimientos/${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
      relations: ["camion"],
    })

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      })
    }

    console.log("✅ [Mantenimientos] Mantenimiento encontrado")

    res.json({
      success: true,
      message: "Mantenimiento obtenido exitosamente",
      mantenimiento: parseMantenimiento(mantenimiento),
    })
  } catch (error) {
    console.error("❌ [Mantenimientos] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ POST Crear Mantenimiento
export const createMantenimiento = async (req: Request, res: Response) => {
  try {
    console.log("📝 [Mantenimientos] POST /api/mantenimientos")

    const {
      camionId,
      tipoMantenimiento,
      descripcion,
      fechaIngreso,
      taller,
      costoManoObra,
      costoRepuestos,
      observaciones,
    } = req.body

    if (!camionId || !tipoMantenimiento || !descripcion || !fechaIngreso) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: camionId, tipoMantenimiento, descripcion, fechaIngreso",
      })
    }

    // Verificar que el camión existe
    const camion = await camionRepository.findOne({
      where: { camionId: camionId },
    })

    if (!camion) {
      return res.status(400).json({
        success: false,
        message: "El camión especificado no existe",
      })
    }

    const manoObra = Number.parseFloat(costoManoObra) || 0
    const repuestos = Number.parseFloat(costoRepuestos) || 0

    const mantenimiento = mantenimientoRepository.create({
      camionId: camion.camionId,
      tipoMantenimiento,
      descripcion,
      fechaIngreso: new Date(fechaIngreso),
      costoManoObra: manoObra,
      costoRepuestos: repuestos,
      costoTotal: manoObra + repuestos,
      taller: taller || "Taller no especificado",
      estado: "programado",
      observaciones,
    })

    const savedMantenimiento = await mantenimientoRepository.save(mantenimiento)

    const mantenimientoCompleto = await mantenimientoRepository.findOne({
      where: { id: savedMantenimiento.id },
      relations: ["camion"],
    })

    console.log("✅ [Mantenimientos] Mantenimiento creado")

    res.status(201).json({
      success: true,
      message: "Mantenimiento creado exitosamente",
      mantenimiento: parseMantenimiento(mantenimientoCompleto!),
    })
  } catch (error) {
    console.error("❌ [Mantenimientos] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ PUT Actualizar Mantenimiento
export const updateMantenimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`📝 [Mantenimientos] PUT /api/mantenimientos/${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
    })

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      })
    }

    const {
      tipoMantenimiento,
      descripcion,
      fechaSalida,
      costoManoObra,
      costoRepuestos,
      taller,
      estado,
      observaciones,
    } = req.body

    // Actualizar campos
    if (tipoMantenimiento) mantenimiento.tipoMantenimiento = tipoMantenimiento
    if (descripcion) mantenimiento.descripcion = descripcion
    if (fechaSalida) mantenimiento.fechaSalida = new Date(fechaSalida)
    if (costoManoObra !== undefined) mantenimiento.costoManoObra = Number.parseFloat(costoManoObra)
    if (costoRepuestos !== undefined) mantenimiento.costoRepuestos = Number.parseFloat(costoRepuestos)
    if (taller) mantenimiento.taller = taller
    if (estado) mantenimiento.estado = estado
    if (observaciones !== undefined) mantenimiento.observaciones = observaciones

    mantenimiento.costoTotal = (mantenimiento.costoManoObra || 0) + (mantenimiento.costoRepuestos || 0)

    const updatedMantenimiento = await mantenimientoRepository.save(mantenimiento)

    console.log("✅ [Mantenimientos] Mantenimiento actualizado")

    res.json({
      success: true,
      message: "Mantenimiento actualizado exitosamente",
      mantenimiento: parseMantenimiento(updatedMantenimiento),
    })
  } catch (error) {
    console.error("❌ [Mantenimientos] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ PUT Completar Mantenimiento
export const completarMantenimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`✅ [Mantenimientos] PUT /api/mantenimientos/${id}/completar`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
    })

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      })
    }

    const { fechaSalida, costoManoObra, costoRepuestos, observaciones } = req.body

    if (fechaSalida) mantenimiento.fechaSalida = new Date(fechaSalida)
    if (costoManoObra !== undefined) mantenimiento.costoManoObra = Number.parseFloat(costoManoObra)
    if (costoRepuestos !== undefined) mantenimiento.costoRepuestos = Number.parseFloat(costoRepuestos)
    if (observaciones !== undefined) mantenimiento.observaciones = observaciones

    mantenimiento.estado = "completado"
    mantenimiento.costoTotal = (mantenimiento.costoManoObra || 0) + (mantenimiento.costoRepuestos || 0)

    const updatedMantenimiento = await mantenimientoRepository.save(mantenimiento)

    console.log("✅ [Mantenimientos] Mantenimiento completado")

    res.json({
      success: true,
      message: "Mantenimiento completado exitosamente",
      mantenimiento: parseMantenimiento(updatedMantenimiento),
    })
  } catch (error) {
    console.error("❌ [Mantenimientos] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al completar mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ DELETE Eliminar Mantenimiento
export const deleteMantenimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🗑️ [Mantenimientos] DELETE /api/mantenimientos/${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(String(id)) },
    })

    if (!mantenimiento) {
      return res.status(404).json({
        success: false,
        message: "Mantenimiento no encontrado",
      })
    }

    // Prevenir eliminación de mantenimientos en proceso
    if (mantenimiento.estado === "en_proceso") {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un mantenimiento en proceso",
      })
    }

    await mantenimientoRepository.remove(mantenimiento)

    console.log("✅ [Mantenimientos] Mantenimiento eliminado")

    res.json({
      success: true,
      message: "Mantenimiento eliminado exitosamente",
    })
  } catch (error) {
    console.error("❌ [Mantenimientos] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
