import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDebts } from '@/hooks/useDebts';
import { AppHeader } from '@/components/layout/AppHeader';
import { DebtSummary } from '@/components/debts/DebtSummary';
import { AddDebtDialog } from '@/components/debts/AddDebtDialog';
import { AddContactDialog } from '@/components/debts/AddContactDialog';
import { ContactCard } from '@/components/debts/ContactCard';
import { DebtList } from '@/components/debts/DebtList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Debts() {
  const { user, loading, signOut } = useAuth();
  const { contactsWithBalance, debts, isLoading, totalLent, totalBorrowed, netBalance } = useDebts();

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

  const activeContacts = contactsWithBalance.filter(c => c.balance !== 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý khoản nợ</h2>
            <p className="text-muted-foreground text-sm">
              Theo dõi các khoản vay mượn với bạn bè
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
          <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
        ) : (
          <Tabs defaultValue="people" className="space-y-4">
            <TabsList>
              <TabsTrigger value="people">Theo người ({activeContacts.length})</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="space-y-4">
              {activeContacts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Chưa có khoản nợ nào</p>
                  <AddDebtDialog />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeContacts
                    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
                    .map(contact => (
                      <ContactCard key={contact.id} contact={contact} />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <DebtList debts={debts} showPaid />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
