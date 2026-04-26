import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { listOrdersByUser } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import EmptyState from "../components/ui/EmptyState";
import PageLoader from "../components/ui/PageLoader";

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await listOrdersByUser(currentUser.uid);
      if (!cancelled) {
        setOrders(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  if (loading) return <PageLoader />;

  if (!orders.length) {
    return <EmptyState title="No orders yet" description="Browse products and place your first order." />;
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-500">
                {order.createdAt?.seconds
                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                  : "—"}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.totals?.grandTotal)}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default OrdersPage;
