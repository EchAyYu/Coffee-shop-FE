import { createContext, useContext, useEffect, useState } from "react";
import { me } from "../api/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const { data } = await me();
        setUser(data?.data || data?.user || null);
      } catch {
        localStorage.removeItem("access_token");
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, setUser }}>
      {booted ? children : null}
    </AuthCtx.Provider>
  );
}
