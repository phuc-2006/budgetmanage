import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { z } from 'zod';

const debtRowSchema = z.object({
  'Ngày': z.string().min(1, 'Ngày không được để trống'),
  'Loại': z.string().min(1, 'Loại không được để trống'),
  'Liên hệ': z.string().min(1, 'Liên hệ không được để trống'),
  'Số tiền': z.number().positive('Số tiền phải lớn hơn 0'),
  'Mô tả': z.string().optional(),
  'Đã trả': z.string().optional(),
});

export function useImportDebts() {
  const { user } = useAuth();
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

      // Cache contacts to avoid duplicate lookups
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      const contactMap = new Map<string, string>();
      (existingContacts || []).forEach(c => contactMap.set(c.name.toLowerCase(), c.id));

      let imported = 0;
      let errors = 0;

      for (const row of jsonData) {
        try {
          const validatedRow = debtRowSchema.parse(row);

          // Parse date
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

          if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
            throw new Error('Định dạng ngày không hợp lệ');
          }

          // Parse type
          const type = validatedRow['Loại'] === 'Cho vay' ? 'lend' : 'borrow';

          // Find or create contact
          const contactName = validatedRow['Liên hệ'];
          let contactId = contactMap.get(contactName.toLowerCase());

          if (!contactId) {
            const { data: newContact, error: contactError } = await supabase
              .from('contacts')
              .insert({ user_id: user.id, name: contactName })
              .select()
              .single();
            if (contactError) throw contactError;
            contactId = newContact.id;
            contactMap.set(contactName.toLowerCase(), contactId);
          }

          const isPaid = validatedRow['Đã trả'] === 'Có';

          const { error } = await supabase.from('debts').insert({
            user_id: user.id,
            contact_id: contactId,
            date: parsedDate,
            type,
            amount: validatedRow['Số tiền'],
            description: validatedRow['Mô tả'] || null,
            is_paid: isPaid,
          });

          if (error) {
            console.error('Insert debt error:', error);
            errors++;
          } else {
            imported++;
          }
        } catch (err) {
          console.error('Row validation error:', err);
          errors++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['contacts', user.id] });
      queryClient.invalidateQueries({ queryKey: ['debts', user.id] });
      queryClient.invalidateQueries({ queryKey: ['all-debts-export', user.id] });

      if (imported > 0) {
        toast.success(`Đã nhập thành công ${imported} khoản nợ`);
      }
      if (errors > 0) {
        toast.warning(`${errors} dòng không thể nhập do lỗi định dạng`);
      }

      setIsImporting(false);
      return { success: true, imported, errors };
    } catch (error) {
      console.error('Import debts error:', error);
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
