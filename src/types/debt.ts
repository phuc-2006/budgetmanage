export interface Contact {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  contact_id: string;
  amount: number;
  type: 'lend' | 'borrow'; // lend = họ nợ mình, borrow = mình nợ họ
  date: string;
  description: string | null;
  is_paid: boolean;
  created_at: string;
}

export interface DebtWithContact extends Debt {
  contact: Contact;
}

export interface ContactWithBalance extends Contact {
  total_lent: number; // họ nợ mình
  total_borrowed: number; // mình nợ họ
  balance: number; // dương = họ nợ mình, âm = mình nợ họ
}
