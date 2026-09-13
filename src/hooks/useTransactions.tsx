import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType } from '@/types/finance';
import { calculateMonthlyBalances, formatDateSafe } from '@/lib/balance';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useTransactions(month?: number, year?: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const selectedMonth = month ?? currentDate.getMonth() + 1;
  const selectedYear = year ?? currentDate.getFullYear();

  const startDate = formatDateSafe(new Date(selectedYear, selectedMonth - 1, 1));
  const endDate = formatDateSafe(new Date(selectedYear, selectedMonth, 0));

  const { data: rawTransactions = [], isLoading, refetch } = useQuery({
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

  // Query opening balance: sum of income - expense strictly before startDate
  const { data: openingBalance = 0, isLoading: isOpeningLoading } = useQuery({
    queryKey: ['transactions-opening-balance', user?.id, startDate],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .lt('date', startDate);

      if (error) throw error;

      const prevIncome = (data || [])
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const prevExpense = (data || [])
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return prevIncome - prevExpense;
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
      queryClient.invalidateQueries({ queryKey: ['transactions-all-time'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-opening-balance'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-trend'] });
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
      queryClient.invalidateQueries({ queryKey: ['transactions-all-time'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-opening-balance'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-trend'] });
      toast.success('Đã xóa giao dịch!');
    },
    onError: (error) => {
      toast.error('Lỗi khi xóa giao dịch: ' + error.message);
    },
  });

  // Calculate forward cumulative balance and monthly totals from openingBalance
  const {
    transactions,
    closingBalance,
    monthlyIncome,
    monthlyExpense,
  } = useMemo(() => {
    return calculateMonthlyBalances(rawTransactions, openingBalance);
  }, [rawTransactions, openingBalance]);

  // All-time totals query
  const { data: allTimeData } = useQuery({
    queryKey: ['transactions-all-time', user?.id],
    queryFn: async () => {
      if (!user) return { totalIncome: 0, totalExpense: 0 };

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalIncome = (data || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = (data || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { totalIncome, totalExpense };
    },
    enabled: !!user,
  });

  // Balance is all-time
  const allTimeIncome = allTimeData?.totalIncome ?? 0;
  const allTimeExpense = allTimeData?.totalExpense ?? 0;
  const balance = allTimeIncome - allTimeExpense;

  return {
    transactions,
    isLoading: isLoading || isOpeningLoading,
    refetch,
    addTransaction,
    deleteTransaction,
    // Income/expense are monthly
    totalIncome: monthlyIncome,
    totalExpense: monthlyExpense,
    openingBalance,
    closingBalance,
    // Balance is all-time
    balance,
    monthlyIncome,
    monthlyExpense,
    selectedMonth,
    selectedYear,
  };
}
