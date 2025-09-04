import React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PaymentStatus,
  TrackingStatus,
  type AdminOrderResponse,
  type Page,
} from "@/services/api";
import { OrderFilters } from "./OrderFilters";
import { OrderCard } from "./OrderCard";

interface OrdersTabProps {
  orders: Page<AdminOrderResponse> | null;
  loading: boolean;
  updating: number | null;
  paymentFilter: PaymentStatus | undefined;
  setPaymentFilter: (filter: PaymentStatus | undefined) => void;
  trackingFilter: TrackingStatus | undefined;
  setTrackingFilter: (filter: TrackingStatus | undefined) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onResetFilters: () => void;
  onStatusUpdate: (orderId: number, status: TrackingStatus) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  loading,
  updating,
  paymentFilter,
  setPaymentFilter,
  trackingFilter,
  setTrackingFilter,
  currentPage,
  setCurrentPage,
  onResetFilters,
  onStatusUpdate,
}) => {
  return (
    <div className="space-y-6 m-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders and track shipments</p>
        </div>

        {orders && (
          <div className="text-sm text-gray-600">
            Showing {orders.content.length} of {orders.page.totalElements}{" "}
            orders
          </div>
        )}
      </div>

      {/* Filters */}
      <OrderFilters
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        trackingFilter={trackingFilter}
        setTrackingFilter={setTrackingFilter}
        onReset={onResetFilters}
      />

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner variant="circle-filled" size={32} />
            <span className="ml-2">Loading...</span>
          </div>
        ) : orders && orders.content.length > 0 ? (
          <>
            {orders.content.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updating={updating}
                onStatusUpdate={onStatusUpdate}
              />
            ))}

            {/* Pagination */}
            {orders.page.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage === 0 || loading}
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {orders.page.totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={
                    currentPage >= orders.page.totalPages - 1 || loading
                  }
                  onClick={() =>
                    setCurrentPage(
                      Math.min(orders.page.totalPages - 1, currentPage + 1)
                    )
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No orders found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
