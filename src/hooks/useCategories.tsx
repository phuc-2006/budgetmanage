import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, TransactionType } from '@/types/finance';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useCategories(type?: TransactionType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id, type],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const addCategory = useMutation({
    mutationFn: async (category: {
      name: string;
      type: TransactionType;
      icon?: string;
      color?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã thêm danh mục!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã xóa danh mục!');
    },
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return {
    categories,
    expenseCategories,
    incomeCategories,
    isLoading,
    addCategory,
    deleteCategory,
  };
}
