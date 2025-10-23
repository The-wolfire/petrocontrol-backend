import { Router } from "express"
import {
  getMantenimientos,
  getMantenimientoById,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento,
  completarMantenimiento,
} from "../controllers/mantenimientoController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = Router()

// ⚠️ IMPORTANTE: Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas públicas (solo lectura) - pero requieren autenticación
router.get("/", getMantenimientos)
router.get("/:id", getMantenimientoById)

// Rutas que requieren permisos adicionales
router.post("/", requireRole(["admin", "operador"]), createMantenimiento)
router.put("/:id", requireRole(["admin", "operador"]), updateMantenimiento)
router.put("/:id/completar", requireRole(["admin", "operador"]), completarMantenimiento)
router.delete("/:id", requireRole(["admin"]), deleteMantenimiento)

export default router
