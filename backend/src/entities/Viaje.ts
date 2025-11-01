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
import { Camionero } from "./Camionero"

@Entity("viaje")
export class Viaje {
  @PrimaryGeneratedColumn()
  id!: number

  // ✅ Relación con Camion
  @Column()
  camionId!: number

  @ManyToOne(
    () => Camion,
    (camion) => camion.viajes,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "camionId" })
  camion!: Camion

  // ✅ Relación con Camionero
  @Column()
  camioneroId!: number

  @ManyToOne(
    () => Camionero,
    (camionero) => camionero.viajes,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "camioneroId" })
  camionero!: Camionero

  @Column()
  origen!: string

  @Column()
  destino!: string

  @Column("decimal", { precision: 10, scale: 2 })
  distanciaKm!: number

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  cargaKg!: number | null

@Column({ type: "timestamp" }) 
fechaSalida!: Date

@Column({ type: "timestamp", nullable: true }) 
fechaLlegada!: Date | null

  @Column({ default: "en_curso" })
  estado!: string

  @Column({ nullable: true, type: "text" })
  observaciones!: string | null

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date
}
