import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiStar, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartContext";
import { useWishlist } from "../context/wishlistContext";
import { getProductById } from "../services/productService";
import { addReview, deleteReview, fetchReviews, getUserReview, updateReview } from "../services/reviewService";
import { formatCurrency } from "../utils/formatCurrency";
import PageLoader from "../components/ui/PageLoader";

const Stars = ({ count, size = 16 }) => (
  <span className="inline-flex gap-0.5 text-yellow-400">
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} size={size} className={i < count ? "fill-yellow-400" : "fill-none text-gray-300"} />
    ))}
  </span>
);

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { currentUser, profile } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Selected variant
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await getProductById(productId);
      if (!cancelled) {
        setProduct(data);
        setSelectedColor(data?.variants?.colors?.[0] || "default");
        setSelectedSize(data?.variants?.sizes?.[0] || "default");
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [productId]);

  const loadReviews = useCallback(async () => {
    try {
      const data = await fetchReviews(productId);
      setReviews(data);
    } catch {
      setReviews([]);
    }
    if (currentUser) {
      try {
        const mine = await getUserReview(productId, currentUser.uid);
        if (mine) {
          setUserReview(mine);
          setReviewForm({ rating: mine.rating, comment: mine.comment });
        }
      } catch {}
    }
  }, [productId, currentUser]);

  useEffect(() => {
    if (product) loadReviews();
  }, [product, loadReviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Login to leave a review"); return; }
    setReviewLoading(true);
    try {
      if (userReview) {
        await updateReview(productId, currentUser.uid, reviewForm);
        toast.success("Review updated");
      } else {
        await addReview(productId, currentUser.uid, {
          ...reviewForm,
          displayName: profile?.displayName || profile?.email || "Anonymous",
        });
        toast.success("Review submitted");
      }
      await loadReviews();
    } catch {
      toast.error("Failed to save review");
    }
    setReviewLoading(false);
  };

  const handleDeleteReview = async () => {
    if (!currentUser) return;
    setReviewLoading(true);
    try {
      await deleteReview(productId, currentUser.uid);
      setUserReview(null);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review deleted");
      await loadReviews();
    } catch {
      toast.error("Failed to delete review");
    }
    setReviewLoading(false);
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="py-12 text-center text-gray-500">Product not found</div>;

  const outOfStock = (product.stockQuantity ?? 99) <= 0;
  const wishlisted = isInWishlist(product.id);

  return (
    <section className="space-y-10">
      {/* Product info */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <img
            src={product.images?.[0] || product.image || "https://placehold.co/500x500?text=Product"}
            alt={product.name}
            className="max-h-96 object-contain"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>

          <div className="flex items-center gap-2">
            <Stars count={Math.round(product.rating || 0)} />
            <span className="text-sm text-gray-500">
              {product.rating || 0} ({product.reviewsCount || reviews.length} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>

          {/* Stock */}
          <div className="text-sm">
            {outOfStock ? (
              <span className="font-semibold text-red-600">Out of Stock</span>
            ) : (
              <span className="text-green-600">
                In Stock{product.stockQuantity != null && ` (${product.stockQuantity} available)`}
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants?.colors?.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Color</label>
              <div className="flex gap-2">
                {product.variants.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`rounded-lg border px-3 py-1 text-sm ${selectedColor === c ? "border-primary bg-primary/10 font-semibold text-primary" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.sizes?.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Size</label>
              <div className="flex gap-2">
                {product.variants.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-lg border px-3 py-1 text-sm ${selectedSize === s ? "border-primary bg-primary/10 font-semibold text-primary" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <button
              disabled={outOfStock}
              onClick={() => addToCart({ ...product, color: selectedColor, size: selectedSize })}
              className="flex-1 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => (wishlisted ? removeFromWishlist(product.id) : addToWishlist(product))}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${wishlisted ? "border-red-300 text-red-500" : "border-gray-300 dark:border-gray-600"}`}
            >
              {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Reviews</h2>

        {/* Review form */}
        {currentUser && (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <h3 className="mb-3 font-semibold">{userReview ? "Edit your review" : "Write a review"}</h3>
            <div className="mb-3 flex items-center gap-2">
              <label className="text-sm font-medium">Rating:</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>{v} Star{v > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
              rows={3}
              placeholder="Share your experience..."
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={reviewLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60"
              >
                {reviewLoading ? "Saving..." : userReview ? "Update Review" : "Submit Review"}
              </button>
              {userReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={reviewLoading}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              )}
            </div>
          </form>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{review.displayName}</p>
                    <Stars count={review.rating} size={14} />
                  </div>
                  {review.createdAt?.seconds && (
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {review.comment && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailsPage;
