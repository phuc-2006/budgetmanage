import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCategories } from './useCategories';
import { useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { z } from 'zod';

const transactionRowSchema = z.object({
  'Ngày': z.string().min(1, 'Ngày không được để trống'),
  'Loại': z.string().min(1, 'Loại không được để trống'),
  'Danh mục': z.string().optional(),
  'Số tiền': z.number().positive('Số tiền phải lớn hơn 0'),
  'Mô tả': z.string().optional(),
});

export function useImportTransactions() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const importFromExcel = async (file: File) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để nhập dữ liệu');
      return { success: false, imported: 0, errors: 0 };
    }

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('File Excel không có dữ liệu');
        setIsImporting(false);
        return { success: false, imported: 0, errors: 0 };
      }

      let imported = 0;
      let errors = 0;

      for (const row of jsonData) {
        try {
          // Validate row data
          const validatedRow = transactionRowSchema.parse(row);
          
          // Parse date - support formats: YYYY-MM-DD, DD/MM/YYYY
          let dateStr = validatedRow['Ngày'];
          let parsedDate: string;
          
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
              throw new Error('Định dạng ngày không hợp lệ');
            }
          } else {
            parsedDate = dateStr;
          }

          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(parsedDate)) {
            throw new Error('Định dạng ngày không hợp lệ');
          }

          // Parse type
          const typeValue = validatedRow['Loại'];
          const type = typeValue === 'Thu nhập' ? 'income' : 'expense';

          // Find category by name
          const categoryName = validatedRow['Danh mục'] || '';
          const category = categories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase() && c.type === type
          );

          // Insert transaction
          const { error } = await supabase.from('transactions').insert({
            user_id: user.id,
            date: parsedDate,
            type,
            category_id: category?.id || null,
            amount: validatedRow['Số tiền'],
            description: validatedRow['Mô tả'] || null,
          });

          if (error) {
            console.error('Insert error:', error);
            errors++;
          } else {
            imported++;
          }
        } catch (err) {
          console.error('Row validation error:', err);
          errors++;
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions-export'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-all-time'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-opening-balance'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-trend'] });

      if (imported > 0) {
        toast.success(`Đã nhập thành công ${imported} giao dịch`);
      }
      if (errors > 0) {
        toast.warning(`${errors} dòng không thể nhập do lỗi định dạng`);
      }

      setIsImporting(false);
      return { success: true, imported, errors };
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Lỗi khi đọc file Excel');
      setIsImporting(false);
      return { success: false, imported: 0, errors: 0 };
    }
  };

  return {
    importFromExcel,
    isImporting,
  };
}
