import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AdminApp from "./admin/AdminApp"; // 👈 thêm dòng này
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* Khách hàng */}
      <Route path="/*" element={<App />} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  </BrowserRouter>
);
