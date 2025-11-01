import { Router } from "express"
import {
  getRegistros,
  getRegistroById,
  createRegistro,
  updateRegistro,
  deleteRegistro,
  getInventarioActual,
} from "../controllers/registroController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = Router()

// Logging middleware
router.use((req, res, next) => {
  console.log(`📋 [Registros Route] ${req.method} ${req.path}`)
  next()
})

// ✅ Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas públicas (con autenticación)
router.get("/", getRegistros)
router.get("/inventario", getInventarioActual)
router.get("/:id", getRegistroById)

// Rutas que requieren permisos específicos
router.post("/", requireRole(["admin", "operador"]), createRegistro)
router.put("/:id", requireRole(["admin", "operador"]), updateRegistro)
router.delete("/:id", requireRole(["admin"]), deleteRegistro)

export default router
