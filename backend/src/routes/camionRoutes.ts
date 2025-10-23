import { Router } from "express"
import { createCamion, getCamiones, getCamionById, updateCamion, deleteCamion } from "../controllers/camionController"

const router = Router()

// Logging middleware para debugging
router.use((req, res, next) => {
  console.log(`🚛 Camiones Route: ${req.method} ${req.path}`)
  next()
})

// Middleware de autenticación simple (temporal)
const authenticateToken = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token requerido" })
    }

    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString())
      req.user = decoded
      next()
    } catch (error) {
      return res.status(403).json({ message: "Token inválido" })
    }
  } catch (error) {
    console.error("Error en autenticación:", error)
    res.status(500).json({ message: "Error en autenticación" })
  }
}

// Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Rutas de camiones
router.post("/", createCamion)
router.get("/", getCamiones)
router.get("/:id", getCamionById)
router.put("/:id", updateCamion)
router.delete("/:id", deleteCamion)

// EXPORTACIÓN POR DEFECTO
export default router
