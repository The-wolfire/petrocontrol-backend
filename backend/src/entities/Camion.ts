import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { RegistroES } from "./RegistroES"
import { Mantenimiento } from "./Mantenimiento"
import { Viaje } from "./Viaje"
import { Camionero } from "./Camionero"

@Entity("camion")
export class Camion {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  camionId!: string

  @Column()
  placa!: string

  @Column()
  marca!: string

  @Column()
  modelo!: string

  @Column()
  año!: number

  @Column("decimal", { precision: 10, scale: 2 })
  capacidad!: number

  @Column({ default: "activo" })
  estado!: string

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  kilometraje!: number

  @Column({ default: "carga_general" })
  tipoVehiculo!: string

  @Column({ nullable: true, type: "text" })
  notas!: string | null

  // ✅ Relación con Camionero
  @Column({ nullable: true })
  camioneroId!: number | null

  @ManyToOne(() => Camionero, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "camioneroId" })
  camionero!: Camionero | null

  // ✅ Relaciones inversas
  @OneToMany(
    () => RegistroES,
    (registro) => registro.camion,
  )
  registros!: RegistroES[]

  @OneToMany(
    () => Mantenimiento,
    (mantenimiento) => mantenimiento.camion,
  )
  mantenimientos!: Mantenimiento[]

  @OneToMany(
    () => Viaje,
    (viaje) => viaje.camion,
  )
  viajes!: Viaje[]

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date

  // ✅ Método para calcular estado
  calcularEstado(): string {
    if (this.estado === "mantenimiento") return "En mantenimiento"
    if (this.estado === "inactivo") return "Inactivo"
    if (this.mantenimientos && this.mantenimientos.some((m) => m.estado === "en_proceso")) {
      return "En mantenimiento"
    }
    return "Disponible"
  }
}
