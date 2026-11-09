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

## 3. Mô hình xác thực và phân quyền (đã xác minh trên `main`)

### 3.1 Endpoint

| Tính năng | Endpoint | Method | Xác thực | Request | `data` trả về |
|---|---|---|---|---|---|
| Đăng ký | `/api/v1/auth/register` | POST | không | `{ email, password(8-100), fullName(tối đa 100), phone }` | `{ userId, email, fullName, status }` |
| Đăng nhập | `/api/v1/auth/login` | POST | không | `{ email(tối đa 254), password }` | `{ userId, email, fullName, accessToken, refreshToken, tokenType }` |
| Refresh | `/api/v1/auth/refresh` | POST | không | `{ refreshToken }` | giống login |
| Đăng xuất | `/api/v1/auth/logout` | POST | không | `{ refreshToken }` | không có data |

### 3.2 Thông tin về token

| Thông tin | Giá trị | Nguồn |
|---|---|---|
| Cả hai token được trả trong JSON body | có | `AuthResponse` |
| Thời hạn access token | 900.000 ms = 15 phút | `application-local.yaml` (**chỉ profile local**) |
| Thời hạn refresh token | 2.592.000.000 ms = 30 ngày | như trên |
| Claim của access token | `sub` (user id), `email`, `tokenType = "ACCESS"` | `JwtService` |
| Role / permission nằm trong JWT | **Không** | `JwtService` |
| Lưu refresh token | có trạng thái (entity và repository trong database) | `security/refreshToken` |
| Xoay vòng / phát hiện dùng lại | Mỗi lần refresh, token cũ bị thu hồi và cấp token mới. Nếu một token đã bị thu hồi mà vẫn được gửi lên, Backend **thu hồi toàn bộ phiên đăng nhập đang hoạt động của user** và trả `AUTH_007`. Logout chỉ thu hồi phiên của refresh token được gửi lên. Refresh token lưu dạng hash trong database. | `RefreshTokenService.rotate` / `revoke` (đã đọc code); chi tiết hash lấy từ commit message của `feature/security` |

### 3.3 Phân quyền dựa trên permission, tính lại ở mỗi request

`CustomUserDetailsService` dựng danh sách authority ở mỗi request đã xác thực, từ:

1. `ROLE_<tên>` cho từng role user đang có. Tên role: `USER`, `APPRAISER`, `STAFF`, `ADMIN`, `OWNER`.
2. Mọi permission code có grant type `FULL` của các role đó.
3. Nếu user là staff của gian hàng: các permission code **được ủy quyền cho bản ghi staff đó**.

Controller dùng `@PreAuthorize("hasAuthority('<PERMISSION>')")`. Các permission code được khai báo trong `PermissionConstants` (ví dụ `PRODUCT_CREATE`, `STORE_STAFF_MANAGE`, `ADMIN_PORTAL_ACCESS`, `CATEGORY_MANAGE`, `USER_STORE_MANAGE`, `PRODUCT_MODERATE`).

Entity `UserRole` là `(user_id, role_id, store_id)`. Cột `store_id` làm cho việc gán role **gắn theo từng gian hàng**.

### 3.4 Frontend biết được gì về permission

| Nhu cầu | Hiện có không? |
|---|---|
| Tên role của user hiện tại | Có: `GET /api/v1/users/me` trả `roles: string[]`. |
| Permission code của user hiện tại | **Chưa thấy endpoint nào.** `/users/me` chỉ trả tên role; JWT không có. |
| Permission của một staff | `StaffResponse.permissions` qua `GET /api/v1/stores/my-store/staff/me`, nhưng endpoint này yêu cầu `STORE_STAFF_MANAGE`. Xem Q1. |
| Staff thuộc gian hàng nào | Chưa có endpoint đã xác minh nào cung cấp. |

Cho đến khi Q1 được giải quyết, Frontend chỉ có thể ẩn/hiện menu dựa trên **tên role**, và luôn phải coi phản hồi `403` là quyết định thật sự. Backend là nguồn quyết định cuối cùng.

