import { useMemo, useState } from "react";

// ---- Mock Data (can be replaced by real API later) ----
const CATEGORIES = [
  { key: "coffee", label: "COFFEE" },
  { key: "freeze", label: "FREEZE" },
  { key: "tea", label: "TEA" },
  { key: "food", label: "FOOD" },
];

const PRODUCTS = [
  // Coffee
  {
    id: "c1",
    name: "Americano",
    priceBase: 45000,
    category: "coffee",
    sizes: [
      { key: "S", delta: 0 },
      { key: "M", delta: 10000 },
      { key: "L", delta: 20000 },
    ],
    desc: "A shot of espresso topped with hot water.",
    image: "https://placehold.co/600x800?text=Americano",
    badges: ["HOT", "ICE"],
  },
  {
    id: "c2",
    name: "Phin Sữa Đá",
    priceBase: 29000,
    category: "coffee",
    sizes: [
      { key: "S", delta: 0 },
      { key: "M", delta: 6000 },
      { key: "L", delta: 12000 },
    ],
    desc: "Vietnamese milk coffee (iced).",
    image: "https://placehold.co/600x800?text=Phin+Sua+Da",
    badges: ["SIGNATURE"],
  },
  {
    id: "c3",
    name: "Cappuccino",
    priceBase: 65000,
    category: "coffee",
    sizes: [
      { key: "S", delta: 0 },
      { key: "M", delta: 6000 },
      { key: "L", delta: 12000 },
    ],
    desc: "Espresso with steamed milk foam.",
    image: "https://placehold.co/600x800?text=Cappuccino",
    badges: ["MILKY"],
  },
  // Freeze
  {
    id: "f1",
    name: "Cookies & Cream Freeze",
    priceBase: 59000,
    category: "freeze",
    sizes: [
      { key: "S", delta: 0 },
      { key: "M", delta: 7000 },
      { key: "L", delta: 14000 },
    ],
    desc: "Ice-blended beverage w/ cookies.",
    image: "https://placehold.co/600x800?text=Freeze+Cookies",
    badges: ["BLENDED"],
  },
  // Tea
  {
    id: "t1",
    name: "Trà Sen Vàng",
    priceBase: 49000,
    category: "tea",
    sizes: [
      { key: "S", delta: 0 },
      { key: "M", delta: 6000 },
      { key: "L", delta: 12000 },
    ],
    desc: "Vietnamese lotus tea with milk foam.",
    image: "https://placehold.co/600x800?text=Tra+Sen+Vang",
    badges: ["BEST SELLER"],
  },
  // Food
  {
    id: "fd1",
    name: "Bánh Mì Gà Nướng",
    priceBase: 39000,
    category: "food",
    sizes: [{ key: "M", delta: 0 }],
    desc: "Grilled chicken baguette.",
    image: "https://placehold.co/600x800?text=Banh+Mi+Ga",
    badges: ["NEW"],
  },
];

// ---- Utilities ----
const currency = (v) => v.toLocaleString("vi-VN") + " ₫";

function priceWithSize(product, sizeKey) {
  const size = product.sizes.find((s) => s.key === sizeKey) ?? product.sizes[0];
  return product.priceBase + (size?.delta ?? 0);
}

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

function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={
            "px-4 py-2 rounded-full text-sm border transition " +
            (active === c.key
              ? "bg-red-700 text-white border-red-700 shadow"
              : "hover:bg-neutral-50")
          }
        >
          {c.label}
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
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          {product.badges?.map((b) => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100">{b}</span>
          ))}
        </div>
        <div className="font-medium leading-tight">{product.name}</div>
        <div className="text-sm text-neutral-500 line-clamp-2 min-h-[2.5lh]">{product.desc}</div>
        <div className="pt-1 font-semibold text-red-700">
          {currency(product.priceBase)}+
        </div>
      </div>
    </button>
  );
}

function ProductGrid({ items, onOpenDetail }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} onOpenDetail={onOpenDetail} />)
      )}
    </div>
  );
}

function DetailModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState(product?.sizes?.[0]?.key ?? "M");
  const [qty, setQty] = useState(1);

  if (!product) return null;
  const calcPrice = priceWithSize(product, size);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white overflow-hidden shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <img src={product.image} alt={product.name} className="w-full h-72 md:h-full object-cover" />
          <div className="p-5 flex flex-col gap-3">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-sm text-neutral-600">{product.desc}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {product.sizes.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  className={
                    "px-4 py-2 rounded-xl border text-sm " +
                    (size === s.key ? "bg-red-700 text-white border-red-700" : "hover:bg-neutral-50")
                  }
                >
                  Size {s.key}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="text-sm text-neutral-600">Số lượng</div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <div className="w-10 text-center">{qty}</div>
                <button className="w-8 h-8 rounded-lg border" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="text-lg font-semibold text-red-700">{currency(calcPrice)}</div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-xl border" onClick={onClose}>Đóng</button>
                <button
                  className="px-4 py-2 rounded-xl bg-red-700 text-white"
                  onClick={() => onAdd({ product, size, qty, unitPrice: calcPrice })}
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
              <img src={it.product.image} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-medium leading-tight">{it.product.name}</div>
                <div className="text-xs text-neutral-500">Size {it.size}</div>
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h3>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>Đóng</button>
        </div>
        <div className="pt-4 space-y-3">
          {mode === "register" && (
            <input className="w-full px-3 py-2 rounded-xl border" placeholder="Họ và tên" />
          )}
          <input className="w-full px-3 py-2 rounded-xl border" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full px-3 py-2 rounded-xl border" placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button
            className="w-full px-4 py-3 rounded-xl bg-red-700 text-white font-semibold"
            onClick={() => { onSuccess({ email }); onClose(); }}
          >
            {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
          <div className="text-sm text-center">
            {mode === "login" ? (
              <span>
                Chưa có tài khoản?{" "}
                <button className="text-red-700 underline" onClick={() => setMode("register")}>Đăng ký</button>
              </span>
            ) : (
              <span>
                Đã có tài khoản?{" "}
                <button className="text-red-700 underline" onClick={() => setMode("login")}>Đăng nhập</button>
              </span>
            )}
          </div>
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
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key);
  const [sortBy, setSortBy] = useState("default");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        list.sort((a, b) => a.priceBase - b.priceBase);
        break;
      case "price-desc":
        list.sort((a, b) => b.priceBase - a.priceBase);
        break;
      default:
        break;
    }
    return list;
  }, [activeCat, sortBy, query]);

  function addToCart({ product, size, qty, unitPrice }) {
    setItems((prev) => [...prev, { product, size, qty, unitPrice }]);
    setDetail(null);
    setCartOpen(true);
  }

  function handleCheckout() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    alert("[Demo] Tiến hành thanh toán – kết nối VN PAY sẽ được tích hợp ở bước sau.");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar onOpenAuth={() => setAuthOpen(true)} onOpenCart={() => setCartOpen(true)} isAuthed={!!user} />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 to-red-50 border">
          <div className="grid md:grid-cols-2">
            <img src="https://placehold.co/1200x800?text=Highlands+Hero" className="w-full h-full object-cover" />
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
            <CategoryTabs active={activeCat} onChange={setActiveCat} />
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
          © {new Date().getFullYear()} Highlands‑style demo. Tiếp theo: kết nối API thật, VN PAY, Rasa Chatbot.
        </div>
      </footer>
    </div>
  );
}
