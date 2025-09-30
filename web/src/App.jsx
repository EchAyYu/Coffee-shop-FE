import { useEffect, useMemo, useState } from "react";
import { getProducts, getCategories, createOrder } from "./api";
import { register, login } from "./api";

// ---- Utilities ----
const currency = (v) => v.toLocaleString("vi-VN") + " ₫";

// ---- Components ----
function TopBar({ onOpenAuth, onOpenCart, isAuthed }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b border-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-red-700 grid place-items-center text-white font-bold">H</div>
          <div className="text-xl font-semibold tracking-wide">Highlands Style</div>
        </div>
        <nav className="ml-auto flex items-center gap-2">
          {!isAuthed ? (
            <button
              className="px-4 py-2 rounded-xl border hover:bg-neutral-50 text-sm"
              onClick={onOpenAuth}
            >
              Đăng nhập / Đăng ký
            </button>
          ) : (
            <div className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg">Đã đăng nhập</div>
          )}
          <button
            className="px-3 py-2 rounded-xl border hover:bg-neutral-50 text-sm"
            onClick={onOpenCart}
            aria-label="Mở giỏ hàng"
          >
            🛒 Giỏ hàng
          </button>
        </nav>
      </div>
    </header>
  );
}

function CategoryTabs({ active, onChange, categories }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={
          "px-4 py-2 rounded-full text-sm border transition " +
          (active === "all"
            ? "bg-red-700 text-white border-red-700 shadow"
            : "hover:bg-neutral-50")
        }
      >
        Tất cả
      </button>

      {categories.map((c) => (
        <button
          key={c.id_dm}
          onClick={() => onChange(c.id_dm)}
          className={
            "px-4 py-2 rounded-full text-sm border transition " +
            (active === c.id_dm
              ? "bg-red-700 text-white border-red-700 shadow"
              : "hover:bg-neutral-50")
          }
        >
          {c.ten_dm}
        </button>
      ))}
    </div>
  );
}


function SortBar({ sortBy, setSortBy, query, setQuery }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm đồ uống, món ăn…"
          className="pl-10 pr-4 py-2 rounded-xl border w-64"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2">🔎</span>
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 rounded-xl border"
      >
        <option value="default">Sắp xếp: Mặc định</option>
        <option value="name-asc">Tên A → Z</option>
        <option value="name-desc">Tên Z → A</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
        <option value="new">Hàng mới</option>
      </select>
    </div>
  );
}

function ProductCard({ product, onOpenDetail }) {
  return (
    <button
      className="group rounded-2xl overflow-hidden bg-white border hover:shadow-md text-left"
      onClick={() => onOpenDetail(product)}
    >
      <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
        <img
          src={product.anh}
          alt={product.ten_mon}
          className="h-full w-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="font-medium leading-tight">{product.ten_mon}</div>
        <div className="text-sm text-neutral-500 line-clamp-2 min-h-[2.5lh]">{product.mo_ta}</div>
        <div className="pt-1 font-semibold text-red-700">
          {currency(Number(product.gia))}
        </div>
      </div>
    </button>
  );
}

function ProductGrid({ items, onOpenDetail }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((p) => (
        <ProductCard key={p.id_mon} product={p} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  );
}

function DetailModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white overflow-hidden shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <img src={product.anh} alt={product.ten_mon} className="w-full h-72 md:h-full object-cover" />
          <div className="p-5 flex flex-col gap-3">
            <h3 className="text-xl font-semibold">{product.ten_mon}</h3>
            <p className="text-sm text-neutral-600">{product.mo_ta}</p>
            <div className="flex items-center gap-3 pt-1">
              <div className="text-sm text-neutral-600">Số lượng</div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <div className="w-10 text-center">{qty}</div>
                <button className="w-8 h-8 rounded-lg border" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="text-lg font-semibold text-red-700">{currency(Number(product.gia) * qty)}</div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Đóng</button>
                <button
                  className="px-4 py-2 rounded-xl bg-red-700 text-white"
                  onClick={() => onAdd({ product, qty, unitPrice: Number(product.gia) })}
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose, items, onChangeQty, onRemove, onCheckout }) {
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[28rem] bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Giỏ hàng</h3>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>Đóng</button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {items.length === 0 && <div className="text-sm text-neutral-500">Chưa có sản phẩm nào.</div>}
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-3 border rounded-xl p-3">
              <img src={it.product.anh} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-medium leading-tight">{it.product.ten_mon}</div>
                <div className="flex items-center gap-2 pt-1">
                  <button className="w-7 h-7 rounded border" onClick={() => onChangeQty(idx, Math.max(1, it.qty - 1))}>-</button>
                  <div className="w-8 text-center text-sm">{it.qty}</div>
                  <button className="w-7 h-7 rounded border" onClick={() => onChangeQty(idx, it.qty + 1)}>+</button>
                  <div className="ml-auto text-sm font-semibold">{currency(it.unitPrice * it.qty)}</div>
                </div>
                <button className="text-xs text-red-600 mt-1" onClick={() => onRemove(idx)}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm"><span>Tạm tính</span><span className="font-semibold">{currency(subtotal)}</span></div>
          <button className="w-full px-4 py-3 rounded-xl bg-red-700 text-white font-semibold" onClick={onCheckout} disabled={items.length === 0}>
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [tenDn, setTenDn] = useState("");
  const [matKhau, setMatKhau] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    try {
      if (mode === "register") {
        const res = await register({
          ten_dn: tenDn,
          mat_khau: matKhau,
          ho_ten: hoTen,
          email,
          sdt,
          dia_chi: diaChi,
        });
        alert("Đăng ký thành công!");
        onSuccess(res.data.customer);
      } else {
        const res = await login({ ten_dn: tenDn, mat_khau: matKhau });
        localStorage.setItem("token", res.data.token);
        alert("Đăng nhập thành công!");
        onSuccess(res.data.account);
      }
      onClose();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Server error"));
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </h3>
        <div className="space-y-3">
          {mode === "register" && (
            <>
              <input className="w-full px-3 py-2 rounded-xl border" placeholder="Họ và tên"
                value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
              <input className="w-full px-3 py-2 rounded-xl border" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full px-3 py-2 rounded-xl border" placeholder="Số điện thoại"
                value={sdt} onChange={(e) => setSdt(e.target.value)} />
              <input className="w-full px-3 py-2 rounded-xl border" placeholder="Địa chỉ"
                value={diaChi} onChange={(e) => setDiaChi(e.target.value)} />
            </>
          )}
          <input className="w-full px-3 py-2 rounded-xl border" placeholder="Tên đăng nhập"
            value={tenDn} onChange={(e) => setTenDn(e.target.value)} />
          <input className="w-full px-3 py-2 rounded-xl border" placeholder="Mật khẩu" type="password"
            value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 rounded-xl bg-red-700 text-white"
            onClick={handleSubmit}
          >
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
          <button
            className="text-sm text-red-700 underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Tạo tài khoản" : "Đã có tài khoản?"}
          </button>
        </div>
      </div>
    </div>
  );
}


