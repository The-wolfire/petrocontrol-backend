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

// Logging para depurar
router.use((req, res, next) => {
  console.log(`🔧 Mantenimientos: ${req.method} ${req.path}`)
  next()
})

// Rutas públicas (sin autenticación) - GET para ver datos
router.get("/", getMantenimientos)
router.get("/:id", getMantenimientoById)

// Rutas protegidas (con autenticación y rol)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createMantenimiento)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateMantenimiento)
router.put("/:id/completar", authenticateToken, requireRole(["admin", "operador"]), completarMantenimiento)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteMantenimiento)

export default router