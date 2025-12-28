import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { BalanceCard } from '@/components/finance/BalanceCard';
import { AddTransactionDialog } from '@/components/finance/AddTransactionDialog';
import { TransactionList } from '@/components/finance/TransactionList';
import { ExpenseChart } from '@/components/finance/ExpenseChart';
import { MonthSelector } from '@/components/finance/MonthSelector';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const { transactions, totalIncome, totalExpense, balance, isLoading, deleteTransaction } = useTransactions(month, year);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold hidden sm:block">Quản Lý Chi Tiêu</h1>
          </div>
          <div className="flex items-center gap-3">
            <AddTransactionDialog />
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Tổng quan</h2>
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </div>

        <BalanceCard totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionList 
            transactions={transactions} 
            onDelete={(id) => deleteTransaction.mutate(id)}
            isDeleting={deleteTransaction.isPending}
            currentBalance={balance}
          />
          <ExpenseChart transactions={transactions} />
        </div>
      </main>
    </div>
  );
}
