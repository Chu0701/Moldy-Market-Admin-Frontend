# 13 - Development Roadmap (Lộ trình phát triển)

- Trạng thái: BẢN NHÁP v0.1
- Cập nhật: 2026-11-08
- Áp dụng cho: Moldy-Market-Admin-Frontend
- Mục đích: sắp xếp thứ tự xây dựng trang quản trị, chỉ ra phụ thuộc vào Backend và các điểm chặn.

Đây là **đề xuất** `[ĐỀ XUẤT]`. Hiện mọi tính năng Frontend là `NOT_STARTED`, công cụ là `FOUNDATION_ONLY`. Danh sách route và từng trang ở doc 04 và 05, doc này không lặp lại, chỉ nhóm thành giai đoạn. Trạng thái Backend lấy từ doc 14.

**Đặc điểm của Admin:** phạm vi Backend hỗ trợ ổn định hẹp hơn nhiều so với kế hoạch ban đầu. Chỉ có API cho người dùng, gian hàng, kiểm duyệt sản phẩm và danh mục. Dashboard, giao dịch, báo cáo, khiếu nại, danh sách order... chưa có API nên chỉ là skeleton. Vì vậy roadmap của Admin ngắn và bị chặn bởi Backend nhiều hơn User.

---

## 1. Nguyên tắc

1. Chỉ tích hợp endpoint `IMPLEMENTED` trên `main`. Module `IN_PROGRESS` đợi branch merge và doc 14 cập nhật (Q12).
2. Nền móng (Axios, router, layout, auth) trước, trang nghiệp vụ sau.
3. Làm theo thứ tự rủi ro tăng dần: danh sách đọc trước, hành động ghi sau, hành động phá hủy cuối cùng.
4. Mọi hành động đổi trạng thái có xác nhận; Backend là chốt chặn quyền thật.
5. Mỗi giai đoạn có cột mốc kiểm tra được với Backend thật.

---

## 2. Các giai đoạn

### Giai đoạn 0: Nền tảng cấu hình (`DONE`)

Đã xong: Vite, React 19, Tailwind v4, shadcn (`button`), alias, proxy (`/api`), Prettier, ESLint, i18n (`vi`/`en` 8 keys), design tokens, font, Node/EOL/editor, cấu trúc thư mục, Vitest + RTL (`passWithNoTests: true`), `index.html` metadata + favicon, GitHub Actions CI, mẫu Pull Request. `format:check`, `lint`, `build` đều pass.

### Giai đoạn 1 & 2 (Đợt 1 Handoff): Khung ứng dụng + Phiên Admin (`NOT_STARTED`)

Port có chọn lọc hạ tầng API/auth/session từ baseline User Frontend (`client`, `unwrap`, `ApiError`, `pagination`, `authRefreshInterceptor`, `tokenStorage` với namespace **`moldy-market:admin:access-token`**, HttpOnly cookie `moldy_refresh` + `X-Moldy-Auth: 1`), `QueryClientProvider`, `AuthLayout`, `AdminLayout`, `RequireAuth` + `RequireAdmin` (`roles.includes('ADMIN')` từ `['users', 'me']`), `/` dashboard skeleton trung thực, unit tests.

### Giai đoạn 3 (Đợt 2 Handoff): Quản lý người dùng (`NOT_STARTED`)

Danh sách (`GET /api/v1/users`, `UserSummaryResponse` không có `roles`), chi tiết (`GET /api/v1/users/{id}`), đổi trạng thái (`PUT /api/v1/users/{id}/status`, quyền `USER_STORE_MANAGE`).
**Quyết định 2026-11-21:** User tự kích hoạt qua Email OTP; **Admin không được bypass OTP** để chuyển `PENDING_VERIFICATION` sang `ACTIVE`. Chỉ hỗ trợ khóa/mở khóa theo transition hợp lệ đã xác minh.

### Giai đoạn 4: Quản lý danh mục

Cây danh mục, thêm, sửa, xóa, quyền `CATEGORY_MANAGE`.
Phụ thuộc: `IMPLEMENTED`. Cần xử lý ràng buộc khi xóa danh mục đang có sản phẩm hoặc có con (đọc kỹ hành vi Backend, doc 14 chưa liệt kê).
Cột mốc: CRUD danh mục với dữ liệu thật.

### Giai đoạn 5: Quản lý gian hàng

Danh sách, chi tiết, đổi trạng thái (`GET /api/v1/stores`, `PUT /api/v1/stores/{id}/status`). Phụ thuộc: `IMPLEMENTED`.
Cột mốc: khóa, mở gian hàng với xác nhận.

### Giai đoạn 6: Kiểm duyệt sản phẩm

Danh sách và chi tiết sản phẩm (dùng search), gỡ sản phẩm (`PUT .../remove` kèm `reason`), khôi phục (`PUT .../restore`), quyền `PRODUCT_MODERATE`.
Cột mốc: gỡ có lý do bắt buộc, khôi phục thành công, xử lý 409 khi dữ liệu đổi (`COMMON_010`).

### Giai đoạn 7: Skeleton cho các trang chưa có Backend

