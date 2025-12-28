import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { MonthSelector } from '@/components/finance/MonthSelector';
import { AddTransactionDialog } from '@/components/finance/AddTransactionDialog';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export default function Transactions() {
  const { user, loading } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);

  const {
    transactions,
    isLoading,
    deleteTransaction,
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

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Group by date
  const groupedTransactions = paginatedTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when month changes
  const handleMonthChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Tất cả giao dịch</h1>
          </div>
          <AddTransactionDialog />
        </div>
      </header>

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
          <>
            <div className="space-y-4">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatDate(date)}
                  </p>
                  {groupedTransactions[date].map((transaction, index) => (
                    <Card
                      key={transaction.id}
                      className="glass hover:bg-secondary/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                              style={{ backgroundColor: transaction.category?.color + '20' }}
                            >
                              {transaction.category?.icon || '📝'}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.category?.name || 'Không có danh mục'}</p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p
                              className={cn(
                                "font-bold text-lg",
                                transaction.type === 'income' ? 'text-income' : 'text-expense'
                              )}
                            >
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(Number(transaction.amount))}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteTransaction.mutate(transaction.id)}
                              disabled={deleteTransaction.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalPages && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
}
