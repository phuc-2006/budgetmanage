import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  currentBalance: number;
}

export function TransactionList({ transactions, onDelete, isDeleting, currentBalance = 0 }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Chưa có giao dịch nào trong tháng này</p>
          <p className="text-sm text-muted-foreground mt-1">Hãy thêm giao dịch đầu tiên của bạn!</p>
        </CardContent>
      </Card>
    );
  }

  // Sort transactions by date descending, then by created_at descending
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calculate running balance for each transaction (from newest to oldest)
  const transactionsWithBalance = sortedTransactions.map((transaction, index) => {
    // Start with current balance and add back transactions that came after this one
    let balanceAfter = currentBalance;
    for (let i = 0; i < index; i++) {
      const t = sortedTransactions[i];
      if (t.type === 'income') {
        balanceAfter -= Number(t.amount);
      } else {
        balanceAfter += Number(t.amount);
      }
    }
    return { ...transaction, balanceAfter };
  });

  // Group transactions by date
  const groupedTransactions = transactionsWithBalance.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, (Transaction & { balanceAfter: number })[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Only show first 5 transactions on dashboard
  const recentDates = sortedDates.slice(0, 3);

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Giao dịch gần đây</CardTitle>
        <Link to="/transactions" className="text-sm text-primary hover:underline">
          Xem tất cả
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="space-y-4 p-4 pt-0">
            {recentDates.map((date) => (
              <div key={date} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur py-1">
                  {formatDate(date)}
                </p>
                {groupedTransactions[date].map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: transaction.category?.color + '20' }}
                      >
                        {transaction.category?.icon || '📝'}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category?.name || 'Không có danh mục'}</p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Số dư: <span className={cn(
                            "font-medium",
                            transaction.balanceAfter >= 0 ? 'text-income' : 'text-expense'
                          )}>{formatCurrency(transaction.balanceAfter)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-bold",
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(transaction.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}