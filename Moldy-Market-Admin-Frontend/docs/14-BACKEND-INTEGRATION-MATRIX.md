# 14 - Backend Integration Matrix (Ma trận tích hợp Backend)

> **Trạng thái tài liệu:** BẢN NHÁP v0.3 (cập nhật 2026-11-08: thêm `feature/order`, đọc lại `feature/chat`, ghi nhận phản hồi của team), cần team review.
> **Áp dụng cho:** `Moldy-Market-User-Frontend` và `Moldy-Market-Admin-Frontend` (nội dung giống hệt nhau ở cả hai repo; cột "Dùng bởi" cho biết app nào cần mục đó).

Tài liệu này trả lời một câu hỏi: **hiện tại Backend thực sự có gì?** Mọi dòng đều được rút ra từ việc đọc source code Backend. Không có gì được suy đoán chỉ từ tên class, và mình chưa gọi thử endpoint nào trên server đang chạy.

Nếu một thông tin không có trong tài liệu này, Frontend phải coi nó là **chưa biết** và không được tự bịa ra.

---

## 0. Tóm tắt nhanh

**Đã có trên `main` và dùng được ngay:** đăng ký, đăng nhập, refresh token, logout, hồ sơ cá nhân, tạo và quản lý gian hàng, quản lý staff (thêm trực tiếp bằng email), category, product (tạo, sửa, xóa, tìm kiếm, gợi ý từ khóa), admin kiểm duyệt product, admin quản lý user và store.

**Đã có code nhưng nằm ở branch chưa merge (`IN_PROGRESS`):** notification, chat (REST và WebSocket), cart, wallet, escrow, withdrawal, voucher, pricing (auto pricing, appraiser, reference price), và mới là **checkout, order (phía người mua), payment kèm SePay webhook** (branch `feature/order`).

**Chưa có code ở bất kỳ branch nào đã đọc:** offer/thương lượng, refund (chỉ có class rỗng), dispute (chỉ có entity), wishlist, follow store, review, thống kê doanh thu và thống kê admin, và phía người bán của order (xác nhận, giao hàng, huỷ).

**Những điều cần biết trước khi code Frontend:**
1. JWT không chứa role hay permission. Hiện chưa có endpoint nào trả permission code của user (câu hỏi Q1).
2. Có nhiều kiểu phân trang khác nhau (kể cả không phân trang), và chỉ số `page` lúc bắt đầu từ 1, lúc bắt đầu từ 0.
3. URL không thống nhất: phần lớn là `/api/v1/...` nhưng voucher và pricing là `/api/...`.
4. Chat chỉ gắn hai user với nhau, không gắn với offer, order hay product.
5. Trên các branch chưa merge, nhiều endpoint admin và escrow chưa có kiểm tra quyền (mục 6, B2). Ẩn nút trên giao diện không thay thế được việc kiểm tra quyền ở Backend.
6. User mới đăng ký có trạng thái `PENDING_VERIFICATION`, và theo code thì chưa đăng nhập được cho đến khi admin chuyển sang `ACTIVE` (mục 3.5, B10). Team đã xác nhận: hiện chưa có luồng nào đặt user thành `ACTIVE`.
7. Sau khi SePay báo thanh toán thành công, code hiện chỉ cập nhật `Payment`, chưa cập nhật `CheckoutGroup` và `Order` (B12). Frontend chưa thể dựa vào trạng thái order để biết đã thanh toán.

---

## 1. Phương pháp và mốc thời gian

