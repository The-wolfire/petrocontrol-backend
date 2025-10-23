import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { Mantenimiento } from "../entities/Mantenimiento"
import { Camion } from "../entities/Camion"

const mantenimientoRepository = AppDataSource.getRepository(Mantenimiento)
const camionRepository = AppDataSource.getRepository(Camion)

// Función para normalizar los valores decimales a números
function parseMantenimiento(m: Mantenimiento) {
  return {
    ...m,
    costoManoObra: Number.parseFloat(m.costoManoObra as any) || 0,
    costoRepuestos: Number.parseFloat(m.costoRepuestos as any) || 0,
    costoTotal: Number.parseFloat(m.costoTotal as any) || 0,
  }
}

// ✅ CAMBIAR NOMBRES DE FUNCIONES A INGLÉS PARA CONSISTENCIA
export const getMantenimientos = async (req: Request, res: Response) => {
  try {
    console.log("🔧 Obteniendo mantenimientos...")

    const mantenimientos = await mantenimientoRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "DESC" },
    })

    console.log(`✅ Encontrados ${mantenimientos.length} mantenimientos`)

    res.json({
      message: "Mantenimientos obtenidos exitosamente",
      mantenimientos: mantenimientos.map(parseMantenimiento),
      total: mantenimientos.length,
    })
  } catch (error) {
    console.error("❌ Error al obtener mantenimientos:", error)
    res.status(500).json({
      message: "Error al obtener mantenimientos",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const getMantenimientoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🔍 Obteniendo mantenimiento con ID: ${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["camion"],
    })

    if (!mantenimiento) {
      return res.status(404).json({ message: "Mantenimiento no encontrado" })
    }

    console.log("✅ Mantenimiento encontrado")

    res.json({
      message: "Mantenimiento obtenido exitosamente",
      mantenimiento: parseMantenimiento(mantenimiento),
    })
  } catch (error) {
    console.error("❌ Error al obtener mantenimiento:", error)
    res.status(500).json({
      message: "Error al obtener mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const createMantenimiento = async (req: Request, res: Response) => {
  try {
    console.log("📝 Creando mantenimiento:", req.body)

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
        message: "Faltan campos requeridos: camionId, tipoMantenimiento, descripcion, fechaIngreso",
      })
    }

    // Buscar camión por camionId (string)
    const camion = await camionRepository.findOne({
      where: { camionId: camionId },
    })

    if (!camion) {
      return res.status(400).json({ message: "El camión especificado no existe" })
    }

    const manoObra = Number.parseFloat(costoManoObra) || 0
    const repuestos = Number.parseFloat(costoRepuestos) || 0

    const mantenimiento = mantenimientoRepository.create({
      camionId: camion.id, // Usar el ID numérico del camión
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

    // Cargar con relaciones
    const mantenimientoCompleto = await mantenimientoRepository.findOne({
      where: { id: savedMantenimiento.id },
      relations: ["camion"],
    })

    console.log("✅ Mantenimiento creado exitosamente")

    res.status(201).json({
      message: "Mantenimiento creado exitosamente",
      mantenimiento: parseMantenimiento(mantenimientoCompleto!),
    })
  } catch (error) {
    console.error("❌ Error al crear mantenimiento:", error)
    res.status(500).json({
      message: "Error al crear mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const updateMantenimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`📝 Actualizando mantenimiento con ID: ${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!mantenimiento) {
      return res.status(404).json({ message: "Mantenimiento no encontrado" })
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

    // Recalcular costo total
    mantenimiento.costoTotal = (mantenimiento.costoManoObra || 0) + (mantenimiento.costoRepuestos || 0)

    const updatedMantenimiento = await mantenimientoRepository.save(mantenimiento)

    console.log("✅ Mantenimiento actualizado exitosamente")

    res.json({
      message: "Mantenimiento actualizado exitosamente",
      mantenimiento: parseMantenimiento(updatedMantenimiento),
    })
  } catch (error) {
    console.error("❌ Error al actualizar mantenimiento:", error)
    res.status(500).json({
      message: "Error al actualizar mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const completarMantenimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`✅ Completando mantenimiento con ID: ${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!mantenimiento) {
      return res.status(404).json({ message: "Mantenimiento no encontrado" })
    }

    const { fechaSalida, costoManoObra, costoRepuestos, observaciones } = req.body

    // Actualizar campos de finalización
    if (fechaSalida) mantenimiento.fechaSalida = new Date(fechaSalida)
    if (costoManoObra !== undefined) mantenimiento.costoManoObra = Number.parseFloat(costoManoObra)
    if (costoRepuestos !== undefined) mantenimiento.costoRepuestos = Number.parseFloat(costoRepuestos)
    if (observaciones !== undefined) mantenimiento.observaciones = observaciones

    // Calcular días en taller si hay fechas
    if (mantenimiento.fechaIngreso && mantenimiento.fechaSalida) {
      const diasEnTaller = Math.ceil(
        (mantenimiento.fechaSalida.getTime() - mantenimiento.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24),
      )
      // Agregar campo diasEnTaller si existe en la entidad
      ;(mantenimiento as any).diasEnTaller = diasEnTaller
    }

    mantenimiento.estado = "completado"
    mantenimiento.costoTotal = (mantenimiento.costoManoObra || 0) + (mantenimiento.costoRepuestos || 0)

    const updatedMantenimiento = await mantenimientoRepository.save(mantenimiento)

    console.log("✅ Mantenimiento completado exitosamente")

    res.json({
      message: "Mantenimiento completado exitosamente",
      mantenimiento: parseMantenimiento(updatedMantenimiento),
    })
  } catch (error) {
    console.error("❌ Error al completar mantenimiento:", error)
    res.status(500).json({
      message: "Error al completar mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const deleteMantenimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🗑️ Eliminando mantenimiento con ID: ${id}`)

    const mantenimiento = await mantenimientoRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!mantenimiento) {
      return res.status(404).json({ message: "Mantenimiento no encontrado" })
    }

    if (mantenimiento.estado === "en_proceso") {
      return res.status(400).json({
        message: "No se puede eliminar un mantenimiento en proceso",
      })
    }

    await mantenimientoRepository.remove(mantenimiento)

    console.log("✅ Mantenimiento eliminado exitosamente")

    res.json({ message: "Mantenimiento eliminado exitosamente" })
  } catch (error) {
    console.error("❌ Error al eliminar mantenimiento:", error)
    res.status(500).json({
      message: "Error al eliminar mantenimiento",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ MANTENER ALIASES PARA COMPATIBILIDAD
export const crearMantenimiento = createMantenimiento
export const obtenerMantenimientos = getMantenimientos
export const obtenerMantenimientoPorId = getMantenimientoById
export const actualizarMantenimiento = updateMantenimiento
export const eliminarMantenimiento = deleteMantenimiento
