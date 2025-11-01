import { Router } from "express"
import { createCamion, getCamiones, getCamionById, updateCamion, deleteCamion } from "../controllers/camionController"
import { authenticateToken } from "../middleware/auth" // ✅ Importa el middleware correcto

const router = Router()

// Logging middleware para debugging
router.use((req, res, next) => {
  console.log(`🚛 Camiones Route: ${req.method} ${req.path}`)
  next()
})

// ✅ USA EL MIDDLEWARE CORRECTO DE AUTENTICACIÓN JWT
router.use(authenticateToken)

// Rutas de camiones
router.post("/", createCamion)
router.get("/", getCamiones)
router.get("/:id", getCamionById)
router.put("/:id", updateCamion)
router.delete("/:id", deleteCamion)

export default router