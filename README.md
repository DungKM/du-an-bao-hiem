# Trust Tool (bản tự dựng)

Next.js 14 (App Router, JavaScript) + MongoDB (Atlas) + NextAuth v5 (Credentials).

## 1. Cài đặt

```bash
npm install
```

## 2. Cấu hình môi trường

Copy `.env.example` thành `.env.local` và điền:

- `MONGODB_URI`: connection string MongoDB Atlas (Database Access → tạo user, Network Access → cho phép IP của bạn hoặc `0.0.0.0/0` khi mới thử nghiệm).
- `AUTH_SECRET`: chuỗi ngẫu nhiên bất kỳ (dùng `openssl rand -base64 32` hoặc bất kỳ chuỗi dài, ngẫu nhiên).
- `NEXTAUTH_URL`: `http://localhost:3000` khi chạy local.
- `ADMIN_SEED_*`: thông tin tài khoản admin đầu tiên (chỉ dùng một lần cho script seed).

## 3. Tạo tài khoản admin đầu tiên

```bash
npm run seed
```

Script đọc `.env.local`, tạo 1 tài khoản `role: admin` trong MongoDB nếu chưa tồn tại. Sau khi có tài khoản admin, đăng nhập và vào mục **Tạo Tài Khoản** để tạo thêm tài khoản tư vấn viên — không cần chạy lại script này.

## 4. Chạy dev

```bash
npm run dev
```

Mở `http://localhost:3000`.

## 5. Build production

```bash
npm run build
npm run start
```

Build không cần kết nối MongoDB (mọi truy vấn DB chỉ chạy ở runtime trong route/server component, không chạy lúc build).

## Cấu trúc 5 tính năng chính

1. **Hoạch Định Tài Chính** (`/hoach-dinh-tai-chinh`) — nhập tên khách hàng + 5 nhu cầu tài chính (bảo vệ, học đại học, hưu trí, gia tăng tài sản, sức khỏe), tính toán khoản thiếu hụt, lưu vào **Khách Hàng Đã Lưu** theo tên, xuất PDF (nút "In / Lưu PDF" dùng `window.print`).
2. **Khách Hàng Đã Lưu** (`/khach-hang`) — danh sách CRUD khách hàng, tiến độ mục tiêu doanh số, xuất CSV.
3. **So Sánh Đóng Phí** (`/so-sanh-dong-phi`) — so sánh giá trị hoàn lại theo các thời hạn đóng phí 10/15/20 năm.
4. **Tính Phí Quyền Lợi** (`/tinh-phi-quyen-loi`) — ước tính phí bảo hiểm theo STBH, tuổi, giới tính và quyền lợi bổ trợ.
5. **Quà Tặng Thần Số Học** (`/than-so-hoc`) — nhập ngày sinh, tính số chủ đạo, số trưởng thành, năm/tháng cá nhân, xuất PDF.

Tất cả công thức tài chính là công thức minh họa/tham khảo, không phải bảng phí chính thức của công ty bảo hiểm nào — phù hợp cho quá trình tư vấn trước khi ra bảng minh họa chính thức.

## Vai trò tài khoản

- **admin**: thấy thêm mục "Tạo Tài Khoản" ở sidebar, tạo/xóa tài khoản tư vấn viên khác, không bị giới hạn ngày dùng thử.
- **agent** (tư vấn viên): dùng 5 tính năng trên, có banner "dùng thử còn N ngày" (tính theo `trialStartedAt` + `trialDays`, mặc định 14 ngày).

Mật khẩu mặc định khi admin tạo tài khoản mới = số điện thoại (nếu để trống ô mật khẩu). Người dùng đổi mật khẩu qua nút 🔑 **Đổi mật khẩu** trên topbar.

## Deploy

Có thể deploy trực tiếp lên Vercel: import repo, khai báo các biến môi trường ở trên trong phần Environment Variables, sau đó chạy `npm run seed` một lần locally (kết nối cùng `MONGODB_URI` với production) để tạo tài khoản admin đầu tiên.
