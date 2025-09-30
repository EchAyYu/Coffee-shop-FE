import { useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);

  if (!admin) {
    return <AdminLogin onSuccess={setAdmin} />;
  }

  return <AdminDashboard />;
}