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

// Rutas SIN autenticación (públicas para ver datos – ya no redirige)
router.get("/", getMantenimientos)
router.get("/:id", getMantenimientoById)

// Rutas CON autenticación (solo para crear/editar/eliminar)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createMantenimiento)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateMantenimiento)
router.put("/:id/completar", authenticateToken, requireRole(["admin", "operador"]), completarMantenimiento)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteMantenimiento)

export default router