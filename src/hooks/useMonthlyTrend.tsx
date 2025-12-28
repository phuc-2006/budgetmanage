import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MonthlyData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
}

export function useMonthlyTrend() {
  const { user } = useAuth();

  const { data: monthlyData = [], isLoading } = useQuery({
    queryKey: ['monthly-trend', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const months: MonthlyData[] = [];
      const today = new Date();

      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;

        const income = data
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expense = data
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        
        months.push({
          month: `${year}-${month.toString().padStart(2, '0')}`,
          monthLabel: `${monthNames[month - 1]}/${year.toString().slice(-2)}`,
          income,
          expense,
        });
      }

      return months;
    },
    enabled: !!user,
  });

  return { monthlyData, isLoading };
}
