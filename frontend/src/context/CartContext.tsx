import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/error";
import type CartItem from "@/models/CartItem";

interface CartContextType {
  cartItems: CartItem[];
  cartItemCount: number;
  loading: boolean;
  error: string | null;
  incrementProduct: (productId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  decrementProduct: (productId: number) => Promise<void>;
  updateCart: (productId: number, quantity: number) => Promise<void>;
  removeProduct: (productId: number) => Promise<void>;
  checkout: (products: CartItem[]) => Promise<string>;
  removeProducts: (productIds: number[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { api } = useApi();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkout = useCallback(async (products: CartItem[]) => {
    const response = await api.newOrder({
      items: products.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    });
    return (await api.createPayment(response.id)).url;
  }, []);

  const refreshCart = useCallback(async () => {
    if (loading) return;
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.getCart();
      const cartItems: CartItem[] = response.products.map((item) => ({
        id: item.product_id,
        name: item.name,
        description: item.description,
        net_price: item.net_price,
        vat_rate: item.vat_rate,
        currency: item.currency,
        quantity: item.quantity,
        stock: item.stock,
      }));
      setCartItems(cartItems);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch cart");
      }
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  }, [api, user, loading]);

  const incrementProduct = useCallback(
    async (productId: number) => {
      if (!user) {
        setError("Please log in to add items to cart");
        throw new ApiError("Must be logged in to add to cart", 401);
      }

      setLoading(true);
      setError(null);

      try {
        await api.addOrRemoveProductFromCart({
          product_id: productId,
          quantity: 1,
        });
        // Refresh cart after adding item
        await refreshCart();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to add item to cart");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, user, refreshCart]
  );

  const decrementProduct = useCallback(
    async (productId: number) => {
      if (!user) {
        setError("Please log in to remove items from cart");
        throw new ApiError("Must be logged in to remove from cart", 401);
      }

      setLoading(true);
      setError(null);

      try {
        await api.addOrRemoveProductFromCart({
          product_id: productId,
          quantity: -1,
        });
        // Refresh cart after removing item
        await refreshCart();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to remove item from cart");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, user, refreshCart]
  );

  const removeProduct = useCallback(
    async (productId: number) => {
      if (!user) {
        setError("Please log in to remove items from cart");
        throw new ApiError("Must be logged in to remove from cart", 401);
      }

      setLoading(true);
      setError(null);

      try {
        await api.removeCartItem(productId);
        // Refresh cart after removing item
        await refreshCart();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to remove item from cart");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, user, refreshCart]
  );

  const removeProducts = useCallback(
    async (productIds: number[]) => {
      if (!user) {
        setError("Please log in to remove items from cart");
        throw new ApiError("Must be logged in to remove from cart", 401);
      }

      setLoading(true);
      setError(null);

      try {
        await api.removeCartItems(productIds);
        // Refresh cart after removing items
        await refreshCart();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to remove items from cart");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, user, refreshCart]
  );

  const updateCart = useCallback(
    async (productId: number, quantity: number) => {
      if (!user) {
        setError("Please log in to update cart items");
        throw new ApiError("Must be logged in to update cart", 401);
      }

      setLoading(true);
      setError(null);

      try {
        await api.updateCart({
          product_id: productId,
          quantity,
        });
        // Refresh cart after updating item
        await refreshCart();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to update cart item");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, user, refreshCart]
  );

  // Load cart when user logs in or component mounts
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      setError(null);
    }
  }, [user]);

  const cartItemCount = cartItems.length;

  const value: CartContextType = {
    cartItems,
    cartItemCount,
    loading,
    error,
    incrementProduct,
    refreshCart,
    clearError,
    updateCart,
    decrementProduct,
    removeProduct,
    checkout,
    removeProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
