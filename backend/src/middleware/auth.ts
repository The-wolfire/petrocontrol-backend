// auth.ts - ACTUALIZADO PARA SOLO JWT
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura_aqui_123456"

export interface AuthRequest extends Request {
  user?: any
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido" })
    }

    // ✅ VERIFICACIÓN SOLO CON JWT
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()

  } catch (error) {
    console.error("❌ Error en autenticación JWT:", error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: "Token JWT inválido" })
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ message: "Token JWT expirado" })
    }

    return res.status(500).json({ message: "Error en autenticación" })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" })
    }

    next()
  }
}