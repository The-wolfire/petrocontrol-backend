import { Router } from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getCamioneros,
  getCamioneroById,
  createCamionero,
  updateCamionero,
  deleteCamionero,
} from "../controllers/camioneroController" // ajusta el path

const router = Router()

// Logging
router.use((req, res, next) => {
  console.log(`👤 Camioneros: ${req.method} ${req.path}`)
  next()
})

// Rutas SIN autenticación (GET para ver datos)
router.get("/", getCamioneros)
router.get("/:id", getCamioneroById)

// Rutas CON autenticación
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createCamionero)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateCamionero)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteCamionero)

export default router