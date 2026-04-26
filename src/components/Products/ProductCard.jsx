import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useWishlist } from "../../context/wishlistContext";
import { formatCurrency } from "../../utils/formatCurrency";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const outOfStock = (product.stockQuantity ?? 99) <= 0;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      {/* Wishlist heart */}
      <button
        onClick={toggleWishlist}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 backdrop-blur hover:bg-white dark:bg-gray-800/80"
      >
        <FiHeart
          size={16}
          className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}
        />
      </button>

      {/* Stock badge */}
      {outOfStock && (
        <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          Out of stock
        </span>
      )}
      {!outOfStock && product.stockQuantity != null && product.stockQuantity <= 5 && (
        <span className="absolute left-2 top-2 z-10 rounded bg-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          Only {product.stockQuantity} left
        </span>
      )}

      {/* Image */}
      <div className="flex h-48 items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.images?.[0] || product.image || "https://placehold.co/300x300?text=Product"}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
          {product.category}
        </p>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 text-xs text-yellow-500">
          <FiStar size={12} className="fill-yellow-400" />
          <span>{product.rating || 0}</span>
          <span className="text-gray-400">({product.reviewsCount || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiShoppingCart size={14} />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
