# Task List (Todo)

## Phase 1: Foundation & Types
- [x] **Task 1**: Cập nhật Type definitions và Helper Utilities
  - [x] Thêm `balanceAfter?: number` vào interface `Transaction` trong `src/types/finance.ts`.
  - [x] Thêm hàm format ngày địa phương và helper `groupByDate` trong `src/lib/balance.ts`.
  - [x] Viết unit test xác thực tính bất biến lịch sử và kiểm tra test pass.
- [x] **Task 2**: Triển khai Opening Balance & Forward Running Balance trong `src/hooks/useTransactions.tsx`
  - [x] Truy vấn tổng thu/chi trước `startDate` để tính `openingBalance`.
  - [x] Sắp xếp giao dịch theo thứ tự tăng dần thời gian và tính lũy kế xuôi O(N).
  - [x] Trả về `transactions` (đã có `balanceAfter`), `openingBalance`, `closingBalance`, `balance`.

## Phase 2: Presentation Layer
- [x] **Task 3**: Refactor `src/pages/Transactions.tsx`
  - [x] Xóa bỏ hàm $O(N^2)$ `getBalanceAfter`.
  - [x] Sử dụng trực tiếp `transaction.balanceAfter`.
  - [x] Sử dụng `groupByDate` dùng chung.
  - [x] Bổ sung thẻ tóm tắt Số dư đầu tháng (`openingBalance`) và Số dư cuối tháng (`closingBalance`).
- [x] **Task 4**: Refactor `src/components/finance/TransactionList.tsx`
  - [x] Xóa bỏ vòng lặp tính ngược từ `currentBalance`.
  - [x] Sử dụng trực tiếp `transaction.balanceAfter`.

## Phase 3: Quality Hardening & Bug Fixes
- [x] **Task 5**: Sửa lỗi lệch múi giờ trong `src/hooks/useMonthlyTrend.tsx`
  - [x] Thay thế `.toISOString()` bằng format ngày địa phương `YYYY-MM-DD`.
- [x] **Task 6**: Sửa lỗi Cache Invalidation trong `src/hooks/useImportTransactions.tsx`
  - [x] Thêm invalidate queries cho `transactions-all-time`, `transactions-opening-balance`, `monthly-trend`.
- [x] **Task 7**: Bổ sung Scoping `user_id` trong `src/hooks/useExportDebts.tsx`
  - [x] Thêm `.eq('user_id', user.id)` trong truy vấn `debts`.
