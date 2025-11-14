import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// ✅ IMPORTANTE: Verificar que JWT_SECRET esté configurado en Vercel
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error("❌ [CRITICAL] JWT_SECRET no está definido en las variables de entorno")
  // En producción, esto debería fallar inmediatamente
}

export interface AuthRequest extends Request {
  user?: {
    userId: number
    username: string
    role: string
    email: string
    iat?: number
    exp?: number
  }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"]
    console.log(`🔐 [Auth] ${req.method} ${req.path}`)

    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      console.log("❌ [Auth] Token no proporcionado")
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
        code: "NO_TOKEN",
      })
    }

    // ✅ Verificar que JWT_SECRET esté disponible
    if (!JWT_SECRET) {
      console.error("❌ [Auth] JWT_SECRET no configurado")
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servidor",
        code: "SERVER_CONFIG_ERROR",
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log(`✅ [Auth] Token válido para: ${decoded.username} (${decoded.role})`)

    if (!decoded.userId) {
      console.log("❌ [Auth] Payload inválido: falta userId")
      return res.status(403).json({
        success: false,
        message: "Payload de token inválido",
        code: "INVALID_PAYLOAD",
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error("❌ [Auth] Error en autenticación:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        message: "Token JWT inválido",
        code: "INVALID_TOKEN",
      })
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        success: false,
        message: "Token JWT expirado",
        code: "TOKEN_EXPIRED",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Error en autenticación",
      code: "AUTH_ERROR",
    })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log("❌ [Role] Usuario no autenticado")
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
        code: "NOT_AUTHENTICATED",
      })
    }

    const userRole = req.user.role
    console.log(`🔒 [Role] Usuario: ${req.user.username} (${userRole})`)

    if (!roles.includes(userRole)) {
      console.log(`❌ [Role] Acceso denegado`)
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para esta acción",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: roles,
        userRole: userRole,
      })
    }

    console.log(`✅ [Role] Acceso permitido`)
    next()
  }
}