import { Router } from "express"
import {
  getCamioneros,
  getCamioneroById,
  createCamionero,
  updateCamionero,
  deleteCamionero,
} from "../controllers/camioneroController"
import { authenticateToken, requireRole } from "../middleware/auth"

const router = Router()

//  IMPORTANTE: Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas públicas (solo lectura) - pero requieren autenticación
router.get("/", getCamioneros)
router.get("/:id", getCamioneroById)

// Rutas que requieren permisos adicionales
router.post("/", requireRole(["admin", "operador"]), createCamionero)
router.put("/:id", requireRole(["admin", "operador"]), updateCamionero)
router.delete("/:id", requireRole(["admin"]), deleteCamionero)

export default router
