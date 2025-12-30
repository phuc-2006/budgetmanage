import { useState } from 'react';
import { Plus, Minus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebts } from '@/hooks/useDebts';
import { cn } from '@/lib/utils';

export function AddDebtDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'lend' | 'borrow'>('lend');
  const [amount, setAmount] = useState('');
  const [contactId, setContactId] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { contacts, addContact, addDebt } = useDebts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    let finalContactId = contactId;

    // Create new contact if needed
    if (showNewContact && newContactName.trim()) {
      const newContact = await addContact.mutateAsync(newContactName.trim());
      finalContactId = newContact.id;
    }

    if (!finalContactId) return;

    await addDebt.mutateAsync({
      contact_id: finalContactId,
      amount: parseFloat(amount),
      type,
      date,
      description: description || null,
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setContactId('');
    setNewContactName('');
    setShowNewContact(false);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="w-4 h-4 mr-2" />
          Thêm khoản nợ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm khoản nợ mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={type} onValueChange={(v) => setType(v as 'lend' | 'borrow')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lend" className="data-[state=active]:bg-income data-[state=active]:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Cho vay
              </TabsTrigger>
              <TabsTrigger value="borrow" className="data-[state=active]:bg-expense data-[state=active]:text-white">
                <Minus className="w-4 h-4 mr-2" />
                Đi vay
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền (VNĐ)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xl font-bold"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Người {type === 'lend' ? 'vay' : 'cho vay'}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewContact(!showNewContact)}
                className="h-7 text-xs gap-1"
              >
                <UserPlus className="w-3 h-3" />
                {showNewContact ? 'Chọn từ danh sách' : 'Thêm mới'}
              </Button>
            </div>

            {showNewContact ? (
              <Input
                placeholder="Nhập tên người mới"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                required
              />
            ) : (
              <Select value={contactId} onValueChange={setContactId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Ngày</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full",
              type === 'lend' ? 'gradient-success' : 'gradient-expense'
            )}
            disabled={addDebt.isPending || addContact.isPending}
          >
            {addDebt.isPending ? 'Đang xử lý...' : `Thêm khoản ${type === 'lend' ? 'cho vay' : 'đi vay'}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
