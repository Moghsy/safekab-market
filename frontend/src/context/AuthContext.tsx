import type User from "@/models/User";
import { extractDataFromToken } from "@/lib/jwt";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  tokenData: TokenData | null;
  loading: boolean;
  getToken: () => TokenData | null;
  setToken: (token: TokenData | null) => void;
  setUser: (user: User | null) => void;
  setTokenData: (tokenData: TokenData | null) => void;
  getIsAdmin: () => boolean;
}

export interface TokenData {
  refreshToken: string;
  accessToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const tokenRef = useRef<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setToken = (token: TokenData | null) => {
    tokenRef.current = token;
  };
  const getToken = () => {
    return tokenRef.current;
  };

  const getIsAdmin = useCallback(() => {
    if (!user) return false;
    return user.roles.includes("ADMIN");
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        if (accessToken && refreshToken) {
          const { id, roles } = extractDataFromToken(accessToken);
          setUser({ id, roles });
          setTokenData({ accessToken, refreshToken });
          setToken({ accessToken, refreshToken });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const value = {
    user,
    tokenData,
    loading,
    getToken,
    setToken,
    setUser,
    setTokenData,
    getIsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
