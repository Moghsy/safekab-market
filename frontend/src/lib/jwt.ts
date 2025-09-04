import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  [key: string]: any;
}

export function extractDataFromToken(token: string): {
  id: string;
  roles: string[];
  exp: number;
} {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.sub,
      roles: decoded.roles || [],
      exp: decoded.exp,
    };
  } catch (e) {
    return { id: "", roles: [], exp: 0 };
  }
}

export function isTokenExpired(token: string) {
  try {
    const { exp } = extractDataFromToken(token);
    return !exp || Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}
