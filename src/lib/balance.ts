import { Transaction } from '@/types/finance';

/**
 * Format a Date object to YYYY-MM-DD using local time (avoids UTC shifting).
 */
export function formatDateSafe(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate forward cumulative running balance for a list of transactions in a period.
 *
 * Financial principle:
 * - Starts from openingBalance (accumulated balance before the period).
 * - Processes transactions in chronological order (oldest -> newest).
 * - For each transaction: balanceAfter = previousBalance + (income ? +amount : -amount).
 * - Future transactions never alter the balance of past transactions.
 *
 * Returns transactions sorted in descending order (newest first) for UI display.
 */
export function calculateMonthlyBalances(
  transactions: Transaction[],
  openingBalance: number = 0
) {
  // Sort in chronological order (oldest first: date asc, created_at asc)
  const chronological = [...transactions].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  let runningBalance = openingBalance;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  const withBalances: Transaction[] = chronological.map((t) => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      runningBalance += amount;
      monthlyIncome += amount;
    } else {
      runningBalance -= amount;
      monthlyExpense += amount;
    }
    return {
      ...t,
      balanceAfter: runningBalance,
    };
  });

  const closingBalance = runningBalance;

  // Return sorted descending (newest first) for UI display
  const displaySorted = [...withBalances].sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    transactions: displaySorted,
    openingBalance,
    closingBalance,
    monthlyIncome,
    monthlyExpense,
  };
}

/**
 * Generic grouping helper by date field (preserves array order within each date)
 */
export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
