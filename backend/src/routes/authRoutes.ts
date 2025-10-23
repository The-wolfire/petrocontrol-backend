// authRoutes.ts - ACTUALIZADO
import { Router } from "express"
import { login, register, verifyToken } from "../controllers/authController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// Rutas de autenticación con logging
router.post(
  "/login",
  (req, res, next) => {
    console.log("POST /api/auth/login")
    next()
  },
  login,
)

router.post(
  "/register",
  (req, res, next) => {
    console.log("POST /api/auth/register")
    next()
  },
  register,
)

// ✅ NUEVA RUTA DE VERIFICACIÓN DE TOKEN
router.get(
  "/verify",
  authenticateToken, // Verifica que el token sea válido
  verifyToken        // Retorna información del usuario
)

export default router