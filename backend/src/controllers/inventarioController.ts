import type { Request, Response } from "express"
import { AppDataSource } from "../config/data-source"
import { RegistroES } from "../entities/RegistroES"

const registroRepository = AppDataSource.getRepository(RegistroES)

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

    // Convertir a formato de respuesta
    const inventario = Object.entries(resumen).map(([tipoPetroleo, cantidad]) => ({
      tipoPetroleo,
      cantidad: Math.max(0, cantidad), // No permitir cantidades negativas
    }))

    console.log("✅ Inventario calculado:", inventario)

    res.json({
      message: "Inventario calculado exitosamente",
      inventario,
      registros: registros.slice(-10), // Últimos 10 registros
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
