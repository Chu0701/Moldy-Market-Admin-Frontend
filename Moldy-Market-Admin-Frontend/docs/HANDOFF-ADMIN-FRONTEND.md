# Bàn giao Frontend Admin — Moldy Market

> Cập nhật phát hành 22/11/2026: Chu đã yêu cầu commit và push bản mới nhất lên main của cả 3 repo. Quy tắc “chưa được commit/push” bên dưới ghi lại thời điểm duyệt 4 quyết định ngày 21/11, không hủy ủy quyền phát hành mới này. Baseline và exact code refs được ghi tại [SHARED-BASELINE.md](https://github.com/Chu0701/Moldy-Market-User-Frontend/blob/main/Moldy-Market-User-Frontend/docs/SHARED-BASELINE.md); chỉ dùng sau khi xác nhận main remote đã có commit tương ứng.

Ngày đối chiếu: 21/11/2026. Người phụ trách: dev Frontend Admin. Owner quyết định nghiệp vụ: Chu.

Đây là brief triển khai cho dev và AI, dùng cùng repo Admin và baseline tham chiếu của User Frontend. File không xác nhận mọi module Backend đã tích hợp; các phần chưa audit phải được ghi rõ trước khi gọi API.

## Quyết định đã được Chu duyệt — 21/11/2026

Chu đã trả lời “duyệt 4 điểm”. Không hỏi lại các quyết định này khi triển khai cùng phạm vi:

1. Review thay đổi local và chia commit hợp lý để tạo shared baseline; trình danh sách cho Chu duyệt trước khi commit/push. Hai dev lấy đúng baseline được phát hành sau đó. Lần duyệt này chưa phải lệnh commit/push ngay và chưa tạo ra baseline commit mới.
2. Admin MVP: login/guard ADMIN → users → stores → product moderation → categories. Orders, dispute/refund, analytics và quản lý Appraiser là giai đoạn sau, chỉ nối khi contract đã xác minh.
3. Appraiser bị chặn thẩm định sản phẩm bản thân/shop sở hữu/shop đang làm staff. Backend phải enforce ở ứng tuyển, accept invitation và tạo/nhận assignment; frontend không thay thế guard. Business đã duyệt, implementation/test Backend chưa thực hiện trong task bàn giao.
4. Admin chưa được bypass OTP để kích hoạt PENDING_VERIFICATION. Đúng OTP mới ACTIVE, người dùng tự login. Khóa/mở khóa theo quyền/transition Backend; không coi mọi ACTIVE transition là được phép cho UI.

Các giới hạn chưa xác minh như tự khóa admin cuối cùng hoặc cấp role Appraiser vẫn phải kiểm tra riêng; bốn quyết định này không cho phép AI tự sửa Backend.

## 1. Mục tiêu và phạm vi

Xây ứng dụng quản trị riêng: đăng nhập đúng quyền ADMIN, quản lý user/gian hàng, kiểm duyệt sản phẩm và quản lý danh mục. Các thao tác quản trị phải có xác nhận, trạng thái pending/error rõ ràng, và phản ánh kết quả thật từ Backend. Giao diện dùng cùng quy ước kiến trúc, auth và design system với User Frontend của Chu.

- Repo làm việc: **Moldy-Market-Admin-Frontend**. Không đặt Admin dưới `/admin` của User app, không tạo app Vite mới trong repo này.
- Dev Appraiser làm workspace người thẩm định trong **User Frontend**, không phải trang `/appraisers` của Admin. Phê duyệt/cấp role Appraiser là công việc quản trị khác và cần contract riêng.
- Chu phụ trách User/store/checkout/payment/chat và quyết định nghiệp vụ. Không sửa Backend khi chưa được Chu duyệt; chuẩn bị đề xuất và bằng chứng thay vì sửa ngoài scope.
- Dashboard thống kê, dispute/refund, giao dịch, escrow/payout, vouchers, appraiser management và reports/settings chỉ triển khai khi contract được xác minh. Không dựng dashboard số liệu giả hoặc nút thành công giả.

## 2. Điểm bắt đầu và thứ tự đọc

Repo root là thư mục chứa `package.json`, `src/`, `.nvmrc`. Docs hiện nằm lồng tại `Moldy-Market-Admin-Frontend/docs/` (gọi là `DOCS`), không phải một app thứ hai. Hướng dẫn agent: `admin/AGENTS.md`; skills: `admin/.agents/skills/`. Đọc `moldy-task-start` mỗi task, rồi skill feature/api/ui/auth theo nhu cầu; chỉ đọc section tài liệu liên quan, không đọc cả docs hoặc scan Backend.

Snapshot local đã kiểm tra:

- Admin nhánh `main`, HEAD `2fc97d9`: mới có scaffold/config, `App.jsx` thử nghiệm, i18n/tokens/Button, lint/format/build/test scripts, CI và metadata. Chưa có API layer, auth hooks, router/layout ứng dụng hay các trang quản trị. Không mặc định những file mô tả trong docs đã tồn tại.
- User FE nhánh `codex/user-product-detail`, HEAD `754cb90`, **nhiều thay đổi chưa commit** gồm hạ tầng/flow đang chạy. Backend nhánh `codex/selective-checkout-integration`, HEAD `dc11b09`, cũng có thay đổi local. Remote/HEAD chưa chắc có bản mới nhất.
- Trước khi port hạ tầng, Chu cần cung cấp baseline/commit hoặc patch đã thống nhất. Không tự merge toàn bộ nhánh User vào Admin, không chép `.env.local`, không reset/stash working tree của người khác.
- `AGENTS.md` Project state ngày 10/11 và docs auth còn snapshot cũ (Q2/B10). Quyết định cập nhật ở mục 4 dưới đây thay thế phần token/OTP cũ; giữ các quy tắc kiến trúc khác.

Reading map cho mỗi task:

1. Đọc handoff này + AGENTS thực tế, xem git status/log, package scripts và source liên quan.
2. `DOCS/04-ROUTING-AND-PAGES.md`: route của task; `05-PAGE-BY-PAGE-GUIDE.md`: đúng trang.
3. `DOCS/14-BACKEND-INTEGRATION-MATRIX.md`: endpoint/DTO/permission của task. `IMPLEMENTED` trong snapshot cũ vẫn cần đối chiếu với Backend ref đang chạy trước khi coi là tích hợp xong.
4. Khi cần: doc 03 tokens, 06 component architecture, 07 API, 08 auth, 09 state/forms, 11 conventions. Chỉ mở phần cần thiết.
5. Thiếu fact: đọc đúng controller/DTO/service của module Backend, ghi source ref + findings vào doc 14; không suy đoán từ tên URL.

Khi tài liệu mâu thuẫn với code/decision mới, báo rõ và cập nhật contract. Không lấy một dòng docs cũ làm lý do bỏ qua endpoint mới hoặc quay lại cách lưu refresh token cũ.

## 3. Các đợt triển khai và đầu ra

### Đợt 1 — App shell + admin session

- Giữ stack/config hiện có. Thêm QueryClientProvider, router, AuthLayout, AdminLayout (sidebar/header/main), loading/error/403/not-found và ngôn ngữ vi/en.
- Port **có chọn lọc** hạ tầng User app đã được Chu duyệt: một HTTP client, ApiError/unwrap/pagination, tokenStorage, auth service/refresh interceptor, session hooks và feedback components. Giữ cùng hành vi/module boundaries; không mang theo store/cart/chat/socket/checkout hay registration pages vào Admin.
- Login → lấy `/users/me` → chỉ roles.includes('ADMIN') mới vào app. Tài khoản USER/STAFF/OWNER/APPRAISER thiếu ADMIN bị từ chối, không chỉ ẩn sidebar. Deep link/refresh trang phải vẫn chạy đúng guard.
- `/` ban đầu là dashboard skeleton trung thực với các link quản trị đã có. Không tính tổng doanh thu/user từ một trang dữ liệu rồi gắn nhãn tổng hệ thống.
- Đầu ra: login/logout/refresh/session cleanup và layout/guard có tests. Chưa xây cả dashboard analytics trước.

### Đợt 2 — Users

- `/users`: list, pagination, loading/empty/error/403. `/users/:userId`: chi tiết và action đổi status sau khi audit contract.
- Doc 14 và `UserController` local có `GET /api/v1/users`, `GET /api/v1/users/{id}`, `PUT /api/v1/users/{id}/status`, permission `USER_STORE_MANAGE`.
- Source DTO đã đọc: `UpdateUserStatusRequest {status}`; enum `ACTIVE`, `LOCKED`, `PENDING_VERIFICATION`. `UserSummaryResponse {id,email,fullName,status,trustPoints,createdAt}` — **list không có roles trong DTO này**, không tự thêm cột quyền giả hoặc role editor.
- Không tự tạo endpoint admin tạo user/cấp role/tìm kiếm. Chỉ gửi filters/sort được Backend xác nhận. Lọc một trang bằng client phải ghi rõ phạm vi, không mô tả là tìm toàn hệ thống.
- **OTP đã chốt:** user xác minh email đúng thì ACTIVE và tự đăng nhập. Chu đã duyệt chưa cho admin bypass OTP: không thêm nút kích hoạt PENDING_VERIFICATION hoặc gửi ACTIVE qua action chung để thay xác minh email. Docs cũ nói admin kích hoạt mọi tài khoản đăng ký mới đã lỗi thời. Đây là quyết định UI/nghiệp vụ; chưa xác minh/sửa enforcement Backend cho admin status endpoint trong task này. Khóa/mở khóa theo transition thật; tự khóa admin cuối cùng/chính mình vẫn cần xác minh.

### Đợt 3 — Stores

- `/stores`, `/stores/:storeId`: danh sách/chi tiết và đổi trạng thái có xác nhận.
- Source/doc hiện có `GET /api/v1/stores`, `GET /api/v1/stores/{id}`, `PUT /api/v1/stores/{id}/status`; status `ACTIVE`, `BLOCKED`. Audit request/response/status guard trước nối. GET chi tiết là public DTO, không suy rằng có email/phone/thông tin riêng của chủ shop.
- UI phải thể hiện Backend từ chối quyền, state stale và action thất bại; không âm thầm sửa thông tin shop của seller. Staff quản lý workspace khác với admin quản lý trạng thái shop.

### Đợt 4 — Product moderation

- `/products`, `/products/:productId`: xem dữ liệu và gỡ/khôi phục đúng API; gỡ có form lý do + xác nhận rõ đối tượng.
- Doc 14 có `GET /api/v1/products/search`, `GET /api/v1/products/{id}`, `PUT /api/v1/products/{id}/remove` body `{reason}`, `PUT /api/v1/products/{id}/restore`, permission `PRODUCT_MODERATE`. Audit limits/error/transition trước khi bật action.
- Search công khai chưa được xác minh là liệt kê hoặc trả chi tiết đầy đủ `REMOVED/HIDDEN/DELETED`. Đây là **điểm cần xác minh sớm**, không tự gọi nó là “toàn bộ sản phẩm”. Nếu thiếu nguồn đọc cho moderation, báo Chu cần admin-read API thay vì giả filter hoặc đổi Backend visibility toàn cục.
- Không dùng API sửa nội dung của seller để admin sửa giá/nội dung. Update product thông thường có version; 409 phải refetch, không bỏ version để overwrite.

### Đợt 5 — Categories

- `/categories`: cây + dialog thêm/sửa, xác nhận xóa; không cần route riêng cho từng form.
- `GET /api/v1/categories`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` dưới prefix này. Audit CategoryRequest/Response cho tên field, cây cha/con và validation, không đoán từ giao diện.
- DELETE thành công có thể không body; xử lý bằng unwrap tương thích, không ép `.data.data` tồn tại. Không tự cascade xóa con/sản phẩm; Backend từ chối thì hiện lỗi thật được map sang i18n.

### Sau MVP — Chỉ mở khi đã có contract/decision

- Orders/shipping/COD: code Backend local hiện có `@IsAdmin` trên `PATCH /api/v1/orders/admin/{orderId}/start-shipping`, `PATCH .../mark-delivered`, `POST .../cod-collected`. Đây là bổ sung so với docs Admin cũ. **Chưa xác minh nguồn danh sách đơn toàn hệ thống**; `GET /orders/me` là buyer, `/stores/{storeId}/orders` là store-scoped. Không dùng hai API đó làm admin list hoặc mặc định ADMIN vượt ownership của GET order detail. Cần audit đọc/ghi và Chu chốt route trước UI action.
- COD đã chốt: shop owner xác nhận, admin cập nhật giao/đã giao/thu tiền. Staff có ORDER_PROCESS được xem đơn shop nhưng không tự được confirm COD. Không làm nút admin “xác nhận thanh toán chuyển khoản” để thay SePay webhook; frontend không được tự đặt paymentStatus thành công.
- Appraiser admin: docs cũ nói `/api/admin/appraisers` chưa đủ làm căn cứ. Backend local có module `appraisal` mới; application là ứng tuyển **cho request**, không phải đăng ký làm Appraiser. Quy trình duyệt hồ sơ/cấp role cần audit riêng và phối hợp dev Appraiser/Chu, không tự tái dùng application DTO.
- Dispute/refund/escrow/voucher/reference price/reports/settings: chỉ skeleton có TODO(doc14:...) khi chưa xác minh DTO/quyền/flow. Không tự tạo endpoint, dữ liệu tài chính hoặc hành động admin từ suy đoán.

## 4. Chuẩn kiến trúc và auth chung

### Stack, tên file và layers

JavaScript/JSX + JSDoc, React 19, Vite, react-router 7, TanStack Query 5, Axios, Zustand 5 (UI state nếu thật cần), react-hook-form + Zod, i18next, Tailwind CSS 4, shadcn radix-nova, Vitest + RTL. Node theo `.nvmrc` (hiện 22, package >=22.12); dùng `npm ci` và lockfile hiện có. Không chuyển TypeScript/Next.js/Redux/MUI/Ant Design hoặc upgrade dependencies hàng loạt.

```text
src/app/providers/                      # one QueryClient for app lifetime
src/app/router/                         # routes.js, RequireAuth, RequireAdmin
src/app/layouts/                        # AuthLayout, AdminLayout
src/services/api/                       # client.js, ApiError.js, unwrap.js, pagination.js
src/services/auth/                      # login/refresh/logout, not registration UI
src/services/users/                     # pure async functions per verified endpoint
src/services/stores/
src/services/products/
src/services/categories/
src/features/<module>/components/       # UI components, narrow props
src/features/<module>/hooks/            # Query/mutation orchestration, no JSX
src/features/<module>/pages/            # named XxxPage exports
src/features/<module>/schemas/          # Zod, translation-key errors
src/components/common/                 # genuinely shared UI
src/components/feedback/                # loading/empty/error/forbidden/not-found
src/components/ui/                      # generated shadcn components
src/lib/tokenStorage.js
src/state/                              # UI only; not API response storage
src/i18n/locales/{vi,en}/common.json
```

Module là users/stores/products/categories/auth; không gom mọi thứ vào một file AdminPage hoặc axios trong component. Named page exports, PascalCase components, camelCase hooks/services; cùng alias `@` = `src`. Không tạo thư mục `stores/` cho Zustand vì store đang có nghĩa gian hàng.

### Auth quyết định rồi, không quay về đề xuất cũ

- Access token lưu localStorage qua **một** tokenStorage module. Admin dùng namespace **`moldy-market:admin:access-token`**, khác `moldy-market:user:access-token` của User app. Đây là quy ước tích hợp cho Admin, chưa có implementation tại snapshot này. Không đọc/clear key của User app hoặc chia sẻ token giữa hai app bằng localStorage thủ công.
- Refresh token **HttpOnly cookie do Backend set**. Không có getRefreshToken() từ JS; không lưu refresh token trong Zustand/localStorage; refresh/logout không gửi refreshToken trong body.
- Theo authService hiện tại ở User: POST login body `{email,password}`; POST refresh/logout body `undefined`; auth config `withCredentials:true`, header `X-Moldy-Auth: 1`. Đối chiếu Backend chạy thật trước khi port, không bỏ header/cookie contract.
- Sau login lấy `/api/v1/users/me`, roles gồm ADMIN mới nhận phiên quản trị. JWT không phải nguồn role/permission UI; token tồn tại chưa đủ chứng minh session hợp lệ.
- Query session dùng `meQueryKey = ['users','me']` trong cache riêng của app. Không giữ thêm bản sao profile trong Zustand/localStorage hoặc key khác.
- Một refresh interceptor, single-flight refresh cho các 401 đồng thời, retry mỗi request tối đa một lần, không refresh login/refresh/logout, không refresh 403, không cài lại mỗi render. User hiện cài tại App.jsx và eject khi HMR dispose; port cùng lifecycle.
- Logout hủy hiệu lực local ngay, clear token và Query cache; server logout lỗi cũng không giữ phiên local. Guard/callback muộn không được phục hồi cache hoặc điều hướng bằng dữ liệu tài khoản cũ. Return URL chỉ chấp nhận đường dẫn nội bộ hợp lệ, không open redirect.
- Namespace access token riêng **không đảm bảo refresh cookie độc lập**: cookie không phân biệt port. Nếu hai app cùng Backend host/name/path, cần test login/refresh/logout chéo và hỏi Chu khi cần Backend tách session. Trong lúc test hai danh tính dùng browser profile/incognito riêng; không tự đổi cookie name/path/CSRF/CORS ở Backend.
- ADMIN role gate chỉ là UX. Test Backend permission và ownership thật cho từng endpoint; URL có chữ admin không phải bằng chứng đã bảo vệ.

### Hạ tầng User để tham khảo/port có chọn lọc

Trong repo User Frontend cùng tên, cần đúng baseline Chu cung cấp:

- `src/services/api/{client,ApiError,unwrap,pagination,authRefreshInterceptor}.js`.
- `src/services/auth/authService.js` (chọn login/refresh/logout), `src/services/users/userService.js` (getMe).
- `src/lib/tokenStorage.js` (đổi riêng namespace Admin), `src/features/auth/hooks/{useSession,useLogin,useLogout}.js`, `src/app/router/RequireAuth.jsx`.
- `src/app/providers/{queryClient.js,AppProviders.jsx}`, `src/App.jsx`, `src/main.jsx` cho lifecycle/router/i18n.
- `src/components/{common,feedback}/` và form schemas/tests phù hợp. Đọc từng file cần dùng; không copy cả src.

Admin phải bổ sung RequireAdmin và từ chối non-admin ở login/guard, không chỉ chép RequireAuth rồi coi là đủ. Không đưa User MainLayout, routes, registration/OTP screens hoặc chat realtime vào Admin.

## 5. Chuẩn service/hook/form qua một ví dụ

Ví dụ sau mô tả pattern sau khi hạ tầng đã port và contract list users được xác minh; không phải file source hiện đã tồn tại. `getAdminUsers` nằm `src/services/users/userService.js`:

```js
import { apiClient } from '@/services/api/client'
import { unwrap } from '@/services/api/unwrap'
import { normalizePagedResponse } from '@/services/api/pagination'

/** @param {{ page?: number, size?: number, signal?: AbortSignal }} [options] */
export async function getAdminUsers({ page = 1, size = 20, signal } = {}) {
  const response = await apiClient.get('/api/v1/users', {
    params: { page, size },
    signal,
  })
  return normalizePagedResponse(unwrap(response))
}
```

- `baseURL = VITE_API_BASE_URL || ''`; mỗi service ghi full path thực tế. Không cố định baseURL thành `/api/v1`, vì Backend có `/api/...` nữa. `API_PROXY_TARGET` chỉ ở Vite dev server, không đọc trong browser code.
- Service không React/navigation/toast/translate; không catch lỗi rồi trả [] để giả empty success. Response qua unwrap, giữ null/false/0/empty body; lỗi qua ApiError.status/code, không hiển thị stacktrace hoặc raw message tùy ý.
- List users/stores dùng PagedResponse `{content,page,size,hasNext,totalElements}`. Backend PaginationConfig đặt request page 1-based; PagedResponse trả page 1-based. `totalElements` có thể null khi Slice: UI dùng Prev/Next + hasNext, không giả totalPages.
- Product search có adapter riêng, không ép vào Spring Page. Spring Page response number bắt đầu 0 không có nghĩa mọi request page cũng bắt đầu 0; kiểm tra controller/resolver. Không chép page-1 của chat sang list users/stores.
- Hook query key có phạm vi admin + userId + filters/page/ID, ví dụ `['admin','users',userId,'list',{page,size}]`, `['admin','users',userId,'detail',id]`; dùng một factory mỗi module. Session query giữ key chuẩn riêng đã nêu.
- GET truyền Query AbortSignal xuống Axios. Chỉ bật query khi session ADMIN và params hợp lệ; không gọi API bảo vệ để “thử xem có quyền không” trước guard.
- Mutation chỉ gửi field whitelist theo DTO, retry:false, khóa double submit, success invalidate list/detail đúng phạm vi và chờ server xác nhận. Không clear toàn cache cho mỗi thay đổi; không optimistic tài khoản đã khóa/thanh toán đã thu khi server chưa thành công.
- Filter/page/sort trong URL, form draft trong react-hook-form/local state. Không store cả response vào Zustand. Reset filter đổi page về 1; parse URL chặt, không gửi NaN/size vô hạn/sort hoặc query params Backend chưa hỗ trợ.
- Form dùng Zod + zodResolver; validation limits từ DTO đã audit; error.message là i18n key. Khi lỗi giữ input, map validationErrors theo shape thật. 403 dừng, 409 báo dữ liệu đổi và refetch, 429 thông báo chờ — không loop/retry mutation tự động.
- Invalidate chỉ trong một QueryClient không làm User app hoặc tab khác tự cập nhật. Không tuyên bố hai app đồng bộ realtime chỉ nhờ cùng query key; dùng refetch/focus hiện có hoặc contract event đã xác minh.

## 6. UI và quy tắc dễ gây lệch khi dùng AI

- Design tokens hiện có: bg-background/text-foreground/text-muted-foreground/border-border/bg-accent, success/warning/info/sidebar. Font Be Vietnam Pro + Playfair Display; không đổi palette/global typography để làm dashboard, không hard-code hex trong component.
- shadcn `components/ui` là generated, không sửa tay. Chỉ thêm component cần dùng qua CLI. Chưa có hệ DataTable/Dialog đầy đủ thì xây mỏng bằng components đã cài, không giả định chúng tồn tại hoặc cài cả framework mới.
- Text UI qua i18n common, vi trước, en đủ key. Gom `adminUsers.*`, `adminStores.*`, `moderation.*`, `categories.*`; không đổi hàng loạt key auth chung hoặc dịch lại wire enums.
- Import từ react-router, RouterProvider từ react-router/dom; lazy route trả `{Component: module.XxxPage}`. Một router ở root; một QueryClient cho vòng đời app, không tạo mỗi render.
- Sidebar responsive, main có h1/landmarks, active nav, skip link, keyboard/focus rõ. Table mobile overflow có chủ đích, label/error liên kết input, dialog trả focus khi đóng, action nguy hiểm có xác nhận rõ đối tượng/hậu quả.
- Mỗi trang tách loading/empty/error/403/not-found/pending. Không thay dữ liệu bằng mock khi API lỗi; skeleton không được có action ghi giả. Ảnh lỗi có fallback, thiếu tên/field dùng nhãn trung tính, không bịa thông tin cá nhân.
- Tiền/ngày format ở UI bằng formatter; payload không gửi số tiền đã format. Không dangerouslySetInnerHTML cho lý do/moderation hoặc dữ liệu người dùng.
- Không log token, cookie, password, OTP, response có dữ liệu riêng. Không đọc/commit `.env.local`, không đưa Backend secret vào biến VITE_. Proxy lỗi ECONNREFUSED thì kiểm tra Backend/target, không thay bằng mock production.

## 7. Definition of Done và cách làm chung

Mỗi task một flow nhỏ: kế hoạch 3–5 dòng → contract/guard → service → schema/hook → component/page/route/i18n → tests → checks → báo kết quả và bước tiếp. Không làm cả Admin trong một lần rồi mới kiểm tra.

- Unit tests ở service boundary: exact method/path/query/body, unwrap/empty body, pagination, cancel/error. Schema test limits; UI/route tests mock services, không gọi Backend thật trong unit tests.
- Auth tests: guest/deep link, ADMIN, non-admin, session 403, concurrent401 chỉ refresh một lần, refresh lỗi không loop, logout/request muộn không khôi phục cache. Action tests: pending double click, cancel confirmation không gửi, 403/409/validation giữ input, đúng invalidate và response server.
- Manual browser bằng tài khoản test: reload URL sâu, Network/Console, mobile/keyboard, login/logout chéo app và dữ liệu đúng quyền. Chưa có mock test không được gọi là tích hợp; không tự thực hiện hành động quản trị lên dữ liệu thật để lấy screenshot.
- Chạy `npm run format`, `npm run lint`, `npm run format:check`, `npm run test`, `npm run build`. Admin hiện passWithNoTests ở scaffold; “test command xanh nhưng 0 test” không phải bằng chứng auth/business đúng. Phải thêm tests cho behavior đã triển khai; không skip/nới checks để xanh.
- Tạo branch riêng từ baseline đã chốt, gợi ý `codex/admin-shell-auth` rồi branch/task nhỏ tiếp theo. Commit Conventional Commits khi người phụ trách duyệt; AI không tự push/merge/force. Không merge/cherry-pick toàn bộ User FE vào Admin để lấy vài helpers.
- Không sửa package-lock/UI config/auth strategy ngoài nhu cầu đã thống nhất. Không đưa dist/node_modules/secrets vào bàn giao. Khi đổi shared API contract, báo Chu và dev Appraiser, cập nhật doc 14 cùng task, không để hai người tự nghĩ ra hai DTO.
- Bàn giao gồm base ref, commits/patch, file list, routes, env **tên biến không giá trị secret**, API contracts đã xác minh, checks, screenshot/manual evidence và blocker. Các app độc lập cùng Backend nên tích hợp bằng contract + conventions, không import source chéo repo hoặc hứa zero conflict.

Task đầu tiên nên nhận: **Admin shell + login/refresh/logout + RequireAdmin**, tham chiếu hạ tầng User mới nhất Chu cung cấp. Sau khi flow này chạy thật mới sang Users list/detail.

## 8. Prompt đưa cho AI của bạn

> Bạn phụ trách Moldy Market Admin Frontend, app Vite riêng, JavaScript/JSX. Đọc HANDOFF-ADMIN-FRONTEND.md này, AGENTS.md thực tế và moldy-task-start. Xác nhận git state và shared baseline; Admin mới có scaffold, User app có hạ tầng local chưa chắc nằm trên remote. Bắt đầu Admin shell + auth/RequireAdmin, port có chọn lọc HTTP/Query/session/i18n hiện có từ baseline Chu cung cấp; không copy cả User src hoặc đổi stack/design system. Access token namespace Admin riêng trong localStorage, refresh HttpOnly cookie do Backend set, single-flight refresh-once, roles từ /users/me. Các đoạn docs/skills cũ nói Q2 chưa chốt hoặc admin phải kích hoạt mọi email đã bị thay thế bởi handoff. API/DTO/filter/quyền chưa rõ thì audit scoped và cập nhật doc 14; chỉ skeleton khi chưa sẵn sàng. Không tự sửa Backend, tạo endpoint/permission/status, nối API buyer thành admin hoặc coi application appraisal là hồ sơ xin role. Một task nhỏ mỗi lần, kế hoạch 3–5 dòng, tests có ý nghĩa, format/lint/format:check/test/build và manual evidence bằng test data. Không tự commit/push/merge/force, không đọc secrets hoặc ghi đè thay đổi của người khác. Báo business gap cho Chu thay vì làm UI để che lỗi quyền Backend.
