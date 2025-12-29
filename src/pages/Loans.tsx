import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLoans } from '@/hooks/useLoans';
import { AppHeader } from '@/components/layout/AppHeader';
import { LoanSummary } from '@/components/loans/LoanSummary';
import { LoanCard } from '@/components/loans/LoanCard';
import { AddLoanDialog } from '@/components/loans/AddLoanDialog';

export default function Loans() {
  const { user, loading, signOut } = useAuth();
  const { loans, isLoading, totalLent, totalReceived, totalOutstanding } = useLoans();

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

  const activeLoans = loans.filter(l => l.status !== 'paid');
  const paidLoans = loans.filter(l => l.status === 'paid');

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý khoản cho vay</h2>
            <p className="text-muted-foreground text-sm">
              Theo dõi các khoản tiền bạn cho người khác vay
            </p>
          </div>
          <AddLoanDialog />
        </div>

        <LoanSummary
          totalLent={totalLent}
          totalReceived={totalReceived}
          totalOutstanding={totalOutstanding}
        />

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Bạn chưa có khoản cho vay nào</p>
            <AddLoanDialog />
          </div>
        ) : (
          <div className="space-y-6">
            {activeLoans.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Đang cho vay ({activeLoans.length})</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeLoans.map(loan => (
                    <LoanCard key={loan.id} loan={loan} />
                  ))}
                </div>
              </div>
            )}

            {paidLoans.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground">Đã hoàn tất ({paidLoans.length})</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {paidLoans.map(loan => (
                    <LoanCard key={loan.id} loan={loan} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