| Mục | Giá trị |
|---|---|
| Repository Backend | `https://github.com/Qt159/Moldy-Market` |
| Ngày chốt | 2026-11-03, cập nhật 2026-11-08 |
| `main` | commit `589a861` (2026-11-01, merge PR #4 `feature/product`) |
| Branch đã đọc | `main`, `feature/order` (commit `3b3d67c`, 2026-11-08; `feature/payment` trỏ cùng commit này), `feature/chat` (đọc lại, commit `68b87cb`, 2026-11-04), và đã đọc ở lần trước: `feature/notification`, `feature/escrow-wallet`, `feature/cart`, `feature/voucher`, `feature/pricing`, `integration/demo` |
| Lưu ý về độ mới | `feature/order` đã gộp `main`, `chat`, `voucher`, `escrow-wallet` nhưng **không có** `cart`, `notification`, `pricing`. Các branch đọc lần trước có đầu commit không đổi so với lần đọc (đã so sánh), trừ `feature/chat`. |
| Branch chưa đọc nội dung | `feature/category`, `feature/store`, `docs`. `feature/authorization` và `feature/security` đã là tổ tiên của `main` (tức đã merge). |
| Cách xác minh | Đọc tĩnh controller, DTO record, enum, `SecurityConfig`, `WebSocketConfig`, `ErrorCode`, `PermissionConstants`. Không gọi endpoint nào. |

### 1.1 Bảng trạng thái

| Trạng thái | Ý nghĩa trong tài liệu này |
|---|---|
| `IMPLEMENTED` | Code đã có trên `main`, đã đọc controller và DTO. |
| `PARTIALLY_IMPLEMENTED` | Có trên `main`, nhưng một phần hành vi dự kiến còn thiếu hoặc code ghi rõ chưa hỗ trợ. |
| `IN_PROGRESS` | Code chỉ có ở **branch chưa merge**. Tên branch được ghi rõ. Contract có thể thay đổi. |
| `PLANNED` | Có trong tài liệu thiết kế hoặc requirements, nhưng không có code ở branch nào đã đọc. |
| `NOT_FOUND` | Không có code và không có thiết kế dùng được. |
| `REQUIRES_BUSINESS_CLARIFICATION` | Quy tắc nghiệp vụ còn mơ hồ. Team phải quyết định trước khi Frontend xây dựng dựa trên nó. |

Trạng thái tích hợp phía Frontend: `NOT_STARTED` (chưa bắt đầu), `FOUNDATION_ONLY` (đã có công cụ nhưng chưa có service code), `INTEGRATED` (đã tích hợp).
Tại thời điểm viết bản nháp này, **mọi dòng đều là `NOT_STARTED`**.

### 1.2 Quy tắc cho dev Frontend

1. Chỉ các dòng `IMPLEMENTED` mới được viết service function gọi API thật.
2. Dòng `IN_PROGRESS` chỉ được viết service sau khi branch đã merge vào `main` và tài liệu này đã cập nhật.
3. Dòng `PLANNED` và `NOT_FOUND` chỉ làm skeleton trang, đánh dấu `TODO`, không viết code API.

---

## 2. Quy ước chung của Backend (đã xác minh)

### 2.1 Response envelope (khung phản hồi)

Mọi REST response (thành công lẫn lỗi) có dạng:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request completed successfully",
  "data": {},
  "timestamp": "2026-11-03T10:00:00Z"
}
```

Khi lỗi: `success` là `false`, `code` là một chuỗi `ErrorCode` (ví dụ `AUTH_001`), và `data` là object `ApiError` (có ít nhất đường dẫn request, các trường khác chưa được đọc).

Các ngoại lệ đã thấy trong controller:
- Một số endpoint **không có body**: `DELETE /api/v1/categories/{id}`, `DELETE /api/v1/products/{id}`, các thao tác `PATCH .../read`, `DELETE`, `PATCH .../restore` của notification, và `DELETE /api/admin/reference-prices/{id}`. Lớp Axios không được giả định lúc nào cũng có `response.data.data`.
- Payload WebSocket của chat **không** bọc trong `ApiResponse` (xem mục 5.2).
- Webhook SePay trả `{ "success": true }`, cũng không bọc trong `ApiResponse` (xem mục 5.8). Endpoint này chỉ để SePay gọi, Frontend không bao giờ gọi.

### 2.2 Các kiểu phân trang khác nhau

| Ở đâu | Tham số request | Dạng response | Ghi chú |
|---|---|---|---|
| Danh sách user, store (admin) | `page` (**bắt đầu từ 1**), `size`, `sort` | `PagedResponse { content, page, size, hasNext, totalElements }` | `totalElements` là `null` khi Backend dùng Slice. `size` tối đa 100, mặc định 20 (`PaginationConfig`). |
| Tìm kiếm product `GET /api/v1/products/search` | `page` (bắt đầu từ 1, dùng cùng resolver), `size` | `ProductSearchResponse { items, page, size, totalElements, totalPages, totalCapped, facets }` | `totalCapped = true` nghĩa là "có từ 10.000 kết quả trở lên". |
| Danh sách product `GET /api/v1/products` | chưa audit | `PagedResponse<ProductResponse>` (theo chữ ký method) | Chưa audit tham số request. Có record `ProductFilterRequest` (keyword, categoryId, minPrice, maxPrice, condition) nhưng chưa xác nhận endpoint này có dùng nó không. Nên ưu tiên dùng `/search` để duyệt sản phẩm. |
| Notification | `limit` (mặc định 20, tối đa 50), `token` | `NotificationPageResponse { items, nextToken, pageSize }` | **Phân trang bằng cursor**, token là chuỗi Base64 không đọc được ý nghĩa. `nextToken = null` nghĩa là hết trang. Dùng `useInfiniteQuery` của TanStack Query. |
| Lịch sử chat `GET /api/v1/conversations/{id}/messages` | `page` (**bắt đầu từ 0**, mặc định 0), `size` (mặc định **4**) | Spring `Page<MessageResponse>` do Jackson serialize | Controller nhận `page` và `size` như số nguyên thường và tự gọi `PageRequest.of(page, size)`, nên bỏ qua resolver bắt đầu từ 1 và `page` tính từ 0. Mặc định size 4 là rất nhỏ. |
| Danh sách admin trong pricing (`/api/admin/...`) | Pageable | Spring `Page<...>` | Dạng Spring page thô, không phải `PagedResponse`. |
| Order và payment của tôi | không có | `List<...>` thuần | `GET /api/v1/orders/me` và `GET /api/v1/payments/my-payments` trả toàn bộ, không phân trang. Riêng `orders/me` trả **404 `ORDER_003`** khi chưa có order nào; Frontend phải coi đó là trạng thái rỗng, không phải lỗi (B13). |

Frontend cần một adapter riêng cho mỗi dạng. Không nên viết một bộ phân trang chung giả định chỉ có một dạng.

### 2.3 Prefix URL không thống nhất

| Prefix | Module |
|---|---|
| `/api/v1/...` | auth, users, stores, staff, categories, products, notifications, conversations, carts, escrows, wallets, withdrawals, checkout-groups, orders, payments, `payment_transactions` (có dấu gạch dưới) |
| `/api/...` (không có `v1`) | vouchers (`/api/vouchers`, `/api/admin/vouchers`), pricing (`/api/pricing/...`), reference prices và appraiser admin (`/api/admin/...`) |

Hệ quả cho Frontend: `baseURL` của Axios **không được gắn cứng `/api/v1`**. Các service dùng nguyên đường dẫn như ghi trong tài liệu này.

### 2.4 CORS

Không có cấu hình CORS cho REST ở bất kỳ branch nào đã đọc. Chỉ endpoint WebSocket có `setAllowedOriginPatterns("*")`. Khi phát triển, Frontend dùng Vite proxy. Khi production, team Backend phải thêm CORS, hoặc các app phải được phục vụ cùng origin với API. Xem mục 6.

### 2.5 Các nhóm mã lỗi (từ `ErrorCode`)

`AUTH_*`, `USER_*`, `ROLE_*`, `STORE_*` (gồm cả staff), `CAT_*`, `PROD_*`, `NOTIFICATION_*`, `COMMON_*`; riêng trên `feature/cart` còn có `PRICING_*`, `VOUCHER_*`, `NOTIF_*`, và trên `feature/order` còn có `ORDER_*`, `PAYMENT_*`. Các mã đáng chú ý mà Frontend phải xử lý:

| Mã | HTTP | Ý nghĩa |
|---|---|---|
| `COMMON_001` | 400 | Validation thất bại |
| `COMMON_003` | 401 | Cần đăng nhập |
| `COMMON_004` | 403 | Không đủ quyền |
| `COMMON_009` | 429 | Gọi quá nhiều (rate limit) |
| `COMMON_010` | 409 | Dữ liệu bị người khác sửa trước (optimistic lock, xem `version` ở update product) |
| `AUTH_001` | 401 | Sai email hoặc mật khẩu |
| `AUTH_003` / `AUTH_004` | 403 | Tài khoản bị khóa / bị vô hiệu |
| `AUTH_005` / `AUTH_006` / `AUTH_007` | 401 | Refresh token không hợp lệ / hết hạn / **phát hiện dùng lại** (với `AUTH_007`, Backend đã thu hồi mọi phiên đăng nhập của user, xem 3.2) |
| `STORE_004` | 403 | Gian hàng bị chặn |
| `STORE_015` | 403 | Không có quyền quản lý tài nguyên của gian hàng này |
| `PROD_008` | 409 | Đã đạt giới hạn số tin đăng |
| `PROD_010` | 400 | Sản phẩm không còn `ACTIVE` (khi checkout) |
| `ORDER_001` | 404 | Order không tồn tại |
| `ORDER_003` | 404 | Chưa có order nào (trả khi danh sách rỗng) |
| `ORDER_005` | 400 | Trùng sản phẩm trong cùng một lần checkout |
| `ORDER_008` | 409 | Checkout group không ở trạng thái hợp lệ |
| `ORDER_011` | 403 | Không được truy cập checkout group này |
| `PAYMENT_001` | 404 | Payment không tồn tại (cũng trả khi payment của người khác) |
| `PAYMENT_002` / `PAYMENT_003` | 401 / 400 | Webhook sai chữ ký / sai định dạng (chỉ phía SePay gặp) |

Danh sách đầy đủ nằm trong `ErrorCode.java`. Message của Backend là tiếng Anh; Frontend nên ánh xạ `code` sang key i18n và không hiển thị trực tiếp message của Backend.

---

## 3. Mô hình xác thực và phân quyền (Cập nhật 2026-11-22)

### 3.1 Endpoint

| Tính năng | Endpoint | Method | Xác thực / Header | Request | `data` trả về |
|---|---|---|---|---|---|
| Đăng ký | `/api/v1/auth/register` | POST | công khai (rate-limited) | `{ email, password(8-100), fullName(<=100), phone? }` | `201 { userId, email, fullName, status }` |
| Xác minh email OTP | `/api/v1/auth/verify-email` | POST | công khai (rate-limited) | `{ email, code(6 digits), password }` | `Void` |
| Gửi lại OTP | `/api/v1/auth/resend-verification` | POST | công khai (rate-limited) | `{ email }` | `Void` |
| Đăng nhập | `/api/v1/auth/login` | POST | công khai + bắt buộc `X-Moldy-Auth: 1` | `{ email(<=254), password }` | `AccessTokenResponse { userId, email, fullName, accessToken, tokenType }` + `Set-Cookie: moldy_refresh` |
| Refresh | `/api/v1/auth/refresh` | POST | Cookie `moldy_refresh` + bắt buộc `X-Moldy-Auth: 1` | không body (`undefined`) | `AccessTokenResponse` + xoay vòng cookie `moldy_refresh` |
| Đăng xuất | `/api/v1/auth/logout` | POST | Cookie `moldy_refresh` + bắt buộc `X-Moldy-Auth: 1` | không body (`undefined`) | `Void` + xóa cookie `moldy_refresh` |

### 3.2 Thông tin về token

| Thông tin | Giá trị | Nguồn |
|---|---|---|
| Access token | Trả trong `AccessTokenResponse.accessToken` (JSON body). Admin FE lưu qua `src/lib/tokenStorage.js` (`moldy-market:admin:access-token`). | `AuthController`, Handoff 2026-11-21 |
| Refresh token | **HttpOnly cookie `moldy_refresh`** (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth`). **Không trả trong JSON body.** | `AuthController` |
| Thời hạn access / refresh token | 15 phút / 30 ngày (profile local) | `application-local.yaml` |
| Claim của access token | `sub`, `email`, `tokenType = "ACCESS"` (không chứa role/permission) | `JwtService` |
| Cache-Control & CSRF | `Cache-Control: no-store`; bắt buộc `X-Moldy-Auth: 1` và `withCredentials: true` | `AuthController` |
| Xoay vòng / phát hiện dùng lại | Dùng lại refresh token cũ trả `401 AUTH_007` và **thu hồi toàn bộ phiên của user**. | `RefreshTokenService` |

