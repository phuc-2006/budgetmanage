import { describe, expect, it } from 'bun:test';
import { calculateMonthlyBalances, formatDateSafe, groupByDate } from '../balance';
import { Transaction } from '@/types/finance';

describe('Balance calculation and financial invariant tests', () => {
  const createTx = (
    id: string,
    date: string,
    type: 'income' | 'expense',
    amount: number,
    createdAt: string
  ): Transaction => ({
    id,
    user_id: 'user-1',
    category_id: null,
    amount,
    type,
    description: `Tx ${id}`,
    date,
    created_at: createdAt,
  });

  it('demonstrates that forward running balance preserves historical invariant when future transactions are added', () => {
    // January transactions:
    // Jan 01: Income 10,000,000
    // Jan 02: Expense 2,000,000
    // Jan 03: Expense 1,000,000
    const janTx1 = createTx('t1', '2026-01-01', 'income', 10000000, '2026-01-01T08:00:00Z');
    const janTx2 = createTx('t2', '2026-01-02', 'expense', 2000000, '2026-01-02T10:00:00Z');
    const janTx3 = createTx('t3', '2026-01-03', 'expense', 1000000, '2026-01-03T12:00:00Z');

    const janResultBefore = calculateMonthlyBalances([janTx1, janTx2, janTx3], 0);

    // Verify January balances:
    // After Jan 01: 10,000,000
    // After Jan 02: 8,000,000
    // After Jan 03: 7,000,000
    const getBalance = (list: Transaction[], id: string) => list.find((t) => t.id === id)?.balanceAfter;

    expect(getBalance(janResultBefore.transactions, 't1')).toBe(10000000);
    expect(getBalance(janResultBefore.transactions, 't2')).toBe(8000000);
    expect(getBalance(janResultBefore.transactions, 't3')).toBe(7000000);
    expect(janResultBefore.openingBalance).toBe(0);
    expect(janResultBefore.closingBalance).toBe(7000000);

    // NOW: User is in February (future/present) and adds a transaction:
    // Feb 10: Income 20,000,000
    const febTx = createTx('t4', '2026-02-10', 'income', 20000000, '2026-02-10T09:00:00Z');

    // In the new architecture:
    // January's openingBalance is STILL 0.
    const janResultAfter = calculateMonthlyBalances([janTx1, janTx2, janTx3], 0);

    // CRUCIAL CHECK: Historical balances of Jan 01, Jan 02, Jan 03 MUST REMAIN UNCHANGED!
    expect(getBalance(janResultAfter.transactions, 't1')).toBe(10000000);
    expect(getBalance(janResultAfter.transactions, 't2')).toBe(8000000);
    expect(getBalance(janResultAfter.transactions, 't3')).toBe(7000000);

    // February's opening balance is January's closing balance (7,000,000):
    const febResult = calculateMonthlyBalances([febTx], janResultBefore.closingBalance);
    expect(febResult.openingBalance).toBe(7000000);
    expect(getBalance(febResult.transactions, 't4')).toBe(27000000);
    expect(febResult.closingBalance).toBe(27000000);
  });

  it('correctly handles same-day transactions using created_at ordering', () => {
    // Two transactions on the same day:
    // 09:00: Income 5,000,000 -> balance becomes 5,000,000
    // 14:00: Expense 1,000,000 -> balance becomes 4,000,000
    const tMorning = createTx('m1', '2026-01-05', 'income', 5000000, '2026-01-05T09:00:00Z');
    const tAfternoon = createTx('m2', '2026-01-05', 'expense', 1000000, '2026-01-05T14:00:00Z');

    const result = calculateMonthlyBalances([tAfternoon, tMorning], 0);

    expect(result.transactions.find((t) => t.id === 'm1')?.balanceAfter).toBe(5000000);
    expect(result.transactions.find((t) => t.id === 'm2')?.balanceAfter).toBe(4000000);
  });

  it('handles empty transactions correctly', () => {
    const result = calculateMonthlyBalances([], 15000000);
    expect(result.transactions).toEqual([]);
    expect(result.openingBalance).toBe(15000000);
    expect(result.closingBalance).toBe(15000000);
    expect(result.monthlyIncome).toBe(0);
    expect(result.monthlyExpense).toBe(0);
  });

  it('groupByDate correctly groups items by date string', () => {
    const t1 = { id: '1', date: '2026-01-02', name: 'A' };
    const t2 = { id: '2', date: '2026-01-02', name: 'B' };
    const t3 = { id: '3', date: '2026-01-01', name: 'C' };

    const grouped = groupByDate([t1, t2, t3]);
    expect(Object.keys(grouped)).toEqual(['2026-01-02', '2026-01-01']);
    expect(grouped['2026-01-02'].length).toBe(2);
    expect(grouped['2026-01-01'].length).toBe(1);
  });

  it('formatDateSafe formats local date to YYYY-MM-DD without UTC shift', () => {
    const testDate = new Date(2026, 0, 15); // Jan 15, 2026
    expect(formatDateSafe(testDate)).toBe('2026-01-15');

    const endOfMonth = new Date(2026, 1, 0); // Last day of Jan 2026 (Jan 31)
    expect(formatDateSafe(endOfMonth)).toBe('2026-01-31');
  });
});
