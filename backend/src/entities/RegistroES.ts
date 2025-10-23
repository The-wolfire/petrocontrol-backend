import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { Camion } from "./Camion"

@Entity("registros_es")
export class RegistroES {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 100 })
  conductor: string

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaHora: Date

  @Column({ type: "varchar", length: 50 })
  tipoPetroleo: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  cantidad: number

  @Column({ type: "varchar", length: 20 })
  tipo: string

  @Column({ type: "varchar", length: 100, nullable: true })
  origen: string

  @Column({ type: "varchar", length: 100, nullable: true })
  destino: string

  @Column({ type: "text", nullable: true })
  observaciones: string

  @ManyToOne(
    () => Camion,
    (camion) => camion.registros,
  )
  @JoinColumn({ name: "camionId" }) // Esta anotación crea automáticamente la columna foreign key
  camion: Camion

  @CreateDateColumn()
  fechaCreacion: Date
}