### 3.3 Phân quyền dựa trên permission, tính lại ở mỗi request

`CustomUserDetailsService` dựng danh sách authority ở mỗi request từ: `ROLE_<tên>` (`USER`, `APPRAISER`, `STAFF`, `ADMIN`, `OWNER`), các permission `FULL` của role, và permission `DELEGATED` của staff. Controller dùng `@PreAuthorize` hoặc `@IsAdmin` / `@IsUser` / `@IsAppraiser`.

### 3.4 Frontend biết được gì về permission

| Nhu cầu | Hiện có không? |
|---|---|
| Tên role, permission code và `storeId` của user hiện tại | Có: `GET /api/v1/users/me` trả `roles: string[]`, `permissions: string[]` và `storeId`. |
| Quyền vào Admin app | Kiểm tra `roles.includes('ADMIN')` từ `/users/me` (UX gate). Backend vẫn là chốt chặn cuối (`403`). |

### 3.5 Kích hoạt tài khoản sau khi đăng ký (Email OTP — đã triển khai)

1. User mới đăng ký có trạng thái `PENDING_VERIFICATION` và tự xác minh qua Email OTP (`POST /api/v1/auth/verify-email`) để chuyển sang `ACTIVE`.
2. **Quyết định nghiệp vụ đã chốt (2026-11-21):** **Admin không được bypass OTP** để kích hoạt `PENDING_VERIFICATION` sang `ACTIVE`.

---

## 4. Ma trận tính năng (Cập nhật 2026-11-22 — đồng bộ Backend `07ef520` + local)

`Dùng bởi`: U = User Frontend, A = Admin Frontend. Toàn bộ dòng Admin FE hiện ở trạng thái `NOT_STARTED` (scaffold).

### 4.1 Endpoints Admin MVP (`IMPLEMENTED` trên `main`)

