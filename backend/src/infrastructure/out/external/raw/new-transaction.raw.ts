export interface NewTransactionRaw {
  data: {
    id: string;
    reference: string;
    created_at: string;
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    payment_method_type: string;
    status: string;
  };
}
