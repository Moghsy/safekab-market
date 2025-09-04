import {
  type Api,
  ApiService,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from "@/services/api";
import { useCallback, useMemo } from "react";
import { useAuth, type TokenData } from "@/context/AuthContext";
import { extractDataFromToken, isTokenExpired } from "@/lib/jwt";
import { ApiError } from "@/services/error";

export function useApi() {
  const { tokenData, loading, getToken, setToken, setTokenData, setUser } =
    useAuth();

  const authHelper = (response: AuthResponse) => {
    const { access_token, refresh_token } = response;
    const { id, roles } = extractDataFromToken(access_token);
    setUser({ id, roles });
    const newTokens: TokenData = {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
    setTokenData(newTokens);
    setToken(newTokens);
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    return newTokens;
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await api.login(credentials);
    authHelper(response);
  }, []);

  const register = useCallback(async (credentials: RegisterRequest) => {
    const response = await api.register(credentials);
    authHelper(response);
  }, []);

  const refresh = useCallback(async (): Promise<TokenData | null> => {
    const token = getToken();
    if (!token) return null;
    try {
      const response = await api.refreshToken({
        refresh_token: token.refreshToken,
      });
      return authHelper(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // 404 could mean the refresh token was just used in another tab
        // Check if the current access token is still valid
        const token = getToken();
        if (token != null) {
          try {
            if (!isTokenExpired(token.accessToken)) {
              // Access token is still valid, do not logout
              return token;
            }
          } catch (e) {
            // If token is invalid, proceed to logout
          }
        }
      }
      console.error("Error refreshing token:", error);
      logout();
      throw error;
    }
  }, [getToken]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {}
    setUser(null);
    setTokenData(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  const api = useMemo(() => {
    return new ApiService(
      import.meta.env.VITE_API_URL || "http://localhost:8080/api",
      getToken,
      refresh
    ) as Api;
  }, []);

  return { api, tokenData, login, register, logout, loading };
}
