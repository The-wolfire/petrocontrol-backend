import { Router } from "express"
import { authenticateToken } from "../middleware/auth" // ✅ Importa el middleware correcto

const router = Router()

// Logging middleware para debugging
router.use((req, res, next) => {
  console.log(`👤 Camioneros Route: ${req.method} ${req.path}`)
  next()
})

// ✅ USA EL MIDDLEWARE CORRECTO DE AUTENTICACIÓN JWT
router.use(authenticateToken)

// Rutas de camioneros (TEMPORAL - hasta que tengas el controlador)
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ruta de camioneros funcionando - Controlador pendiente",
    camioneros: []
  })
})

router.post("/", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Camionero creado exitosamente - Controlador pendiente"
  })
})

export default router