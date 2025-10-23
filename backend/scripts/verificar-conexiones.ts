import "reflect-metadata"
import { AppDataSource } from "../src/config/data-source"
import { Camion } from "../src/entities/Camion"
import { RegistroES } from "../src/entities/RegistroES"
import { Camionero } from "../src/entities/Camionero"
import { Mantenimiento } from "../src/entities/Mantenimiento"
import { Viaje } from "../src/entities/Viaje"
import { Usuario } from "../src/entities/Usuario"
import axios from "axios"

const API_URL = "http://localhost:3000/api"

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
}

async function verificarConexionDB() {
  log.section("VERIFICANDO CONEXIÓN A BASE DE DATOS")

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    log.success("Conexión a PostgreSQL establecida correctamente")
    return true
  } catch (error) {
    log.error(`Error al conectar con la base de datos: ${error}`)
    return false
  }
}

async function verificarTablas() {
  log.section("VERIFICANDO TABLAS EN BASE DE DATOS")

  const tablas = [
    { nombre: "usuario", repositorio: AppDataSource.getRepository(Usuario) },
    { nombre: "camion", repositorio: AppDataSource.getRepository(Camion) },
    { nombre: "camionero", repositorio: AppDataSource.getRepository(Camionero) },
    { nombre: "registro_es", repositorio: AppDataSource.getRepository(RegistroES) },
    { nombre: "mantenimiento", repositorio: AppDataSource.getRepository(Mantenimiento) },
    { nombre: "viaje", repositorio: AppDataSource.getRepository(Viaje) },
  ]

  let todasExisten = true
  let hayDatos = false

  for (const tabla of tablas) {
    try {
      const count = await tabla.repositorio.count()
      if (count > 0) {
        hayDatos = true
        log.success(`Tabla '${tabla.nombre}': ${count} registros`)
      } else {
        log.warning(`Tabla '${tabla.nombre}': 0 registros (ejecuta 'npm run seed')`)
      }
    } catch (error) {
      log.error(`Tabla '${tabla.nombre}': No existe o hay error`)
      todasExisten = false
    }
  }

  if (!hayDatos) {
    log.warning("\n⚠️  Base de datos vacía. Ejecuta 'npm run seed' para poblarla con datos de prueba.")
  }

  return todasExisten
}

async function verificarRelaciones() {
  log.section("VERIFICANDO RELACIONES ENTRE ENTIDADES")

  try {
    const camionRepo = AppDataSource.getRepository(Camion)

    // Verificar relación Camion -> RegistroES
    const camionConRegistros = await camionRepo.findOne({
      where: {},
      relations: ["registros"],
    })

    if (camionConRegistros) {
      log.success(`Relación Camion → RegistroES: OK (${camionConRegistros.registros?.length || 0} registros)`)
    } else {
      log.warning("No hay camiones con registros para verificar la relación (ejecuta 'npm run seed')")
    }

    // Verificar relación Camion -> Mantenimiento
    const camionConMantenimientos = await camionRepo.findOne({
      where: {},
      relations: ["mantenimientos"],
    })

    if (camionConMantenimientos) {
      log.success(
        `Relación Camion → Mantenimiento: OK (${camionConMantenimientos.mantenimientos?.length || 0} mantenimientos)`,
      )
    } else {
      log.warning("No hay camiones con mantenimientos para verificar la relación (ejecuta 'npm run seed')")
    }

    // Verificar relación Camion -> Viaje
    const camionConViajes = await camionRepo.findOne({
      where: {},
      relations: ["viajes"],
    })

    if (camionConViajes) {
      log.success(`Relación Camion → Viaje: OK (${camionConViajes.viajes?.length || 0} viajes)`)
    } else {
      log.warning("No hay camiones con viajes para verificar la relación (ejecuta 'npm run seed')")
    }

    return true
  } catch (error) {
    log.error(`Error verificando relaciones: ${error}`)
    return false
  }
}

