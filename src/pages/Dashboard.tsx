import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonthlyTrend } from '@/hooks/useMonthlyTrend';
import { BalanceCard } from '@/components/finance/BalanceCard';
import { TransactionList } from '@/components/finance/TransactionList';
import { ExpenseChart } from '@/components/finance/ExpenseChart';
import { TrendChart } from '@/components/finance/TrendChart';
import { MonthSelector } from '@/components/finance/MonthSelector';
import { AppHeader } from '@/components/layout/AppHeader';

export default function Dashboard() {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    isLoading,
    deleteTransaction
  } = useTransactions(month, year);
  const { monthlyData, isLoading: trendLoading } = useMonthlyTrend();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Đang tải...</div>
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <div className="min-h-screen bg-background">
      <AppHeader onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Tổng quan</h2>
          <MonthSelector month={month} year={year} onChange={(m, y) => {
          setMonth(m);
          setYear(y);
        }} />
        </div>

        <BalanceCard totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionList transactions={transactions} onDelete={id => deleteTransaction.mutate(id)} isDeleting={deleteTransaction.isPending} currentBalance={balance} />
          <ExpenseChart transactions={transactions} />
        </div>

        <TrendChart data={monthlyData} isLoading={trendLoading} />
      </main>
    </div>;
}