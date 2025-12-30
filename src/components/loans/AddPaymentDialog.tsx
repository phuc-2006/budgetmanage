import { useState } from 'react';
import { Plus, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLoans } from '@/hooks/useLoans';
import { LoanWithPayments } from '@/types/loan';
import { formatCurrency } from '@/lib/format';

interface AddPaymentDialogProps {
  loan: LoanWithPayments;
}

export function AddPaymentDialog({ loan }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  const { addPayment } = useLoans();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    await addPayment.mutateAsync({
      loan_id: loan.id,
      amount: parseFloat(amount),
      payment_date: format(paymentDate, 'yyyy-MM-dd'),
      notes: notes.trim() || undefined,
    });

    setAmount('');
    setPaymentDate(new Date());
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="w-3 h-3" />
          Ghi nhận trả
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          <p>Người nợ: <span className="font-medium text-foreground">{loan.borrower_name}</span></p>
          <p>Còn lại: <span className="font-medium text-foreground">{formatCurrency(loan.remaining)}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Số tiền trả *</Label>
            <Input
              id="payment-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              max={loan.remaining}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày thanh toán</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(paymentDate, 'dd/MM/yyyy', { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Ghi chú</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú (không bắt buộc)"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={addPayment.isPending}>
            {addPayment.isPending ? 'Đang ghi nhận...' : 'Ghi nhận thanh toán'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
