import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, TrendingUp, TrendingDown, Check, ArrowUpRight, ArrowDownLeft, ChevronLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useDebts } from '@/hooks/useDebts';
import { useSettings } from '@/hooks/useSettings';
import { DebtWithContact, ContactWithBalance } from '@/types/debt';
import { formatCurrency, formatDate } from '@/lib/format';
import { groupByDate } from '@/lib/balance';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DebtSummary } from '@/components/debts/DebtSummary';
import { AddDebtDialog } from '@/components/debts/AddDebtDialog';
import { AddContactDialog } from '@/components/debts/AddContactDialog';

export default function Debts() {
  const { user, loading, signOut } = useAuth();
  const { showDayOfWeek } = useSettings();
  const { debts, contactsWithBalance, isLoading, totalLent, totalBorrowed, netBalance, togglePaid, deleteDebt } = useDebts();
  const [selectedContact, setSelectedContact] = useState<ContactWithBalance | null>(null);

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

  // Sort by date
  const sortByDate = (a: DebtWithContact, b: DebtWithContact) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const renderContactCard = (contact: ContactWithBalance) => {
    const isPositive = contact.balance > 0;
    return (
      <div
        key={contact.id}
        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
        onClick={() => setSelectedContact(contact)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isPositive ? 'bg-income/20' : 'bg-expense/20'
          )}>
            <User className={cn("w-5 h-5", isPositive ? 'text-income' : 'text-expense')} />
          </div>
          <div>
            <p className="font-medium">{contact.name}</p>
            <p className="text-sm text-muted-foreground">
              {isPositive 
                ? `Họ nợ bạn` 
                : `Bạn nợ họ`
              }
            </p>
          </div>
        </div>
        <p className={cn(
          "font-bold text-lg",
          isPositive ? 'text-income' : 'text-expense'
        )}>
          {isPositive ? '+' : ''}{formatCurrency(contact.balance)}
        </p>
      </div>
    );
  };

  // Get lend and borrow debts for selected contact
  const getContactLendDebts = (contactId: string) => {
    return debts.filter(d => d.contact_id === contactId && !d.is_paid && d.type === 'lend').sort(sortByDate);
  };

  const getContactBorrowDebts = (contactId: string) => {
    return debts.filter(d => d.contact_id === contactId && !d.is_paid && d.type === 'borrow').sort(sortByDate);
  };

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
            <p className="font-medium truncate">
              {debt.type === 'lend' ? 'Cho vay' : 'Đi vay'}
            </p>
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

  const renderContactDebts = () => {
    if (!selectedContact) return null;
    
    const lendDebts = getContactLendDebts(selectedContact.id);
    const borrowDebts = getContactBorrowDebts(selectedContact.id);
    const allDebts = [...lendDebts, ...borrowDebts].sort(sortByDate);
    
    const groupedLend = groupByDate(lendDebts);
    const groupedBorrow = groupByDate(borrowDebts);
    const groupedAll = groupByDate(allDebts);
    
    const lendDates = Object.keys(groupedLend).sort((a, b) => b.localeCompare(a));
    const borrowDates = Object.keys(groupedBorrow).sort((a, b) => b.localeCompare(a));
    const allDates = Object.keys(groupedAll).sort((a, b) => b.localeCompare(a));
    
    const lendTotal = lendDebts.reduce((sum, d) => sum + Number(d.amount), 0);
    const borrowTotal = borrowDebts.reduce((sum, d) => sum + Number(d.amount), 0);

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

    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedContact(null)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{selectedContact.name}</h3>
            <p className="text-sm text-muted-foreground">
              Số dư: <span className={cn("font-medium", selectedContact.balance > 0 ? 'text-income' : 'text-expense')}>
                {selectedContact.balance > 0 ? '+' : ''}{formatCurrency(selectedContact.balance)}
              </span>
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="lend">Cho vay</TabsTrigger>
            <TabsTrigger value="borrow">Đi vay</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tất cả khoản nợ</CardTitle>
                  <div className="text-right">
                    <p className={cn("text-2xl font-bold", selectedContact.balance > 0 ? "text-income" : "text-expense")}>
                      {selectedContact.balance > 0 ? '+' : ''}{formatCurrency(selectedContact.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">{allDebts.length} khoản</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {renderDebtList(groupedAll, allDates, 'Không có khoản nợ nào')}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lend" className="mt-0">
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
                    <p className="text-2xl font-bold text-income">+{formatCurrency(lendTotal)}</p>
                    <p className="text-xs text-muted-foreground">{lendDebts.length} khoản</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {renderDebtList(groupedLend, lendDates, 'Chưa cho vay')}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrow" className="mt-0">
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
                    <p className="text-2xl font-bold text-expense">-{formatCurrency(borrowTotal)}</p>
                    <p className="text-xs text-muted-foreground">{borrowDebts.length} khoản</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {renderDebtList(groupedBorrow, borrowDates, 'Chưa đi vay')}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  const renderContactsList = () => {
    // All contacts with unpaid debts (balance != 0)
    const activeContacts = contactsWithBalance.filter(c => c.balance !== 0);

    return (
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách người nợ</CardTitle>
            <p className="text-sm text-muted-foreground">{activeContacts.length} người</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {activeContacts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có ai trong danh sách nợ
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {activeContacts.map(contact => renderContactCard(contact))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
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
        ) : selectedContact ? (
          renderContactDebts()
        ) : (
          renderContactsList()
        )}
      </main>
    </div>
  );
}
