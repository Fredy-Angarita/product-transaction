import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity('delivery')
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;
  @Column({ type: 'varchar', length: 150 })
  declare country: string;
  @Column({ type: 'varchar', length: 150 })
  declare city: string;
  @Column({ type: 'varchar', length: 150 })
  declare locality: string;
  @Column({ type: 'varchar', length: 150 })
  declare subLocality: string;
  @Column()
  declare address: string;
  @Column({ type: 'varchar', length: 50 })
  declare postal_code: string;
  @Column({ type: 'text' })
  declare additionalInfo: string;
  @OneToOne(() => TransactionEntity, (transaction) => transaction.delivery)
  @JoinColumn({ name: 'transaction_id' })
  declare transaction: TransactionEntity;
}
