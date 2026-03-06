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

  // Vercel Postgres (producción)
  url: isProduction ? process.env.POSTGRES_URL : undefined,
  ssl: isProduction ? { rejectUnauthorized: false } : false,

  // Configuración local (desarrollo)
  host: !isProduction ? process.env.DB_HOST : undefined,
  port: !isProduction ? parseInt(process.env.DB_PORT || "5432") : undefined,
  username: !isProduction ? process.env.DB_USERNAME : undefined,
  password: !isProduction ? process.env.DB_PASSWORD : undefined,
  database: !isProduction ? process.env.DB_NAME : undefined,

  // ⚠️ TEMPORAL: Forzar sincronización para crear tablas en producción
  // Después del primer despliegue, cambiar a: synchronize: !isProduction
  synchronize: true, // Ahora se crean las tablas en producción

  // Desactivamos logging en producción para no llenar logs
  logging: !isProduction,

  // Entidades
  entities: [
    Usuario,
    Camion,
    RegistroES,
    Camionero,
    Mantenimiento,
    Viaje,
  ],

  // Migraciones (las dejamos listas para cuando quieras usarlas después)
  migrations: ["src/migrations/*.ts"],
  migrationsRun: false, // por ahora no las ejecutamos
})