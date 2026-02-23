
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string; // ID of the user (client)

  @Column({ nullable: true })
  clientName: string; // Name of the client, if known

  @Column({ nullable: true })
  attendantId: string; // ID of the attendant, if any

  @Column({ default: 'active' }) // active, closed, paused
  status: string;

  @Column({ default: true })
  isAiEnabled: boolean; // If false, AI stops responding

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