| Tính năng | Controller | Endpoint | Xác thực / permission | FE (A) |
|---|---|---|---|---|
| Đăng nhập / refresh / logout | `AuthController` | xem 3.1 (`X-Moldy-Auth: 1` + cookie) | công khai | `NOT_STARTED` |
| Hồ sơ phiên hiện tại | `UserController` | `GET /api/v1/users/me` | đã đăng nhập (FE kiểm tra `roles.includes('ADMIN')`) | `NOT_STARTED` |
| Quản lý user | `UserController` | `GET /api/v1/users` (`PagedResponse`), `GET /api/v1/users/{id}`, `PUT /api/v1/users/{id}/status` | `USER_STORE_MANAGE` | `NOT_STARTED` |
| Quản lý store | `StoreController` | `GET /api/v1/stores` (`PagedResponse`), `GET /api/v1/stores/{id}`, `PUT /api/v1/stores/{id}/status` | `USER_STORE_MANAGE` | `NOT_STARTED` |
| Kiểm duyệt sản phẩm | `ProductController` | `GET /api/v1/products/search`, `GET /api/v1/products/{id}`, `PUT /api/v1/products/{id}/remove` (`{ reason }`), `PUT /api/v1/products/{id}/restore` | `PRODUCT_MODERATE` (lưu ý: cần xác minh search công khai có trả `REMOVED/HIDDEN` không) | `NOT_STARTED` |
| Quản lý danh mục | `CategoryController` | `GET /api/v1/categories`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` (`204 Void`) | `CATEGORY_MANAGE` | `NOT_STARTED` |

### 4.2 Endpoints Admin sau MVP (đã merge trên `main` / local, cần Audit trước khi nối)

| Tính năng | Controller | Endpoint | Xác thực quan sát được & Lưu ý | FE (A) |
|---|---|---|---|---|
| Giao hàng & thu COD | `OrderController` | `PATCH /api/v1/orders/admin/{orderId}/start-shipping`, `PATCH .../mark-delivered`, `POST .../cod-collected` | `@IsAdmin`; **chưa có API danh sách order toàn hệ thống** | `NOT_STARTED` |
| Quản lý Appraiser | `AdminAppraiserController` | `GET /api/v1/admin/appraisers` (`status?`), `GET /pending`, `GET /{id}/status`, `PATCH /{id}/{approve,reject,suspend,resume}` | `@PreAuthorize("hasRole('ADMIN')")` (thay thế `/api/admin/appraisers` cũ) | `NOT_STARTED` |
| Voucher hệ thống | `VoucherController` | `POST/GET /api/admin/vouchers`, `GET /api/admin/vouchers/{code}` | `@IsAdmin` | `NOT_STARTED` |
| Reference Price | `ReferencePriceController` | `GET/POST /api/admin/reference-prices` (Spring `Page`), `GET/PUT/DELETE /{id}` | `@IsAdmin` | `NOT_STARTED` |
| Escrow & Rút tiền | `EscrowController`, `WithdrawalController` | `/api/v1/escrows/{hold,orders/{id}/capture,orders/{id}/release}`, `PATCH /api/v1/withdrawals/{id}/{approve,complete,reject,fail}` | **B2 MỞ:** chỉ yêu cầu `authenticated()`, chưa có `@PreAuthorize` | `NOT_STARTED` |
| File Storage (Presigned URL) | `FileController` | `/api/v1/files/{presigned-url,{id}/confirm,{id}/download-url,{id}}` | đã đăng nhập; trả **RAW JSON** (không bọc `ApiResponse`) | `NOT_STARTED` |

### 4.3 Chưa có API (`NOT_FOUND` / `REQUIRES_BUSINESS_CLARIFICATION`)

| Tính năng | Trạng thái | Bằng chứng |
|---|---|---|
| Danh sách order toàn hệ thống cho admin | `NOT_FOUND` | Chỉ có `/orders/me` (buyer) và `/stores/{storeId}/orders` (store) |
| Thống kê dashboard admin, báo cáo/vi phạm, cấu hình hệ thống | `NOT_FOUND` | Không có controller |
| Yêu cầu và duyệt refund / dispute | `NOT_FOUND` / `REQUIRES_BUSINESS_CLARIFICATION` | `Refund` rỗng, `DisputeRequest` mới chỉ có entity |
| Cập nhật trạng thái order và checkout group sau khi thanh toán thành công, và tự động hết hạn | `NOT_FOUND` | Chỉ `Payment` được cập nhật. `PaymentCompletedEvent` được phát nhưng không có listener nào. `CheckoutGroup.markPaid()` và `markExpired()` có định nghĩa nhưng không ai gọi. Không thấy job `@Scheduled` nào. Xem B12. |
| Offer / thương lượng / counteroffer | `NOT_FOUND` | Không có code offer. `offer-negotiation.md` rỗng. Giới hạn số vòng chưa biết. |
| Yêu cầu và duyệt refund | `NOT_FOUND` dưới dạng API. Class `Refund` (trên `feature/order`) hiện **rỗng**, không có trường nào. Module escrow có `DisputeOutcome { PAY_SELLER, REFUND_BUYER }` và trạng thái `DISPUTED`, nhưng chưa controller nào mở refund hay dispute ra ngoài. | Xem các endpoint escrow ở 4.2. |
| Quy trình return / dispute | `REQUIRES_BUSINESS_CLARIFICATION` | Có permission `DISPUTE_*`. Entity `DisputeRequest` (trên `feature/order`) có `userId`, `orderId`, `description`, `imagesUrl`, `createdAt` nhưng chưa có controller hay service. Tài liệu thiết kế mô tả các trạng thái `OPEN`, `UNDER_REVIEW`, `RESOLVED_REFUND`, `RESOLVED_RELEASE`, `CLOSED` nhưng chưa được triển khai. |
| Wishlist | `NOT_FOUND` | không có code |
| Follow gian hàng | `NOT_FOUND` | không có code |
| Đánh giá gian hàng / người bán | `NOT_FOUND` | có permission `REVIEW_CREATE`, không có code |
| Tổng quan doanh thu / giao dịch của gian hàng | `NOT_FOUND` | có permission `STORE_STATS_VIEW`, không có controller |
| Thống kê dashboard admin | `NOT_FOUND` | có permission `ANALYTICS_SYSTEM_VIEW`, không có controller |
| Admin: quản lý giao dịch, khiếu nại, báo cáo/vi phạm, cấu hình hệ thống | `NOT_FOUND` | không có controller |
| Biểu đồ giá / phân tích thị trường | `NOT_FOUND` | Reference price chỉ có CRUD cho admin (4.2). Không endpoint nào trả giá trung bình theo category hay sản phẩm tương tự. |
| Sản phẩm tương tự | `NOT_FOUND` | không có endpoint riêng (endpoint search có thể đáp ứng một phần, cần hỏi team) |
| Upload ảnh | `NOT_FOUND` | `image-upload.md` rỗng. Ảnh product được gửi dưới dạng **URL HTTPS** (tối đa 10, mỗi URL tối đa 500 ký tự). Cơ chế upload chưa rõ. Xem Q5. |
| Notification thời gian thực | `NOT_FOUND` | Notification lưu trong DynamoDB và phát qua SQS publisher. Không thấy kênh đẩy xuống trình duyệt. |

---

## 5. Contract đã xác minh của các module đang phát triển

> Các contract này lấy từ branch chưa merge. Hãy coi là **tạm thời**.

### 5.1 Notification

```text
NotificationRecord {
  notificationId: string, userId: string, type: string,
  referenceType: string, referenceId: string,
  title: string, content: string, isRead: boolean,
  createdAt: string, deletedAt: string | null
}
NotificationPageResponse { items: NotificationRecord[], nextToken: string | null, pageSize: number }
```

- `type` và `referenceType` là chuỗi thường. **Không có enum liệt kê giá trị trong code**, nên Frontend phải có cách hiển thị dự phòng cho type chưa biết.
- Trường cờ đã đọc có thể được serialize thành `read` hoặc `isRead` tùy cấu hình Jackson với record component tên `isRead`. Phải kiểm tra bằng response thật trước khi code.
- Các thao tác `PATCH` và `DELETE` trả body rỗng.
- ID của notification là chuỗi (không phải kiểu UUID).

### 5.2 Chat và WebSocket

| Mục | Giá trị đã xác minh |
|---|---|
| Giao thức | STOMP qua SockJS |
| Endpoint kết nối | `/chat` (nằm trên origin của Backend; SockJS tự thêm các sub-path của nó) |
| Xác thực | Frame STOMP `CONNECT` phải có native header `Authorization: Bearer <accessToken>`. Thiếu hoặc token sai sẽ bị từ chối kết nối. |
| Destination để gửi | `/app/conversations/{conversationId}/send` |
| Payload gửi | `{ type: "TEXT" \| "IMAGE" \| "FILE", content?: string, attachmentUrl?: string }` |
| Destination để nhận | `/user/queue/messages` (server đẩy cho cả người gửi lẫn người nhận) |
| Payload nhận | `MessageResponse { id: number, conversationId, senderId, type, content, attachment, sentAt }` |
| Broker prefix | `/topic`, `/queue`; application prefix `/app`; user prefix `/user` |
| Kênh báo lỗi | `/user/queue/errors`. Khi gửi tin gặp `AppException`, server đẩy `ChatErrorResponse { errorType, errorMessage, timestamp }` (tham số đầu là mã `ErrorCode`). Các exception khác `AppException` chưa có handler. Bản cũ ở `feature/cart` và `integration/demo` chưa có kênh này. |
| Subscribe | Khi SUBSCRIBE vào `/topic/conversations/{uuid}`, Backend kiểm tra user có thuộc conversation không. Tuy nhiên tin nhắn hiện được đẩy qua `/user/queue/messages`, không qua topic này. Frontend không cần subscribe topic. |
| Token hết hạn | Token chỉ được kiểm tra lúc CONNECT. Chưa biết chuyện gì xảy ra khi access token (15 phút) hết hạn trên socket đang mở. |

Phần REST:

| Endpoint | Request | `data` trả về |
|---|---|---|
| `POST /api/v1/conversations` | `{ targetUserId }` | `ConversationResponse { id, participant1Id, participant2Id, status(ACTIVE\|CLOSED), lastMessageAt, lastReadAtParticipant1, lastReadAtParticipant2, createdAt }` (tạo mới hoặc trả lại cuộc hội thoại có sẵn) |
| `GET /api/v1/conversations` | không | `ConversationResponse[]` (không phân trang) |
| `GET /api/v1/conversations/{id}/messages?page&size` | xem 2.2 | `Page<MessageResponse>`, tin mới nhất trước |
| `PATCH /api/v1/conversations/{id}/read` | không | không có data (đánh dấu đã đọc), chỉ có ở bản `feature/chat` mới nhất và `feature/order` |

Lưu ý quan trọng: một conversation chỉ là giữa **hai user** và được tạo chỉ với `targetUserId`. **Không có liên kết tới offer, order hay product** trong bất kỳ DTO nào. Điều này khác với ý tưởng chat gắn với offer. Xem Q6.
Endpoint "đánh dấu đã đọc" chỉ có ở bản `feature/chat` mới nhất.

### 5.3 Cart

`CartResponse { id, userId, status, items[], subtotal, totalItems, createdAt, lastUpdatedAt, abandonedAt }` với `CartItemResponse { id, listingId, sellerId, quantity, priceAtAddTime, totalPrice, note, createdAt, updatedAt }`.
Request: thêm `{ listingId, quantity >= 1, note }`, cập nhật `{ quantity >= 1, note }`.
Backend gọi product là `listingId`, trong khi `ProductResponse` dùng trường `id`. Xem Q7. Các giá trị của `CartStatus` chưa audit.

### 5.4 Escrow và withdrawal (chỉ mô hình dữ liệu)

- `EscrowStatus`: `HELD`, `CAPTURED`, `RELEASED`, `DISPUTED`.
- `DisputeOutcome`: `PAY_SELLER`, `REFUND_BUYER`.
- `WithdrawalStatus`: `REQUESTED`, `PROCESSING`, `COMPLETED`, `FAILED`, `REJECTED`.
- `EscrowHoldRequest { orderId: string, buyerId, sellerId, amount, fee }`; `EscrowHoldResponse { id: number, orderId: number, amount, feeAmount, status, createdAt, resolvedAt }` (lưu ý `orderId` là chuỗi ở request nhưng là số ở response).
- Các endpoint này trông giống **thao tác nội bộ của service** (client có thể gọi `hold` với buyer và số tiền tùy ý). Frontend có nên gọi chúng hay không là câu hỏi nghiệp vụ và bảo mật, xem B2 và Q4.

### 5.5 Voucher

`VoucherCheckResponse { code, discountType, discountValue, expiredAt, valid }`; `VoucherResponse { code, discountType, discountValue, remainingQuantity, expiredAt }`; request tạo `{ code, discountType, discountValue > 0, remainingQuantity > 0, expiredAt }`.
Hiện chỉ có API voucher cho **hệ thống/admin**. Chưa có API voucher cho người bán, dù đã có permission `VOUCHER_SELLER_MANAGE`. Các giá trị của `DiscountType` chưa audit.

### 5.6 Điểm chính của contract Product (`main`)

- Tạo product bắt buộc có `categoryId`, `title (<=150)`, `price (0 < price <= 1.000.000.000, tối đa 2 chữ số thập phân)`, `condition`, `pricingStrategy`. Tùy chọn: `storeId` (null nghĩa là đăng bán cá nhân), `description (<=2000)`, `images (<=10, chỉ https)`, `attributes` (kiểm tra bằng `@ValidProductAttributes`).
- Cập nhật bắt buộc có `version` (optimistic locking). Version cũ sẽ trả `COMMON_010`.
- Enum: `ProductCondition { NEW, LIKE_NEW, USED, DAMAGED }`, `ProductStatus { ACTIVE, HIDDEN, SOLD, DELETED, REMOVED }`, `PricingStrategy { SELLER_SET, AUTO_PRICING, APPRAISER }`.
- Người bán chỉ được chuyển qua lại giữa `ACTIVE` và `HIDDEN` (`PROD_004`).
- Tham số search: `q (<=100)`, `categoryId[] (<=20)`, `condition[] (<=10)`, `minPrice`, `maxPrice`, `storeId`, `sellerType`, `attr[] (<=10)`, `sort`, `facets`. Giá trị `sort` hợp lệ: `relevance`, `newest`, `price_asc`, `price_desc`. `attr` được parse thành khóa và danh sách giá trị (OR trong cùng một khóa); định dạng chuỗi chính xác chưa audit.
- Các enum khác đã xác minh: `UserStatus { ACTIVE, LOCKED, PENDING_VERIFICATION }`, `StoreStatus { ACTIVE, BLOCKED }`.

### 5.7 Checkout và Order (`feature/order`, chưa merge)

> Contract tạm thời. Nội dung dưới đây lấy từ `CheckoutGroupController`, `OrderController`, các DTO và `CheckoutGroupService`.

**Tạo checkout:** `POST /api/v1/checkout-groups`

> Lưu ý: team đã quyết định bỏ `quantity` (mỗi sản phẩm cũ chỉ bán 1 món, xem Q17). Request dưới đây là bản **hiện tại trên branch** và sẽ thay đổi khi Backend sửa.

```text
CheckoutGroupRequest {
  orderItems: [{ productId: UUID, quantity: 1..100 }]   // 1 đến 20 phần tử
  receiverName: string (<=255)
  phoneNumber: string, theo regex ^(\+84|0)\d{9,10}$
  shippingAddress: string (<=500)
  method: "COD" | "ONLINE_BANKING"
  note?: string (<=500)
}
```

Quy tắc đã xác minh trong code:
- **Giá do Backend tính** từ `product.price`. Frontend không gửi giá và không được tự tính tổng để quyết định số tiền thanh toán; chỉ hiển thị `totalAmount` do Backend trả.
- Không được trùng `productId` trong một request (lỗi `ORDER_005`). Mọi product phải tồn tại và đang `ACTIVE` (lỗi `PROD_010` nếu không).
- Backend **tự tách thành nhiều order** theo cặp `(sellerId, storeId)`. Một lần checkout có thể trả về nhiều order.
- `ONLINE_BANKING`: `expiredAt = bây giờ + 15 phút`. `COD`: `expiredAt = null`.
- Phí ship luôn là 0. Voucher chưa được áp dụng (phần code bị comment). Tồn kho chưa được giữ hoặc trừ (`//todo: subtract quantity, reverse stock`). Xem B14.

