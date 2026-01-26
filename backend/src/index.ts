import express, { type Request, type Response, type NextFunction, type RequestHandler } from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import { AppDataSource } from "./config/data-source"
import authRoutes from "./routes/authRoutes"
import camionRoutes from "./routes/camionRoutes"
import camioneroRoutes from "./routes/camioneroRoutes"
import registroRoutes from "./routes/registroRoutes"
import mantenimientoRoutes from "./routes/mantenimientoRoutes"
import inventarioRoutes from "./routes/inventarioRoutes"

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5500"

// Lista de origenes permitidos para CORS
const allowedOrigins = [
  FRONTEND_URL,
  // Produccion - Vercel
  "https://petrocontrol-frontend.vercel.app",
  "https://petrocontrol-backend.vercel.app",
  // Desarrollo - localhost
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]

console.log("\n======================================================================")
console.log("INICIANDO SERVIDOR PETROCONTROL")
console.log("======================================================================\n")
console.log("Configuracion:")
console.log(`   Entorno: ${process.env.NODE_ENV || "development"}`)
console.log(`   Puerto: ${PORT}`)
console.log(`   Frontend URL: ${FRONTEND_URL}`)
console.log(`   Origenes CORS permitidos:`)
allowedOrigins.forEach((origin) => console.log(`     - ${origin}`))

// Middlewares de seguridad
app.use(helmet() as RequestHandler)
app.use(compression() as RequestHandler)

// Configuracion de CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman, curl, etc.)
      if (!origin) {
        console.log("[CORS] Peticion sin origen (permitida)")
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] Origen permitido: ${origin}`)
        callback(null, true)
      } else {
        console.log(`[CORS] Origen no permitido: ${origin}`)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Parsear JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware de logging de peticiones
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const path = req.path
  const origin = req.get("origin") || "N/A"

  console.log("\n------------------------------------------------------------")
  console.log(`[${timestamp}]`)
  console.log(`   ${method.padEnd(7)} ${path}`)
  console.log(`   Origin: ${origin}`)
  console.log("------------------------------------------------------------")

  next()
})

// Ruta raiz - Redirigir al frontend
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PetroControl API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 { margin: 0 0 20px 0; font-size: 2.5em; }
        .status { 
          display: inline-block;
          background: #4caf50;
          padding: 10px 20px;
          border-radius: 50px;
          margin: 20px 0;
          font-weight: bold;
        }
        .links {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        a {
          color: white;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.2);
          padding: 15px 30px;
          border-radius: 10px;
          transition: all 0.3s;
          font-weight: 500;
        }
        a:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .api-link {
          background: rgba(76, 175, 80, 0.3);
        }
        .frontend-link {
          background: rgba(33, 150, 243, 0.3);
          font-size: 1.2em;
          font-weight: bold;
        }
      </style>
      <script>
        setTimeout(() => {
          window.location.href = '${FRONTEND_URL}/index.html';
        }, 3000);
      </script>
    </head>
    <body>
      <div class="container">
        <h1>PetroControl API</h1>
        <div class="status">Sistema Online</div>
        <p>Version 2.0.0</p>
        <p style="font-size: 0.9em; opacity: 0.8;">Redirigiendo al frontend en 3 segundos...</p>
        <div class="links">
          <a href="${FRONTEND_URL}/index.html" class="frontend-link">
            Ir al Sistema (Login)
          </a>
          <a href="/api/health" class="api-link">
            Health Check
          </a>
          <a href="/api/test" class="api-link">
            API Test
          </a>
        </div>
      </div>
    </body>
    </html>
  `)
})

// Rutas de la API
app.use("/api/auth", authRoutes)
app.use("/api/camiones", camionRoutes)
app.use("/api/camioneros", camioneroRoutes)
app.use("/api/registros", registroRoutes)
app.use("/api/mantenimientos", mantenimientoRoutes)
app.use("/api/inventario", inventarioRoutes)

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "ok",
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
  })
})

// Test endpoint
app.get("/api/test", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "PetroControl API v2.0",
    version: "2.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
  })
})

// Manejo de rutas no encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  })
})

// Manejo global de errores
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("\n============================================================")
  console.error("[Error Global]")
  console.error(`   Path: ${req.path}`)
  console.error(`   Method: ${req.method}`)
  console.error(`   Error: ${err.message}`)
  console.error("============================================================\n")

  res.status(500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  })
})

// Inicializar la base de datos y arrancar el servidor
async function startServer() {
  try {
    console.log("\n[Database] Iniciando conexion...")
    console.log(`[Database] Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`)
    console.log(`[Database] Database: ${process.env.DB_NAME}`)

    await AppDataSource.initialize()

    console.log("[Database] Conexion establecida exitosamente")

    app.listen(PORT, () => {
      console.log("\n======================================================================")
      console.log("SERVIDOR INICIADO CORRECTAMENTE")
      console.log("======================================================================\n")
      console.log("URLs disponibles:")
      console.log(`   API Base: http://localhost:${PORT}`)
      console.log(`   Health Check: http://localhost:${PORT}/api/health`)
      console.log(`   API Test: http://localhost:${PORT}/api/test`)
      console.log(`   Frontend: ${FRONTEND_URL}/index.html`)
      console.log("\nEndpoints de Autenticacion:")
      console.log(`   POST   /api/auth/login`)
      console.log(`   POST   /api/auth/register`)
      console.log(`   GET    /api/auth/verify`)
      console.log("\nEndpoints de Recursos (protegidos):")
      console.log(`   GET    /api/camiones`)
      console.log(`   GET    /api/registros`)
      console.log(`   GET    /api/camioneros`)
      console.log(`   GET    /api/mantenimientos`)
      console.log(`   GET    /api/inventario/completo`)
      console.log("\nSistema listo para recibir peticiones")
      console.log("======================================================================\n")
    })
  } catch (error) {
    console.error("\n[Database] Error al conectar:")
    console.error(error)
    process.exit(1)
  }
}

startServer()
