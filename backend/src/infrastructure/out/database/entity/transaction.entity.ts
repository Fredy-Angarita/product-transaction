import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatusEnum } from '../../../../../domain/models/transaction-status.enum';
import { CustomerEntity } from './customer.entity';
import { DeliveryEntity } from './delivery.entity';
import { OrderItemEntity } from './order.item.entity';

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string;

  @Column({ name: 'acceptance_token', type: 'varchar' })
  declare acceptanceToken: string;

  @Column({ name: 'accept_personal_auth', type: 'varchar' })
  declare acceptPersonalAuth: string;

  @Column({
    type: 'enum',
    enum: TransactionStatusEnum,
    default: TransactionStatusEnum.PENDING,
  })
  declare status: TransactionStatusEnum;

  @Column({ name: 'customer_uuid', type: 'uuid' })
  declare customerId: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'customer_uuid' })
  declare customer: CustomerEntity | null;

  @OneToOne(() => DeliveryEntity, (delivery) => delivery.transaction)
  declare delivery: DeliveryEntity | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  declare total: number;

  @OneToMany(() => OrderItemEntity, (item) => item.transaction)
  declare items: OrderItemEntity[];

  @CreateDateColumn({ name: 'create_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  declare updatedAt: Date;
}
