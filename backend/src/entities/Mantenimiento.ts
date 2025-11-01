import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Camion } from "./Camion"

@Entity("mantenimiento")
export class Mantenimiento {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  camionId!: string

  // ✅ Relación con Camion usando camionId como string
  @ManyToOne(
    () => Camion,
    (camion) => camion.mantenimientos,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "camionId", referencedColumnName: "camionId" })
  camion!: Camion

  @Column()
  tipoMantenimiento!: string

  @Column({ type: "text" })
  descripcion!: string

  @Column({ type: "date" })
  fechaIngreso!: Date

  @Column({ type: "date", nullable: true })
  fechaSalida!: Date | null

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  costoManoObra!: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  costoRepuestos!: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  costoTotal!: number

  @Column({ default: "Taller no especificado" })
  taller!: string

  @Column({ default: "programado" })
  estado!: string // "programado", "en_proceso", "completado", "cancelado"

  @Column({ nullable: true, type: "text" })
  observaciones!: string | null

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date
}
