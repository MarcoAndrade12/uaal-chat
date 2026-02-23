
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  sender: 'client' | 'ai' | 'attendant';

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
