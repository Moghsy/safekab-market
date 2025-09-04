import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { OrderResponse, Page } from "@/services/api";
import { Navbar } from "@/components/ui/navbar";

export default function OrdersPage() {
  const { api } = useApi();
  const [ordersPage, setOrdersPage] = useState<Page<OrderResponse> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const size = 10;

  useEffect(() => {
    setLoading(true);
    api
      .getUserOrdersPaginated(page, size)
      .then(setOrdersPage)
      .catch((e) => setError(e.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [api, page]);

  // useEffect(() => {
  //   console.log("Orders Page Data:", ordersPage);
  // }, [ordersPage]);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      </>
    );
  if (error)
    return (
      <>
        <Navbar />
        <div className="text-red-500 p-4">{error}</div>
      </>
    );
  if (!ordersPage || !ordersPage.content.length)
    return (
      <>
        <Navbar />
        <div className="p-4">No orders found.</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        {ordersPage.content.map((order) => (
          <Card key={order.id} className="mb-4">
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{order.payment_status}</Badge>
                <Badge variant="secondary">{order.tracking_status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="py-2 flex justify-between items-center"
                  >
                    <span>{item.product.name}</span>
                    <span className="text-sm text-gray-500">
                      x{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-8">
          <button
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={ordersPage.page.number === 0}
          >
            Previous
          </button>
          <span>
            Page {ordersPage.page.number + 1} of {ordersPage.page.totalPages}
          </span>
          <button
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={ordersPage.page.number === ordersPage.page.totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
