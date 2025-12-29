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

export function AddLoanDialog() {
  const [open, setOpen] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');

  const { addLoan } = useLoans();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim() || !amount) return;

    await addLoan.mutateAsync({
      borrower_name: borrowerName.trim(),
      amount: parseFloat(amount),
      interest_rate: parseFloat(interestRate) || 0,
      start_date: format(startDate, 'yyyy-MM-dd'),
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      notes: notes.trim() || undefined,
    });

    setBorrowerName('');
    setAmount('');
    setInterestRate('0');
    setStartDate(new Date());
    setDueDate(undefined);
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm khoản cho vay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm khoản cho vay mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="borrower">Tên người vay *</Label>
            <Input
              id="borrower"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="Nhập tên người vay"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền cho vay *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest">Lãi suất (%/năm)</Label>
            <Input
              id="interest"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày cho vay</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'dd/MM/yyyy', { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Hạn trả</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm ghi chú (không bắt buộc)"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={addLoan.isPending}>
            {addLoan.isPending ? 'Đang thêm...' : 'Thêm khoản cho vay'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
