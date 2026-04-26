import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import PageLoader from "../components/ui/PageLoader";
import { ORDER_STATUS, listOrders, updateOrderStatus } from "../services/orderService";

const STATUS_OPTIONS = Object.values(ORDER_STATUS);

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const data = await listOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus({ orderId, status });
      toast.success("Order status updated");
      await loadOrders();
    } catch (error) {
      toast.error(error.message || "Failed to update order");
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin: Manage Orders</h1>
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Order #{order.id}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{order.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default AdminOrdersPage;
