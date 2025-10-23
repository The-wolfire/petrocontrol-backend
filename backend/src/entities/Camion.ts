import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { RegistroES } from "./RegistroES"
import { Camionero } from "./Camionero"
import { Mantenimiento } from "./Mantenimiento"
import { Viaje } from "./Viaje"

@Entity("camiones")
export class Camion {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 50, unique: true })
  camionId: string

  @Column({ type: "varchar", length: 20, unique: true })
  placa: string

  @Column({ type: "varchar", length: 50 })
  marca: string

  @Column({ type: "varchar", length: 50 })
  modelo: string

  @Column({ type: "int" })
  año: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  capacidad: number

  @Column({ type: "varchar", length: 20, default: "activo" })
  estado: string

  @Column({ type: "int", default: 0 })
  kilometraje: number

  @Column({ type: "varchar", length: 30, default: "carga_general" })
  tipoVehiculo: string

  @Column({ type: "text", nullable: true })
  observaciones: string

  @Column({ type: "text", nullable: true })
  notas: string

  @Column({ type: "int", nullable: true })
  camioneroId: number

  @OneToMany(
    () => RegistroES,
    (registro) => registro.camion,
  )
  registros: RegistroES[]

  @ManyToOne(
    () => Camionero,
    (camionero) => camionero.camiones,
  )
  @JoinColumn({ name: "camioneroId" })
  camionero: Camionero

  @OneToMany(
    () => Mantenimiento,
    (mantenimiento) => mantenimiento.camion,
  )
  mantenimientos: Mantenimiento[]

  @OneToMany(
    () => Viaje,
    (viaje) => viaje.camion,
  )
  viajes: Viaje[]

  @CreateDateColumn()
  fechaCreacion: Date

  @UpdateDateColumn()
  fechaActualizacion: Date

  calcularEstado(): string {
    if (!this.registros || this.registros.length === 0) {
      return "disponible"
    }

    const registrosOrdenados = this.registros.sort(
      (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
    )

    const ultimoRegistro = registrosOrdenados[0]
    return ultimoRegistro.tipo === "entrada" ? "disponible" : "en_ruta"
  }
}
