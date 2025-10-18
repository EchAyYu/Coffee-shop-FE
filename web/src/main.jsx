// ===============================
// ☕ Coffee Shop - main.jsx (Cách 1: Dùng App tổng duy nhất)
// ===============================
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// 🔹 Render toàn bộ ứng dụng
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
