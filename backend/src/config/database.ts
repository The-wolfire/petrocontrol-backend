import { AppDataSource } from "./data-source"

// ✅ Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    console.log("\n🔌 [Database] Iniciando conexión...")
    console.log(`📊 [Database] Modo: ${process.env.NODE_ENV || "development"}`)
    console.log(`🏠 [Database] Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}`)
    console.log(`💾 [Database] Database: ${process.env.DB_DATABASE || "petrocontrol_db"}`)

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    console.log("✅ [Database] Conexión establecida exitosamente")
    console.log(
      `📊 [Database] Pool: min=${AppDataSource.options.extra?.min || 2}, max=${AppDataSource.options.extra?.max || 10}`,
    )

    // ✅ Verificar entidades
    const entities = AppDataSource.entityMetadatas.map((entity) => entity.name)
    console.log(`📦 [Database] Entidades cargadas: ${entities.join(", ")}`)

    return true
  } catch (error) {
    console.error("\n❌ [Database] Error al conectar:")
    console.error(error)
    return false
  }
}

// ✅ Función para cerrar la conexión
export async function closeDatabase() {
  try {
    if (AppDataSource.isInitialized) {
      console.log("\n🔌 [Database] Cerrando conexión...")
      await AppDataSource.destroy()
      console.log("✅ [Database] Conexión cerrada correctamente")
    }
  } catch (error) {
    console.error("❌ [Database] Error al cerrar conexión:", error)
  }
}

// ✅ Verificar estado de la conexión
export function isDatabaseConnected(): boolean {
  return AppDataSource.isInitialized
}
