import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @Column({ unique: true, nullable: true })
  email: string

  @Column({ default: "operador" })
  role: string

  @CreateDateColumn()
  createdAt: Date
}
