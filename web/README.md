# ☕ LO Coffee Shop - Frontend (Graduation Project)

**Repository:** [Coffee-shop-FE](https://github.com/EchAyYu/Coffee-shop-FE)  
**Technology Stack:** React + Vite + Tailwind CSS + Socket.io  
**Status:** Development

---

## 📋 Mục Lục

1. [Giới thiệu](#giới-thiệu)
2. [Tính năng chính](#tính-năng-chính)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Cài đặt & Chạy](#cài-đặt--chạy)
5. [Các Module chính](#các-module-chính)
6. [API Endpoints](#api-endpoints)
7. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới thiệu

**LO Coffee Shop** là một hệ thống quản lý cà phê toàn diện với:

- 🛒 **Frontend khách hàng** — Xem menu, đặt hàng, đặt bàn, chatbot AI
- 👔 **Admin Dashboard** — Quản lý sản phẩm, đơn hàng, nhân viên, khuyến mãi
- 👨‍💼 **Employee Dashboard** — Xem đơn hàng, quản lý bàn
- 💬 **AI Chatbot** — Tư vấn sản phẩm, đặt bàn tự động, gửi ảnh

---

## ✨ Tính năng chính

### 🛍️ Khách hàng

- ✅ Xem menu sản phẩm
- ✅ Thêm vào giỏ hàng & thanh toán
- ✅ Đặt bàn online
- ✅ Xem lịch sử đơn hàng & đặt bàn
- ✅ Đánh giá sản phẩm
- ✅ Sử dụng voucher & tích điểm loyalty
- ✅ Chat với AI Chatbot (gửi ảnh, gợi ý menu, đặt bàn nhanh)

### 🔐 Admin

- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục
- ✅ Quản lý đơn hàng (xem, cập nhật trạng thái)
- ✅ Quản lý nhân viên
- ✅ Quản lý bàn & đặt bàn
- ✅ Quản lý khách hàng
- ✅ Quản lý voucher & khuyến mãi
- ✅ Xem đánh giá & trả lời
- ✅ Thống kê doanh thu (tuần/tháng)
- ✅ Export dữ liệu (CSV)

### 💼 Nhân viên

- ✅ Xem danh sách đơn hàng cần xử lý
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Quản lý bàn & đặt bàn

---

## 📁 Cấu trúc dự án

```
Coffee-shop-FE/
└── web/
    ├── index.html                    # HTML chính
    ├── package.json                  # Dependencies
    ├── vite.config.js               # Vite configuration
    ├── tailwind.config.js           # Tailwind CSS config
    ├── postcss.config.js            # PostCSS config
    ├── .env                         # Environment variables
    ├── public/
    │   └── images/                  # Assets
    └── src/
        ├── main.jsx                 # Entry point
        ├── App.jsx                  # Main routing
        ├── index.css                # Global styles
        ├── socket.js                # Socket.io setup
        │
        ├── api/
        │   ├── api.js               # ⭐ Main axios instance + auth endpoints
        │   ├── adminApi.js          # Admin API calls
        │   ├── auth.js              # Authentication endpoints
        │   ├── chatbotApi.js        # Chatbot endpoints
        │   ├── homeContentApi.js    # Homepage content
        │   ├── productsApi.js       # Products endpoints
        │   ├── profile.js           # User profile endpoints
        │   └── reservationApi.js    # Reservation endpoints
        │
        ├── components/
        │   ├── TopBar.jsx           # Navigation bar
        │   ├── CartModal.jsx        # Shopping cart modal
        │   ├── ChatbotWidget.jsx    # 💬 AI Chatbot widget
        │   ├── ProductCard.jsx      # Product card component
        │   ├── OrderDetailModal.jsx # Order details modal
        │   ├── TableCard.jsx        # Table booking card
        │   └── ...                  # Other reusable components
        │
        ├── context/
        │   ├── AuthContext.jsx      # Authentication context
        │   └── ThemeContext.jsx     # Dark/Light theme
        │
        ├── hooks/
        │   └── useDebounce.js       # Search debounce hook
        │
        ├── layouts/
        │   └── AdminLayout.jsx      # Admin layout wrapper
        │
        ├── pages/
        │   ├── HomePage.jsx         # Home page
        │   ├── MenuPage.jsx         # Menu/Products page
        │   ├── BookingPage.jsx      # Table booking page
        │   ├── CustomerInfoPage.jsx # User profile
        │   ├── CheckoutPage.jsx     # Checkout page
        │   ├── Login.jsx            # Login page
        │   ├── Register.jsx         # Registration page
        │   ├── AboutPage.jsx        # About us
        │   ├── CareerPage.jsx       # Careers
        │   │
        │   ├── admin/               # 📊 Admin pages
        │   │   ├── AdminDashboard.jsx
        │   │   ├── AdminOrders.jsx
        │   │   ├── AdminCustomers.jsx
        │   │   ├── AdminEmployees.jsx
        │   │   ├── AdminTables.jsx
        │   │   ├── AdminVouchersPage.jsx
        │   │   ├── AdminPromotions.jsx
        │   │   ├── AdminReservations.jsx
        │   │   ├── AdminReviewsPage.jsx
        │   │   ├── ProductsPage.jsx
        │   │   ├── HomeContentManager.jsx
        │   │   └── index.jsx
        │   │
        │   └── employee/           # 👔 Employee pages
        │       └── EmployeeApp.jsx
        │
        ├── routes/
        │   └── ProtectedRoute.jsx   # Route protection wrapper
        │
        ├── styles/                  # Additional CSS
        └── utils/                   # Utility functions
```

---

## 🚀 Cài đặt & Chạy

### 1. Clone repository

```bash
git clone https://github.com/EchAyYu/Coffee-shop-FE.git
cd Coffee-shop-FE/web
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Tạo file `.env` (hoặc sửa file hiện tại):

```env
VITE_API_BASE=http://localhost:4000/api
```

### 4. Chạy dev server

```bash
npm run dev
```

**Mở trình duyệt:** http://localhost:5173

### 5. Build production

```bash
npm run build
npm run preview
```

---

## 🔧 Các Module chính

### 📡 API Layer (`src/api/`)

#### `api.js` — Main API Service

- ✅ Axios instance với auto token refresh
- ✅ Request/Response interceptors
- ✅ Error handling (401, 403, 404, 500)
- ✅ Token management

```javascript
// Sử dụng
import { getProducts, login, me } from "@/api/api";

const products = await getProducts({ page: 1 });
```

#### `adminApi.js` — Admin API Service

- ✅ Tách biệt token cho admin
- ✅ Admin-only endpoints
- ✅ Stats & export functions

```javascript
import { getOrdersAdmin, exportAdminOrders } from "@/api/adminApi";
```

### 🎨 Context (`src/context/`)

#### `AuthContext.jsx`

- Quản lý user state (login, logout, refresh)
- Auto token refresh
- User info & role (customer, admin, employee)

#### `ThemeContext.jsx`

- Dark/Light mode
- Theme persistence

### 🛒 Shopping (`src/components/CartContext.jsx`)

- Shopping cart state
- Add/Remove/Update item
- Persist to localStorage

### 💬 Chatbot (`src/components/ChatbotWidget.jsx`)

- AI chatbot UI
- Session management
- Image upload support
- Auto order suggestion

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/login`    | Login user           |
| POST   | `/auth/register` | Register new account |
| POST   | `/auth/refresh`  | Refresh token        |
| POST   | `/auth/logout`   | Logout               |
| GET    | `/auth/me`       | Current user info    |

### Products

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| GET    | `/products`     | List all products   |
| GET    | `/products/:id` | Get product details |
| GET    | `/categories`   | List categories     |

### Orders

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/orders`                  | Create order        |
| GET    | `/orders`                  | User's orders       |
| GET    | `/orders/:id`              | Order details       |
| GET    | `/admin/orders`            | All orders (admin)  |
| PUT    | `/admin/orders/:id/status` | Update order status |

### Bookings

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/reservations`    | Create booking       |
| GET    | `/reservations/my` | User's bookings      |
| GET    | `/reservations`    | All bookings (admin) |

### Chatbot

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/chatbot/message` | Send text message       |
| POST   | `/chatbot/image`   | Send image for analysis |

---

## 💡 Hướng dẫn sử dụng

### 1. Đăng nhập khách hàng

```
URL: http://localhost:5173/login
Tài khoản mẫu: (từ backend)
```

### 2. Xem menu & đặt hàng

```
1. Vào /menu → Xem sản phẩm
2. Thêm vào giỏ hàng (icon giỏ)
3. Click giỏ hàng → Checkout
4. Nhập thông tin giao hàng → Thanh toán
```

### 3. Đặt bàn

```
1. Vào /booking
2. Chọn ngày, giờ, số người
3. Gửi yêu cầu
4. Xem trạng thái tại /customer
```

### 4. Sử dụng Chatbot

```
1. Click nút 💬 góc phải màn hình
2. Hỏi về menu, đặt bàn, gửi ảnh
3. Bot sẽ gợi ý & có thể tự động thêm vào giỏ
```

### 5. Admin Dashboard

```
URL: http://localhost:5173/admin
- Login với tài khoản admin
- Quản lý sản phẩm, đơn hàng, nhân viên
- Xem thống kê & export dữ liệu
```

---

## 🐛 Troubleshooting

### Lỗi: "API base URL is not defined"

**Giải pháp:** Kiểm tra file `.env`

```bash
# Đảm bảo có:
VITE_API_BASE=http://localhost:4000/api
```

### Lỗi: "Failed to resolve import"

**Giải pháp:** Cài missing package

```bash
npm install lucide-react socket.io-client
```

### Lỗi: "Chỉ Admin mới được truy cập" (403)

**Giải pháp:** Backend chặn quyền hạn nhân viên

- Kiểm tra role của tài khoản
- Hoặc thay endpoint `/admin/...` sang `/stats/...` nếu backend hỗ trợ

### Token hết hạn

**Giải pháp:** App sẽ tự động refresh token, nếu không:

```javascript
// Check localStorage
console.log(localStorage.getItem("access_token"));
```

---

## 📦 Dependencies chính

| Package          | Version | Use Case       |
| ---------------- | ------- | -------------- |
| react            | ^18.x   | UI library     |
| react-router-dom | ^6.x    | Routing        |
| axios            | ^1.x    | HTTP client    |
| tailwindcss      | ^3.x    | CSS framework  |
| socket.io-client | ^4.x    | Real-time chat |
| react-toastify   | ^9.x    | Notifications  |
| sweetalert2      | ^11.x   | Modal dialogs  |
| lucide-react     | ^0.x    | Icons          |

---

## 👥 Team

- **Sinh viên:** (Tên bạn)
- **Đại học:** (Tên đại học)
- **Năm học:** 2024-2025

---

## 📝 License

Graduation Project — All rights reserved.

---

## 📞 Contact

- **GitHub:** [EchAyYu](https://github.com/EchAyYu)
- **Email:** (your-email@example.com)

---

**Last Updated:** December 9, 2025  
**Status:** 🟢 Development In Progress