async function verificarInventario() {
  log.section("VERIFICANDO CÁLCULOS DE INVENTARIO")

  try {
    const registroRepo = AppDataSource.getRepository(RegistroES)

    const entradas = await registroRepo
      .createQueryBuilder("registro")
      .where("registro.tipo = :tipo", { tipo: "entrada" })
      .getCount()

    const salidas = await registroRepo
      .createQueryBuilder("registro")
      .where("registro.tipo = :tipo", { tipo: "salida" })
      .getCount()

    log.info(`Total de entradas: ${entradas}`)
    log.info(`Total de salidas: ${salidas}`)

    if (entradas === 0 && salidas === 0) {
      log.warning("No hay registros para calcular inventario (ejecuta 'npm run seed')")
      return true
    }

    // Calcular inventario por tipo de petróleo
    const inventarioDiesel = await registroRepo
      .createQueryBuilder("registro")
      .select("SUM(CASE WHEN registro.tipo = 'entrada' THEN registro.cantidad ELSE -registro.cantidad END)", "balance")
      .where("registro.tipoPetroleo = :tipo", { tipo: "diesel" })
      .getRawOne()

    const inventarioGasolina = await registroRepo
      .createQueryBuilder("registro")
      .select("SUM(CASE WHEN registro.tipo = 'entrada' THEN registro.cantidad ELSE -registro.cantidad END)", "balance")
      .where("registro.tipoPetroleo = :tipo", { tipo: "gasolina" })
      .getRawOne()

    log.success(`Inventario Diesel: ${inventarioDiesel?.balance || 0} litros`)
    log.success(`Inventario Gasolina: ${inventarioGasolina?.balance || 0} litros`)

    return true
  } catch (error) {
    log.error(`Error verificando inventario: ${error}`)
    return false
  }
}

