export interface TransactionResponseRaw {
  data: {
    id: string;
    reference: string;
    status: string;
    amount_in_cents: number;
    currency: string;
    payment_method_type: string;
    status_message: string;
  };
}
