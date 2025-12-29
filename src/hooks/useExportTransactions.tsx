import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Transaction } from '@/types/finance';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export function useExportTransactions() {
  const { user } = useAuth();

  const { data: allTransactions = [], isLoading, refetch } = useQuery({
    queryKey: ['all-transactions-export', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const exportToExcel = async () => {
    try {
      // Refetch to get latest data
      const result = await refetch();
      const transactions = result.data || [];

      if (transactions.length === 0) {
        toast.error('Không có giao dịch nào để xuất');
        return;
      }

      // Prepare data for Excel
      const excelData = transactions.map((t) => ({
        'Ngày': t.date,
        'Loại': t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        'Danh mục': t.category?.name || 'Không có',
        'Số tiền': Number(t.amount),
        'Mô tả': t.description || '',
        'Icon': t.category?.icon || '',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Ngày
        { wch: 10 }, // Loại
        { wch: 15 }, // Danh mục
        { wch: 15 }, // Số tiền
        { wch: 30 }, // Mô tả
        { wch: 5 },  // Icon
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Giao dịch');

      // Generate filename with date
      const today = new Date();
      const filename = `giao-dich_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      toast.success('Đã xuất file Excel thành công!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  return {
    exportToExcel,
    isLoading,
    transactionCount: allTransactions.length,
  };
}