async function verificarEndpoints() {
  log.section("VERIFICANDO ENDPOINTS DEL API")

  const endpoints = [
    { url: "/health", method: "GET", requiresAuth: false, expected: 200 },
    { url: "/test", method: "GET", requiresAuth: false, expected: 200 },
    { url: "/camiones", method: "GET", requiresAuth: true, expected: 401 },
    { url: "/registros", method: "GET", requiresAuth: true, expected: 401 },
    { url: "/registros/inventario", method: "GET", requiresAuth: true, expected: 401 },
    { url: "/camioneros", method: "GET", requiresAuth: true, expected: 401 },
    { url: "/mantenimientos", method: "GET", requiresAuth: true, expected: 401 },
  ]

  log.info("Nota: Endpoints protegidos deben responder 401 sin token (esto es correcto)")

  let todosOk = true

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_URL}${endpoint.url}`, {
        validateStatus: () => true,
        timeout: 5000,
      })

      if (response.status === endpoint.expected) {
        log.success(`${endpoint.method} ${endpoint.url}: OK (${response.status})`)
      } else if (endpoint.requiresAuth && response.status === 401) {
        log.success(`${endpoint.method} ${endpoint.url}: Protegido correctamente (401)`)
      } else if (!endpoint.requiresAuth && response.status === 200) {
        log.success(`${endpoint.method} ${endpoint.url}: Responde correctamente (200)`)
      } else {
        log.warning(`${endpoint.method} ${endpoint.url}: Estado ${response.status} (esperado: ${endpoint.expected})`)
        todosOk = false
      }
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        log.error(`${endpoint.method} ${endpoint.url}: Servidor no está corriendo`)
        log.warning("   → Inicia el servidor con 'npm run dev' en otra terminal")
        todosOk = false
      } else if (error.code === "ECONNABORTED") {
        log.error(`${endpoint.method} ${endpoint.url}: Timeout`)
        todosOk = false
      } else {
        log.error(`${endpoint.method} ${endpoint.url}: ${error.message}`)
        todosOk = false
      }
    }
  }

  return todosOk
}

async function verificarIntegridadDatos() {
  log.section("VERIFICANDO INTEGRIDAD DE DATOS")

  try {
    const registroRepo = AppDataSource.getRepository(RegistroES)
    const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento)

    // Verificar registros sin camión
    const registrosSinCamion = await registroRepo
      .createQueryBuilder("registro")
      .where("registro.camionId IS NULL")
      .getCount()

    if (registrosSinCamion === 0) {
      log.success("Todos los registros tienen un camión asociado")
    } else {
      log.warning(`Hay ${registrosSinCamion} registros sin camión asociado`)
    }

    // Verificar mantenimientos sin camión
    const mantenimientosSinCamion = await mantenimientoRepo
      .createQueryBuilder("mantenimiento")
      .where("mantenimiento.camionId IS NULL")
      .getCount()

    if (mantenimientosSinCamion === 0) {
      log.success("Todos los mantenimientos tienen un camión asociado")
    } else {
      log.warning(`Hay ${mantenimientosSinCamion} mantenimientos sin camión asociado`)
    }

    // Verificar cantidades negativas
    const cantidadesNegativas = await registroRepo
      .createQueryBuilder("registro")
      .where("registro.cantidad < 0")
      .getCount()

    if (cantidadesNegativas === 0) {
      log.success("Todas las cantidades son válidas (> 0)")
    } else {
      log.warning(`Hay ${cantidadesNegativas} registros con cantidades negativas`)
    }

    return true
  } catch (error) {
    log.error(`Error verificando integridad: ${error}`)
    return false
  }
}

async function resumenGeneral() {
  log.section("RESUMEN GENERAL DEL SISTEMA")

  try {
    const camionRepo = AppDataSource.getRepository(Camion)
    const registroRepo = AppDataSource.getRepository(RegistroES)
    const camioneroRepo = AppDataSource.getRepository(Camionero)
    const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento)
    const viajeRepo = AppDataSource.getRepository(Viaje)
    const usuarioRepo = AppDataSource.getRepository(Usuario)

    const stats = {
      camiones: await camionRepo.count(),
      registros: await registroRepo.count(),
      camioneros: await camioneroRepo.count(),
      mantenimientos: await mantenimientoRepo.count(),
      viajes: await viajeRepo.count(),
      usuarios: await usuarioRepo.count(),
    }

    log.info(`📊 Estadísticas del Sistema:`)
    console.log(`   • Camiones: ${stats.camiones}`)
    console.log(`   • Registros E/S: ${stats.registros}`)
    console.log(`   • Camioneros: ${stats.camioneros}`)
    console.log(`   • Mantenimientos: ${stats.mantenimientos}`)
    console.log(`   • Viajes: ${stats.viajes}`)
    console.log(`   • Usuarios: ${stats.usuarios}`)

    // Calcular inventario total
    const inventarioTotal = await registroRepo
      .createQueryBuilder("registro")
      .select("SUM(CASE WHEN registro.tipo = 'entrada' THEN registro.cantidad ELSE -registro.cantidad END)", "total")
      .getRawOne()

    log.info(`\n📦 Inventario Total Actual: ${inventarioTotal?.total || 0} litros`)

    const totalRegistros =
      stats.camiones + stats.registros + stats.camioneros + stats.mantenimientos + stats.viajes + stats.usuarios

    if (totalRegistros === 0) {
      log.warning("\n⚠️  La base de datos está vacía. Ejecuta 'npm run seed' para poblarla.")
    }
  } catch (error) {
    log.error(`Error generando resumen: ${error}`)
  }
}

async function main() {
  console.log("\n" + "=".repeat(60))
  console.log(`${colors.magenta}🔍 SISTEMA DE VERIFICACIÓN DE CONEXIONES${colors.reset}`)
  console.log(`${colors.magenta}   PetroControl - Sistema de Gestión de Flota${colors.reset}`)
  console.log("=".repeat(60))

  let todoOk = true

  // 1. Verificar conexión DB
  const dbOk = await verificarConexionDB()
  todoOk = todoOk && dbOk

  if (!dbOk) {
    log.error("\n❌ No se puede continuar sin conexión a la base de datos")
    process.exit(1)
  }

  // 2. Verificar tablas
  const tablasOk = await verificarTablas()
  todoOk = todoOk && tablasOk

  // 3. Verificar relaciones
  const relacionesOk = await verificarRelaciones()
  todoOk = todoOk && relacionesOk

  // 4. Verificar inventario
  const inventarioOk = await verificarInventario()
  todoOk = todoOk && inventarioOk

  // 5. Verificar endpoints
  const endpointsOk = await verificarEndpoints()
  todoOk = todoOk && endpointsOk

  // 6. Verificar integridad
  const integridadOk = await verificarIntegridadDatos()
  todoOk = todoOk && integridadOk

  // 7. Resumen general
  await resumenGeneral()

  // Resultado final
  console.log("\n" + "=".repeat(60))
  if (todoOk) {
    log.success("✅ TODAS LAS VERIFICACIONES COMPLETADAS CON ÉXITO")
  } else {
    log.warning("⚠️  ALGUNAS VERIFICACIONES TIENEN ADVERTENCIAS")
    log.info("\nPasos recomendados:")
    console.log("   1. Ejecuta 'npm run seed' para poblar la base de datos")
    console.log("   2. Inicia el servidor con 'npm run dev' en otra terminal")
    console.log("   3. Ejecuta 'npm run verify' nuevamente")
  }
  console.log("=".repeat(60) + "\n")

  await AppDataSource.destroy()
  process.exit(todoOk ? 0 : 1)
}

main().catch((error) => {
  log.error(`Error fatal: ${error}`)
  process.exit(1)
})
