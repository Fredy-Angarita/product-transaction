export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  VOIDED = 'VOIDED',
  ERROR = 'ERROR',
}
export const WOMPI_STATUS_MAP: Record<string, TransactionStatusEnum> = {
  APPROVED: TransactionStatusEnum.APPROVED,
  DECLINED: TransactionStatusEnum.DECLINED,
  VOIDED: TransactionStatusEnum.VOIDED,
  ERROR: TransactionStatusEnum.ERROR,
};
