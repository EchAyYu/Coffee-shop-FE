import { Routes, Route, Link, Navigate } from "react-router-dom";
import ProductsPage from "./ProductsPage";

export default function AdminApp() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/admin/products" className="font-semibold">Admin Dashboard</Link>
          <nav className="ml-auto flex gap-3 text-sm">
            <Link to="/" className="underline">Về trang khách</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="products" replace />} />
          <Route path="products" element={<ProductsPage />} />
        </Routes>
      </main>
    </div>
  );
}
