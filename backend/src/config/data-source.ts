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

// ... (imports y dotenv.config())

const isProduction = process.env.NODE_ENV === "production"

export const AppDataSource = new DataSource({
  type: "postgres",
  
  //CAMBIO CLAVE: Usa POSTGRES_URL, que Vercel inyecta automáticamente.
  url: isProduction ? process.env.POSTGRES_URL : undefined, 
  ssl: isProduction ? { rejectUnauthorized: false } : false, 
  
  // Las demás variables son para el entorno local (Docker/development)
  host: !isProduction ? process.env.DB_HOST : undefined,
  port: !isProduction ? parseInt(process.env.DB_PORT || "5432") : undefined,
  username: !isProduction ? process.env.DB_USERNAME : undefined,
  password: !isProduction ? process.env.DB_PASSWORD : undefined,
  database: !isProduction ? process.env.DB_NAME : undefined,
  
  synchronize: !isProduction, // Solo en desarrollo
  logging: !isProduction,
  entities: [/* Tus Entidades */],
  migrations: ["src/migrations/*.ts"],
  extra: {
    connectionLimit: 5,
    acquireTimeout: 60000,
    timeout: 60000,
  }
})