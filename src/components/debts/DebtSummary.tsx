import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

interface DebtSummaryProps {
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
}

export function DebtSummary({ totalLent, totalBorrowed, netBalance }: DebtSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="glass animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cho vay</p>
              <p className="text-2xl font-bold text-income mt-1">
                {formatCurrency(totalLent)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-income" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đi vay</p>
              <p className="text-2xl font-bold text-expense mt-1">
                {formatCurrency(totalBorrowed)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-expense" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cân bằng</p>
              <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-income' : 'text-expense'}`}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
