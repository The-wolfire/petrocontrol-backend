import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { Camionero } from "../entities/Camionero"

const camioneroRepository = AppDataSource.getRepository(Camionero)

// ✅ GET Camioneros
export const getCamioneros = async (req: Request, res: Response) => {
  try {
    console.log("👤 [Camioneros] GET /api/camioneros")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
      })
    }

    const camioneros = await camioneroRepository.find({
      relations: ["viajes"],
      order: { fechaCreacion: "DESC" },
    })

    // Agregar información adicional
    const camionerosConInfo = camioneros.map((camionero) => ({
      ...camionero,
      ultimoViaje: camionero.obtenerUltimoViaje(),
      disponible: camionero.estaDisponible(),
    }))

    console.log(`✅ [Camioneros] Encontrados: ${camioneros.length}`)

    res.json({
      success: true,
      message: "Camioneros obtenidos exitosamente",
      camioneros: camionerosConInfo,
      total: camioneros.length,
    })
  } catch (error) {
    console.error("❌ [Camioneros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener camioneros",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Camionero por ID
export const getCamioneroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🔍 [Camioneros] GET /api/camioneros/${id}`)

    const camionero = await camioneroRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["viajes"],
    })

    if (!camionero) {
      return res.status(404).json({
        success: false,
        message: "Camionero no encontrado",
      })
    }

    console.log("✅ [Camioneros] Camionero encontrado")

    res.json({
      success: true,
      message: "Camionero obtenido exitosamente",
      camionero: {
        ...camionero,
        ultimoViaje: camionero.obtenerUltimoViaje(),
        disponible: camionero.estaDisponible(),
      },
    })
  } catch (error) {
    console.error("❌ [Camioneros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ POST Crear Camionero
export const createCamionero = async (req: Request, res: Response) => {
  try {
    console.log("📝 [Camioneros] POST /api/camioneros")

    const { nombre, apellido, cedula, licencia, telefono, email, fechaNacimiento, fechaIngreso, observaciones } =
      req.body

    if (!nombre || !apellido || !cedula || !licencia || !telefono) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: nombre, apellido, cédula, licencia, teléfono",
      })
    }

    // Verificar duplicados
    const existente = await camioneroRepository.findOne({
      where: { cedula },
    })

    if (existente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un camionero con esa cédula",
      })
    }

    const camionero = camioneroRepository.create({
      nombre,
      apellido,
      cedula,
      licencia,
      telefono,
      email: email || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date(),
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
      fechaVencimientoLicencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      estado: "activo",
      horasConducidas: 0,
      enDescanso: false,
      observaciones: observaciones || null,
    })

    const savedCamionero = await camioneroRepository.save(camionero)

    console.log("✅ [Camioneros] Camionero creado")

    res.status(201).json({
      success: true,
      message: "Camionero creado exitosamente",
      camionero: savedCamionero,
    })
  } catch (error) {
    console.error("❌ [Camioneros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ PUT Actualizar Camionero
export const updateCamionero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`📝 [Camioneros] PUT /api/camioneros/${id}`)

    const camionero = await camioneroRepository.findOne({
      where: { id: Number.parseInt(id) },
    })

    if (!camionero) {
      return res.status(404).json({
        success: false,
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
      fechaIngreso,
      fechaVencimientoLicencia,
      estado,
      horasConducidas,
      enDescanso,
      observaciones,
    } = req.body

    // Verificar duplicados si cambia la cédula
    if (cedula && cedula !== camionero.cedula) {
      const existente = await camioneroRepository.findOne({
        where: { cedula },
      })

      if (existente) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un camionero con esa cédula",
        })
      }
    }

    // Actualizar campos
    if (nombre) camionero.nombre = nombre
    if (apellido) camionero.apellido = apellido
    if (cedula) camionero.cedula = cedula
    if (licencia) camionero.licencia = licencia
    if (telefono) camionero.telefono = telefono
    if (email !== undefined) camionero.email = email
    if (fechaNacimiento) camionero.fechaNacimiento = new Date(fechaNacimiento)
    if (fechaIngreso) camionero.fechaIngreso = new Date(fechaIngreso)
    if (fechaVencimientoLicencia) camionero.fechaVencimientoLicencia = new Date(fechaVencimientoLicencia)
    if (estado) camionero.estado = estado
    if (horasConducidas !== undefined) camionero.horasConducidas = Number.parseInt(horasConducidas)
    if (enDescanso !== undefined) camionero.enDescanso = Boolean(enDescanso)
    if (observaciones !== undefined) camionero.observaciones = observaciones

    const updatedCamionero = await camioneroRepository.save(camionero)

    console.log("✅ [Camioneros] Camionero actualizado")

    res.json({
      success: true,
      message: "Camionero actualizado exitosamente",
      camionero: updatedCamionero,
    })
  } catch (error) {
    console.error("❌ [Camioneros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ DELETE Eliminar Camionero
export const deleteCamionero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`🗑️ [Camioneros] DELETE /api/camioneros/${id}`)

    const camionero = await camioneroRepository.findOne({
      where: { id: Number.parseInt(id) },
      relations: ["viajes"],
    })

    if (!camionero) {
      return res.status(404).json({
        success: false,
        message: "Camionero no encontrado",
      })
    }

    // Verificar dependencias
    if (camionero.viajes && camionero.viajes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el camionero porque tiene viajes asociados",
      })
    }

    await camioneroRepository.remove(camionero)

    console.log("✅ [Camioneros] Camionero eliminado")

    res.json({
      success: true,
      message: "Camionero eliminado exitosamente",
    })
  } catch (error) {
    console.error("❌ [Camioneros] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar camionero",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
