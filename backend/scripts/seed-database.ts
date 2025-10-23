import "reflect-metadata"
import { AppDataSource } from "../src/config/data-source"
import { Camion } from "../src/entities/Camion"
import { RegistroES } from "../src/entities/RegistroES"
import { Usuario } from "../src/entities/Usuario"
import { Camionero } from "../src/entities/Camionero"
import { Mantenimiento } from "../src/entities/Mantenimiento"
import { Viaje } from "../src/entities/Viaje"
import crypto from "crypto"

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

async function seedDatabase() {
  try {
    console.log("🔌 Iniciando conexión a la base de datos...")
    await AppDataSource.initialize()
    console.log("✅ Conexión a la base de datos establecida")

    // Crear repositorios
    const usuarioRepository = AppDataSource.getRepository(Usuario)
    const camionRepository = AppDataSource.getRepository(Camion)
    const registroRepository = AppDataSource.getRepository(RegistroES)
    const camioneroRepository = AppDataSource.getRepository(Camionero)
    const mantenimientoRepository = AppDataSource.getRepository(Mantenimiento)
    const viajeRepository = AppDataSource.getRepository(Viaje)

    // Limpiar datos existentes
    console.log("🧹 Limpiando datos existentes...")
    await registroRepository.delete({})
    await viajeRepository.delete({})
    await mantenimientoRepository.delete({})
    await camionRepository.delete({})
    await camioneroRepository.delete({})
    await usuarioRepository.delete({})

    // Crear usuarios de prueba
    console.log("👤 Creando usuarios de prueba...")
    const usuariosData = [
      {
        username: "tnn",
        password: "1234",
        role: "admin",
        email: "tnn@petrocontrol.local",
      },
      {
        username: "admin",
        password: "admin123",
        role: "admin",
        email: "admin@petrocontrol.local",
      },
      {
        username: "operador",
        password: "operador123",
        role: "operador",
        email: "operador@petrocontrol.local",
      },
    ]

    for (const userData of usuariosData) {
      const hashedPassword = hashPassword(userData.password)
      const usuario = usuarioRepository.create({
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
        email: userData.email,
      })
      await usuarioRepository.save(usuario)
      console.log(`✅ Usuario ${userData.username} creado`)
    }

    // Crear camioneros
    console.log("🚛 Creando camioneros...")
    const camionerosData = [
      {
        nombre: "Juan",
        apellido: "Pérez",
        cedula: "12345678",
        licencia: "LIC001",
        telefono: "555-0001",
        email: "juan.perez@petrocontrol.local",
        fechaNacimiento: new Date("1980-05-15"),
        fechaVencimientoLicencia: new Date("2025-12-31"),
        estado: "activo",
        horasConducidas: 120,
        enDescanso: false,
      },
      {
        nombre: "María",
        apellido: "González",
        cedula: "87654321",
        licencia: "LIC002",
        telefono: "555-0002",
        email: "maria.gonzalez@petrocontrol.local",
        fechaNacimiento: new Date("1985-08-22"),
        fechaVencimientoLicencia: new Date("2026-06-30"),
        estado: "activo",
        horasConducidas: 95,
        enDescanso: true,
      },
    ]

    // Array tipado explícitamente para camioneros
    const camionerosSaved: Camionero[] = []
    for (const camioneroData of camionerosData) {
      const camionero = camioneroRepository.create(camioneroData)
      const savedCamionero = await camioneroRepository.save(camionero)
      camionerosSaved.push(savedCamionero)
      console.log(`✅ Camionero ${camioneroData.nombre} ${camioneroData.apellido} creado`)
    }

    // Crear camiones
    console.log("🚚 Creando camiones...")
    const camionesData = [
      {
        camionId: "C-001",
        placa: "ABC123",
        marca: "Volvo",
        modelo: "FH16",
        año: 2020,
        capacidad: 15000,
        estado: "activo",
        kilometraje: 150000,
        tipoVehiculo: "carga_general",
        camioneroId: camionerosSaved[0]?.id || null,
        notas: "Camión en excelente estado",
      },
      {
        camionId: "C-002",
        placa: "DEF456",
        marca: "Scania",
        modelo: "R450",
        año: 2019,
        capacidad: 12000,
        estado: "activo",
        kilometraje: 200000,
        tipoVehiculo: "carga_general",
        camioneroId: camionerosSaved[1]?.id || null,
        notas: "Mantenimiento reciente",
      },
      {
        camionId: "C-003",
        placa: "GHI789",
        marca: "Mercedes",
        modelo: "Actros",
        año: 2021,
        capacidad: 18000,
        estado: "mantenimiento",
        kilometraje: 80000,
        tipoVehiculo: "carga_general",
        camioneroId: null,
        notas: "En revisión técnica",
      },
    ]

    // Array tipado explícitamente para camiones
    const camionesSaved: Camion[] = []
    for (const camionData of camionesData) {
      const camion = camionRepository.create(camionData)
      const savedCamion = await camionRepository.save(camion)
      camionesSaved.push(savedCamion)
      console.log(`✅ Camión ${camionData.camionId} creado`)
    }

    // Crear registros de ejemplo
    console.log("📋 Creando registros de ejemplo...")
    const registrosData = [
      {
        camionId: "C-001",
        conductor: "Juan Pérez",
        fechaHora: new Date("2024-08-15T08:00:00"),
        tipoPetroleo: "crudo",
        cantidad: 5000,
        tipo: "entrada",
        origen: "Refinería Norte",
        destino: null,
        observaciones: "Carga completa de crudo",
      },
      {
        camionId: "C-002",
        conductor: "María González",
        fechaHora: new Date("2024-08-16T14:30:00"),
        tipoPetroleo: "diesel",
        cantidad: 3000,
        tipo: "salida",
        origen: null,
        destino: "Estación Sur",
        observaciones: "Entrega programada de diesel",
      },
      {
        camionId: "C-001",
        conductor: "Juan Pérez",
        fechaHora: new Date("2024-08-17T10:15:00"),
        tipoPetroleo: "gasolina",
        cantidad: 2500,
        tipo: "entrada",
        origen: "Terminal Central",
        destino: null,
        observaciones: "Recarga de gasolina premium",
      },
    ]

    for (const registroData of registrosData) {
      const registro = registroRepository.create(registroData)
      await registroRepository.save(registro)
      console.log(`✅ Registro ${registro.tipo} creado`)
    }

    // Crear mantenimientos
    console.log("🔧 Creando mantenimientos...")
    if (camionesSaved.length > 2 && camionesSaved[2]) {
      const mantenimientosData = [
        {
          camionId: camionesSaved[2].id,
          tipoMantenimiento: "preventivo",
          descripcion: "Cambio de aceite y filtros",
          fechaIngreso: new Date("2024-08-10T10:00:00"),
          costoManoObra: 150000,
          costoRepuestos: 250000,
          costoTotal: 400000,
          taller: "Taller Central",
          estado: "en_proceso",
          observaciones: "Mantenimiento rutinario",
        },
      ]

      for (const mantenimientoData of mantenimientosData) {
        const mantenimiento = mantenimientoRepository.create(mantenimientoData)
        await mantenimientoRepository.save(mantenimiento)
        console.log(`✅ Mantenimiento creado`)
      }
    }

    // Crear viajes
    console.log("🛣️ Creando viajes...")
    if (camionesSaved.length > 0 && camionerosSaved.length > 0 && camionesSaved[0] && camionerosSaved[0]) {
      const viajesData = [
        {
          camionId: camionesSaved[0].id,
          camioneroId: camionerosSaved[0].id,
          origen: "Bogotá",
          destino: "Medellín",
          distanciaKm: 415,
          cargaKg: 20000,
          fechaSalida: new Date("2024-08-15T14:15:00"),
          fechaLlegada: new Date("2024-08-16T08:30:00"),
          estado: "completado",
          observaciones: "Entrega exitosa",
        },
      ]

      for (const viajeData of viajesData) {
        const viaje = viajeRepository.create(viajeData)
        await viajeRepository.save(viaje)
        console.log(`✅ Viaje creado`)
      }
    }

    console.log("")
    console.log("🎉 BASE DE DATOS POBLADA EXITOSAMENTE")
    console.log("")
    console.log("📋 CREDENCIALES DE ACCESO:")
    console.log("========================")
    console.log("Usuario: tnn")
    console.log("Contraseña: 1234")
    console.log("========================")
  } catch (error) {
    console.error("❌ Error al poblar la base de datos:", error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log("🔌 Conexión cerrada")
    }
  }
}

seedDatabase()
