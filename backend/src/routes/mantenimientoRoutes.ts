import { Router } from "express"
import {
  getMantenimientos,
  getMantenimientoById,
  createMantenimiento,
  updateMantenimiento,
  completarMantenimiento,
  deleteMantenimiento,
} from "../controllers/mantenimientoController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = Router()

// Logging middleware
router.use((req, res, next) => {
  console.log(`🔧 [Mantenimientos Route] ${req.method} ${req.path}`)
  next()
})

// ✅ Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas públicas (con autenticación)
router.get("/", getMantenimientos)
router.get("/:id", getMantenimientoById)

// Rutas que requieren permisos específicos
router.post("/", requireRole(["admin", "operador"]), createMantenimiento)
router.put("/:id", requireRole(["admin", "operador"]), updateMantenimiento)
router.put("/:id/completar", requireRole(["admin", "operador"]), completarMantenimiento)
router.delete("/:id", requireRole(["admin"]), deleteMantenimiento)

export default router
