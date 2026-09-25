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
import { CustomerEntity } from './customer.entity';
import { TransactionStatusEntity } from './transaction.status.entity';
import { DeliveryEntity } from './delivery.entity';
import { OrderItemEntity } from './order.item.entity';

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string;
  @Column({ type: 'varchar' })
  declare payment_reference: string;
  @ManyToOne(() => TransactionStatusEntity, (status) => status.transactions)
  @JoinColumn({ name: 'status_id' })
  declare status: string;
  @ManyToOne(() => CustomerEntity, (customer) => customer.transactions)
  @JoinColumn({ name: 'customer_uuid' })
  declare customer: CustomerEntity;
  @OneToOne(() => DeliveryEntity, (delivery) => delivery.transaction)
  declare delivery: DeliveryEntity;
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  declare total: number;
  @OneToMany(() => OrderItemEntity, (item) => item.transaction)
  declare items: OrderItemEntity[];
  @CreateDateColumn()
  declare create_at: string;
  @UpdateDateColumn()
  declare update_at: string;
}
