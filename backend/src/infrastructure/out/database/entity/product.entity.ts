import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItemEntity } from './order.item.entity';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;
  @Column({ type: 'varchar', length: 150 })
  declare name: string;
  @Column({ type: 'text' })
  declare image: string;
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  declare price: number;
  @Column({ type: 'int' })
  declare quantity: number;
  @OneToMany(() => OrderItemEntity, (item) => item.product)
  declare orderItems: OrderItemEntity[];
}
