import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { listAllOrders, updateOrderStatusAdmin } from "../../services/adminService";
import { ORDER_STATUS } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatCurrency";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge";
import PageLoader from "../../components/ui/PageLoader";

const STATUS_OPTIONS = Object.values(ORDER_STATUS);

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAllOrders();
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatusAdmin(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? o.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID or email..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((order) => (
          <article
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">{order.email}</p>
                <p className="text-xs text-gray-400">
                  {order.createdAt?.seconds
                    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary">
                  {formatCurrency(order.totals?.grandTotal)}
                </span>
                <OrderStatusBadge status={order.status} />
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {order.items && (
              <div className="mt-2 text-xs text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}: {order.items.map((i) => i.name).join(", ")}
              </div>
            )}
          </article>
        ))}
        {!filtered.length && (
          <p className="py-8 text-center text-gray-500">No orders found</p>
        )}
      </div>
    </section>
  );
};

export default AdminOrdersPage;
