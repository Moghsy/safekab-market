import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { PaymentStatus, TrackingStatus } from "@/services/api";

interface OrderFiltersProps {
  paymentFilter: PaymentStatus | undefined;
  setPaymentFilter: (filter: PaymentStatus | undefined) => void;
  trackingFilter: TrackingStatus | undefined;
  setTrackingFilter: (filter: TrackingStatus | undefined) => void;
  onReset: () => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  paymentFilter,
  setPaymentFilter,
  trackingFilter,
  setTrackingFilter,
  onReset,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Payment Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={paymentFilter || ""}
              onChange={(e) => {
                setPaymentFilter(
                  (e.target.value as PaymentStatus) || undefined
                );
              }}
            >
              {/* <option value="">All Payment Status</option> */}
              <option value={PaymentStatus.PAID}>Paid</option>
              <option value={PaymentStatus.UNPAID}>Unpaid</option>
              <option value={PaymentStatus.REFUNDED}>Refunded</option>
              <option value={PaymentStatus.FAILED}>Failed</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Tracking Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={trackingFilter || ""}
              onChange={(e) => {
                setTrackingFilter(
                  (e.target.value as TrackingStatus) || undefined
                );
              }}
            >
              {/* <option value="">All Tracking Status</option> */}
              <option value={TrackingStatus.NOT_SHIPPED}>Not Shipped</option>
              <option value={TrackingStatus.SHIPPED}>Shipped</option>
              <option value={TrackingStatus.IN_TRANSIT}>In Transit</option>
              <option value={TrackingStatus.DELIVERED}>Delivered</option>
              <option value={TrackingStatus.RETURNED}>Returned</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={onReset} variant="outline">
              Reset to Default
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
