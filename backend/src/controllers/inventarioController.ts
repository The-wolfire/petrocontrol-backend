import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { RegistroES } from "../entities/RegistroES"
import { Camion } from "../entities/Camion"

const registroRepository = AppDataSource.getRepository(RegistroES)
const camionRepository = AppDataSource.getRepository(Camion)

// ✅ GET Inventario Actual Completo
export const getInventarioCompleto = async (req: Request, res: Response) => {
  try {
    console.log("📊 [Inventario] GET /api/inventario/completo")

    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
      })
    }

    // Obtener todos los registros
    const registros = await registroRepository.find({
      relations: ["camion"],
      order: { fechaCreacion: "ASC" },
    })

    // Calcular inventario por tipo de petróleo
    const inventarioPorTipo: { [key: string]: number } = {}

    registros.forEach((reg) => {
      const tipo = reg.tipoPetroleo?.toLowerCase() || "desconocido"
      const cantidad = Number.parseFloat(reg.cantidad?.toString() || "0")

      if (!inventarioPorTipo[tipo]) {
        inventarioPorTipo[tipo] = 0
      }

      if (reg.tipo === "entrada") {
        inventarioPorTipo[tipo] += cantidad
      } else if (reg.tipo === "salida") {
        inventarioPorTipo[tipo] -= cantidad
      }
    })

    // Formatear inventario
    const inventario = Object.entries(inventarioPorTipo).map(([tipoPetroleo, cantidad]) => ({
      tipoPetroleo,
      cantidad: Math.max(0, cantidad),
      estado: cantidad < 1000 ? "bajo" : cantidad < 5000 ? "medio" : "alto",
      porcentajeCapacidad: ((cantidad / 10000) * 100).toFixed(2),
    }))

    // Estadísticas generales
    const totalEntradas = registros
      .filter((r) => r.tipo === "entrada")
      .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

    const totalSalidas = registros
      .filter((r) => r.tipo === "salida")
      .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

    const inventarioTotal = inventario.reduce((sum, item) => sum + item.cantidad, 0)

    console.log(`✅ [Inventario] Inventario calculado: ${inventarioTotal.toFixed(2)}L`)

    res.json({
      success: true,
      message: "Inventario completo obtenido exitosamente",
      inventario,
      estadisticas: {
        totalEntradas: totalEntradas.toFixed(2),
        totalSalidas: totalSalidas.toFixed(2),
        inventarioTotal: inventarioTotal.toFixed(2),
        cantidadRegistros: registros.length,
        tiposDisponibles: inventario.length,
      },
    })
  } catch (error) {
    console.error("❌ [Inventario] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener inventario",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Inventario por Tipo de Petróleo
export const getInventarioPorTipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params
    console.log(`📊 [Inventario] GET /api/inventario/tipo/${tipo}`)

    const registros = await registroRepository.find({
      where: { tipoPetroleo: String(tipo) },
      relations: ["camion"],
      order: { fechaCreacion: "DESC" },
    })

    let total = 0
    const movimientos: any[] = []

    registros.forEach((reg) => {
      const cantidad = Number.parseFloat(reg.cantidad?.toString() || "0")

      if (reg.tipo === "entrada") {
        total += cantidad
        movimientos.push({
          tipo: "entrada",
          cantidad,
          fecha: reg.fechaHora,
          camion: reg.camionId,
          conductor: reg.conductor,
        })
      } else if (reg.tipo === "salida") {
        total -= cantidad
        movimientos.push({
          tipo: "salida",
          cantidad,
          fecha: reg.fechaHora,
          camion: reg.camionId,
          conductor: reg.conductor,
        })
      }
    })

    console.log(`✅ [Inventario] Total ${tipo}: ${total.toFixed(2)}L`)

    res.json({
      success: true,
      message: `Inventario de ${tipo} obtenido exitosamente`,
      tipoPetroleo: tipo,
      cantidadActual: Math.max(0, total).toFixed(2),
      movimientos: movimientos.slice(0, 50), // Últimos 50 movimientos
      totalMovimientos: movimientos.length,
    })
  } catch (error) {
    console.error("❌ [Inventario] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener inventario por tipo",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Reporte de Inventario (últimos 30 días)
export const getReporteInventario = async (req: Request, res: Response) => {
  try {
    console.log("📊 [Inventario] GET /api/inventario/reporte")

    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    const registros = await registroRepository
      .createQueryBuilder("registro")
      .leftJoinAndSelect("registro.camion", "camion")
      .where("registro.fechaCreacion >= :fecha", { fecha: hace30Dias })
      .orderBy("registro.fechaCreacion", "DESC")
      .getMany()

    // Agrupar por día
    const reportePorDia: { [key: string]: any } = {}

    registros.forEach((reg) => {
      const fecha = new Date(reg.fechaCreacion).toISOString().split("T")[0]
      const cantidad = Number.parseFloat(reg.cantidad?.toString() || "0")

      if (!reportePorDia[fecha]) {
        reportePorDia[fecha] = {
          fecha,
          entradas: 0,
          salidas: 0,
          neto: 0,
        }
      }

      if (reg.tipo === "entrada") {
        reportePorDia[fecha].entradas += cantidad
        reportePorDia[fecha].neto += cantidad
      } else if (reg.tipo === "salida") {
        reportePorDia[fecha].salidas += cantidad
        reportePorDia[fecha].neto -= cantidad
      }
    })

    const reporte = Object.values(reportePorDia).sort((a: any, b: any) => b.fecha.localeCompare(a.fecha))

    console.log(`✅ [Inventario] Reporte generado: ${reporte.length} días`)

    res.json({
      success: true,
      message: "Reporte de inventario generado exitosamente",
      periodo: {
        desde: hace30Dias.toISOString().split("T")[0],
        hasta: new Date().toISOString().split("T")[0],
      },
      reporte,
      totalDias: reporte.length,
    })
  } catch (error) {
    console.error("❌ [Inventario] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al generar reporte",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Alertas de Inventario
export const getAlertasInventario = async (req: Request, res: Response) => {
  try {
    console.log("⚠️ [Inventario] GET /api/inventario/alertas")

    const registros = await registroRepository.find({
      order: { fechaCreacion: "ASC" },
    })

    // Calcular inventario por tipo
    const inventarioPorTipo: { [key: string]: number } = {}

    registros.forEach((reg) => {
      const tipo = reg.tipoPetroleo?.toLowerCase() || "desconocido"
      const cantidad = Number.parseFloat(reg.cantidad?.toString() || "0")

      if (!inventarioPorTipo[tipo]) {
        inventarioPorTipo[tipo] = 0
      }

      if (reg.tipo === "entrada") {
        inventarioPorTipo[tipo] += cantidad
      } else if (reg.tipo === "salida") {
        inventarioPorTipo[tipo] -= cantidad
      }
    })

    // Generar alertas
    const alertas: any[] = []
    const CAPACIDAD_MAXIMA = 10000
    const UMBRAL_CRITICO = 0.2 // 20%
    const UMBRAL_BAJO = 0.4 // 40%

    Object.entries(inventarioPorTipo).forEach(([tipo, cantidad]) => {
      const porcentaje = cantidad / CAPACIDAD_MAXIMA

      if (porcentaje < UMBRAL_CRITICO) {
        alertas.push({
          tipo: "critico",
          tipoPetroleo: tipo,
          cantidad: cantidad.toFixed(2),
          porcentaje: (porcentaje * 100).toFixed(2),
          mensaje: `Nivel crítico de ${tipo}: ${cantidad.toFixed(2)}L (${(porcentaje * 100).toFixed(2)}%)`,
        })
      } else if (porcentaje < UMBRAL_BAJO) {
        alertas.push({
          tipo: "advertencia",
          tipoPetroleo: tipo,
          cantidad: cantidad.toFixed(2),
          porcentaje: (porcentaje * 100).toFixed(2),
          mensaje: `Nivel bajo de ${tipo}: ${cantidad.toFixed(2)}L (${(porcentaje * 100).toFixed(2)}%)`,
        })
      }
    })

    console.log(`✅ [Inventario] Alertas generadas: ${alertas.length}`)

    res.json({
      success: true,
      message: "Alertas de inventario obtenidas exitosamente",
      alertas,
      totalAlertas: alertas.length,
      alertasCriticas: alertas.filter((a) => a.tipo === "critico").length,
      alertasAdvertencia: alertas.filter((a) => a.tipo === "advertencia").length,
    })
  } catch (error) {
    console.error("❌ [Inventario] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener alertas",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ GET Estadísticas por Camión
export const getEstadisticasPorCamion = async (req: Request, res: Response) => {
  try {
    console.log("📊 [Inventario] GET /api/inventario/estadisticas-camiones")

    const camiones = await camionRepository.find({
      relations: ["registros"],
    })

    const estadisticas = camiones.map((camion) => {
      const registros = camion.registros || []

      const totalEntradas = registros
        .filter((r) => r.tipo === "entrada")
        .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

      const totalSalidas = registros
        .filter((r) => r.tipo === "salida")
        .reduce((sum, r) => sum + Number.parseFloat(r.cantidad?.toString() || "0"), 0)

      return {
        camionId: camion.camionId,
        marca: camion.marca,
        modelo: camion.modelo,
        estado: camion.estado,
        totalEntradas: totalEntradas.toFixed(2),
        totalSalidas: totalSalidas.toFixed(2),
        neto: (totalEntradas - totalSalidas).toFixed(2),
        cantidadRegistros: registros.length,
      }
    })

    console.log(`✅ [Inventario] Estadísticas de ${camiones.length} camiones`)

    res.json({
      success: true,
      message: "Estadísticas por camión obtenidas exitosamente",
      estadisticas,
      totalCamiones: camiones.length,
    })
  } catch (error) {
    console.error("❌ [Inventario] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
