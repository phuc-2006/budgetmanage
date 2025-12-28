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
}

export function TransactionList({ transactions, onDelete, isDeleting }: TransactionListProps) {
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

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Giao dịch gần đây</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 p-4 pt-0">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur py-1">
                  {formatDate(date)}
                </p>
                {txns.map((transaction, index) => (
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
