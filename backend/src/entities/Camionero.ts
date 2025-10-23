import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Camion } from "./Camion"
import { Viaje } from "./Viaje"

@Entity("camioneros")
export class Camionero {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 100 })
  nombre: string

  @Column({ type: "varchar", length: 100 })
  apellido: string

  @Column({ type: "varchar", length: 20, unique: true })
  cedula: string

  @Column({ type: "varchar", length: 50, unique: true })
  licencia: string

  @Column({ type: "varchar", length: 20 })
  telefono: string

  @Column({ type: "varchar", length: 100, unique: true })
  email: string

  @Column({ type: "date" })
  fechaNacimiento: Date

  @Column({ type: "date" })
  fechaVencimientoLicencia: Date

  @Column({ type: "varchar", length: 20, default: "activo" })
  estado: string

  @Column({ type: "int", default: 0 })
  horasConducidas: number

  @Column({ type: "boolean", default: false })
  enDescanso: boolean

  @Column({ type: "text", nullable: true })
  observaciones: string

  @OneToMany(
    () => Camion,
    (camion) => camion.camionero,
  )
  camiones: Camion[]

  @OneToMany(
    () => Viaje,
    (viaje) => viaje.camionero,
  )
  viajes: Viaje[]

  @CreateDateColumn()
  fechaCreacion: Date

  @UpdateDateColumn()
  fechaActualizacion: Date
}
