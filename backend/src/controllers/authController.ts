import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { AppDataSource } from "../config/data-source"
import { Usuario } from "../entities/Usuario"

const userRepository = AppDataSource.getRepository(Usuario)

//  CONFIGURACIÓN JWT - Asegurar tipos correctos
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura_aqui_123456"
const JWT_EXPIRES_IN = "24h" //  Hardcodeado como string literal

// Función para hashear contraseñas usando crypto nativo de Node.js
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// Función para verificar contraseñas (compatible con hash y sin hash)
function verifyPassword(password: string, storedPassword: string): boolean {
  try {
    // Si la contraseña almacenada contiene ":", es hasheada
    if (storedPassword.includes(":")) {
      const [salt, hash] = storedPassword.split(":")
      if (!salt || !hash) return false
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
      return hash === verifyHash
    } else {
      // Contraseña sin hash (para compatibilidad con datos existentes)
      console.log(" Verificando contraseña sin hash (modo compatibilidad)")
      return password === storedPassword
    }
  } catch (error) {
    console.error("Error verificando contraseña:", error)
    return false
  }
}

// FUNCIÓN SIMPLIFICADA PARA CREAR TOKEN JWT - CORREGIDA
function createJWToken(user: Usuario): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
  }

  //  SOLUCIÓN: Usar objeto de opciones sin tipo explícito
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string, //  Cast explícito
    issuer: "petrocontrol-api",
    subject: String(user.id), // Asegurar que sea string
  })
}

//  FUNCIÓN PARA VERIFICAR TOKEN JWT
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: "Token no proporcionado",
      })
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Verificar que el usuario aún existe en la base de datos
    const user = await userRepository.findOneBy({ id: decoded.userId })
    if (!user) {
      return res.status(401).json({
        valid: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      expiresIn: decoded.exp,
    })
  } catch (error) {
    console.error(" Error verificando token:", error)

    //  VERIFICACIÓN DE TIPOS DE ERROR JWT CORREGIDA
    if (error && typeof error === "object" && "name" in error) {
      const jwtError = error as { name: string }
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          valid: false,
          message: "Token JWT inválido",
        })
      }

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          valid: false,
          message: "Token JWT expirado",
        })
      }
    }

    return res.status(401).json({
      valid: false,
      message: "Error verificando token",
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    console.log(" Intento de login:", req.body.username)

    const { username, password } = req.body

    // Validaciones básicas
    if (!username || !password) {
      console.log(" Faltan credenciales")
      return res.status(400).json({
        message: "Username y password son requeridos",
      })
    }

    // Verificar conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      console.log(" Base de datos no inicializada")
      return res.status(500).json({
        message: "Base de datos no disponible",
      })
    }

    const user = await userRepository.findOneBy({ username })
    if (!user) {
      console.log(" Usuario no encontrado:", username)
      return res.status(401).json({
        message: "Credenciales inválidas",
      })
    }

    console.log("Usuario encontrado:", user.username)

    const validPassword = verifyPassword(password, user.password)
    if (!validPassword) {
      console.log(" Contraseña incorrecta para:", username)
      return res.status(401).json({
        message: "Credenciales inválidas",
      })
    }

    //  CREAR TOKEN JWT REAL
    const token = createJWToken(user)

    // Decodificar para obtener fecha de expiración
    const decoded = jwt.decode(token) as any

    console.log(" Login exitoso para:", username)
    if (decoded && decoded.exp) {
      console.log(" Token expira en:", new Date(decoded.exp * 1000).toLocaleString())
    }

    res.json({
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
    console.error(" Error en login:", error)
    res.status(500).json({
      message: "Error en el servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    console.log(" Intento de registro:", req.body.username)

    const { username, password, role } = req.body

    // Validaciones básicas
    if (!username || !password) {
      console.log(" Faltan campos requeridos")
      return res.status(400).json({
        message: "Username y password son requeridos",
      })
    }

    if (username.length < 3) {
      console.log(" Username muy corto")
      return res.status(400).json({
        message: "El username debe tener al menos 3 caracteres",
      })
    }

    if (password.length < 4) {
      console.log(" Password muy corta")
      return res.status(400).json({
        message: "La password debe tener al menos 4 caracteres",
      })
    }

    // Verificar conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      console.log(" Base de datos no inicializada")
      return res.status(500).json({
        message: "Base de datos no disponible",
      })
    }

    const existingUser = await userRepository.findOneBy({ username })
    if (existingUser) {
      console.log(" Usuario ya existe:", username)
      return res.status(400).json({
        message: "El usuario ya existe",
      })
    }

    const hashedPassword = hashPassword(password)

    // GENERAR EMAIL AUTOMÁTICAMENTE
    const email = `${username}@petrocontrol.local`

    const user = userRepository.create({
      username,
      password: hashedPassword,
      email,
      role: role || "operador",
    })

    const result = await userRepository.save(user)

    //  CREAR TOKEN JWT PARA EL NUEVO USUARIO
    const token = createJWToken(result)

    console.log(" Usuario registrado exitosamente:", result.username)

    const { password: _, ...userWithoutPassword } = result

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token, //  INCLUIR TOKEN EN REGISTRO
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error(" Error en registro:", error)
    res.status(500).json({
      message: "Error en el servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

//  EXPORTAR LA FUNCIÓN DE CREACIÓN DE TOKEN PARA USO EXTERNO
export { createJWToken }
