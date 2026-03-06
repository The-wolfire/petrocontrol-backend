import { Router } from "express"
import { authenticateToken, requireRole } from "../middleware/auth"

// Importa tus controladores reales (ajusta nombres si son diferentes)
import {
  getCamioneros,
  getCamioneroById,
  createCamionero,
  updateCamionero,
  deleteCamionero,
} from "../controllers/camioneroController" // ajusta el path si es necesario

const router = Router()

// Logging
router.use((req, res, next) => {
  console.log(`👤 Camioneros: ${req.method} ${req.path}`)
  next()
})

// Rutas públicas (sin autenticación) - GET para ver datos
router.get("/", getCamioneros)
router.get("/:id", getCamioneroById)

// Rutas protegidas (con autenticación y rol)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createCamionero)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateCamionero)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteCamionero)

export default router