function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (activeCat === "all") {
      getProducts().then(res => setProducts(res.data));
    } else {
      getProducts({ category: activeCat }).then(res => setProducts(res.data));
    }
  }, [activeCat]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(console.error);
  
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(console.error);
  }, []);
  

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== "all") {
      list = list.filter((p) => p.id_dm === activeCat);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.ten_mon.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "name-asc":
        list.sort((a, b) => a.ten_mon.localeCompare(b.ten_mon));
        break;
      case "name-desc":
        list.sort((a, b) => b.ten_mon.localeCompare(a.ten_mon));
        break;
      case "price-asc":
        list.sort((a, b) => Number(a.gia) - Number(b.gia));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.gia) - Number(a.gia));
        break;
      default:
        break;
    }
    return list;
  }, [products, activeCat, sortBy, query]);

  function addToCart({ product, qty, unitPrice }) {
    setItems((prev) => [...prev, { product, qty, unitPrice }]);
    setDetail(null);
    setCartOpen(true);
  }

  async function handleCheckout() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const payload = {
        id_kh: user.id_kh, // nếu login trả về kèm id_kh
        ho_ten_nhan: user.ho_ten || "Khách vãng lai",
        sdt_nhan: user.sdt || "000000000",
        dia_chi_nhan: user.dia_chi || "Chưa cập nhật",
        pttt: "COD",
        items: items.map(it => ({
          id_mon: it.product.id_mon,
          so_luong: it.qty,
        }))
      };
  
      await createOrder(payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      alert("Đặt hàng thành công!");
      setItems([]);
    } catch (err) {
      console.error(err);
      alert("Không thể đặt hàng!");
    }
  }
  
  

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar onOpenAuth={() => setAuthOpen(true)} onOpenCart={() => setCartOpen(true)} isAuthed={!!user} />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 to-red-50 border">
          <div className="grid md:grid-cols-2">
          <img src="/images/Hero.jpg" alt="Highlands Hero" className="w-full h-full object-cover" />

            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Nước ngon thưởng vị · Bánh ngon no đầy</h1>
              <p className="mt-3 text-neutral-600">Lấy cảm hứng từ cấu trúc thực đơn Highlands Coffee: Coffee · Freeze · Tea · Food. Chọn món yêu thích & thêm vào giỏ hàng.</p>
              <div className="mt-5">
                <a href="#menu" className="inline-block px-5 py-3 rounded-xl bg-red-700 text-white font-semibold">Đặt hàng ngay</a>
              </div>
            </div>
          </div>
        </section>

        {/* Menu */}
        <section id="menu" className="space-y-5">
          <SectionHeader title="Thực đơn" subtitle="Dựa theo nhóm COFFEE · FREEZE · TEA · FOOD" />
          <div className="flex items-center justify-between gap-3 flex-wrap">
          <CategoryTabs categories={categories} active={activeCat} onChange={setActiveCat} />
            <SortBar sortBy={sortBy} setSortBy={setSortBy} query={query} setQuery={setQuery} />
          </div>
          <ProductGrid items={filtered} onOpenDetail={setDetail} />
        </section>
      </main>

      {/* Modals & Drawers */}
      {detail && (
        <DetailModal product={detail} onClose={() => setDetail(null)} onAdd={addToCart} />
      )}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onChangeQty={(idx, qty) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, qty } : it)))}
        onRemove={(idx) => setItems((prev) => prev.filter((_, i) => i !== idx))}
        onCheckout={handleCheckout}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <footer className="mt-12 border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500">
          © {new Date().getFullYear()} Highlands-style demo. Tiếp theo: kết nối API categories, Dashboard Admin, VN PAY, Chatbot.
        </div>
      </footer>
    </div>
  );
}
