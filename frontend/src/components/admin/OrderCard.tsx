import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
  Calendar,
  RotateCcw,
} from "lucide-react";
import {
  PaymentStatus,
  TrackingStatus,
  type AdminOrderResponse,
} from "@/services/api";
import { formatPriceUk } from "@/lib/utils";
import { getGrossPrice } from "@/models/Product";

interface OrderCardProps {
  order: AdminOrderResponse;
  updating: number | null;
  onStatusUpdate: (orderId: number, status: TrackingStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  updating,
  onStatusUpdate,
}) => {
  const getStatusBadgeColor = (status: PaymentStatus | TrackingStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800";
      case PaymentStatus.UNPAID:
        return "bg-red-100 text-red-800";
      case PaymentStatus.REFUNDED:
        return "bg-orange-100 text-orange-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800";
      case TrackingStatus.NOT_SHIPPED:
        return "bg-yellow-100 text-yellow-800";
      case TrackingStatus.SHIPPED:
        return "bg-blue-100 text-blue-800";
      case TrackingStatus.IN_TRANSIT:
        return "bg-indigo-100 text-indigo-800";
      case TrackingStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case TrackingStatus.RETURNED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: TrackingStatus) => {
    switch (status) {
      case TrackingStatus.NOT_SHIPPED:
        return <Package className="h-4 w-4" />;
      case TrackingStatus.SHIPPED:
      case TrackingStatus.IN_TRANSIT:
        return <Truck className="h-4 w-4" />;
      case TrackingStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4" />;
      case TrackingStatus.RETURNED:
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextStatus = (
    currentStatus: TrackingStatus
  ): TrackingStatus | null => {
    switch (currentStatus) {
      case TrackingStatus.NOT_SHIPPED:
        return TrackingStatus.SHIPPED;
      case TrackingStatus.SHIPPED:
        return TrackingStatus.IN_TRANSIT;
      case TrackingStatus.IN_TRANSIT:
        return TrackingStatus.DELIVERED;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Order Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <Badge className={getStatusBadgeColor(order.payment_status)}>
                  <CreditCard className="h-3 w-3 mr-1" />
                  {order.payment_status}
                </Badge>
                <Badge className={getStatusBadgeColor(order.tracking_status)}>
                  {getStatusIcon(order.tracking_status)}
                  <span className="ml-1">
                    {order.tracking_status.replace("_", " ")}
                  </span>
                </Badge>
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatPriceUk(order.total_price)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Ordered: {formatDate(order.order_date)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  {order.user.username} ({order.user.email})
                </span>
              </div>

              {order.shipment_location && (
                <div className="flex items-start gap-2 text-gray-600 md:col-span-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Ship to: </span>
                    {order.shipment_location.line1}
                    {order.shipment_location.line2 &&
                      `, ${order.shipment_location.line2}`}
                    <br />
                    {order.shipment_location.city},{" "}
                    {order.shipment_location.postal_code}
                    <br />
                    {order.shipment_location.country}
                  </div>
                </div>
              )}

              {order.promotion_code && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Promo:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {order.promotion_code}
                  </code>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPriceUk(getGrossPrice(item.product) * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.shipping_cost && order.shipping_cost > 0 && (
                  <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {formatPriceUk(order.shipping_cost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-semibold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatPriceUk(order.total_price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:w-48 flex lg:flex-col gap-2">
            {order.payment_status === PaymentStatus.PAID &&
              order.tracking_status !== TrackingStatus.DELIVERED &&
              order.tracking_status !== TrackingStatus.RETURNED && (
                <Button
                  onClick={() => {
                    const nextStatus = getNextStatus(order.tracking_status);
                    if (nextStatus) {
                      onStatusUpdate(order.id, nextStatus);
                    }
                  }}
                  disabled={updating === order.id}
                  className="w-full"
                >
                  {updating === order.id ? (
                    <Spinner
                      variant="circle-filled"
                      size={16}
                      className="mr-2"
                    />
                  ) : (
                    getStatusIcon(
                      getNextStatus(order.tracking_status) ||
                        order.tracking_status
                    )
                  )}
                  <span className="ml-2">
                    Mark as{" "}
                    {getNextStatus(order.tracking_status)?.replace("_", " ")}
                  </span>
                </Button>
              )}

            {order.tracking_status !== TrackingStatus.NOT_SHIPPED &&
              order.tracking_status !== TrackingStatus.RETURNED && (
                <Button
                  variant="outline"
                  onClick={() =>
                    onStatusUpdate(order.id, TrackingStatus.RETURNED)
                  }
                  disabled={updating === order.id}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Mark Returned
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