```text
CheckoutResponse {
  id: UUID, totalAmount, expiredAt | null,
  orders: OrderSummaryResponse[], status: CheckoutGroupStatus,
  paymentResponse: PaymentResponse
}
OrderSummaryResponse { id, orderCode, checkoutGroupId, buyerId, sellerId, status, totalAmount, createdAt, expiredAt, items[] }
PaymentResponse { id, amount, paymentStatus: string, qrBankUrl: string | null, checkoutGroupId }
```

Đọc lại: `GET /api/v1/checkout-groups/{id}` trả cùng `CheckoutResponse`. Chỉ người mua được xem (`ORDER_011` nếu không phải).

**Order của người mua:**

```text
OrderResponse {
  id, orderCode, checkoutGroupId, buyerId, sellerId, storeId, status,
  totalAmount, receiverName, receiverPhone, shippingFee, shippingAddress,
  shopDiscount, platformDiscount,
  confirmedAt, shippedAt, deliveredAt, returnDeadline, completedAt, cancelledAt, createdAt,
  items: [{ id: number, orderId, productId, productName, unitPrice, quantity, imageUrl }]
}
```

- `GET /api/v1/orders/me` trả `OrderResponse[]`, không phân trang, và trả **404 `ORDER_003`** khi rỗng (B13).
- `GET /api/v1/orders/{orderId}` **không kiểm tra chủ sở hữu** (B11).
- `POST /api/v1/orders/admin/{orderId}/cod-collected` (`@IsAdmin`): chỉ cho order đang `DELIVERED`, chuyển sang `COMPLETED`; order ở trạng thái khác trả `ORDER_009`.

