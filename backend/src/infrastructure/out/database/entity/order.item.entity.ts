import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { ProductEntity } from './product.entity';

@Entity('order_item')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;
  @Column({ name: 'transaction_id', type: 'uuid' })
  declare transactionId: string;
  @ManyToOne(() => TransactionEntity, (transaction) => transaction.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  declare transaction: TransactionEntity;
  @Column({ name: 'product_id', type: 'uuid' })
  declare productId: string;
  @ManyToOne(() => ProductEntity, (product) => product.orderItems, {
    nullable: false,
  })
  @JoinColumn({ name: 'product_id' })
  declare product: ProductEntity | null;
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  declare price: number;

  @Column({ type: 'int' })
  declare quantity: number;
}