### 3.5 Kích hoạt tài khoản sau khi đăng ký (team đã xác nhận)

Theo đọc code, và team Backend đã xác nhận ngày 2026-11-08 rằng chưa có luồng nào đặt user thành `ACTIVE`:

1. Đăng ký đặt trạng thái user là `PENDING_VERIFICATION` (`AuthenticationService`, entity `User`).
2. Đăng nhập đi qua Spring `authenticate`, và `CustomUserDetails.isEnabled()` chỉ cho phép `ACTIVE`. User chưa `ACTIVE` gây `DisabledException`, Backend trả lỗi `ACCOUNT_DISABLED`.
3. Không tìm thấy endpoint xác minh email hay OTP. Chỉ có hai nơi đặt `ACTIVE`: tài khoản admin được tạo lúc khởi động (`RoleInitializer`) và `PUT /api/v1/users/{id}/status` của admin.
4. `StoreStaffService` cũng yêu cầu staff phải `ACTIVE`.

Hệ quả: user tự đăng ký xong thì chưa đăng nhập được cho đến khi có luồng kích hoạt. Xem B10 và Q14. Trong lúc chờ, để phát triển và thử giao diện, tài khoản test phải được admin chuyển sang `ACTIVE` bằng `PUT /api/v1/users/{id}/status`, hoặc dùng tài khoản admin được tạo sẵn lúc khởi động.

---

## 4. Ma trận tính năng

`Dùng bởi`: U = User Frontend, A = Admin Frontend.

### 4.1 Đã xác minh trên `main`