Dashboard (khung thẻ và biểu đồ, không có số liệu thật), giao dịch, báo cáo, khiếu nại, thẩm định viên, voucher, escrow, cài đặt: trang giữ chỗ đánh dấu rõ trạng thái Backend (`NOT_FOUND`, `IN_PROGRESS`, `REQUIRES_BUSINESS_CLARIFICATION`). **Không viết service**. Chọn thư viện biểu đồ khi có dữ liệu thật.

### Giai đoạn 8: Tích hợp khi Backend sẵn sàng (chờ)

| Hạng mục | Trạng thái Backend | Điều kiện bắt đầu |
|---|---|---|
| Xác nhận thu COD (`POST /api/v1/orders/admin/{orderId}/cod-collected`) | `IN_PROGRESS`, chưa merge | Merge; làm rõ Q18; B11 |
| Escrow | `IN_PROGRESS`, B2: chưa có `@PreAuthorize` | Backend sửa quyền, làm rõ Q4 |
| Voucher admin, thẩm viên, pricing | `IN_PROGRESS`, B2 | Merge và sửa quyền |
| Quản lý order (danh sách) | **không có endpoint** cho admin | Backend bổ sung |
| Khiếu nại, refund, dispute | `REQUIRES_BUSINESS_CLARIFICATION` (Q9, Q10) | Team quyết định nghiệp vụ |
| Dashboard thống kê | `NOT_FOUND` | Backend bổ sung API thống kê |

### Giai đoạn 9: Hoàn thiện

Kiểm thử, trợ năng, rà soát bảo mật, triển khai (doc 12), cập nhật docs, demo đồ án.

---

## 3. Sơ đồ phụ thuộc

```mermaid
flowchart TD
  P0["GĐ 0: Nền tảng cấu hình"] --> P1["GĐ 1: App shell, AdminLayout, bảng dùng chung"]
  P1 --> P2["GĐ 2: Xác thực, RequireAdmin"]
  P2 --> P3["GĐ 3: Người dùng"]
  P2 --> P4["GĐ 4: Danh mục"]
  P2 --> P5["GĐ 5: Gian hàng"]
  P2 --> P6["GĐ 6: Kiểm duyệt sản phẩm"]
  P1 --> P7["GĐ 7: Skeleton trang chưa có API"]
  P3 --> P9["GĐ 9: Hoàn thiện"]
  P4 --> P9
  P5 --> P9
  P6 --> P9
  P7 --> P8["GĐ 8: Tích hợp khi Backend sẵn sàng"]
  P8 --> P9
  Q2["Q2: nơi lưu token"] -.->|"chặn"| P1
  Q1["Q1: đọc permission"] -.->|"ảnh hưởng guard"| P2
  B2["B2: thiếu @PreAuthorize"] -.->|"chặn"| P8
  Q12["Q12: merge branch"] -.->|"chặn"| P8
```

Giai đoạn 3 đến 6 độc lập nhau sau giai đoạn 2, có thể chia cho nhiều thành viên.

---

## 4. Điểm chặn đã biết & trạng thái (2026-11-22)

| Mã | Nội dung | Trạng thái / Ảnh hưởng |
|---|---|---|
| Q2 | Access token `localStorage` (`moldy-market:admin:access-token`), refresh token HttpOnly cookie `moldy_refresh` + `X-Moldy-Auth: 1` | **ĐÃ CHỐT** (xem `HANDOFF-ADMIN-FRONTEND.md`) |
| Q1 | `/users/me` đã trả `roles`, `permissions`, `storeId` | **ĐÃ GIẢI QUYẾT** (`403` vẫn là quyết định cuối) |
| B10, Q14 | Kích hoạt qua Email OTP; Admin **không được bypass OTP** | **ĐÃ GIẢI QUYẾT** |
| B1 | `SecurityConfig` đã có CORS `/api/**`, nhưng thiếu `allowCredentials(true)` & `X-Moldy-Auth` | Chỉ ảnh hưởng khi deploy cross-origin |
| B2 | Thiếu `@PreAuthorize` trên `WalletController`, `EscrowController`, `WithdrawalController` (đã sửa trên Voucher, Pricing, AdminAppraiser, Admin Order) | Không mở các trang Wallet/Escrow/Withdrawal khi chưa sửa |
| Admin Orders | Đã có `@IsAdmin` cho `start-shipping`, `mark-delivered`, `cod-collected`, nhưng chưa có API danh sách order toàn hệ thống | Để giai đoạn sau MVP |
| Q4, Q9, Q10 | Nghiệp vụ escrow, refund, dispute chưa có API hoàn chỉnh | Giữ skeleton |

## 5. Chưa có API (không làm tích hợp)

Theo doc 14 mục 4.3: thống kê dashboard, danh sách order cho admin, giao dịch, báo cáo, cài đặt hệ thống. Chỉ skeleton `TODO`. Không viết service đoán endpoint.

## 6. Theo dõi tiến độ

Mỗi giai đoạn một milestone GitHub; mỗi trang một issue gắn trạng thái Backend. Khi xong, cập nhật trạng thái Frontend (`NOT_STARTED`, `FOUNDATION_ONLY`, `INTEGRATED`) trong doc 04 và 07. Rà soát roadmap mỗi khi doc 14 đổi.

---

## Tài liệu liên quan

- Doc 04, 05: route và trang. Doc 08: xác thực. Doc 10: luồng.
- Doc 12: môi trường, CI. Doc 14: ma trận Backend. Doc 15: quy trình làm một tính năng.
