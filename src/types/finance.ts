export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  created_at: string;
  category?: Category;
  balanceAfter?: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  category?: Category;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: {
    category: Category;
    amount: number;
    percentage: number;
  }[];
}
