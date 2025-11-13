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
const FRONTEND_URL = process.env.FRONTEND_URL || "https://petrocontrol-frontend.vercel.app";

// Lista de orígenes permitidos
const allowedOrigins = [
  FRONTEND_URL,
  "https://petrocontrol-frontend.vercel.app",
  // ...
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

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
app.use(express.json());
app.use(helmet());
// Configuración de CORS
app.use(
  cors({
    origin: allowedOrigins, // Usa el array de orígenes
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Asegúrate de incluir OPTIONS
    credentials: true,
  })
);

// ═══════════════════════════════════════════════════════════════════
// APLICACIÓN DE RUTAS (LIMPIA)
// ═══════════════════════════════════════════════════════════════════

// ✅ Rutas principales CORREGIDAS
app.use("/auth", authRoutes); // Antes: /routes
app.use("/camiones", camionRoutes); // Antes: /routes
app.use("/registros", registroRoutes); // Antes: /routes
app.use("/camioneros", camioneroRoutes); // Antes: /rotres
app.use("/mantenimientos", mantenimientoRoutes); // Antes: /routes
app.use("/inventario", inventarioRoutes); // Antes: /routes

// Rutas base
app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor PetroControl operativo.");
});

// El segundo app.get("/") es redundante, puedes dejar solo uno.

// ═══════════════════════════════════════════════════════════════════
//  EXPORTAR EL OBJETO EXPRESS PARA VERCEL
// ═══════════════════════════════════════════════════════════════════

export default app;