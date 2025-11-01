import "reflect-metadata"
import { AppDataSource } from "../config/data-source"
import { Usuario } from "../entities/Usuario"
import { Camion } from "../entities/Camion"
import { Camionero } from "../entities/Camionero"
import { RegistroES } from "../entities/RegistroES"
import { Mantenimiento } from "../entities/Mantenimiento"
import bcrypt from "bcrypt"

async function seed() {
  try {
    console.log("🌱 Iniciando seed de la base de datos...")

    await AppDataSource.initialize()
    console.log("✅ Conexión a la base de datos establecida")

    // Limpiar datos existentes (en orden inverso por dependencias FK)
    await AppDataSource.getRepository(Mantenimiento).clear()
    await AppDataSource.getRepository(RegistroES).clear()
    await AppDataSource.getRepository(Camion).clear()
    await AppDataSource.getRepository(Camionero).clear()
    await AppDataSource.getRepository(Usuario).clear()
    console.log("🧹 Datos existentes limpiados")

    // Crear usuarios
    const usuarioRepo = AppDataSource.getRepository(Usuario)
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const admin = usuarioRepo.create({
      username: "admin",
      password: hashedPassword,
      email: "admin@petrocontrol.com",
      role: "admin",
    })
    await usuarioRepo.save(admin)
    console.log("👤 Usuario admin creado")

    // Crear camioneros
    const camioneroRepo = AppDataSource.getRepository(Camionero)
    const camionerosData = [
      { nombre: "Juan", apellido: "Pérez", licencia: "LIC-001", telefono: "555-0001", estado: "disponible" },
      { nombre: "María", apellido: "González", licencia: "LIC-002", telefono: "555-0002", estado: "disponible" },
      { nombre: "Carlos", apellido: "Rodríguez", licencia: "LIC-003", telefono: "555-0003", estado: "en_viaje" },
    ]

    // ESPECIFICAR EL TIPO EXPLÍCITAMENTE
    const camionerosSaved: Camionero[] = []
    for (const data of camionerosData) {
      const camionero = camioneroRepo.create(data)
      const saved = await camioneroRepo.save(camionero)
      camionerosSaved.push(saved)
    }
    console.log("🚛 Camioneros creados")

    // Crear camiones
    const camionRepo = AppDataSource.getRepository(Camion)
    const camionesData = [
      {
        placa: "ABC-123",
        marca: "Volvo",
        modelo: "FH16",
        anio: 2020,
        capacidad: 40000,
        estado: "disponible",
        kilometraje: 50000,
      },
      {
        placa: "DEF-456",
        marca: "Scania",
        modelo: "R450",
        anio: 2021,
        capacidad: 45000,
        estado: "en_viaje",
        kilometraje: 30000,
      },
      {
        placa: "GHI-789",
        marca: "Mercedes-Benz",
        modelo: "Actros",
        anio: 2019,
        capacidad: 38000,
        estado: "mantenimiento",
        kilometraje: 80000,
      },
    ]

    // ESPECIFICAR EL TIPO EXPLÍCITAMENTE
    const camionesSaved: Camion[] = []
    for (const data of camionesData) {
      const camion = camionRepo.create(data)
      const saved = await camionRepo.save(camion)
      camionesSaved.push(saved)
    }
    console.log("🚚 Camiones creados")

    // Crear registros de entrada/salida
    const registroRepo = AppDataSource.getRepository(RegistroES)
    const registro1 = registroRepo.create({
      camion: camionesSaved[1],
      conductor: "Carlos Rodríguez",
      fechaHora: new Date(),
      tipoPetroleo: "Crudo",
      cantidad: 35000,
      tipo: "salida",
      origen: null,
      destino: "Refinería Norte",
      observaciones: "Carga completa",
    })
    await registroRepo.save(registro1)
    console.log(" Registros de entrada/salida creados")

    // Crear mantenimientos
    const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento)
    const mantenimiento1 = mantenimientoRepo.create({
      camion: camionesSaved[2],
      tipoMantenimiento: "preventivo",
      descripcion: "Cambio de aceite y filtros",
      fechaIngreso: new Date(),
      fechaSalida: null,
      costoManoObra: 300,
      costoRepuestos: 200,
      costoTotal: 500,
      taller: "Taller Central",
      estado: "en_proceso",
      observaciones: null,
    })
    await mantenimientoRepo.save(mantenimiento1)
    console.log(" Mantenimientos creados")

    console.log("\n Seed completado exitosamente!")
    console.log("\n Datos creados:")
    console.log("   - 1 Usuario admin (username: admin, password: admin123)")
    console.log("   - 3 Camioneros")
    console.log("   - 3 Camiones")
    console.log("   - 1 Registro de entrada/salida")
    console.log("   - 1 Mantenimiento")

    await AppDataSource.destroy()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error durante el seed:", error)
    process.exit(1)
  }
}

seed()