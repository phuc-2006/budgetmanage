import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType } from '@/types/finance';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useTransactions(month?: number, year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const selectedMonth = month ?? currentDate.getMonth() + 1;
  const selectedYear = year ?? currentDate.getFullYear();

  // Format date without timezone conversion (toISOString converts to UTC which shifts dates)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startDate = formatDate(new Date(selectedYear, selectedMonth - 1, 1));
  const endDate = formatDate(new Date(selectedYear, selectedMonth, 0));

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions', user?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user) return [];

      if (import.meta.env.DEV) {
        console.debug('[useTransactions] range', {
          selectedMonth,
          selectedYear,
          startDate,
          endDate,
        });
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: {
      category_id: string | null;
      amount: number;
      type: TransactionType;
      description?: string;
      date: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Đã thêm giao dịch thành công!');
    },
    onError: (error) => {
      toast.error('Lỗi khi thêm giao dịch: ' + error.message);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Đã xóa giao dịch!');
    },
    onError: (error) => {
      toast.error('Lỗi khi xóa giao dịch: ' + error.message);
    },
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    isLoading,
    refetch,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
    selectedMonth,
    selectedYear,
  };
}
