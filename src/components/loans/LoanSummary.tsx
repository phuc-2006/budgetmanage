import { HandCoins, Wallet, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

interface LoanSummaryProps {
  totalLent: number;
  totalReceived: number;
  totalOutstanding: number;
}

export function LoanSummary({ totalLent, totalReceived, totalOutstanding }: LoanSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="glass animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng nợ</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(totalLent)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HandCoins className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đã thu</p>
              <p className="text-2xl font-bold text-income mt-1">
                {formatCurrency(totalReceived)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-income" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chưa thu</p>
              <p className="text-2xl font-bold text-expense mt-1">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-expense" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
