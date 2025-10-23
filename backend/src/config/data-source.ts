import { DataSource } from "typeorm"
import dotenv from "dotenv"
import { Usuario } from "../entities/Usuario"
import { Camion } from "../entities/Camion"
import { RegistroES } from "../entities/RegistroES"
import { Camionero } from "../entities/Camionero"
import { Mantenimiento } from "../entities/Mantenimiento"
import { Viaje } from "../entities/Viaje"

dotenv.config()

// Configuración para Railway/Render
export const AppDataSource = new DataSource({
  type: "postgres",

  // En producción, usar DATABASE_URL
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USERNAME || "tnn",
        password: process.env.DB_PASSWORD || "1234",
        database: process.env.DB_DATABASE || "petrocontrol_db",
      }),

  // SSL para producción
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,

  // Solo sincronizar en desarrollo
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",

  entities: [Usuario, Camion, RegistroES, Camionero, Mantenimiento, Viaje],
  migrations: ["dist/migrations/*.js"],

  // Pool de conexiones optimizado para Railway
  extra: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
})
