import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { DebtWithContact } from '@/types/debt';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export function useExportDebts() {
  const { user } = useAuth();

  const { data: allDebts = [], isLoading, refetch } = useQuery({
    queryKey: ['all-debts-export', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('debts')
        .select('*, contact:contacts(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as DebtWithContact[];
    },
    enabled: !!user,
  });

  const exportToExcel = async () => {
    try {
      const result = await refetch();
      const debts = result.data || [];

      if (debts.length === 0) {
        toast.error('Không có khoản nợ nào để xuất');
        return;
      }

      const excelData = debts.map((d) => ({
        'Ngày': d.date,
        'Loại': d.type === 'lend' ? 'Cho vay' : 'Đi vay',
        'Liên hệ': d.contact?.name || '',
        'Số tiền': Number(d.amount),
        'Mô tả': d.description || '',
        'Đã trả': d.is_paid ? 'Có' : 'Không',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 8 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Khoản nợ');

      const today = new Date();
      const filename = `khoan-no_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Đã xuất file Excel thành công!');
    } catch (error) {
      console.error('Export debts error:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  return {
    exportToExcel,
    isLoading,
    debtCount: allDebts.length,
  };
}
