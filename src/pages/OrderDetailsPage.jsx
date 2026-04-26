import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import PageLoader from "../components/ui/PageLoader";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await getOrderById(orderId);
      if (!cancelled) {
        setOrder(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) return <PageLoader />;
  if (!order) return <div className="py-12 text-center text-gray-500">Order not found</div>;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img src={item.image || "https://placehold.co/60x60"} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">{item.color} / {item.size} × {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatCurrency((item.discountPrice || item.price) * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {order.shipping && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-2 font-semibold">Shipping</h2>
          <p className="text-sm">{order.shipping.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {order.shipping.address}, {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.shipping.phone}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-2 font-semibold">Summary</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.totals?.subtotal)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.totals?.tax)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.totals?.shipping === 0 ? "Free" : formatCurrency(order.totals?.shipping)}</span></div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold dark:border-gray-700">
            <span>Total</span><span>{formatCurrency(order.totals?.grandTotal)}</span>
          </div>
        </div>
      </div>

      <Link to="/orders" className="inline-block text-sm text-primary hover:underline">
        ← Back to orders
      </Link>
    </section>
  );
};

export default OrderDetailsPage;
