import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp, User, Calendar, Percent, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoanWithPayments } from '@/types/loan';
import { formatCurrency } from '@/lib/format';
import { useLoans } from '@/hooks/useLoans';
import { AddPaymentDialog } from './AddPaymentDialog';
import { cn } from '@/lib/utils';

interface LoanCardProps {
  loan: LoanWithPayments;
}

export function LoanCard({ loan }: LoanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { deleteLoan, deletePayment, updateLoan } = useLoans();

  const progressPercent = (loan.total_paid / Number(loan.amount)) * 100;
  const isOverdue = loan.due_date && new Date(loan.due_date) < new Date() && loan.status === 'active';

  const handleMarkAsPaid = () => {
    updateLoan.mutate({ id: loan.id, status: 'paid' });
  };

  const getStatusBadge = () => {
    if (loan.status === 'paid') {
      return <Badge className="bg-income/20 text-income border-income/30">Đã trả</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Quá hạn</Badge>;
    }
    return <Badge variant="secondary">Đang vay</Badge>;
  };

  return (
    <Card className="glass overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold truncate">{loan.borrower_name}</span>
              {getStatusBadge()}
            </div>

            <div className="text-2xl font-bold text-primary mb-2">
              {formatCurrency(Number(loan.amount))}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(loan.start_date), 'dd/MM/yyyy', { locale: vi })}
              </div>
              {loan.due_date && (
                <div className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-destructive"
                )}>
                  <Calendar className="w-3 h-3" />
                  Hạn: {format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: vi })}
                </div>
              )}
              {loan.interest_rate > 0 && (
                <div className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {loan.interest_rate}%/năm
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đã trả</span>
                <span className="font-medium">
                  {formatCurrency(loan.total_paid)} / {formatCurrency(Number(loan.amount))}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="text-sm text-muted-foreground">
                Còn lại: <span className="font-medium text-foreground">{formatCurrency(loan.remaining)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {loan.status !== 'paid' && (
              <>
                <AddPaymentDialog loan={loan} />
                {loan.remaining <= 0 && (
                  <Button size="sm" variant="outline" onClick={handleMarkAsPaid} className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Đánh dấu xong
                  </Button>
                )}
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteLoan.mutate(loan.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loan.notes && (
          <p className="text-sm text-muted-foreground mt-3 italic">"{loan.notes}"</p>
        )}

        {/* Payment history */}
        {loan.payments && loan.payments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setExpanded(!expanded)}
            >
              <span>Lịch sử thanh toán ({loan.payments.length})</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {loan.payments
                  .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <div className="font-medium text-income">+{formatCurrency(Number(payment.amount))}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: vi })}
                          {payment.notes && ` • ${payment.notes}`}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => deletePayment.mutate(payment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
