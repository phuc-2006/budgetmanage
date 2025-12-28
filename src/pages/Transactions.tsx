import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { MonthSelector } from '@/components/finance/MonthSelector';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';

export default function Transactions() {
  const { user, loading, signOut } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const {
    transactions,
    isLoading,
    deleteTransaction,
    balance,
  } = useTransactions(month, year);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Separate income and expense transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Sort by date descending
  const sortByDate = (a: Transaction, b: Transaction) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const sortedIncome = [...incomeTransactions].sort(sortByDate);
  const sortedExpense = [...expenseTransactions].sort(sortByDate);

  // Calculate running balance for each transaction
  const allSorted = [...transactions].sort(sortByDate);
  
  const getBalanceAfter = (transaction: Transaction) => {
    let runningBalance = balance;
    for (const t of allSorted) {
      if (t.id === transaction.id) break;
      if (t.type === 'income') {
        runningBalance -= Number(t.amount);
      } else {
        runningBalance += Number(t.amount);
      }
    }
    return runningBalance;
  };

  // Group by date
  const groupByDate = (txns: Transaction[]) => {
    return txns.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  };

  const groupedIncome = groupByDate(sortedIncome);
  const groupedExpense = groupByDate(sortedExpense);

  const incomeDates = Object.keys(groupedIncome).sort((a, b) => b.localeCompare(a));
  const expenseDates = Object.keys(groupedExpense).sort((a, b) => b.localeCompare(a));

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const handleMonthChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
  };

  const renderTransactionItem = (transaction: Transaction, index: number) => {
    const balanceAfter = getBalanceAfter(transaction);
    
    return (
      <div
        key={transaction.id}
        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in"
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
            style={{ backgroundColor: transaction.category?.color + '20' }}
          >
            {transaction.category?.icon || '📝'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{transaction.category?.name || 'Không có danh mục'}</p>
            {transaction.description && (
              <p className="text-sm text-muted-foreground truncate">
                {transaction.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Số dư: <span className={cn(
                "font-medium",
                balanceAfter >= 0 ? 'text-income' : 'text-expense'
              )}>{formatCurrency(balanceAfter)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p
            className={cn(
              "font-bold",
              transaction.type === 'income' ? 'text-income' : 'text-expense'
            )}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(Number(transaction.amount))}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteTransaction.mutate(transaction.id)}
            disabled={deleteTransaction.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderTransactionList = (
    groupedTxns: Record<string, Transaction[]>,
    dates: string[],
    emptyMessage: string
  ) => {
    if (dates.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        {dates.map((date) => (
          <div key={date} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur py-1">
              {formatDate(date)}
            </p>
            {groupedTxns[date].map((transaction, index) => 
              renderTransactionItem(transaction, index)
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Tổng cộng: <span className="font-medium text-foreground">{transactions.length}</span> giao dịch
          </p>
          <MonthSelector month={month} year={year} onChange={handleMonthChange} />
        </div>

        {isLoading ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground animate-pulse">Đang tải...</p>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Chưa có giao dịch nào trong tháng này</p>
              <p className="text-sm text-muted-foreground mt-1">Hãy thêm giao dịch đầu tiên của bạn!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Column */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-expense/20 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-expense" />
                    </div>
                    <CardTitle className="text-lg">Chi tiêu</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-expense">-{formatCurrency(totalExpense)}</p>
                    <p className="text-xs text-muted-foreground">{expenseTransactions.length} giao dịch</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {renderTransactionList(groupedExpense, expenseDates, 'Chưa có chi tiêu trong tháng này')}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Income Column */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-income/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-income" />
                    </div>
                    <CardTitle className="text-lg">Thu nhập</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-income">+{formatCurrency(totalIncome)}</p>
                    <p className="text-xs text-muted-foreground">{incomeTransactions.length} giao dịch</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {renderTransactionList(groupedIncome, incomeDates, 'Chưa có thu nhập trong tháng này')}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
