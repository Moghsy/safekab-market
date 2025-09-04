import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { ShoppingBag, RefreshCw, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getGrossPrice } from "@/models/CartItem";
import type CartItem from "@/models/CartItem";
import { useState } from "react";

const CartPage = () => {
  const {
    cartItems,
    cartItemCount,
    error,
    loading,
    refreshCart,
    clearError,
    // incrementProduct, // Unused
    // decrementProduct, // Unused
    checkout,
    removeProduct,
    updateCart,
  } = useCart();
  const { showToast } = useToast();
  const { shippingCost } = useConfig();
  const navigate = useNavigate();

  // State for selected items (by cart item ID)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const formatPrice = (priceInPence: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(priceInPence / 100);
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((total, item) => total + getGrossPrice(item), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = selectedItems.size > 0 ? shippingCost : 0;
    return subtotal + shipping;
  };

  const getSelectedItems = () => {
    return cartItems.filter((item) => selectedItems.has(item.id));
  };

  const getSelectedItemCount = () => {
    return getSelectedItems().reduce((count, item) => count + item.quantity, 0);
  };

  const handleSelectItem = (itemId: number, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (selected) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allItemIds = new Set(cartItems.map((item) => item.id));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleRefresh = async () => {
    try {
      clearError();
      await refreshCart();
      showToast("Cart refreshed successfully", "success");
    } catch (err) {
      showToast("Failed to refresh cart", "destructive");
    }
  };

  const handleCheckout = async () => {
    const selectedCartItems = getSelectedItems();
    if (selectedCartItems.length === 0) {
      showToast("Please select items to checkout", "destructive");
      return;
    }
    const checkoutUrl = await checkout(selectedCartItems);
    window.location.href = checkoutUrl;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8" />
                  Your Cart
                </h1>
                <p className="text-blue-600 dark:text-blue-400 mt-1">
                  {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in
                  your cart
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-red-700 dark:text-red-400">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Empty Cart */}
          {cartItems.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <ShoppingBag className="h-16 w-16 text-blue-300 dark:text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start shopping to add items to your cart
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}

          {/* Cart Items */}
          {cartItems.length > 0 && (
            <div className="space-y-6">
              {/* Items List */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Items in your cart
                    </h2>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={
                          selectedItems.size === cartItems.length &&
                          cartItems.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        Select all
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {cartItems.map((item: CartItem, index: number) => {
                      const isSelected = selectedItems.has(item.id);
                      return (
                        <div
                          key={`${item.id}-${index}`}
                          className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                              : "bg-gray-50 dark:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              id={`item-${item.id}`}
                              checked={isSelected}
                              onChange={(e) =>
                                handleSelectItem(item.id, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                              {item.stock !== null &&
                                item.stock !== undefined &&
                                (item.stock > 0 ? (
                                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    In stock: {item.stock}
                                  </div>
                                ) : (
                                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Out of stock
                                  </div>
                                ))}
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center border border-blue-300 dark:border-blue-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                                  <button
                                    type="button"
                                    aria-label="Decrement quantity"
                                    disabled={item.quantity <= 1}
                                    onClick={() =>
                                      updateCart(item.id, item.quantity - 1)
                                    }
                                    className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    max={item.stock ?? undefined}
                                    value={item.quantity}
                                    onChange={(e) => {
                                      let val = parseInt(e.target.value, 10);
                                      if (isNaN(val) || val < 1) val = 1;
                                      if (item.stock && val > item.stock)
                                        val = item.stock;
                                      updateCart(item.id, val);
                                    }}
                                    className="w-12 px-2 py-1 text-center border-0 border-l border-r border-blue-300 dark:border-blue-700 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    type="button"
                                    aria-label="Increment quantity"
                                    disabled={
                                      item.stock !== null &&
                                      item.stock !== undefined &&
                                      item.quantity >= item.stock
                                    }
                                    onClick={() =>
                                      updateCart(item.id, item.quantity + 1)
                                    }
                                    className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Remove from cart"
                                  onClick={() => removeProduct(item.id)}
                                  className="ml-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              {formatPrice(getGrossPrice(item))}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              × {item.quantity}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>
                      Subtotal ({getSelectedItemCount()} selected items):
                    </span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping:</span>
                    <span>
                      {selectedItems.size > 0 ? formatPrice(shippingCost) : "£0.00"}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-200">
                      <span>Total:</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout ({selectedItems.size} items)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
