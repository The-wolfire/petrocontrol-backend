import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Camion } from "./Camion"
import { Camionero } from "./Camionero"

@Entity("viajes")
export class Viaje {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "int" })
  camionId: number

  @Column({ type: "int" })
  camioneroId: number

  @Column({ type: "varchar", length: 100 })
  origen: string

  @Column({ type: "varchar", length: 100 })
  destino: string

  @Column({ type: "int" })
  distanciaKm: number

  @Column({ type: "int" })
  cargaKg: number

  @Column({ type: "timestamp" })
  fechaSalida: Date

  @Column({ type: "timestamp", nullable: true })
  fechaLlegada: Date

  @Column({ type: "varchar", length: 30, default: "programado" })
  estado: string

  @Column({ type: "text", nullable: true })
  observaciones: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  combustibleConsumido: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  costoViaje: number

  @ManyToOne(
    () => Camion,
    (camion) => camion.viajes,
  )
  @JoinColumn({ name: "camionId" })
  camion: Camion

  @ManyToOne(
    () => Camionero,
    (camionero) => camionero.viajes,
  )
  @JoinColumn({ name: "camioneroId" })
  camionero: Camionero

  @CreateDateColumn()
  fechaCreacion: Date

  @UpdateDateColumn()
  fechaActualizacion: Date
}
