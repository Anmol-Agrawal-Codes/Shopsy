import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";
import { useCart } from "../context/cartContext";
import { formatCurrency } from "../utils/formatCurrency";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totals } = useCart();

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse products and add items to continue checkout."
      />
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center"
          >
            <img
              src={item.image || "https://placehold.co/220x220"}
              alt={item.name}
              className="h-24 w-24 rounded-lg object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.color} / {item.size}
              </p>
              <p className="text-sm font-medium text-primary">
                {formatCurrency(item.discountPrice || item.price)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={item.stockQuantity || 99}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity({ itemId: item.id, quantity: Number(e.target.value) || 1 })
                }
                className="w-20 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
              />

              <button
                onClick={() => removeFromCart(item.id)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-bold">Order Summary</h2>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(totals.shipping)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold dark:border-gray-700">
            <span>Total</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="mt-4 inline-flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary"
        >
          Proceed to Checkout
        </Link>
      </aside>
    </section>
  );
};

export default CartPage;
