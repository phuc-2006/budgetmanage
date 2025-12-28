import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function BalanceCard({ totalIncome, totalExpense, balance }: BalanceCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="glass shadow-glow animate-fade-in overflow-hidden relative">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Số dư</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                balance >= 0 ? "text-primary" : "text-destructive"
              )}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thu nhập</p>
              <p className="text-2xl font-bold text-income mt-1">
                +{formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-income" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chi tiêu</p>
              <p className="text-2xl font-bold text-expense mt-1">
                -{formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-expense" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
