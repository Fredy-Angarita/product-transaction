import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity('customer')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;
  @Column({ type: 'varchar', length: 150 })
  declare name: string;
  @Column({ type: 'varchar', length: 150 })
  declare lastName: string;
  @Column({ type: 'varchar', length: 50 })
  declare identificationNumber: string;
  @Column({ type: 'varchar', length: 200 })
  declare email: string;
  @OneToMany(() => TransactionEntity, (transaction) => transaction.customer)
  declare transactions: TransactionEntity[];
}
