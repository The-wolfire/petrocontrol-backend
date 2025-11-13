import "reflect-metadata";
import express, { type Request, type Response } from "express";
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://petrocontrol-frontend.vercel.app";

// Lista de orígenes permitidos
const allowedOrigins = [
  FRONTEND_URL,
  "https://petrocontrol-frontend.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MIDDLEWARES BASE (SOLO UNA VEZ)
// ═══════════════════════════════════════════════════════════════════
app.use(express.json());
app.use(helmet());

// ✅ CONFIGURACIÓN CORS (SOLO UNA VEZ - eliminar el duplicado)
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ═══════════════════════════════════════════════════════════════════
// 🎯 PATRÓN SERVERLESS: INICIALIZACIÓN DE DB
// ═══════════════════════════════════════════════════════════════════
let isDbInitialized = AppDataSource.isInitialized;

if (!isDbInitialized) {
    AppDataSource.initialize()
        .then(() => {
            isDbInitialized = true;
            console.log("✅ Base de datos conectada correctamente (Inicialización Serverless).");
        })
        .catch((error) => {
            console.error(`\n❌ [Database] Error al conectar en Serverless Init:`, error);
        });
}

// ═══════════════════════════════════════════════════════════════════
// APLICACIÓN DE RUTAS SIMPLIFICADAS
// ═══════════════════════════════════════════════════════════════════
app.use("/auth", authRoutes);
app.use("/camiones", camionRoutes);
app.use("/registros", registroRoutes);
app.use("/camioneros", camioneroRoutes);
app.use("/mantenimientos", mantenimientoRoutes);
app.use("/inventario", inventarioRoutes);

// Ruta de salud para testing
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "healthy",
    message: "Servidor PetroControl operativo",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/auth",
      camiones: "/camiones",
      registros: "/registros", 
      camioneros: "/camioneros",
      mantenimientos: "/mantenimientos",
      inventario: "/inventario"
    }
  });
});

// Ruta base
app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor PetroControl operativo.");
});

export default app;