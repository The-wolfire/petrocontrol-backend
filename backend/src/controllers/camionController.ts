import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { Camion } from "../entities/Camion"
import { RegistroES } from "../entities/RegistroES"

const camionRepository = AppDataSource.getRepository(Camion)
const registroRepository = AppDataSource.getRepository(RegistroES)

export const getCamiones = async (req: Request, res: Response) => {
  try {
    console.log("Obteniendo camiones...")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        message: "Base de datos no disponible",
      })
    }

    const camiones = await camionRepository.find({
      relations: ["registros", "camionero", "mantenimientos"],
      order: { fechaCreacion: "DESC" },
    })

    console.log(`Encontrados ${camiones.length} camiones`)

    res.json({
      message: "Camiones obtenidos exitosamente",
      camiones,
      total: camiones.length,
    })
  } catch (error) {
    console.error("Error al obtener camiones:", error)
    res.status(500).json({
      message: "Error al obtener camiones",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const getCamionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Obteniendo camión con ID: ${id}`)

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["registros", "camionero", "mantenimientos", "viajes"],
    })

    if (!camion) {
      return res.status(404).json({
        message: "Camión no encontrado",
      })
    }

    console.log("Camión encontrado")

    res.json({
      message: "Camión obtenido exitosamente",
      camion,
    })
  } catch (error) {
    console.error("Error al obtener camión:", error)
    res.status(500).json({
      message: "Error al obtener camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const createCamion = async (req: Request, res: Response) => {
  try {
    console.log("Creando nuevo camión:", req.body)

    const { camionId, marca, modelo, capacidad, estado, notas } = req.body

    if (!camionId || !marca || !modelo || !capacidad) {
      return res.status(400).json({
        message: "Faltan campos requeridos: camionId, marca, modelo, capacidad",
      })
    }

    // Verificar que no exista otro camión con el mismo ID
    const existente = await camionRepository.findOne({
      where: { camionId },
    })

    if (existente) {
      return res.status(400).json({
        message: "Ya existe un camión con ese ID",
      })
    }

    const camion = camionRepository.create({
      camionId,
      placa: camionId, // Usar camionId como placa por ahora
      marca,
      modelo,
      año: new Date().getFullYear(),
      capacidad: Number.parseFloat(capacidad),
      estado: estado || "activo",
      notas,
      kilometraje: 0,
      tipoVehiculo: "carga_general",
    })

    const savedCamion = await camionRepository.save(camion)

    console.log("Camión creado exitosamente:", savedCamion.id)

    res.status(201).json({
      message: "Camión creado exitosamente",
      camion: savedCamion,
    })
  } catch (error) {
    console.error("Error al crear camión:", error)
    res.status(500).json({
      message: "Error al crear camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const updateCamion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Actualizando camión con ID: ${id}`, req.body)

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!camion) {
      return res.status(404).json({
        message: "Camión no encontrado",
      })
    }

    const { camionId, marca, modelo, capacidad, estado, notas } = req.body

    // Actualizar campos
    if (camionId) camion.camionId = camionId
    if (marca) camion.marca = marca
    if (modelo) camion.modelo = modelo
    if (capacidad) camion.capacidad = Number.parseFloat(capacidad)
    if (estado) camion.estado = estado
    if (notas !== undefined) camion.notas = notas

    const updatedCamion = await camionRepository.save(camion)

    console.log("Camión actualizado exitosamente")

    res.json({
      message: "Camión actualizado exitosamente",
      camion: updatedCamion,
    })
  } catch (error) {
    console.error("Error al actualizar camión:", error)
    res.status(500).json({
      message: "Error al actualizar camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const deleteCamion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Eliminando camión con ID: ${id}`)

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["registros"],
    })

    if (!camion) {
      return res.status(404).json({
        message: "Camión no encontrado",
      })
    }

    // Eliminar registros asociados primero
    if (camion.registros && camion.registros.length > 0) {
      await registroRepository.remove(camion.registros)
    }

    // Eliminar el camión
    await camionRepository.remove(camion)

    console.log("Camión eliminado exitosamente")

    res.json({
      message: "Camión eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar camión:", error)
    res.status(500).json({
      message: "Error al eliminar camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
