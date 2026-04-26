import { useEffect, useState } from "react";
import { FiBox, FiDollarSign, FiShoppingBag, FiUsers } from "react-icons/fi";
import { getAdminMetrics } from "../../services/adminService";
import { formatCurrency } from "../../utils/formatCurrency";
import PageLoader from "../../components/ui/PageLoader";

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getAdminMetrics();
        if (!cancelled) setMetrics(data);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageLoader />;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FiDollarSign} label="Total Revenue" value={formatCurrency(metrics?.totalRevenue || 0)} color="bg-green-500" />
        <MetricCard icon={FiShoppingBag} label="Total Orders" value={metrics?.totalOrders || 0} color="bg-blue-500" />
        <MetricCard icon={FiBox} label="Total Products" value={metrics?.totalProducts || 0} color="bg-purple-500" />
        <MetricCard icon={FiUsers} label="Total Users" value={metrics?.totalUsers || 0} color="bg-orange-500" />
      </div>

      {/* Order status breakdown */}
      {metrics?.statusCounts && Object.keys(metrics.statusCounts).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Orders by Status</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(metrics.statusCounts).map(([status, count]) => {
              const colors = {
                Pending: "bg-yellow-100 text-yellow-800",
                Confirmed: "bg-blue-100 text-blue-800",
                Shipped: "bg-indigo-100 text-indigo-800",
                Delivered: "bg-green-100 text-green-800",
                Cancelled: "bg-red-100 text-red-800",
              };
              return (
                <div key={status} className={`rounded-lg px-4 py-3 ${colors[status] || "bg-gray-100 text-gray-700"}`}>
                  <p className="text-sm font-medium">{status}</p>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simple bar chart */}
      {metrics?.statusCounts && Object.keys(metrics.statusCounts).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Order Distribution</h2>
          <div className="flex items-end gap-4" style={{ height: 200 }}>
            {Object.entries(metrics.statusCounts).map(([status, count]) => {
              const maxCount = Math.max(...Object.values(metrics.statusCounts));
              const height = maxCount > 0 ? (count / maxCount) * 160 : 0;
              const barColors = {
                Pending: "bg-yellow-400",
                Confirmed: "bg-blue-400",
                Shipped: "bg-indigo-400",
                Delivered: "bg-green-400",
                Cancelled: "bg-red-400",
              };
              return (
                <div key={status} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold">{count}</span>
                  <div className={`w-full max-w-[60px] rounded-t-md ${barColors[status] || "bg-gray-400"}`} style={{ height }} />
                  <span className="text-[10px] text-gray-500">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboardPage;
