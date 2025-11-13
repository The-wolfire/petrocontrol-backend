import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";

// Importar las rutas
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

// Middlewares base
app.use(express.json());
import helmet from "helmet";
import compression from "compression";

// Configuración de CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Incluir OPTIONS es vital
    credentials: true,
  })
);

// Conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Base de datos conectada correctamente.");

    // Rutas principales
    app.use("/api/auth", authRoutes);
    app.use("/api/camiones", camionRoutes);
    app.use("/api/registros", registroRoutes);
    app.use("/api/camioneros", camioneroRoutes);
    app.use("/api/mantenimientos", mantenimientoRoutes);
    app.use("/api/inventario", inventarioRoutes);

    // Ruta base
    app.get("/", (_req: Request, res: Response) => {
      res.send("Servidor PetroControl operativo.");
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar la base de datos:", error);
  });

// Middleware global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("⚠️ Error interno:", err.message);
  res.status(500).json({ message: "Error interno del servidor" });
});
