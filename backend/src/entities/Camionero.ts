import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Viaje } from "./Viaje"

@Entity("camionero")
export class Camionero {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar" })
  nombre!: string

  @Column({ type: "varchar" })
  apellido!: string

  @Column({ type: "varchar", unique: true })
  cedula!: string

  @Column({ type: "varchar" })
  licencia!: string

  @Column({ type: "varchar" })
  telefono!: string

  @Column({ type: "varchar", nullable: true })
  email!: string | null

  @Column({ type: "date" }) // ✅ CORREGIDO
  fechaNacimiento!: Date

  @Column({ type: "date", default: () => "CURRENT_DATE" }) // ✅ CORREGIDO
  fechaIngreso!: Date

  @Column({ type: "date", nullable: true }) // ✅ CORREGIDO
  fechaVencimientoLicencia!: Date | null

  @Column({ type: "varchar", default: "activo" })
  estado!: string

  @Column({ type: "int", default: 0 })
  horasConducidas!: number

  @Column({ type: "boolean", default: false })
  enDescanso!: boolean

  @Column({ type: "text", nullable: true })
  observaciones!: string | null

  // ✅ Relación con Viajes
  @OneToMany(
    () => Viaje,
    (viaje) => viaje.camionero,
  )
  viajes!: Viaje[]

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date

  // ✅ Métodos útiles
  obtenerUltimoViaje(): Date | null {
    if (!this.viajes || this.viajes.length === 0) return null
    const viajesOrdenados = this.viajes.sort(
      (a, b) => new Date(b.fechaSalida).getTime() - new Date(a.fechaSalida).getTime(),
    )
    return viajesOrdenados[0].fechaSalida
  }

  estaDisponible(): boolean {
    return this.estado === "activo" && !this.enDescanso
  }
}