**Enum (đã xác minh):**
- `CheckoutGroupStatus`: `PENDING_PAYMENT`, `PAID`, `CANCELLED`, `EXPIRED`.
- `OrderStatus`: `PENDING_PAYMENT`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `EXPIRED`, `DISPUTED`, `REFUNDED`.
- `PaymentMethod`: `COD`, `ONLINE_BANKING`.
- `PaymentStatus`: `PENDING`, `PROCESSING`, `SUCCESSFUL`, `FAILED`.

**Chuyển trạng thái order thực sự có trong code:** order được tạo ở `PENDING_PAYMENT`; `DELIVERED` sang `COMPLETED` do admin. Mọi chuyển trạng thái khác chưa có code, kể cả các trạng thái có trong enum. Frontend không được vẽ timeline order như thể các bước này đã chạy.

### 5.8 Thanh toán SePay (`feature/order`, chưa merge)

**Phía Frontend nhận được gì:** trong `PaymentResponse`, `qrBankUrl` là một URL ảnh QR do Backend tạo (dạng `https://vietqr.app/img?acc=...&bank=...&amount=...&des=<mã thanh toán>`), và là `null` với `COD`. Mã thanh toán có dạng `MM` + 8 ký tự chữ hoa hoặc số, được dùng làm nội dung chuyển khoản. Số tài khoản và tên ngân hàng nằm trong cấu hình Backend. Frontend chỉ hiển thị ảnh theo URL này và **không tự dựng QR**. Chưa có endpoint nào trả thông tin chuyển khoản dạng chữ (số tài khoản, ngân hàng, nội dung), xem Q11.

**Luồng webhook (chỉ để hiểu, Frontend không gọi):**

1. SePay gọi `POST /api/v1/payment_transactions/webhook/sepay`. Endpoint công khai, nhưng Backend kiểm tra chữ ký HMAC-SHA256 trong header `X-SePay-Signature` (dạng `sha256=<hex>`, tính trên `timestamp + "." + body`) cùng `X-SePay-TimeStamp` lệch không quá 300 giây. Sai thì trả `PAYMENT_002`.
2. Mỗi giao dịch được lưu theo `(provider, externalId)`, nên SePay gửi lại cùng giao dịch sẽ bị bỏ qua (idempotent).
3. Giao dịch tiền ra (`OUT`) chỉ ghi nhận (`IGNORED`).
4. Backend tìm payment theo mã `MM[A-Z0-9]{8}` trong nội dung chuyển khoản. Không tìm thấy thì ghi `UNMATCHED`.
5. **Số tiền phải khớp chính xác** với `payment.amount`. Lệch thì ghi `AMOUNT_MISMATCH` và payment vẫn `PENDING`.
6. Khớp và payment đang `PENDING`: payment chuyển `SUCCESSFUL`, ghi `paidAt`, phát `PaymentCompletedEvent`. Nếu payment không còn `PENDING`: ghi `DUPLICATE` (đã thành công) hoặc `LATE` (đã hết hạn hay thất bại).
7. `MatchStatus`: `MATCHED`, `UNMATCHED`, `AMOUNT_MISMATCH`, `LATE`, `DUPLICATE`, `IGNORED`.

**Hệ quả cho Frontend:**

