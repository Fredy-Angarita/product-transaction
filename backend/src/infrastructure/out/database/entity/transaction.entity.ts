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
  @Column({ name: 'payment_reference', type: 'varchar' })
  declare paymentReference: string;
  @Column({ name: 'status_id', type: 'int' })
  declare statusId: number;
  @ManyToOne(() => TransactionStatusEntity, (status) => status.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'status_id' })
  declare status: TransactionStatusEntity | null;
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
