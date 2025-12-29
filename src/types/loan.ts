export interface Loan {
  id: string;
  user_id: string;
  borrower_name: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  due_date: string | null;
  notes: string | null;
  status: 'active' | 'paid' | 'overdue';
  created_at: string;
  payments?: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export interface LoanWithPayments extends Loan {
  total_paid: number;
  remaining: number;
}
