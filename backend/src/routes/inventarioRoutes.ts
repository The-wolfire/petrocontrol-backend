import { Router } from "express"
import {
  getInventarioCompleto,
  getInventarioPorTipo,
  getReporteInventario,
  getAlertasInventario,
  getEstadisticasPorCamion,
} from "../controllers/inventarioController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = Router()

// Logging middleware
router.use((req, res, next) => {
  console.log(`📊 [Inventario Route] ${req.method} ${req.path}`)
  next()
})

// ✅ Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas de inventario
router.get("/completo", getInventarioCompleto)
router.get("/tipo/:tipo", getInventarioPorTipo)
router.get("/reporte", getReporteInventario)
router.get("/alertas", getAlertasInventario)
router.get("/estadisticas-camiones", requireRole(["admin", "operador"]), getEstadisticasPorCamion)

export default router
