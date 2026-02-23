
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('chat_prompts')
export class ChatPrompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column('text')
  content: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