- Không có kênh push. Để biết đã thanh toán, Frontend phải **polling** `GET /api/v1/payments/{id}` (hoặc `GET /api/v1/checkout-groups/{id}`) và chỉ coi là thành công khi `paymentStatus === "SUCCESSFUL"` do Backend trả. Bấm nút "Tôi đã chuyển khoản" không bao giờ được coi là thanh toán thành công.
- Chỉ tin `paymentStatus`. `CheckoutGroup.status` và `Order.status` hiện **không** được cập nhật sau khi thanh toán (B12), nên chúng vẫn là `PENDING_PAYMENT` dù tiền đã về.
- `expiredAt` chỉ để hiển thị đếm ngược. Không thấy job tự động chuyển trạng thái hết hạn, nên đếm ngược về 0 không có nghĩa Backend đã huỷ. Chuyển khoản trễ hoặc lệch số tiền chưa có đường xử lý (code ghi `//todo: late/duplicate -> refund or re-reserve`).
- `paymentStatus` trong DTO là chuỗi, giá trị theo enum `PaymentStatus`. Hãy xử lý giá trị lạ bằng nhánh mặc định.

---

## 6. Vấn đề cần báo team Backend

Đây là những điều quan sát được khi đọc code, không phải việc của Frontend.

| ID | Quan sát | Vì sao Frontend cần quan tâm |
|---|---|---|
| B1 | Không có cấu hình CORS cho REST. | Trình duyệt không gọi được API khác origin, trừ khi đi qua Vite proxy. |
| B2 | Trên `feature/cart` (và các feature branch khác), **không** controller nào của cart, wallet, escrow, withdrawal, voucher admin, pricing, reference-price hay appraiser admin có `@PreAuthorize`, và `SecurityConfig` chỉ yêu cầu `authenticated()`. Bất kỳ user nào đã đăng nhập đều có thể gọi `/api/admin/**`, `/api/v1/escrows/**` và `/api/v1/withdrawals/*/approve`. | Frontend có ẩn giao diện admin thì cũng không phải là bảo mật. Backend cần sửa trước khi phát hành. |
| B3 | Các branch lệch nhau: `SecurityConfig` của `feature/cart` cho phép công khai `GET /api/categories/**` và `GET /api/vouchers/**` nhưng không liệt kê `/api/v1/products...` hay `/api/v1/categories`, trong khi `main` thì ngược lại. | Sau khi merge, việc duyệt công khai có thể âm thầm bắt phải đăng nhập. Cần kiểm tra lại danh sách route công khai sau khi tích hợp. `SecurityConfig` của `feature/order` (đã gộp `main`) liệt kê đủ route công khai của product, category, store, `/chat/**` và webhook, nên có thể dùng làm mốc đối chiếu. |
| B4 | Prefix URL lẫn lộn (`/api/v1` và `/api`). | Xem 2.3. |
| B5 | Đã được xử lý ở `feature/chat` mới nhất: lỗi `AppException` được gửi tới `/user/queue/errors`. Các branch cũ hơn (`cart`, `integration/demo`) vẫn chưa có. Lỗi không phải `AppException` vẫn chưa có đường báo. | Cần chốt branch tích hợp để biết dùng bản nào. |
| B6 | Lịch sử chat mặc định `size = 4` và `page` bắt đầu từ 0, trong khi các endpoint khác bắt đầu từ 1. | Dễ gây lỗi lệch trang. |
| B7 | `orderId` là chuỗi ở `EscrowHoldRequest` nhưng là số ở `EscrowHoldResponse`, trong khi `Order.id` trên `feature/order` là UUID. | Contract không nhất quán, và escrow hiện chưa thể gắn với order thật. |
| B8 | Các tài liệu thiết kế cho chat, offer, vòng đời order, payment/escrow và upload ảnh đều rỗng (0 byte) trên `main`. | Frontend không có contract viết sẵn cho các phần này. |
| B9 | Tên class `UserProfileReSponse` bị viết sai chính tả. | Chỉ là thẩm mỹ, nội bộ, không ảnh hưởng JSON. |
| B10 | Đăng ký đặt user ở `PENDING_VERIFICATION`, đăng nhập chỉ cho `ACTIVE`, và không có endpoint xác minh nào. Chỉ admin (qua `PUT /users/{id}/status`) hoặc tài khoản admin seed mới có `ACTIVE`. Team xác nhận ngày 2026-11-08. | User tự đăng ký xong không đăng nhập được. Frontend chưa thể làm luồng đăng ký rồi đăng nhập hoàn chỉnh. |
| B11 | `GET /api/v1/orders/{orderId}` không kiểm tra người gọi có phải chủ order. Mọi user đã đăng nhập đều xem được order của người khác (tên, số điện thoại, địa chỉ nhận hàng). `GET /checkout-groups/{id}` và `GET /payments/{id}` thì có kiểm tra. | Lộ dữ liệu cá nhân. Backend cần sửa trước khi phát hành. |
| B12 | Sau khi SePay báo thành công chỉ `Payment` đổi sang `SUCCESSFUL`. `PaymentCompletedEvent` không có listener, `CheckoutGroup.markPaid()` và `markExpired()` không được gọi, order vẫn `PENDING_PAYMENT`, và không có job hết hạn. | Team dự định gắn listener cho `PaymentCompletedEvent` (chưa có code, ghi nhận 2026-11-08). Cho đến khi đó được merge và ghi vào tài liệu này, Frontend chỉ tin được `paymentStatus` của payment, không tin `status` của order hay checkout group. |
| B13 | `GET /api/v1/orders/me` trả 404 (`ORDER_003`) khi người mua chưa có order. | Trạng thái rỗng bị trả như lỗi. Frontend phải xử lý riêng. |
| B14 | Checkout chưa giữ hay trừ tồn kho (`//todo`), chưa áp voucher, phí ship luôn 0. `ProductResponse` không có trường số lượng tồn nhưng checkout nhận `quantity` từ 1 đến 100 (team đã quyết định bỏ `quantity`, xem Q17). | Có thể bán trùng cùng một sản phẩm cho nhiều người. Cần cơ chế giữ hàng hoặc khoá sản phẩm khi đã có checkout. |

---

## 7. Câu hỏi nghiệp vụ và kỹ thuật còn mở

