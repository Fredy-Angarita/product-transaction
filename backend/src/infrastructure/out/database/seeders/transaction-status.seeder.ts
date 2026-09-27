import { dataSourceInstance } from '../config/data.source';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';

const STATUSES = [
  { id: 1, status: 'PENDING' },
  { id: 2, status: 'APPROVED' },
  { id: 3, status: 'DECLINED' },
  { id: 4, status: 'VOIDED' },
  { id: 5, status: 'ERROR' },
];

export async function seedTransactionStatuses(): Promise<void> {
  await dataSourceInstance.initialize();

  const repository = dataSourceInstance.getRepository(TransactionStatusEntity);

  await repository.upsert(STATUSES, ['id']);

  await dataSourceInstance.query(`
    SELECT setval(
      pg_get_serial_sequence('"transaction-status"', 'id'),
      (SELECT MAX(id) FROM "transaction-status")
    )
  `);

  console.log('Transaction statuses seeded');

  await dataSourceInstance.destroy();
}

seedTransactionStatuses().catch((error) => {
  console.error('Error seeding transaction statuses:', error);
  process.exit(1);
});
