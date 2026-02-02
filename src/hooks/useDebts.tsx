import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Contact, Debt, DebtWithContact, ContactWithBalance } from '@/types/debt';

export function useDebts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });

  // Fetch debts with contacts
  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*, contact:contacts(*)')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as DebtWithContact[];
    },
    enabled: !!user,
  });

  // Calculate contacts with balance
  const contactsWithBalance: ContactWithBalance[] = contacts.map(contact => {
    const contactDebts = debts.filter(d => d.contact_id === contact.id && !d.is_paid);
    const total_lent = contactDebts
      .filter(d => d.type === 'lend')
      .reduce((sum, d) => sum + Number(d.amount), 0);
    const total_borrowed = contactDebts
      .filter(d => d.type === 'borrow')
      .reduce((sum, d) => sum + Number(d.amount), 0);
    return {
      ...contact,
      total_lent,
      total_borrowed,
      balance: total_lent - total_borrowed,
    };
  });

  // Summary
  const totalLent = contactsWithBalance.reduce((sum, c) => sum + c.total_lent, 0);
  const totalBorrowed = contactsWithBalance.reduce((sum, c) => sum + c.total_borrowed, 0);
  const netBalance = totalLent - totalBorrowed;

  // Add contact
  const addContact = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ user_id: user!.id, name })
        .select()
        .single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  // Delete contact
  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
      toast({ title: 'Đã xóa liên hệ' });
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  // Add debt
  const addDebt = useMutation({
    mutationFn: async (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'is_paid'>) => {
      const { error } = await supabase
        .from('debts')
        .insert({ ...debt, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
      toast({ title: 'Đã thêm khoản nợ' });
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle paid status
  const togglePaid = useMutation({
    mutationFn: async ({ id, is_paid }: { id: string; is_paid: boolean }) => {
      const { error } = await supabase
        .from('debts')
        .update({ is_paid })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  // Delete debt
  const deleteDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
      toast({ title: 'Đã xóa khoản nợ' });
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  return {
    contacts,
    contactsWithBalance,
    debts,
    isLoading: contactsLoading || debtsLoading,
    totalLent,
    totalBorrowed,
    netBalance,
    addContact,
    deleteContact,
    addDebt,
    togglePaid,
    deleteDebt,
  };
}
