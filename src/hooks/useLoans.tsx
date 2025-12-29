import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan, LoanPayment, LoanWithPayments } from '@/types/loan';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useLoans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;

      // Fetch payments for all loans
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('user_id', user.id);

      if (paymentsError) throw paymentsError;

      // Calculate totals for each loan
      const loansWithPayments: LoanWithPayments[] = (loansData as Loan[]).map(loan => {
        const loanPayments = (paymentsData as LoanPayment[]).filter(p => p.loan_id === loan.id);
        const total_paid = loanPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
          ...loan,
          payments: loanPayments,
          total_paid,
          remaining: Number(loan.amount) - total_paid,
        };
      });

      return loansWithPayments;
    },
    enabled: !!user,
  });

  const addLoan = useMutation({
    mutationFn: async (loan: {
      borrower_name: string;
      amount: number;
      interest_rate?: number;
      start_date: string;
      due_date?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('loans')
        .insert({
          ...loan,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Đã thêm khoản cho vay!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      const { error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Đã cập nhật khoản vay!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Đã xóa khoản vay!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment: {
      loan_id: string;
      amount: number;
      payment_date: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('loan_payments')
        .insert({
          ...payment,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Đã ghi nhận thanh toán!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loan_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Đã xóa thanh toán!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  // Calculate totals
  const totalLent = loans.reduce((sum, loan) => sum + Number(loan.amount), 0);
  const totalReceived = loans.reduce((sum, loan) => sum + loan.total_paid, 0);
  const totalOutstanding = loans.reduce((sum, loan) => 
    loan.status !== 'paid' ? sum + loan.remaining : sum, 0
  );

  return {
    loans,
    isLoading,
    addLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    deletePayment,
    totalLent,
    totalReceived,
    totalOutstanding,
  };
}
