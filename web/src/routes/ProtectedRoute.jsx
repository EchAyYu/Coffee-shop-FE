import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (role && String(user.role).toLowerCase() !== String(role).toLowerCase()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
