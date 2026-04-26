import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./authContext";
import {
  addToWishlist as addWL,
  fetchWishlist,
  removeFromWishlist as removeWL,
} from "../services/wishlistService";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchWishlist(currentUser.uid);
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  const addToWishlist = useCallback(
    async (product) => {
      if (!currentUser) {
        toast.error("Login to save favorites");
        return;
      }
      // Optimistic
      setItems((prev) => [...prev, { id: product.id, productId: product.id, ...product }]);
      try {
        await addWL(currentUser.uid, product);
        toast.success("Added to wishlist");
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== product.id));
        toast.error("Failed to add to wishlist");
      }
    },
    [currentUser]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!currentUser) return;
      const backup = items;
      setItems((prev) => prev.filter((i) => i.id !== productId && i.productId !== productId));
      try {
        await removeWL(currentUser.uid, productId);
        toast.success("Removed from wishlist");
      } catch {
        setItems(backup);
        toast.error("Failed to remove from wishlist");
      }
    },
    [currentUser, items]
  );

  const isInWishlist = useCallback(
    (productId) => items.some((i) => i.id === productId || i.productId === productId),
    [items]
  );

  const value = useMemo(
    () => ({ items, loading, addToWishlist, removeFromWishlist, isInWishlist }),
    [items, loading, addToWishlist, removeFromWishlist, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
