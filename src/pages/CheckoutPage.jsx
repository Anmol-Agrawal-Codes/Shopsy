import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartContext";
import { placeOrder } from "../services/orderService";
import { formatCurrency } from "../utils/formatCurrency";

const CheckoutPage = () => {
  const { currentUser, profile } = useAuth();
  const { items, totals, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: profile?.displayName || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const handleChange = (e) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) { toast.error("Cart is empty"); return; }
    setLoading(true);
    try {
      const orderId = await placeOrder({
        uid: currentUser.uid,
        email: currentUser.email,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          price: i.price,
          discountPrice: i.discountPrice,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          stockQuantity: i.stockQuantity,
        })),
        shipping,
        totals,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${orderId}`, { replace: true });
    } catch (err) {
      toast.error(err.message || "Order failed");
    }
    setLoading(false);
  };

  if (!items.length) {
    return (
      <div className="py-12 text-center text-gray-500">
        Your cart is empty.{" "}
        <button onClick={() => navigate("/")} className="text-primary underline">
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 font-semibold">Shipping Information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="fullName" value={shipping.fullName} onChange={handleChange} required placeholder="Full Name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="phone" value={shipping.phone} onChange={handleChange} required placeholder="Phone" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="address" value={shipping.address} onChange={handleChange} required placeholder="Address" className="col-span-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="city" value={shipping.city} onChange={handleChange} required placeholder="City" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="state" value={shipping.state} onChange={handleChange} required placeholder="State" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="zip" value={shipping.zip} onChange={handleChange} required placeholder="ZIP Code" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 font-semibold">Order Items ({items.length})</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <img src={item.image || "https://placehold.co/50x50"} alt={item.name} className="h-10 w-10 rounded object-cover" />
                <span className="flex-1">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency((item.discountPrice || item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary disabled:opacity-60"
        >
          {loading ? "Placing Order..." : `Place Order — ${formatCurrency(totals.grandTotal)}`}
        </button>
      </form>

      {/* Summary */}
      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-bold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span>Tax (18%)</span><span>{formatCurrency(totals.tax)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</span></div>
          <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold dark:border-gray-700">
            <span>Total</span><span>{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
};

export default CheckoutPage;
