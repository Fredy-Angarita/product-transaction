import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity('transaction-status')
export class TransactionStatusEntity {
  @PrimaryGeneratedColumn()
  declare id: number;
  @Column({ type: 'varchar', length: 50 })
  declare status: string;
  @OneToMany(() => TransactionEntity, (transaction) => transaction.status)
  declare transactions: TransactionEntity[];
}
