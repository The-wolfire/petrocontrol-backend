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

@Entity("mantenimientos")
export class Mantenimiento {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "int" })
  camionId: number

  @Column({ type: "varchar", length: 50 })
  tipoMantenimiento: string

  @Column({ type: "text" })
  descripcion: string

  @Column({ type: "timestamp" })
  fechaIngreso: Date

  @Column({ type: "timestamp", nullable: true })
  fechaSalida: Date

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  costoManoObra: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  costoRepuestos: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  costoTotal: number

  @Column({ type: "varchar", length: 100 })
  taller: string

  @Column({ type: "varchar", length: 30, default: "programado" })
  estado: string

  @Column({ type: "int", nullable: true })
  diasEnTaller: number

  @Column({ type: "text", nullable: true })
  observaciones: string

  @ManyToOne(
    () => Camion,
    (camion) => camion.mantenimientos,
  )
  @JoinColumn({ name: "camionId" })
  camion: Camion

  @CreateDateColumn()
  fechaCreacion: Date

  @UpdateDateColumn()
  fechaActualizacion: Date
}
