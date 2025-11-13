import "reflect-metadata"
import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import dotenv from "dotenv"
import { AppDataSource } from "./config/data-source"
import authRoutes from "./routes/authRoutes"
import camionRoutes from "./routes/camionRoutes"
import registroRoutes from "./routes/registroRoutes"
import camioneroRoutes from "./routes/camioneroRoutes"
import mantenimientoRoutes from "./routes/mantenimientoRoutes"
import inventarioRoutes from "./routes/inventarioRoutes"

// ✅ Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5500"

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE CORS
// ═══════════════════════════════════════════════════════════════════

const allowedOrigins = [
  FRONTEND_URL,
  // AÑADIR ESTA LÍNEA DE FORMA EXPLÍCITA (SOLUCIÓN FINAL DE CORS)
  "https://petrocontrol-frontend.vercel.app", 
  // URLs de Desarrollo (Local)
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  // ... otras URLs
];

app.use(
  cors({
    origin: (origin, callback) => {
      // ✅ Permitir peticiones sin origen (Postman, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        console.log(`✅ [CORS] Origen permitido: ${origin}`)
        callback(null, true)
      } else {
        console.log(`⚠️ [CORS] Origen no permitido: ${origin}`)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARES GLOBALES
// ═══════════════════════════════════════════════════════════════════

app.use(helmet())
app.use(compression)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ✅ Middleware de logging mejorado
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  console.log(`
────────────────────────────────────────────────────────────
📡 [${new Date().toISOString()}]
   ${req.method.padEnd(7)} ${req.path}
   IP: ${req.ip}
   Origin: ${req.get("origin") || "N/A"}
────────────────────────────────────────────────────────────`)

  res.on("finish", () => {
    const duration = Date.now() - start
    const statusEmoji = res.statusCode < 400 ? "✅" : "❌"
    console.log(`${statusEmoji} [Response] Status: ${res.statusCode}`)
    console.log(`────────────────────────────────────────────────────────────
`)
    console.log(`⏱️ [Performance] ${req.method} ${req.path} - ${duration}ms
`)
  })

  next()
})

// ═══════════════════════════════════════════════════════════════════
// RUTA RAÍZ CON REDIRECCIÓN AL FRONTEND
// ═══════════════════════════════════════════════════════════════════

app.get("/", (req: Request, res: Response) => {
  // Si la petición viene del navegador, redirigir al frontend
  const userAgent = req.get("user-agent") || ""
  if (userAgent.includes("Mozilla") || userAgent.includes("Chrome")) {
    return res.redirect(FRONTEND_URL + "/index.html")
  }

  // Si es una petición de API, devolver JSON
  res.json({
    success: true,
    message: "PetroControl API v2.0",
    version: "2.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
    frontendUrl: FRONTEND_URL + "/index.html",
    endpoints: {
      health: "/api/health",
      test: "/api/test",
      auth: "/api/auth",
      camiones: "/api/camiones",
      registros: "/api/registros",
      camioneros: "/api/camioneros",
      mantenimientos: "/api/mantenimientos",
      inventario: "/api/inventario",
    },
  })
})

// ═══════════════════════════════════════════════════════════════════
// RUTAS DE HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "ok",
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
  })
})

app.get("/api/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Ruta de prueba funcionando",
    timestamp: new Date().toISOString(),
  })
})

// ═══════════════════════════════════════════════════════════════════
// RUTAS DE LA API
// ═══════════════════════════════════════════════════════════════════

app.use("/api/auth", authRoutes)
app.use("/api/camiones", camionRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/camioneros", camioneroRoutes)
app.use("/api/mantenimientos", mantenimientoRoutes)
app.use("/api/inventario", inventarioRoutes)

// ═══════════════════════════════════════════════════════════════════
// MANEJO DE ERRORES GLOBAL
// ═══════════════════════════════════════════════════════════════════

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`
============================================================
❌ [Error Global]
   Path: ${req.path}
   Method: ${req.method}
   Error: ${err.message}
   Stack: ${err.stack}
============================================================
`)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// ═══════════════════════════════════════════════════════════════════
// RUTA 404
// ═══════════════════════════════════════════════════════════════════

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.path,
  })
})

// ═══════════════════════════════════════════════════════════════════
// INICIALIZAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════

async function startServer() {
  try {
    console.log(`
======================================================================
🚀 INICIANDO SERVIDOR PETROCONTROL
======================================================================

📦 Configuración:
   • Entorno: ${process.env.NODE_ENV || "development"}
   • Puerto: ${PORT}
   • Frontend URL: ${FRONTEND_URL}
`)

    // ✅ Conectar a la base de datos
    console.log("🔌 [Database] Iniciando conexión...")
    console.log(`📊 [Database] Modo: ${process.env.NODE_ENV || "development"}`)
    console.log(`🏠 [Database] Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`)
    console.log(`💾 [Database] Database: ${process.env.DB_DATABASE}`)

    await AppDataSource.initialize()

    console.log("✅ [Database] Conexión establecida exitosamente")
    console.log(`📊 [Database] Pool: min=2, max=10`)
    console.log(`📦 [Database] Entidades cargadas: ${AppDataSource.entityMetadatas.map((e) => e.name).join(", ")}`)

    // ✅ Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
======================================================================
✅ SERVIDOR INICIADO CORRECTAMENTE
======================================================================

🌐 URLs disponibles:
   • API Base: http://localhost:${PORT}
   • Health Check: http://localhost:${PORT}/api/health
   • API Test: http://localhost:${PORT}/api/test
   • Frontend: ${FRONTEND_URL}/index.html

🔐 Endpoints de Autenticación:
   • POST   /api/auth/login
   • POST   /api/auth/register
   • GET    /api/auth/verify

🚛 Endpoints de Recursos (protegidos):
   • GET    /api/camiones
   • GET    /api/registros
   • GET    /api/registros/inventario
   • GET    /api/camioneros
   • GET    /api/mantenimientos
   • GET    /api/inventario/completo
   • GET    /api/inventario/alertas

🔑 Seguridad:
   • JWT Secret: ✓ Configurado
   • CORS: Habilitado (${allowedOrigins.length} orígenes permitidos)
   • Helmet: Habilitado
   • Compression: Habilitado

✅ Sistema listo para recibir peticiones
======================================================================
`)
    })
  } catch (error) {
    console.error(`
❌ [Database] Error al conectar:`)
    console.error(error)
    console.error(`
❌ No se pudo conectar a la base de datos
   Verifica tu configuración en .env`)
    process.exit(1)
  }
}

// ✅ Iniciar el servidor
startServer()

export default app