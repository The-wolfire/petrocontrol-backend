import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { Camionero } from "../entities/Camionero"

const camioneroRepository = AppDataSource.getRepository(Camionero)

export const getCamioneros = async (req: Request, res: Response) => {
  try {
    console.log("Obteniendo camioneros...")

    const camioneros = await camioneroRepository.find({
      relations: ["camiones", "viajes"],
      order: { fechaCreacion: "DESC" },
    })

    console.log(`Encontrados ${camioneros.length} camioneros`)

    res.json({
      message: "Camioneros obtenidos exitosamente",
      camioneros,
      total: camioneros.length,
    })
  } catch (error) {
    console.error("Error al obtener camioneros:", error)
    res.status(500).json({
      message: "Error al obtener camioneros",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const getCamioneroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Obteniendo camionero con ID: ${id}`)

    const camionero = await camioneroRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["camiones", "viajes"],
    })

    if (!camionero) {
      return res.status(404).json({
        message: "Camionero no encontrado",
      })
    }

    console.log("Camionero encontrado")

    res.json({
      message: "Camionero obtenido exitosamente",
      camionero,
    })
  } catch (error) {
    console.error("Error al obtener camionero:", error)
    res.status(500).json({
      message: "Error al obtener camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const createCamionero = async (req: Request, res: Response) => {
  try {
    console.log("Creando nuevo camionero:", req.body)

    const { nombre, apellido, cedula, licencia, telefono, email, fechaNacimiento, observaciones } = req.body

    if (!nombre || !apellido || !cedula || !licencia || !email) {
      return res.status(400).json({
        message: "Faltan campos requeridos: nombre, apellido, cedula, licencia, email",
      })
    }

    const camionero = camioneroRepository.create({
      nombre,
      apellido,
      cedula,
      licencia,
      telefono,
      email,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date(),
      fechaVencimientoLicencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año desde ahora
      observaciones,
      estado: "activo",
      horasConducidas: 0,
      enDescanso: false,
    })

    const savedCamionero = await camioneroRepository.save(camionero)

    console.log("Camionero creado exitosamente:", savedCamionero.id)

    res.status(201).json({
      message: "Camionero creado exitosamente",
      camionero: savedCamionero,
    })
  } catch (error) {
    console.error("Error al crear camionero:", error)
    res.status(500).json({
      message: "Error al crear camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const updateCamionero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Actualizando camionero con ID: ${id}`, req.body)

    const camionero = await camioneroRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!camionero) {
      return res.status(404).json({
        message: "Camionero no encontrado",
      })
    }

    const {
      nombre,
      apellido,
      cedula,
      licencia,
      telefono,
      email,
      fechaNacimiento,
      fechaVencimientoLicencia,
      estado,
      horasConducidas,
      enDescanso,
      observaciones,
    } = req.body

    // Actualizar campos
    if (nombre) camionero.nombre = nombre
    if (apellido) camionero.apellido = apellido
    if (cedula) camionero.cedula = cedula
    if (licencia) camionero.licencia = licencia
    if (telefono) camionero.telefono = telefono
    if (email) camionero.email = email
    if (fechaNacimiento) camionero.fechaNacimiento = new Date(fechaNacimiento)
    if (fechaVencimientoLicencia) camionero.fechaVencimientoLicencia = new Date(fechaVencimientoLicencia)
    if (estado) camionero.estado = estado
    if (horasConducidas !== undefined) camionero.horasConducidas = Number.parseInt(horasConducidas)
    if (enDescanso !== undefined) camionero.enDescanso = Boolean(enDescanso)
    if (observaciones !== undefined) camionero.observaciones = observaciones

    const updatedCamionero = await camioneroRepository.save(camionero)

    console.log("Camionero actualizado exitosamente")

    res.json({
      message: "Camionero actualizado exitosamente",
      camionero: updatedCamionero,
    })
  } catch (error) {
    console.error("Error al actualizar camionero:", error)
    res.status(500).json({
      message: "Error al actualizar camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const deleteCamionero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Eliminando camionero con ID: ${id}`)

    const camionero = await camioneroRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!camionero) {
      return res.status(404).json({
        message: "Camionero no encontrado",
      })
    }

    // Eliminar el camionero
    await camioneroRepository.remove(camionero)

    console.log("Camionero eliminado exitosamente")

    res.json({
      message: "Camionero eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar camionero:", error)
    res.status(500).json({
      message: "Error al eliminar camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
