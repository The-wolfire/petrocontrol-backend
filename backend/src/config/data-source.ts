import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv from "dotenv"
import { Usuario } from "../entities/Usuario"
import { Camion } from "../entities/Camion"
import { RegistroES } from "../entities/RegistroES"
import { Camionero } from "../entities/Camionero"
import { Mantenimiento } from "../entities/Mantenimiento"
import { Viaje } from "../entities/Viaje"

dotenv.config()

// En data-source.ts:
const isProduction = process.env.NODE_ENV === "production"

export const AppDataSource = new DataSource({
  type: "postgres",
  // Para producción en Vercel, usa DATABASE_URL
  url: isProduction ? process.env.DATABASE_URL : undefined, 
  ssl: isProduction ? { rejectUnauthorized: false } : false, // Esto es correcto y necesario
  host: !isProduction ? process.env.DB_HOST : undefined,
  port: !isProduction ? parseInt(process.env.DB_PORT || "5432") : undefined,
  username: !isProduction ? process.env.DB_USERNAME : undefined,
  password: !isProduction ? process.env.DB_PASSWORD : undefined,
  database: !isProduction ? process.env.DB_NAME : undefined,
  
  synchronize: !isProduction, // Solo en desarrollo
  logging: !isProduction,
  entities: [Usuario, Camion, RegistroES, Camionero, Mantenimiento, Viaje],
  migrations: ["src/migrations/*.ts"],
  extra: {
    connectionLimit: 5,
    acquireTimeout: 60000,
    timeout: 60000,
  }
})