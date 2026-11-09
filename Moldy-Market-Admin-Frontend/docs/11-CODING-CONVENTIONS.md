# 11 - Coding Conventions (Quy ước viết code)

- Trạng thái: BẢN NHÁP v0.1
- Cập nhật: 2026-11-08
- Áp dụng cho: Moldy-Market-Admin-Frontend
- Mục đích: thống nhất cách đặt tên, cách tổ chức và cách viết code cho trang quản trị, để các thành viên đọc code của nhau không phải đoán.

Quy ước nhãn: `[ĐÃ CẤU HÌNH]` là thứ đã có thật trong repo. `[ĐỀ XUẤT]` là quy ước team cần đồng ý, hiện chưa có code nào áp dụng. Mọi ví dụ code là **ví dụ minh họa, chưa có trong repo**. Bộ công cụ của Admin cấu hình giống repo User (chưa đối chiếu lại từng dòng); quy ước chung được giữ nhất quán giữa hai repo.

---

## 1. Công cụ tự động `[ĐÃ CẤU HÌNH]`

### 1.1 Prettier

`.prettierrc`: `semi: false`, `singleQuote: true`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`, `endOfLine: lf`. `.prettierignore` loại `dist`, `node_modules`, `package-lock.json`, `src/components/ui`.

Lệnh: `npm run format` (ghi đè), `npm run format:check` (kiểm tra). Antigravity đã bật format khi lưu qua `.vscode/settings.json`. Prettier quyết định style, không tranh luận trong review.

### 1.2 ESLint 10 (flat config)

- `react-hooks`: không gọi hook có điều kiện, khai báo đủ dependency của effect.
- `react-refresh/only-export-components`: file component chỉ export component; hook và hằng số tách file. Đã tắt cho `src/components/ui/**` (code shadcn).
- `no-unused-vars`: xóa import và biến thừa.
- Lệnh: `npm run lint`. Trước PR phải sạch cùng với `format:check` và `build`.

### 1.3 Alias `@`

`@` trỏ tới `src`. Import xuyên thư mục cấp cao dùng alias (`@/lib/utils`, `@/services/users/userService`). Trong cùng một feature được dùng `./Xxx`. Không dùng `../` quá hai cấp.

---

## 2. Đặt tên `[ĐỀ XUẤT]`

| Loại | Quy tắc | Ví dụ trong Admin |
|---|---|---|
| Thư mục | thường, tiếng Anh | `features/users`, `features/categories` |
| Component | `PascalCase.jsx` | `UserStatusBadge.jsx`, `CategoryTree.jsx` |
| Page | `PascalCase` + `Page` | `UserListPage.jsx`, `CategoryManagementPage.jsx` |
| Layout | `PascalCase` + `Layout` | `AdminLayout.jsx`, `AuthLayout.jsx` |
| Hook | `useXxx.js` | `useUserList.js`, `useUpdateUserStatus.js` |
| Service | `xxxService.js` | `userService.js`, `categoryService.js` |
| Schema Zod | `xxxSchema.js` | `loginSchema.js`, `categorySchema.js` |
| Zustand store | `useXxxStore.js` | `useSidebarStore.js` |
| Hằng số | `SCREAMING_SNAKE_CASE` | `DEFAULT_PAGE_SIZE` |

Biến và hàm `camelCase`; boolean bắt đầu bằng `is/has/can/should`; handler truyền xuống là `onXxx`, bên trong là `handleXxx`.

**Chú ý từ "store"**: trong Admin, `stores` (feature) nghĩa là **gian hàng** cần kiểm duyệt; Zustand đặt trong `state/`. Đừng đặt biến tên `store` mơ hồ, hãy dùng `shop` hoặc `storeItem` cho gian hàng, và `useXxxStore` chỉ cho Zustand.

Query key dạng mảng từ chung đến riêng: `['users', 'list', params]`, `['users', 'detail', userId]`, `['categories', 'tree']` (xem doc 09).

---

## 3. JavaScript và JSDoc `[ĐỀ XUẤT]`

- `const` mặc định; không `var`; `async/await` thay vì trộn `.then()`.
- Dùng `?.` và `??`; tránh `||` với giá trị `0` hoặc chuỗi rỗng.
- Không để `console.log` trong code đã commit.
- **Mọi hàm service có JSDoc** ghi endpoint, quyền cần có và trạng thái Backend. Chỉ mô tả trường đã xác minh trong doc 14.

Ví dụ minh họa (chưa có trong repo):

```js
/**
 * Đổi trạng thái người dùng (kích hoạt, khóa...).
 * Endpoint: PUT /api/v1/users/{id}/status (IMPLEMENTED)
 * Quyền Backend: USER_STORE_MANAGE
 * @param {string} userId
 * @param {object} body  Dạng body chưa liệt kê trong doc 14: kiểm tra trước khi viết
 */
