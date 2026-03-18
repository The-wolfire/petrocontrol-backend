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

const isProduction = process.env.NODE_ENV === "production"

export const AppDataSource = new DataSource({
  type: "postgres",

  // Usar POSTGRES_URL si está definida (para Vercel)
  url: process.env.POSTGRES_URL,

  // Siempre usar SSL con rejectUnauthorized false para Vercel
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,

  // Configuración local (solo si no hay POSTGRES_URL)
  host: !process.env.POSTGRES_URL ? process.env.DB_HOST : undefined,
  port: !process.env.POSTGRES_URL ? parseInt(process.env.DB_PORT || "5432") : undefined,
  username: !process.env.POSTGRES_URL ? process.env.DB_USERNAME : undefined,
  password: !process.env.POSTGRES_URL ? process.env.DB_PASSWORD : undefined,
  database: !process.env.POSTGRES_URL ? process.env.DB_NAME : undefined,

  synchronize: true,  // en desarrollo sincroniza, en producción no
  logging: !isProduction,
  entities: [
    Usuario,
    Camion,
    RegistroES,
    Camionero,
    Mantenimiento,
    Viaje,
  ],
  migrations: ["src/migrations/*.ts"],
  migrationsRun: false,
})