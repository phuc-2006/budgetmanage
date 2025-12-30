import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DebtWithContact } from '@/types/debt';
import { formatCurrency } from '@/lib/format';
import { useDebts } from '@/hooks/useDebts';
import { cn } from '@/lib/utils';

interface DebtListProps {
  debts: DebtWithContact[];
  title?: string;
  showPaid?: boolean;
}

export function DebtList({ debts, title = 'Lịch sử giao dịch', showPaid = false }: DebtListProps) {
  const { togglePaid, deleteDebt } = useDebts();

  const filteredDebts = showPaid ? debts : debts.filter(d => !d.is_paid);

  if (filteredDebts.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Chưa có khoản nợ nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {filteredDebts.map((debt) => (
          <div
            key={debt.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              debt.is_paid ? "bg-muted/30" : "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                debt.type === 'lend' ? 'bg-income/20' : 'bg-expense/20'
              )}>
                {debt.type === 'lend' ? (
                  <ArrowUpRight className="w-4 h-4 text-income" />
                ) : (
                  <ArrowDownLeft className="w-4 h-4 text-expense" />
                )}
              </div>
              <div>
                <p className={cn("font-medium", debt.is_paid && "line-through text-muted-foreground")}>
                  {debt.contact.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(debt.date), 'dd/MM/yyyy', { locale: vi })}
                  {debt.description && ` • ${debt.description}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                "font-bold",
                debt.is_paid ? "text-muted-foreground" : debt.type === 'lend' ? 'text-income' : 'text-expense'
              )}>
                {debt.type === 'lend' ? '+' : '-'}{formatCurrency(Number(debt.amount))}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => togglePaid.mutate({ id: debt.id, is_paid: !debt.is_paid })}
              >
                <Check className={cn("w-4 h-4", debt.is_paid && "text-income")} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteDebt.mutate(debt.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
