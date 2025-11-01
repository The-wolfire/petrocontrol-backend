// authRoutes.ts - SOLO CORRECCIONES DE CONEXIÓN
import { Router } from "express"
import { login, register, verifyToken } from "../controllers/authController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// ✅ CORRECCIÓN 3: NO aplicar authenticateToken a todas las rutas
// Las rutas de login y register deben ser públicas

// Rutas públicas (sin autenticación)
router.post(
  "/login",
  (req, res, next) => {
    console.log("🔐 POST /api/auth/login")
    next()
  },
  login,
)

router.post(
  "/register",
  (req, res, next) => {
    console.log("📝 POST /api/auth/register")
    next()
  },
  register,
)

// Ruta protegida (con autenticación)
router.get(
  "/verify",
  (req, res, next) => {
    console.log("🔍 GET /api/auth/verify")
    next()
  },
  authenticateToken, // Solo esta ruta necesita autenticación
  verifyToken,
)

export default router
