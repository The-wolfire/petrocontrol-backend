import "reflect-metadata";
import express, { type Request, type Response } from "express"; // Eliminamos NextFunction y RequestHandler que ya no son necesarios
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";

// Importar todas las rutas
import authRoutes from "./routes/authRoutes";
import camionRoutes from "./routes/camionRoutes";
import registroRoutes from "./routes/registroRoutes";
import camioneroRoutes from "./routes/camioneroRoutes";
import mantenimientoRoutes from "./routes/mantenimientoRoutes";
import inventarioRoutes from "./routes/inventarioRoutes";

// ✅ Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:5500";

// Lista de orígenes permitidos
const allowedOrigins = [
  FRONTEND_URL,
  "https://petrocontrol-frontend.vercel.app", 
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  // Añadir subdominio temporal de Vercel como comodín
  "https://*.the-wolfires-projects.vercel.app", 
];

// ═══════════════════════════════════════════════════════════════════
// 🎯 PATRÓN SERVERLESS: INICIALIZACIÓN DE DB EN EL ALCANCE GLOBAL
// ═══════════════════════════════════════════════════════════════════
// La conexión se intenta SOLO UNA VEZ cuando el contenedor Vercel arranca ("cold start").
let isDbInitialized = AppDataSource.isInitialized;

if (!isDbInitialized) {
    AppDataSource.initialize()
        .then(() => {
            isDbInitialized = true;
            console.log("✅ Base de datos conectada correctamente (Inicialización Serverless).");
        })
        .catch((error) => {
            // Logeamos el error si falla la conexión en el arranque.
            console.error(`\n❌ [Database] Error al conectar en Serverless Init:`, error);
        });
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MIDDLEWARES BASE
// ═══════════════════════════════════════════════════════════════════

// Configuración de CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        callback(new Error(`❌ No permitido por CORS: ${origin}`), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    credentials: true,
  })
);

// ═══════════════════════════════════════════════════════════════════
// APLICACIÓN DE RUTAS (LIMPIA)
// ═══════════════════════════════════════════════════════════════════

// ❌ El código problemático ha sido eliminado.
// El error TS2769 desaparece.

app.use("/api/auth", authRoutes);
app.use("/api/camiones", camionRoutes);
app.use("/api/registros", registroRoutes);
app.use("/api/camioneros", camioneroRoutes);
app.use("/api/mantenimientos", mantenimientoRoutes);
app.use("/api/inventario", inventarioRoutes);

// Rutas base y de salud
app.get("/api/health", (_req: Request, res: Response) => {
    // Reportar el estado de la conexión en el health check.
    if (!isDbInitialized) {
        return res.status(503).json({ status: "error", message: "Database connection failed during initialization. (503 Service Unavailable)" });
    }
    res.status(200).json({ status: "ok", message: "Backend Health Check OK" });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor PetroControl operativo. Rutas cargadas.");
});

// ═══════════════════════════════════════════════════════════════════
// ✅ EXPORTAR EL OBJETO EXPRESS PARA VERCEL
// ═══════════════════════════════════════════════════════════════════

export default app;