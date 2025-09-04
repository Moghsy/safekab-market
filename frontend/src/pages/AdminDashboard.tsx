import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import {
  PaymentStatus,
  TrackingStatus,
  type AdminOrderResponse,
  type Page,
  type UpdateOrderStatusRequest,
} from "@/services/api";
import { Navbar } from "@/components/ui/navbar";
import Loading from "./Loading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrdersTab, ProductsTab } from "../components/admin";
import type Product from "@/models/Product";

const AdminDashboard: React.FC = () => {
  const { api } = useApi();
  const { showError, showSuccess } = useToast();
  const [orders, setOrders] = useState<Page<AdminOrderResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Filter states
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | undefined>(
    PaymentStatus.PAID
  );
  const [trackingFilter, setTrackingFilter] = useState<
    TrackingStatus | undefined
  >(TrackingStatus.NOT_SHIPPED);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminOrders(
        paymentFilter,
        trackingFilter,
        currentPage,
        pageSize
      );
      setOrders(response);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.products);
    } catch (e) {
      showError("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [paymentFilter, trackingFilter, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: TrackingStatus
  ) => {
    try {
      setUpdating(orderId);
      const request: UpdateOrderStatusRequest = {
        tracking_status: newStatus,
      };
      await api.updateOrderStatus(orderId, request);
      showSuccess(`Order status updated to ${newStatus.replace("_", " ")}`);
      fetchOrders(); // Refresh the orders
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const handleResetFilters = () => {
    setPaymentFilter(PaymentStatus.PAID);
    setTrackingFilter(TrackingStatus.NOT_SHIPPED);
    setCurrentPage(0);
  };

  if (loading && !orders) {
    return (
      <div>
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="space-y-6 m-10">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab
              orders={orders}
              loading={loading}
              updating={updating}
              paymentFilter={paymentFilter}
              setPaymentFilter={(filter) => {
                setPaymentFilter(filter);
                setCurrentPage(0);
              }}
              trackingFilter={trackingFilter}
              setTrackingFilter={(filter) => {
                setTrackingFilter(filter);
                setCurrentPage(0);
              }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onResetFilters={handleResetFilters}
              onStatusUpdate={handleStatusUpdate}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab products={products} onRefresh={fetchProducts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