export async function updateUserStatus(userId, body) {
  const { data } = await apiClient.put(`/api/v1/users/${userId}/status`, body)
  return data.data
}
```

Lưu ý: doc 14 chưa mô tả đầy đủ body của endpoint này; khi triển khai thật phải đọc lại DTO ở Backend và cập nhật doc 14 trước.

---

## 4. React best practices `[ĐỀ XUẤT]`

1. Component nhỏ, một trách nhiệm; page chỉ ghép component và hook.
2. **Không gọi Axios trong component.** Component gọi hook TanStack Query, hook gọi `services/`.
3. **Dữ liệu server do TanStack Query quản lý**, không sao chép vào Zustand hay `useState`.
4. Props ít và rõ; dùng `children` và composition.
5. `key` ổn định bằng id Backend, không dùng index cho danh sách động.
6. `useEffect` chỉ để đồng bộ với hệ thống ngoài; không dùng để tính dữ liệu phái sinh.
7. Form dùng React Hook Form + Zod.
8. Mọi chỗ lấy dữ liệu có đủ loading, rỗng, lỗi.
9. Chuỗi giao diện đi qua i18n (`vi`, `en`), không viết cứng.
10. **Trang quản trị đặc thù:**
    - Bảng dữ liệu (users, stores, products) luôn có phân trang, trạng thái rỗng và lỗi; adapter phân trang theo đúng dạng của từng endpoint (doc 07).
    - **Hành động phá hủy hoặc đổi trạng thái** (khóa user, gỡ sản phẩm, xóa danh mục) luôn qua hộp thoại xác nhận, vô hiệu hóa nút khi đang gửi để tránh bấm đúp, và gỡ sản phẩm phải yêu cầu nhập `reason`.
    - Sau mutation thành công, `invalidateQueries` đúng key để bảng cập nhật; không sửa tay dữ liệu cache trừ khi có lý do.
    - Ẩn nút theo role/permission chỉ để **tiện dụng**; Backend mới là chốt chặn thật (doc 08).

---

## 5. Xử lý lỗi `[ĐỀ XUẤT]`

- Chuẩn hóa lỗi ở interceptor Axios thành `{ status, code, message }` (doc 07).
- Hiển thị thông điệp đã dịch theo `code`; mã chưa biết thì dùng thông điệp chung và ghi log.
- Lỗi form gắn vào đúng field bằng `setError`.
- `401`: refresh một lần (doc 08). `403`: báo không đủ quyền, không thử lại. `409` (optimistic locking, `COMMON_010`): báo dữ liệu đã bị sửa và tải lại.
- `ErrorBoundary` ở cấp app và cấp route. Không nuốt lỗi bằng `catch {}` rỗng.

---

## 6. Tầng service `[ĐỀ XUẤT]`

- Thư mục: `services/api` (Axios instance), `auth`, `users`, `stores`, `categories`, `products`.
- Hàm thuần, async, trả `data` đã bóc phong bì `ApiResponse`; không dùng hook.
- Đường dẫn đầy đủ vì baseURL không gắn cứng prefix (có hai prefix `/api/v1` và `/api`).
- **Chỉ viết service cho endpoint `IMPLEMENTED`.** Dashboard, giao dịch, báo cáo, khiếu nại... là `NOT_FOUND` hoặc `IN_PROGRESS`, chỉ làm skeleton UI `TODO`, **không viết service đoán endpoint**. Escrow đang `IN_PROGRESS` và có lỗ hổng B2 (không có kiểm tra quyền), chờ Backend sửa rồi mới tích hợp.

---

## 7. Tailwind CSS `[ĐỀ XUẤT]`

- Token trong `src/index.css` (Tailwind v4, không có `tailwind.config.js`). Dùng class theo token (`bg-background`, `text-muted-foreground`, `text-success`...), không viết hex trong component.
- Gộp class có điều kiện bằng `cn()`.
- Hạn chế giá trị tùy ý; dùng thang spacing mặc định.
- Admin là **desktop-first**: tối ưu cho màn hình rộng với sidebar cố định, nhưng bảng phải cuộn ngang được và sidebar thu gọn được trên màn hình nhỏ (doc 03).
- Không sửa tay `src/components/ui/*`; thêm component bằng `npx shadcn@latest add <tên>`, commit riêng.
- Dùng màu ngữ nghĩa cho trạng thái: `success` cho ACTIVE, `warning` cho chờ xử lý, `destructive` cho bị khóa hoặc gỡ. Luôn kèm chữ hoặc icon, không chỉ phân biệt bằng màu.

---

## 8. Git và review

Chi tiết ở doc 15. Tóm tắt: Conventional Commits; một PR làm một việc; không commit `.env.local`; reviewer kiểm tra đúng ranh giới lớp, đủ loading/rỗng/lỗi, xác nhận cho hành động phá hủy, không bịa endpoint, lint và build sạch.

## 9. Checklist nhanh trước khi mở PR

- [ ] `npm run lint`, `npm run format:check`, `npm run build` sạch.
- [ ] Endpoint có trong doc 14 và `IMPLEMENTED`.
- [ ] Có loading, rỗng, lỗi; hành động nguy hiểm có xác nhận.
- [ ] Chuỗi qua i18n.
- [ ] Cập nhật docs nếu đổi route, kiến trúc hoặc contract.

---

## Tài liệu liên quan

- Doc 02, 03, 06, 07, 08, 09 (kiến trúc, design system, component, API, auth, state).
- Doc 14: ma trận tích hợp Backend.
- Doc 15: quy trình đóng góp.
