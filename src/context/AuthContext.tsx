import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../api/axios";
import {  type AuthContextType, type User } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);

    const userRes = await api.get("/auth/me");
    setUser(userRes.data.user);
  };

  // REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      password_confirmation,
    });

    localStorage.setItem("token", res.data.token);

    const userRes = await api.get("/auth/me");
    setUser(userRes.data.user);
  };

  // LOGOUT
  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook آمن
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};