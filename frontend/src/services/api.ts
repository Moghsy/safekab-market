import type Product from "@/models/Product";
import { ApiError, type ErrorResponse } from "./error";
import type { TokenData } from "@/context/AuthContext";
import type { Config } from "@/models/Config";

export interface Api {
  getUserDetails(token: string): Promise<GetUserDetailsResponse>;
  getProducts(): Promise<GetProductsResponse>;
  getProduct(id: number): Promise<Product>;
  newProduct(req: NewProductRequest): Promise<void>;
  updateProduct(req: UpdateProductRequest): Promise<void>;
  createPayment(orderId: number): Promise<CreatePaymentResponse>;
  getCart(): Promise<GetCartResponse>;
  addOrRemoveProductFromCart(req: AddOrRemoveCartProductRequest): Promise<void>;
  removeCartItem(productId: number): Promise<void>;
  updateCart(req: UpdateCartRequest): Promise<void>;
  login(req: LoginRequest): Promise<AuthResponse>;
  register(req: RegisterRequest): Promise<AuthResponse>;
  refreshToken(req: RefreshTokenRequest): Promise<AuthResponse>;
  logout(): Promise<void>;

  getOrder(orderId: number): Promise<OrderResponse>;
  newOrder(req: NewOrderRequest): Promise<OrderResponse>;
  getUserOrdersPaginated(
    page?: number,
    size?: number
  ): Promise<Page<OrderResponse>>;
  removeCartItems(productIds: number[]): Promise<void>;

  getConfig(): Promise<Config>;

