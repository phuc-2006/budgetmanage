# Implementation Plan: Sửa lỗi tính sai số dư lịch sử & Nâng cấp chất lượng dự án

## Overview
Dự án đang gặp lỗi logic tài chính nghiêm trọng: khi người dùng cập nhật tiền ở hiện tại (thêm giao dịch hoặc điều chỉnh tiền hôm nay), số dư của các ngày trong quá khứ bị thay đổi theo. Kế hoạch này triển khai kiến trúc tính số dư lũy kế xuôi (Forward Cumulative Running Balance) kết hợp Số dư đầu kỳ (Opening Balance), loại bỏ triệt để thuật toán tính ngược (Reverse Draining), sửa lỗi lệch múi giờ (Timezone Shift), hoàn thiện cache invalidation và tối ưu hiệu năng từ O(N^2) về O(N).

## Architecture Decisions
1. **Chuyển từ Reverse Running Balance sang Forward Running Balance kết hợp Opening Balance**:
   - Truy vấn `openingBalance`: Tổng (Thu - Chi) của tất cả giao dịch trước ngày 1 của tháng được chọn (`date < startDate`).
   - Sắp xếp giao dịch trong tháng theo chiều tăng dần thời gian (cũ nhất -> mới nhất), cộng dồn lũy kế số dư O(N).
   - `balanceAfter` của từng giao dịch trong quá khứ hoàn toàn độc lập với các giao dịch phát sinh sau nó (hiện tại/tương lai).
2. **Chuẩn hóa kiểu dữ liệu & Tách trách nhiệm (Separation of Concerns)**:
   - Thêm `balanceAfter?: number` vào kiểu `Transaction` trong `src/types/finance.ts`.
   - Chuyển toàn bộ logic tính toán số dư về `useTransactions.tsx`, giải phóng Presentation Layer (`Transactions.tsx`, `TransactionList.tsx`) khỏi việc tính toán toán học.
3. **Chuẩn hóa xử lý ngày tháng (Timezone Safety)**:
   - Thay thế toàn bộ các chỗ dùng `.toISOString().split('T')[0]` bằng hàm format chuẩn ngày địa phương `YYYY-MM-DD` để tránh lỗi lệch ngày UTC+7 tại Việt Nam.
4. **Tái sử dụng logic chung (DRY)**:
   - Viết hàm helper `groupByDate` trong `src/lib/format.ts` để loại bỏ 3 bản copy trùng lặp ở `Transactions.tsx`, `TransactionList.tsx`, `Debts.tsx`.

## Task List

### Phase 1: Foundation & Types
- [ ] Task 1: Cập nhật Type definitions và Helper Utilities
- [ ] Task 2: Triển khai Opening Balance & Forward Running Balance trong `useTransactions.tsx`

### Checkpoint: Data Layer Ready
- [ ] TypeScript check pass
- [ ] Logic tính số dư xuôi hoạt động chính xác

### Phase 2: Presentation Layer
- [ ] Task 3: Refactor `src/pages/Transactions.tsx`
- [ ] Task 4: Refactor `src/components/finance/TransactionList.tsx`

### Checkpoint: UI Integration
- [ ] Cập nhật tiền hiện tại không làm nhảy số dư quá khứ
- [ ] Render danh sách mượt mà O(N)

### Phase 3: Quality Hardening & Bug Fixes
- [ ] Task 5: Sửa lỗi múi giờ trong `src/hooks/useMonthlyTrend.tsx`
- [ ] Task 6: Sửa lỗi Cache Invalidation trong `src/hooks/useImportTransactions.tsx`
- [ ] Task 7: Bổ sung Scoping `user_id` trong `src/hooks/useExportDebts.tsx`

### Checkpoint: Complete
- [ ] Toàn bộ 5 trục (Đúng đắn, Dễ đọc, Kiến trúc, Bảo mật, Hiệu năng) đều đạt chuẩn.
