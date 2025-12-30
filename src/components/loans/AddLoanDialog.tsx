import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLoans } from '@/hooks/useLoans';

interface Borrower {
  id: string;
  name: string;
  amount: string;
}

export function AddLoanDialog() {
  const [open, setOpen] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([
    { id: crypto.randomUUID(), name: '', amount: '' }
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { addLoan } = useLoans();

  const addBorrower = () => {
    setBorrowers([...borrowers, { id: crypto.randomUUID(), name: '', amount: '' }]);
  };

  const removeBorrower = (id: string) => {
    if (borrowers.length > 1) {
      setBorrowers(borrowers.filter(b => b.id !== id));
    }
  };

  const updateBorrower = (id: string, field: 'name' | 'amount', value: string) => {
    setBorrowers(borrowers.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const totalAmount = borrowers.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const validBorrowers = borrowers.filter(b => b.name.trim() && parseFloat(b.amount) > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validBorrowers.length === 0) return;

    for (const borrower of validBorrowers) {
      await addLoan.mutateAsync({
        borrower_name: borrower.name.trim(),
        amount: parseFloat(borrower.amount),
        interest_rate: 0,
        start_date: date,
        notes: notes.trim() || undefined,
      });
    }

    setBorrowers([{ id: crypto.randomUUID(), name: '', amount: '' }]);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setOpen(false);
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Người nợ & Số tiền (VNĐ)</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addBorrower}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                Thêm người
              </Button>
            </div>
            
            <div className="space-y-2">
              {borrowers.map((borrower) => (
                <div key={borrower.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Tên"
                    value={borrower.name}
                    onChange={(e) => updateBorrower(borrower.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={borrower.amount}
                    onChange={(e) => updateBorrower(borrower.id, 'amount', e.target.value)}
                    className="w-28 text-right font-bold"
                    min="0"
                  />
                  {borrowers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeBorrower(borrower.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {totalAmount > 0 && (
              <div className="text-sm text-muted-foreground text-right pt-1">
                Tổng: <span className="font-semibold text-foreground">{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
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
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả chi tiết..."
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary"
            disabled={addLoan.isPending || validBorrowers.length === 0}
          >
            {addLoan.isPending ? 'Đang xử lý...' : `Thêm khoản nợ`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
