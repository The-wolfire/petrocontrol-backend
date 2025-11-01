import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { Camion } from "../entities/Camion"

const camionRepository = AppDataSource.getRepository(Camion)

// ✅ GET Camiones
export const getCamiones = async (req: Request, res: Response) => {
  try {
    console.log("🚛 [Camiones] GET /api/camiones")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
      })
    }

    const camiones = await camionRepository.find({
      relations: ["registros", "mantenimientos", "camionero"],
      order: { fechaCreacion: "DESC" },
    })

    const camionesConEstado = camiones.map((camion) => ({
      ...camion,
      estadoCalculado: camion.calcularEstado(),
    }))

    console.log(`✅ [Camiones] Encontrados: ${camiones.length}`)

    res.json({
      success: true,
      message: "Camiones obtenidos exitosamente",
      camiones: camionesConEstado,
      total: camiones.length,
    })
  } catch (error) {
    console.error("❌ [Camiones] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener camiones",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Camión por ID
export const getCamionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🔍 [Camiones] GET /api/camiones/${id}`)

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["registros", "mantenimientos", "viajes", "camionero"],
    })

    if (!camion) {
      return res.status(404).json({
        success: false,
        message: "Camión no encontrado",
      })
    }

    console.log("✅ [Camiones] Camión encontrado")

    res.json({
      success: true,
      message: "Camión obtenido exitosamente",
      camion: {
        ...camion,
        estadoCalculado: camion.calcularEstado(),
      },
    })
  } catch (error) {
    console.error("❌ [Camiones] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ POST Crear Camión
export const createCamion = async (req: Request, res: Response) => {
  try {
    console.log("📝 [Camiones] POST /api/camiones")

    const { camionId, marca, modelo, capacidad, estado, notas, placa, año, tipoVehiculo, camioneroId } = req.body

    if (!camionId || !marca || !modelo || !capacidad) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: camionId, marca, modelo, capacidad",
      })
    }

    // Verificar duplicados
    const existente = await camionRepository.findOne({
      where: { camionId },
    })

    if (existente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un camión con ese ID",
      })
    }

    const camion = camionRepository.create({
      camionId: camionId.toUpperCase(),
      placa: placa || camionId.toUpperCase(),
      marca,
      modelo,
      año: año || new Date().getFullYear(),
      capacidad: Number.parseFloat(capacidad),
      estado: estado || "activo",
      notas,
      kilometraje: 0,
      tipoVehiculo: tipoVehiculo || "carga_general",
      camioneroId: camioneroId || null,
    })

    const savedCamion = await camionRepository.save(camion)

    console.log("✅ [Camiones] Camión creado")

    res.status(201).json({
      success: true,
      message: "Camión creado exitosamente",
      camion: savedCamion,
    })
  } catch (error) {
    console.error("❌ [Camiones] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ PUT Actualizar Camión
export const updateCamion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`📝 [Camiones] PUT /api/camiones/${id}`)

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!camion) {
      return res.status(404).json({
        success: false,
        message: "Camión no encontrado",
      })
    }

    const { camionId, marca, modelo, capacidad, estado, notas, placa, año, tipoVehiculo, kilometraje, camioneroId } =
      req.body

    // Verificar duplicados si cambia el ID
    if (camionId && camionId !== camion.camionId) {
      const existente = await camionRepository.findOne({
        where: { camionId: camionId.toUpperCase() },
      })

      if (existente) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un camión con ese ID",
        })
      }
    }

    // Actualizar campos
    if (camionId) camion.camionId = camionId.toUpperCase()
    if (placa) camion.placa = placa.toUpperCase()
    if (marca) camion.marca = marca
    if (modelo) camion.modelo = modelo
    if (año) camion.año = Number.parseInt(año)
    if (capacidad) camion.capacidad = Number.parseFloat(capacidad)
    if (estado) camion.estado = estado
    if (tipoVehiculo) camion.tipoVehiculo = tipoVehiculo
    if (kilometraje !== undefined) camion.kilometraje = Number.parseFloat(kilometraje)
    if (notas !== undefined) camion.notas = notas
    if (camioneroId !== undefined) camion.camioneroId = camioneroId

    const updatedCamion = await camionRepository.save(camion)

    console.log("✅ [Camiones] Camión actualizado")

    res.json({
      success: true,
      message: "Camión actualizado exitosamente",
      camion: updatedCamion,
    })
  } catch (error) {
    console.error("❌ [Camiones] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ DELETE Eliminar Camión
export const deleteCamion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🗑️ [Camiones] DELETE /api/camiones/${id}`)

    const camion = await camionRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["registros", "mantenimientos", "viajes"],
    })

    if (!camion) {
      return res.status(404).json({
        success: false,
        message: "Camión no encontrado",
      })
    }

    // Verificar dependencias
    if (camion.registros && camion.registros.length > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el camión porque tiene registros asociados",
      })
    }

    if (camion.mantenimientos && camion.mantenimientos.length > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el camión porque tiene mantenimientos asociados",
      })
    }

    if (camion.viajes && camion.viajes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el camión porque tiene viajes asociados",
      })
    }

    await camionRepository.remove(camion)

    console.log("✅ [Camiones] Camión eliminado")

    res.json({
      success: true,
      message: "Camión eliminado exitosamente",
    })
  } catch (error) {
    console.error("❌ [Camiones] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar camión",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
