import { useApi } from "@/hooks/useApi";
import type { OrderResponse, TrackingStatus } from "@/services/api";
import { PaymentStatus } from "@/services/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Package,
  Truck,
  Clock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getGrossPrice } from "@/models/Product";
import { formatPriceUk } from "@/lib/utils";

const CheckoutResult = () => {
  const { result, orderId } = useParams();
  const { api } = useApi();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { removeProducts } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      if (result === "cancel") {
        // Redirect to checkout/cart page
        navigate("/cart");
        return;
      }

      if (result === "success" && orderId) {
        try {
          setLoading(true);
          const orderData = await api.getOrder(parseInt(orderId, 10));
          setOrder(orderData);

          // If payment is not yet processed, keep polling
          if (orderData.payment_status === PaymentStatus.UNPAID) {
            setIsProcessing(true);
            pollPaymentStatus(parseInt(orderId, 10));
          } else if (orderData.payment_status === PaymentStatus.PAID) {
            // Payment is successful, remove purchased items from cart
            if (orderData.items && orderData.items.length > 0) {
              try {
                const productIds = orderData.items.map(
                  (item) => item.product.id
                );
                await removeProducts(productIds);
              } catch (err) {
                console.error("Failed to bulk remove items from cart:", err);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch order:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [result, orderId]);

  const pollPaymentStatus = async (orderIdNum: number) => {
    const maxAttempts = 30; // Poll for up to 5 minutes (10s intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const updatedOrder = await api.getOrder(orderIdNum);
        setOrder(updatedOrder);

        if (updatedOrder.payment_status === PaymentStatus.PAID) {
          setIsProcessing(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Failed to poll payment status:", error);
        setIsProcessing(false);
      }
    };

    setTimeout(poll, 3000); // Start polling after 3 seconds
  };

  const getTrackingStatusInfo = (status: TrackingStatus) => {
    switch (status) {
      case "NOT_SHIPPED":
        return {
          icon: Package,
          text: "Order Confirmed",
          color: "text-blue-600",
        };
      case "SHIPPED":
        return { icon: Truck, text: "Shipped", color: "text-yellow-600" };
      case "DELIVERED":
        return {
          icon: CheckCircle,
          text: "Delivered",
          color: "text-green-600",
        };
      case "RETURNED":
        return { icon: XCircle, text: "Returned", color: "text-red-600" };
      default:
        return { icon: Package, text: "Processing", color: "text-gray-600" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner
            variant="circle"
            size={48}
            className="mx-auto mb-4 text-blue-600"
          />
          <p className="text-lg text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (result === "success" && order) {
    const trackingInfo = getTrackingStatusInfo(order.tracking_status);
    const TrackingIcon = trackingInfo.icon;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            {(isProcessing && order.payment_status === PaymentStatus.UNPAID) ||
            order.payment_status === PaymentStatus.UNPAID ? (
              <>
                <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Processing
                </h1>
                <p className="text-lg text-gray-600">
                  We're confirming your payment. This usually takes a few
                  moments.
                </p>
                {isProcessing &&
                  order.payment_status === PaymentStatus.UNPAID && (
                    <div className="mt-6">
                      <Spinner
                        variant="circle"
                        size={32}
                        className="mx-auto text-yellow-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Checking payment status...
                      </p>
                    </div>
                  )}
              </>
            ) : (
              <>
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-lg text-gray-600">
                  Thank you for your purchase. Your order has been successfully
                  placed.
                </p>
              </>
            )}
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Details
              </h2>
              <span className="text-sm text-gray-500">Order #{order.id}</span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center mb-4 p-3 rounded-lg bg-gray-50">
              <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Payment Status</p>
                <p
                  className={`text-sm ${
                    order.payment_status === PaymentStatus.PAID
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.payment_status === PaymentStatus.PAID
                    ? "Paid"
                    : "Processing"}
                </p>
              </div>
            </div>

            {/* Tracking Status */}
            <div className="flex items-center mb-6 p-3 rounded-lg bg-gray-50">
              <TrackingIcon className={`h-5 w-5 mr-3 ${trackingInfo.color}`} />
              <div>
                <p className="font-medium text-gray-900">Order Status</p>
                <p className={`text-sm ${trackingInfo.color}`}>
                  {trackingInfo.text}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Items Ordered</h3>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 border rounded-lg"
                >
                  {item.product.images && item.product.images.length > 0 && (
                    <img
                      src={item.product.images[0].image_url}
                      alt={item.product.images[0].alt_text || item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.product.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPriceUk(
                          getGrossPrice(item.product) * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Order Total Breakdown */}
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Items subtotal:</span>
                    <span>
                      {formatPriceUk(
                        order.items.reduce(
                          (sum, item) => sum + getGrossPrice(item.product) * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                  {order.shipping_cost && order.shipping_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPriceUk(order.shipping_cost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPriceUk(order.total_price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="default"
              className="flex-1"
            >
              Continue Shopping
            </Button>
            {/* <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="flex-1"
            >
              View All Orders
            </Button> */}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any other result state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          We couldn't process your request. Please try again.
        </p>
        <Button onClick={() => navigate("/")} variant="default">
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default CheckoutResult;
