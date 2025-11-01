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

@Entity("registro_es")
export class RegistroES {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  camionId!: string

  // ✅ Relación con Camion usando camionId como string
  @ManyToOne(
    () => Camion,
    (camion) => camion.registros,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "camionId", referencedColumnName: "camionId" })
  camion!: Camion

  @Column()
  conductor!: string

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaHora!: Date

  @Column()
  tipoPetroleo!: string

  @Column("decimal", { precision: 10, scale: 2 })
  cantidad!: number

  @Column()
  tipo!: string // "entrada" o "salida"

  @Column({ type: "varchar", nullable: true }) // CAMBIADO: tipo explícito
  origen!: string | null

  @Column({ type: "varchar", nullable: true }) // CAMBIADO: tipo explícito
  destino!: string | null

  @Column({ type: "text", nullable: true }) // CAMBIADO: tipo explícito
  observaciones!: string | null

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date
}