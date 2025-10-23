import "reflect-metadata"
import express from "express"
import cors from "cors"
import compression from "compression"
import morgan from "morgan"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import path from "path"
import dotenv from "dotenv"

import { AppDataSource } from "./config/data-source"

// Importar rutas
import authRoutes from "./routes/authRoutes"
import camionRoutes from "./routes/camionRoutes"
import registroRoutes from "./routes/registroRoutes"
import camioneroRoutes from "./routes/camioneroRoutes"
import mantenimientoRoutes from "./routes/mantenimientoRoutes"

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  },
})

// Middlewares de seguridad
app.use(
  helmet({
    contentSecurityPolicy: false, // Deshabilitado para desarrollo
  }),
)
app.use(limiter)
app.use(compression())

// Logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"))
} else {
  app.use(morgan("dev"))
}

// CORS configurado para desarrollo y producción
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "https://tu-frontend.vercel.app", // AGREGAR ESTA LÍNEA
      process.env.FRONTEND_URL || "*",
      // Railway te dará una URL como: https://tu-app.up.railway.app
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Middlewares básicos
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ENDPOINT TEMPORAL PARA SEED - ELIMINAR DESPUÉS
app.post("/api/admin/seed", async (req, res) => {
  const { secret } = req.body

  if (secret !== "mi_clave_super_secreta_123") {
    return res.status(403).json({ message: "Forbidden" })
  }

  try {
    // Importar y ejecutar el seed
    const { seedDatabase } = require("../scripts/seed-database")
    await seedDatabase()

    res.json({ message: "Base de datos sembrada exitosamente" })
  } catch (error) {
    res.status(500).json({
      message: "Error sembrando base de datos",
      error: error.message,
    })
  }
})

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend")))

// Logging middleware para debugging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Origin: ${req.get("Origin")}`)
  next()
})

// Rutas API
app.use("/api/auth", authRoutes)
app.use("/api/camiones", camionRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/camioneros", camioneroRoutes)
app.use("/api/mantenimientos", mantenimientoRoutes)

// Health check - CORREGIDO
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
  })
})

// Ruta para servir el frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend funcionando correctamente",
    timestamp: new Date(),
    version: "2.0.0",
  })
})

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Error:", err)

  if (process.env.NODE_ENV === "production") {
    res.status(500).json({ message: "Error interno del servidor" })
  } else {
    res.status(500).json({
      message: err.message,
      stack: err.stack,
    })
  }
})

// Ruta 404 para API
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" })
})

// Servir SPA para todas las demás rutas
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Inicializar aplicación
async function startServer() {
  try {
    console.log("🔌 Conectando a la base de datos...")
    await AppDataSource.initialize()
    console.log("✅ Base de datos conectada exitosamente")

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
      console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`)
      console.log(`📡 API disponible en: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error("❌ Error al inicializar:", error)
    process.exit(1)
  }
}

// Manejo de señales para cierre graceful
process.on("SIGTERM", async () => {
  console.log("🛑 Recibida señal SIGTERM, cerrando servidor...")
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("🛑 Recibida señal SIGINT, cerrando servidor...")
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }
  process.exit(0)
})

startServer()
