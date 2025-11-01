import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Viaje } from "./Viaje"

@Entity("camionero")
export class Camionero {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  nombre!: string

  @Column()
  apellido!: string

  @Column({ unique: true })
  cedula!: string

  @Column()
  licencia!: string

  @Column()
  telefono!: string

  @Column({ nullable: true })
  email!: string | null

  @Column({ type: "date" })
  fechaNacimiento!: Date

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  fechaIngreso!: Date

  @Column({ type: "date", nullable: true })
  fechaVencimientoLicencia!: Date | null

  @Column({ default: "activo" })
  estado!: string

  @Column({ default: 0 })
  horasConducidas!: number

  @Column({ default: false })
  enDescanso!: boolean

  @Column({ nullable: true, type: "text" })
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