| ID | Câu hỏi | Chặn việc gì |
|---|---|---|
| Q1 | Frontend biết **permission code** của user bằng cách nào (và với staff thì biết thuộc gian hàng nào)? `GET /stores/my-store/staff/me` yêu cầu `STORE_STAFF_MANAGE`, mà một staff bình thường có thể không có quyền này. | Menu theo permission trong Store Dashboard. |
| Q2 | Frontend lưu access/refresh token ở đâu (bộ nhớ, `localStorage`, hay cookie httpOnly)? Backend trả cả hai trong JSON body, nên dùng cookie sẽ phải sửa Backend. | Doc 08 và lớp Axios. |
| Q3 | **Đã trả lời từ source** (xem 3.2): khi gặp `AUTH_007`, Backend thu hồi toàn bộ phiên của user. Cách UI thông báo cho user sẽ ghi ở doc 08. | Doc 08. |
| Q4 | Ai gọi escrow `hold` / `capture` / `release`: service order nội bộ hay Frontend? | Frontend có cần các endpoint này không. |
| Q5 | Ảnh product upload bằng cách nào (API chỉ nhận URL HTTPS)? Pre-signed URL? Dịch vụ bên thứ ba? | Trang tạo/sửa product. |
| Q6 | Chat có gắn với offer, order hay product không? Hiện conversation chỉ là `(participant1, participant2)`. | Điểm vào chat trên giao diện. |
| Q7 | `listingId` trong cart có đúng là `Product.id` không? | Liên kết cart với product. |
| Q8 | Thương lượng offer: số vòng, thời hạn, ai được counter? | Quy tắc giao diện offer. `REQUIRES_BUSINESS_CLARIFICATION`. |
| Q9 | Refund: ai được yêu cầu, có những trạng thái nào, có hoàn một phần không? Requirements nói Admin xử lý refund thủ công; hiện chưa có API. | Các trang refund. |
| Q10 | Quy trình dispute chưa được định nghĩa. | Các trang dispute giữ ở `PLANNED`. |
| Q11 | **Đã biết một phần** (mục 5.8): QR là URL ảnh do Backend trả, trạng thái lấy bằng polling `GET /payments/{id}`. Còn thiếu: thông tin chuyển khoản dạng chữ (số tài khoản, ngân hàng, nội dung), tần suất polling hợp lý, và cách xử lý chuyển khoản trễ hoặc sai số tiền. | Trang thanh toán. |
| Q12 | Branch nào là đích tích hợp, và khi nào `order`, `payment`, `notification`, `chat`, `cart`, `voucher`, `pricing`, `escrow-wallet` được merge vào `main`? Lưu ý `feature/order` đã gộp `main`, `chat`, `voucher`, `escrow-wallet` nhưng **không có** `cart`, `notification`, `pricing`. | Quyết định khi nào các dòng `IN_PROGRESS` được phép code. |
| Q13 | `isRead` trong JSON của notification được serialize thành `read` hay `isRead`? | Hiển thị danh sách notification. |
| Q14 | Luồng kích hoạt tài khoản sau khi đăng ký là gì (email xác minh, OTP, hay admin duyệt)? Xem B10. | Trang đăng ký, đăng nhập và thông báo sau đăng ký. |
| Q15 | **Team đang bàn lại (2026-11-08), chưa có quyết định.** Ai chuyển order qua `CONFIRMED`, `SHIPPING`, `DELIVERED`? Người bán xác nhận và giao hàng thế nào? Người mua xác nhận đã nhận hàng và huỷ order ở đâu? Hiện chỉ có admin `cod-collected`. | Trang quản lý order của Store Dashboard và timeline order của người mua. |
| Q16 | Cart dùng `listingId`, checkout dùng `productId` và nhận danh sách item riêng, không đọc từ cart. Sau checkout có xoá item khỏi cart không? Voucher áp dụng ở checkout thế nào (code hiện đang comment)? | Luồng cart sang checkout. |
| Q17 | **Đã quyết định (2026-11-08):** đồ cũ chỉ bán 1 món cho mỗi sản phẩm, bỏ `quantity`. Backend chưa sửa code (branch hiện vẫn nhận `quantity` 1 đến 100), nên contract checkout ở mục 5.7 sẽ đổi. Frontend không làm ô chọn số lượng. **Còn mở:** khi một sản phẩm đang nằm trong checkout chờ thanh toán của người này, người khác có đặt được không (giữ hàng trong 15 phút hay không)? | Form checkout, trang chi tiết sản phẩm. |
| Q18 | COD: ai thu tiền và khi nào (endpoint tên `cod-collected` nhưng chuyển `DELIVERED` sang `COMPLETED`)? Escrow có áp dụng cho order COD và order trả bằng chuyển khoản không, và nối với order bằng cách nào? | Trang order, trang escrow của admin. |

---

## 8. Bảo trì tài liệu

### Ghi nhận khi bàn giao Admin — 2026-11-21

Decision update sau khi Chu trả lời “duyệt 4 điểm” ngày 2026-11-21: MVP Admin theo thứ tự auth/ADMIN guard → users → stores → product moderation → categories; các module khác để sau contract audit. Chưa cho admin bypass email OTP để kích hoạt PENDING_VERIFICATION; admin UI không có action thay xác minh email. Đây là BUSINESS_APPROVED, chưa audit/sửa enforcement admin status endpoint trong task này. Appraiser bị chặn hàng của bản thân/shop sở hữu/shop đang làm staff, Backend implementation/test pending. Baseline sẽ review/tách commit và trình duyệt trước commit/push; chưa có shared baseline commit mới.

Xem [HANDOFF-ADMIN-FRONTEND.md](HANDOFF-ADMIN-FRONTEND.md). Snapshot auth/token/OTP cũ trong tài liệu và AGENTS phải đọc cùng decision cập nhật: access token localStorage theo namespace từng app, refresh HttpOnly cookie Backend set; email OTP hợp lệ kích hoạt ngay, user tự login. Không mặc định admin duyệt mọi đăng ký mới. Đã đối chiếu scoped local Backend `dc11b09`: UserSummaryResponse không có roles, UpdateUserStatusRequest là {status}; PaginationConfig request Pageable 1-based và PagedResponse.page 1-based. OrderController hiện có @IsAdmin PATCH /api/v1/orders/admin/{orderId}/start-shipping, PATCH .../mark-delivered và POST .../cod-collected; chưa xác minh nguồn admin order-list/detail nên không dùng buyer/store API thay thế. Appraisal hiện là module requests/applications/invitations/assignments/reports/reviews, application không phải hồ sơ xin role Appraiser. Các ghi nhận source này chưa phải HTTP/security audit đầy đủ hoặc trạng thái Frontend INTEGRATED; cần cập nhật từng contract trong task triển khai. Không sửa Backend trong lần bàn giao.

- Cập nhật tài liệu này **trong cùng Pull Request** mỗi khi một branch Backend được merge hoặc một Frontend service được thêm.
- Khi một dòng đổi trạng thái, ghi lại commit hoặc PR của Backend làm căn cứ.
- Giữ file này giống hệt nhau ở cả hai repo Frontend.
