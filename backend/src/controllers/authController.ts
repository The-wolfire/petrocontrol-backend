import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { AppDataSource } from "../config/data-source"
import { Usuario } from "../entities/Usuario"
import type { AuthRequest } from "../middleware/auth"

const userRepository = AppDataSource.getRepository(Usuario)
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura_aqui_123456"
const JWT_EXPIRES_IN = "24h"

// ✅ Función para hashear contraseñas
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// ✅ Función para verificar contraseñas
function verifyPassword(password: string, storedPassword: string): boolean {
  try {
    if (storedPassword.includes(":")) {
      const [salt, hash] = storedPassword.split(":")
      if (!salt || !hash) return false
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
      return hash === verifyHash
    }
    // Modo compatibilidad para contraseñas sin hash
    console.log("⚠️ Verificando contraseña sin hash")
    return password === storedPassword
  } catch (error) {
    console.error("❌ Error verificando contraseña:", error)
    return false
  }
}

// ✅ Función para crear JWT
function createJWToken(user: Usuario): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "petrocontrol-api",
    subject: String(user.id),
  })
}

// ✅ Login
export const login = async (req: Request, res: Response) => {
  try {
    console.log("\n🔐 [Login] Nueva solicitud")
    console.log(`👤 [Login] Usuario: ${req.body.username}`)

    const { username, password } = req.body

    // Validaciones
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username y password son requeridos",
        code: "MISSING_CREDENTIALS",
      })
    }

    // Verificar DB
    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
        code: "DB_NOT_AVAILABLE",
      })
    }

    // Buscar usuario
    const user = await userRepository.findOneBy({ username })
    if (!user) {
      console.log("❌ [Login] Usuario no encontrado")
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS",
      })
    }

    // Verificar contraseña
    const validPassword = verifyPassword(password, user.password)
    if (!validPassword) {
      console.log("❌ [Login] Contraseña incorrecta")
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS",
      })
    }

    // Generar token
    const token = createJWToken(user)
    const decoded = jwt.decode(token) as any

    console.log("✅ [Login] Login exitoso")
    console.log(`🕒 [Login] Token expira: ${new Date(decoded.exp * 1000).toLocaleString()}\n`)

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      expiresIn: decoded?.exp || null,
    })
  } catch (error) {
    console.error("❌ [Login] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ Register
export const register = async (req: Request, res: Response) => {
  try {
    console.log("\n📝 [Register] Nueva solicitud")
    console.log(`👤 [Register] Usuario: ${req.body.username}`)

    const { username, password, role } = req.body

    // Validaciones
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username y password son requeridos",
        code: "MISSING_FIELDS",
      })
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: "El username debe tener al menos 3 caracteres",
        code: "USERNAME_TOO_SHORT",
      })
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "La password debe tener al menos 4 caracteres",
        code: "PASSWORD_TOO_SHORT",
      })
    }

    // Verificar DB
    if (!AppDataSource.isInitialized) {
      return res.status(500).json({
        success: false,
        message: "Base de datos no disponible",
        code: "DB_NOT_AVAILABLE",
      })
    }

    // Verificar si existe
    const existingUser = await userRepository.findOneBy({ username })
    if (existingUser) {
      console.log("❌ [Register] Usuario ya existe")
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe",
        code: "USER_EXISTS",
      })
    }

    // Crear usuario
    const hashedPassword = hashPassword(password)
    const email = `${username}@petrocontrol.local`

    const user = userRepository.create({
      username,
      password: hashedPassword,
      email,
      role: role || "operador",
    })

    const result = await userRepository.save(user)
    const token = createJWToken(result)

    console.log("✅ [Register] Usuario registrado exitosamente\n")

    const { password: _, ...userWithoutPassword } = result

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ [Register] Error:", error)
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      code: "SERVER_ERROR",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// ✅ Verify Token
export const verifyToken = async (req: AuthRequest, res: Response) => {
  try {
    console.log("\n🔍 [VerifyToken] Verificando token")

    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Token inválido",
        code: "INVALID_TOKEN",
      })
    }

    const user = await userRepository.findOneBy({ id: userId })
    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
      })
    }

    console.log(`✅ [VerifyToken] Token válido para: ${user.username}\n`)

    res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      tokenInfo: {
        expiresAt: req.user?.exp ? new Date(req.user.exp * 1000).toISOString() : null,
      },
    })
  } catch (error) {
    console.error("❌ [VerifyToken] Error:", error)
    res.status(401).json({
      success: false,
      valid: false,
      message: "Error verificando token",
      code: "VERIFY_ERROR",
    })
  }
}

export { createJWToken }
