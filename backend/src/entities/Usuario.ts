import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("usuario")
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  username!: string

  @Column()
  password!: string

  @Column({ unique: true })
  email!: string

  @Column({ default: "operador" })
  role!: string

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date
}
