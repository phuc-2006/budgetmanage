import { Navigate } from 'react-router-dom';
import { Trash2, TrendingUp, TrendingDown, Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useDebts } from '@/hooks/useDebts';
import { useSettings } from '@/hooks/useSettings';
import { DebtWithContact } from '@/types/debt';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';
import { DebtSummary } from '@/components/debts/DebtSummary';
import { AddDebtDialog } from '@/components/debts/AddDebtDialog';
import { AddContactDialog } from '@/components/debts/AddContactDialog';

export default function Debts() {
  const { user, loading, signOut } = useAuth();
  const { showDayOfWeek } = useSettings();
  const { debts, isLoading, totalLent, totalBorrowed, netBalance, togglePaid, deleteDebt } = useDebts();

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

  // Separate lend and borrow debts (only unpaid)
  const lendDebts = debts.filter(d => d.type === 'lend' && !d.is_paid);
  const borrowDebts = debts.filter(d => d.type === 'borrow' && !d.is_paid);

  // Sort by date descending
  const sortByDate = (a: DebtWithContact, b: DebtWithContact) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const sortedLend = [...lendDebts].sort(sortByDate);
  const sortedBorrow = [...borrowDebts].sort(sortByDate);

  // Group by date
  const groupByDate = (items: DebtWithContact[]) => {
    return items.reduce((groups, debt) => {
      const date = debt.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(debt);
      return groups;
    }, {} as Record<string, DebtWithContact[]>);
  };

  const groupedLend = groupByDate(sortedLend);
  const groupedBorrow = groupByDate(sortedBorrow);

  const lendDates = Object.keys(groupedLend).sort((a, b) => b.localeCompare(a));
  const borrowDates = Object.keys(groupedBorrow).sort((a, b) => b.localeCompare(a));

  const totalLendAmount = lendDebts.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalBorrowAmount = borrowDebts.reduce((sum, d) => sum + Number(d.amount), 0);

  const renderDebtItem = (debt: DebtWithContact, index: number) => {
    return (
      <div
        key={debt.id}
        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in"
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center",
              debt.type === 'lend' ? 'bg-income/20' : 'bg-expense/20'
            )}
          >
            {debt.type === 'lend' ? (
              <ArrowUpRight className="w-5 h-5 text-income" />
            ) : (
              <ArrowDownLeft className="w-5 h-5 text-expense" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{debt.contact.name}</p>
            {debt.description && (
              <p className="text-sm text-muted-foreground truncate">
                {debt.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <p
            className={cn(
              "font-bold",
              debt.type === 'lend' ? 'text-income' : 'text-expense'
            )}
          >
            {debt.type === 'lend' ? '+' : '-'}
            {formatCurrency(Number(debt.amount))}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => togglePaid.mutate({ id: debt.id, is_paid: true })}
            title="Đánh dấu đã trả"
          >
            <Check className="w-4 h-4" />
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
    );
  };

  const renderDebtList = (
    groupedItems: Record<string, DebtWithContact[]>,
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
              {formatDate(date, showDayOfWeek)}
            </p>
            {groupedItems[date].map((debt, index) => 
              renderDebtItem(debt, index)
            )}
          </div>
        ))}
      </div>
    );
  };

  const unpaidDebts = debts.filter(d => !d.is_paid);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý khoản nợ</h2>
            <p className="text-muted-foreground text-sm">
              Tổng cộng: <span className="font-medium text-foreground">{unpaidDebts.length}</span> khoản nợ chưa trả
            </p>
          </div>
          <div className="flex gap-2">
            <AddContactDialog />
            <AddDebtDialog />
          </div>
        </div>

        <DebtSummary
          totalLent={totalLent}
          totalBorrowed={totalBorrowed}
          netBalance={netBalance}
        />

        {isLoading ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground animate-pulse">Đang tải...</p>
            </CardContent>
          </Card>
        ) : unpaidDebts.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Chưa có khoản nợ nào</p>
              <p className="text-sm text-muted-foreground mt-1">Hãy thêm khoản nợ đầu tiên của bạn!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lend Column - Họ nợ mình */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-income/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-income" />
                    </div>
                    <CardTitle className="text-lg">Cho vay</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-income">+{formatCurrency(totalLendAmount)}</p>
                    <p className="text-xs text-muted-foreground">{lendDebts.length} khoản nợ</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {renderDebtList(groupedLend, lendDates, 'Chưa có khoản cho vay nào')}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Borrow Column - Mình nợ họ */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-expense/20 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-expense" />
                    </div>
                    <CardTitle className="text-lg">Đi vay</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-expense">-{formatCurrency(totalBorrowAmount)}</p>
                    <p className="text-xs text-muted-foreground">{borrowDebts.length} khoản nợ</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {renderDebtList(groupedBorrow, borrowDates, 'Chưa có khoản đi vay nào')}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