| Tính năng | Trạng thái | Controller | Endpoint | Xác thực / permission | Dùng bởi | FE |
|---|---|---|---|---|---|---|
| Đăng ký / đăng nhập / refresh / logout | `IMPLEMENTED` | `AuthController` | xem 3.1 | công khai | U, A | NOT_STARTED |
| Hồ sơ của tôi | `IMPLEMENTED` | `UserController` | `GET /api/v1/users/me` | đã đăng nhập | U, A | NOT_STARTED |
| Cập nhật hồ sơ | `IMPLEMENTED` | `UserController` | `PUT /api/v1/users/me` | `PROFILE_MANAGE` | U | NOT_STARTED |
| Đổi mật khẩu | `IMPLEMENTED` | `UserController` | `PUT /api/v1/users/me/password` | đã đăng nhập | U | NOT_STARTED |
| Admin: danh sách / chi tiết / đổi trạng thái user | `IMPLEMENTED` | `UserController` | `GET /api/v1/users`, `GET /api/v1/users/{id}`, `PUT /api/v1/users/{id}/status` | `USER_STORE_MANAGE` | A | NOT_STARTED |
| Tạo gian hàng | `IMPLEMENTED` | `StoreController` | `POST /api/v1/stores` | đã đăng nhập (controller không có `@PreAuthorize`; Backend giới hạn mỗi user một gian hàng bằng `STORE_002`) | U | NOT_STARTED |
| Gian hàng của tôi (xem / sửa) | `IMPLEMENTED` | `StoreController` | `GET` / `PUT /api/v1/stores/my-store` | đã đăng nhập | U | NOT_STARTED |
| Trang công khai của gian hàng | `IMPLEMENTED` | `StoreController` | `GET /api/v1/stores/{id}` | công khai | U | NOT_STARTED |
| Admin: danh sách store / đổi trạng thái | `IMPLEMENTED` | `StoreController` | `GET /api/v1/stores`, `PUT /api/v1/stores/{id}/status` | `USER_STORE_MANAGE` | A | NOT_STARTED |
| Staff: thêm / danh sách / permission / xóa / me | `IMPLEMENTED` | `StoreStaffController` | `POST`, `GET`, `PUT /{staffId}/permissions`, `DELETE /{staffId}`, `GET /me` dưới `/api/v1/stores/my-store/staff` | `STORE_STAFF_MANAGE` | U | NOT_STARTED |
| Quy trình **mời** staff | `PLANNED` | không có | không có (chỉ có thêm trực tiếp bằng email) | không áp dụng | U | NOT_STARTED |
| Category: cây / chi tiết | `IMPLEMENTED` | `CategoryController` | `GET /api/v1/categories`, `GET /api/v1/categories/{id}` | công khai | U, A | NOT_STARTED |
| Category: CRUD cho admin | `IMPLEMENTED` | `CategoryController` | `POST`, `PUT /{id}`, `DELETE /{id}` | `CATEGORY_MANAGE` | A | NOT_STARTED |
| Product: tạo / sửa / xóa / đổi trạng thái | `IMPLEMENTED` | `ProductController` | `POST /api/v1/products`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/status?status=` | `PRODUCT_CREATE`, `PRODUCT_MANAGE_OWN` | U | NOT_STARTED |
| Product: danh sách / chi tiết | `IMPLEMENTED` | `ProductController` | `GET /api/v1/products`, `GET /api/v1/products/{id}` | công khai | U, A | NOT_STARTED |
| Product: tìm kiếm và gợi ý | `IMPLEMENTED` | `ProductController` | `GET /api/v1/products/search`, `GET /api/v1/products/suggest?q=` | công khai | U | NOT_STARTED |
| Admin kiểm duyệt product | `IMPLEMENTED` | `ProductController` | `PUT /{id}/remove` (body `{ reason }`), `PUT /{id}/restore` | `PRODUCT_MODERATE` | A | NOT_STARTED |
| Chiến lược định giá của product | `PARTIALLY_IMPLEMENTED` | `ProductService` | enum có `SELLER_SET`, `AUTO_PRICING`, `APPRAISER`; lỗi `PROD_003` ghi "This pricing strategy is not supported yet" | không áp dụng | U | NOT_STARTED |

### 4.2 Chỉ có ở branch chưa merge (`IN_PROGRESS`)

| Tính năng | Branch | Endpoint | Xác thực quan sát được | Dùng bởi | FE |
|---|---|---|---|---|---|
| Notification | `feature/notification`, `feature/cart`, `integration/demo` | `GET /api/v1/notifications?limit&token`, `GET /{id}`, `PATCH /{id}/read`, `DELETE /{id}` (xóa mềm), `PATCH /{id}/restore` | chỉ cần đăng nhập | U | NOT_STARTED |
| Chat REST | Bản mới nhất ở `feature/chat` (`68b87cb`) và `feature/order`. Bản cũ hơn ở `feature/cart`, `integration/demo` (chưa có `PATCH .../read`). | `POST /api/v1/conversations`, `GET /api/v1/conversations`, `GET /api/v1/conversations/{id}/messages`, `PATCH /api/v1/conversations/{id}/read` | chỉ cần đăng nhập | U | NOT_STARTED |
| Chat WebSocket | như trên | xem mục 5.2 | JWT trong header của STOMP CONNECT | U | NOT_STARTED |
| Checkout (tạo checkout group, order, payment trong một lần gọi) | `feature/order` (`feature/payment` cùng commit) | `POST /api/v1/checkout-groups` | đã đăng nhập, không có `@PreAuthorize` | U | NOT_STARTED |
| Xem checkout group | `feature/order` | `GET /api/v1/checkout-groups/{id}` (chỉ người mua) | đã đăng nhập | U | NOT_STARTED |
| Order của người mua | `feature/order` | `GET /api/v1/orders/me`, `GET /api/v1/orders/{orderId}` (**không kiểm tra chủ sở hữu**, B11) | đã đăng nhập | U | NOT_STARTED |
| Admin xác nhận đã thu tiền COD | `feature/order` | `POST /api/v1/orders/admin/{orderId}/cod-collected` (chuyển `DELIVERED` sang `COMPLETED`) | `@IsAdmin` | A | NOT_STARTED |
| Xem payment | `feature/order` | `GET /api/v1/payments/my-payments`, `GET /api/v1/payments/{id}` (chỉ người trả tiền) | đã đăng nhập | U | NOT_STARTED |
| Webhook SePay | `feature/order` | `POST /api/v1/payment_transactions/webhook/sepay` | công khai, xác thực bằng chữ ký HMAC. **Chỉ SePay gọi.** | không ai (server-to-server) | không áp dụng |
| Cart | `feature/cart` | `GET /api/v1/carts`, `/summary`, `/by-seller`, `POST /items`, `PATCH /items/{listingId}`, `DELETE /items/{listingId}`, `DELETE /api/v1/carts`, `GET /items/{listingId}/exists`, `GET /items/count` | chỉ cần đăng nhập | U | NOT_STARTED |
| Số dư ví | `feature/escrow-wallet`, `feature/cart`, `integration/demo` | `GET /api/v1/wallets/{userId}/balance` | chỉ cần đăng nhập (xem B2) | U | NOT_STARTED |
| Escrow | như trên | `POST /api/v1/escrows/hold`, `POST /orders/{orderId}/capture`, `POST /orders/{orderId}/release` | chỉ cần đăng nhập (xem B2) | A (và dùng nội bộ) | NOT_STARTED |
| Rút tiền | như trên | `POST /api/v1/withdrawals`, `PATCH /{id}/approve`, `/complete`, `/reject`, `/fail` | chỉ cần đăng nhập (xem B2) | U (gửi yêu cầu), A (xử lý) | NOT_STARTED |
| Voucher | `feature/voucher`, `feature/cart`, `integration/demo` | `GET /api/vouchers/{code}`, `POST/GET /api/admin/vouchers`, `GET /api/admin/vouchers/{code}` | `GET /api/vouchers/**` công khai; đường dẫn admin chỉ cần đăng nhập | U, A | NOT_STARTED |
| Auto pricing | `feature/pricing`, `feature/cart`, `integration/demo` | `POST /api/pricing/auto` | chỉ cần đăng nhập | U | NOT_STARTED |
| Reference price | như trên | `GET/POST /api/admin/reference-prices`, `GET/PUT/DELETE /{id}` | chỉ cần đăng nhập | A | NOT_STARTED |
| Hồ sơ appraiser | `feature/cart` | `POST /api/pricing/appraiser/apply`, `GET /me`, `GET /{id}`, `GET /list`, `GET /api/admin/appraisers`, `PUT /api/admin/appraisers/{id}/approve`, `PUT .../suspend` | chỉ cần đăng nhập | U, A | NOT_STARTED |
| Yêu cầu thẩm định | `feature/cart` | `POST /api/pricing/appraiser/request`, `GET /queue`, `POST /{requestId}/claim`, `/submit`, `/accept`, `/reject`, `GET /api/pricing/requests/{requestId}`, `GET /api/pricing/{listingId}` | chỉ cần đăng nhập | U | NOT_STARTED |

Đã đọc DTO của notification, chat, cart, escrow, trạng thái withdrawal và voucher (mục 5). **DTO của pricing, appraiser, wallet và withdrawal chưa được audit.** Chưa được viết service code cho các mục này.

### 4.3 Không tìm thấy ở bất kỳ branch nào đã đọc

| Tính năng | Trạng thái | Bằng chứng |
|---|---|---|
| Order phía người bán (xác nhận, giao hàng, huỷ, danh sách order của gian hàng) và người mua xác nhận đã nhận hàng hoặc huỷ order | `NOT_FOUND` | Enum `OrderStatus` có `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `EXPIRED`... nhưng không code nào chuyển sang các trạng thái này, ngoại trừ `DELIVERED` sang `COMPLETED` do admin. Code có ghi chú `//todo: shipping simulator`. File `order-lifecycle.md` trên `main` rỗng (0 byte). |
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

- Cập nhật tài liệu này **trong cùng Pull Request** mỗi khi một branch Backend được merge hoặc một Frontend service được thêm.
- Khi một dòng đổi trạng thái, ghi lại commit hoặc PR của Backend làm căn cứ.
- Giữ file này giống hệt nhau ở cả hai repo Frontend.
