import { Link } from "react-router-dom";
import { useWishlist } from "../context/wishlistContext";
import { useCart } from "../context/cartContext";
import { formatCurrency } from "../utils/formatCurrency";
import EmptyState from "../components/ui/EmptyState";
import { FiShoppingCart, FiTrash2 } from "react-icons/fi";

const WishlistPage = () => {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 h-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState title="Your wishlist is empty" description="Browse products and click the heart icon to save favorites." />;
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">My Wishlist ({items.length})</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          >
            <Link to={`/products/${item.productId || item.id}`} className="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-800">
              <img src={item.image || "https://placehold.co/300x300"} alt={item.name} className="h-full w-full object-cover" />
            </Link>
            <div className="flex flex-1 flex-col p-3">
              <Link to={`/products/${item.productId || item.id}`} className="line-clamp-1 font-semibold hover:text-primary">
                {item.name}
              </Link>
              <p className="text-xs text-gray-500">{item.category}</p>
              <p className="mt-auto pt-2 text-lg font-bold text-primary">
                {formatCurrency(item.discountPrice || item.price)}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => addToCart({ id: item.productId || item.id, ...item })}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary"
                >
                  <FiShoppingCart size={14} /> Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.productId || item.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WishlistPage;
