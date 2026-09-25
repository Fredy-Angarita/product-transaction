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
  @Column({ name: 'postal_code', type: 'varchar', length: 50 })
  declare postalCode: string;
  @Column({ type: 'text' })
  declare additionalInfo: string;
  @Column({ name: 'transaction_id', type: 'uuid', nullable: true })
  declare transactionId: string | null;
  @OneToOne(() => TransactionEntity, (transaction) => transaction.delivery, {
    nullable: true,
  })
  @JoinColumn({ name: 'transaction_id' })
  declare transaction: TransactionEntity | null;
}