  // Admin endpoints
  getAdminOrders(
    paymentStatus?: PaymentStatus,
    trackingStatus?: TrackingStatus,
    page?: number,
    size?: number
  ): Promise<Page<AdminOrderResponse>>;
  updateOrderStatus(
    orderId: number,
    req: UpdateOrderStatusRequest
  ): Promise<AdminOrderResponse>;
}
export interface Page<T> {
  content: T[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface OrderResponse {
  id: number;
  payment_status: PaymentStatus;
  tracking_status: TrackingStatus;
  order_date: string;
  total_price: number;
  shipping_cost: number;
  items: Array<OrderProductResponse>;
}

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
export const PaymentStatus = {
  UNPAID: "UNPAID" as PaymentStatus,
  PAID: "PAID" as PaymentStatus,
  REFUNDED: "REFUNDED" as PaymentStatus,
  FAILED: "FAILED" as PaymentStatus,
};

export type TrackingStatus =
  | "NOT_SHIPPED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURNED";
export const TrackingStatus = {
  NOT_SHIPPED: "NOT_SHIPPED" as TrackingStatus,
  SHIPPED: "SHIPPED" as TrackingStatus,
  IN_TRANSIT: "IN_TRANSIT" as TrackingStatus,
  DELIVERED: "DELIVERED" as TrackingStatus,
  RETURNED: "RETURNED" as TrackingStatus,
};

export interface OrderProductResponse {
  product: Product;
  quantity: number;
}

export interface NewOrderRequest {
  items: Array<NewOrderRequestItem>;
}

export interface NewOrderRequestItem {
  product_id: number;
  quantity: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
}

export interface GetUserDetailsResponse {
  id: number;
  username: string;
  email: string;
  mobile: string;
}

export interface GetProductsResponse {
  products: Array<Product>;
}

export interface ProductImageRequest {
  image_url: string;
  alt_text?: string;
  display_order: number;
  media_type?: "image" | "video";
}

export interface NewProductRequest {
  name: string;
  description: string;
  net_price: number;
  stock?: number;
  currency: string;
  vat_rate: number;
  media?: Array<ProductImageRequest>;
}

export interface UpdateProductRequest {
  id?: number;
  name?: string;
  description?: string;
  net_price?: number;
  stock?: number;
  currency?: string;
  vat_rate?: number;
  media?: Array<ProductImageRequest>;
}

export interface CreatePaymentResponse {
  url: string;
}

export interface AddOrRemoveCartProductRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartRequest {
  product_id: number;
  quantity: number;
}

export interface GetCartResponse {
  cart_id: number;
  products: Array<GetCartItemResponseItem>;
}

export interface GetCartItemResponseItem {
  product_id: number;
  name: string;
  description: string;
  net_price: number;
  vat_rate: number;
  currency: string;
  stock?: number;
  quantity: number;
}

// Admin interfaces
export interface AdminOrderResponse {
  id: number;
  payment_status: PaymentStatus;
  tracking_status: TrackingStatus;
  order_date: string;
  total_price: number;
  shipping_cost: number;
  items: Array<OrderProductResponse>;
  user: {
    id: number;
    username: string;
    email: string;
  };
  shipment_location?: {
    id: number;
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  promotion_code?: string;
}

export interface UpdateOrderStatusRequest {
  tracking_status: TrackingStatus;
}

type TokenRefresher = () => Promise<TokenData | null>;
type TokenGetter = () => TokenData | null;
export class ApiService implements Api {
  private readonly apiUrl: string;
  private readonly getToken: TokenGetter;
  private readonly _rawRefreshTokens: TokenRefresher;
  private _refreshPromise: Promise<TokenData | null> | null = null;

  public constructor(
    apiUrl: string,
    getToken: TokenGetter,
    refreshTokens: TokenRefresher
  ) {
    this.apiUrl = apiUrl;
    this.getToken = getToken;
    this._rawRefreshTokens = refreshTokens;
  }

  /**
   * Ensures only one refreshTokens call is in-flight at a time.
   */
  private refreshTokens = async (): Promise<TokenData | null> => {
    if (this._refreshPromise) {
      return this._refreshPromise;
    }
    this._refreshPromise = this._rawRefreshTokens();
    try {
      const result = await this._refreshPromise;
      return result;
    } finally {
      this._refreshPromise = null;
    }
  };

  private isRefreshRequest(endpoint: string) {
    return endpoint === "/auth/refresh";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    retry = true
  ): Promise<T> {
    try {
      const defaultHeaders = { "Content-Type": "application/json" };
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });
      if (response.status === 204) return undefined as T;
      let data: any = undefined;
      try {
        data = await response.json();
      } catch (e) {}
      if (!response.ok) {
        const tokens = this.getToken();
        if (
          response.status === 401 &&
          retry &&
          tokens &&
          !this.isRefreshRequest(endpoint)
        ) {
          await this.refreshTokens();
          // Try again with new token
          const newTokens = this.getToken();
          if (newTokens) {
            const newOptions: RequestInit = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newTokens.accessToken}`,
              },
            };
            return this.request<T>(endpoint, newOptions, false);
          }
        }
        const errorData = data as ErrorResponse;
        throw new ApiError(
          (errorData && errorData.message) || "unexpected error",
          response.status,
          (errorData && errorData.validation_errors) || []
        );
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("An unexpected error occurred", 500);
    }
  }

  public async login(req: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  public async register(req: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  public async refreshToken(req: RefreshTokenRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  public async logout(): Promise<void> {
    const tokens = this.getToken();
    if (!tokens || !tokens.refreshToken) return;
    await this.request<undefined>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: tokens.refreshToken,
      } as LogoutRequest),
    });
  }

  // These methods now use the latest access token automatically
  public async getUserDetails(): Promise<GetUserDetailsResponse> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<GetUserDetailsResponse>("/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async getProducts(): Promise<GetProductsResponse> {
    return this.request<GetProductsResponse>("/products", {
      method: "GET",
    });
  }

  public async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: "GET",
    });
  }

  public async newProduct(req: NewProductRequest): Promise<void> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    await this.request<undefined>("/admin/products", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async updateProduct(req: UpdateProductRequest): Promise<void> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    await this.request<undefined>("/admin/products", {
      method: "PATCH",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async createPayment(orderId: number): Promise<CreatePaymentResponse> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<CreatePaymentResponse>("/payment/create", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async getOrder(orderId: number): Promise<OrderResponse> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<OrderResponse>(`/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async newOrder(req: NewOrderRequest): Promise<OrderResponse> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async getCart(): Promise<GetCartResponse> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<GetCartResponse>("/cart", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async addOrRemoveProductFromCart(
    req: AddOrRemoveCartProductRequest
  ): Promise<void> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    await this.request<undefined>("/cart", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async updateCart(req: UpdateCartRequest): Promise<void> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    await this.request<undefined>("/cart", {
      method: "PUT",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }
  public async removeCartItem(productId: number): Promise<void> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    await this.request<undefined>(`/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  public async getUserOrdersPaginated(
    page = 0,
    size = 10
  ): Promise<Page<OrderResponse>> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return this.request<Page<OrderResponse>>(`/orders?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }
  /**
   * @deprecated Use getUserOrdersPaginated instead
   */
  public async getUserOrders(): Promise<OrderResponse[]> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<OrderResponse[]>("/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }
  public async removeCartItems(productIds: number[]): Promise<void> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    await this.request<undefined>("/cart", {
      method: "DELETE",
      body: JSON.stringify({ products: productIds }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }
  public async getConfig(): Promise<Config> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<Config>("/config", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  // Admin methods
  public async getAdminOrders(
    paymentStatus?: PaymentStatus,
    trackingStatus?: TrackingStatus,
    page = 0,
    size = 20
  ): Promise<Page<AdminOrderResponse>> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (paymentStatus) {
      params.append("payment_status", paymentStatus);
    }
    if (trackingStatus) {
      params.append("tracking_status", trackingStatus);
    }

    return this.request<Page<AdminOrderResponse>>(
      `/admin/orders?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
  }

  public async updateOrderStatus(
    orderId: number,
    req: UpdateOrderStatusRequest
  ): Promise<AdminOrderResponse> {
    const tokens = this.getToken();
    if (!tokens) throw new ApiError("No tokens", 401);
    return this.request<AdminOrderResponse>(`/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }
}
