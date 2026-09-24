import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 150 })
  name: string;
  @Column({ type: 'text' })
  image: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;
  @Column({ type: 'int' })
  quantity: number;
}
