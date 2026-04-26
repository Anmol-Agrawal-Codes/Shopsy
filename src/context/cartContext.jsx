import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./authContext";
import {
  addItemToUserCart,
  clearUserCart,
  fetchUserCart,
  removeItemFromUserCart,
  updateUserCartQuantity,
} from "../services/cartService";

const CartContext = createContext();
const SESSION_KEY = "cart-items";

const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
  } catch {
    return [];
  }
};

const writeSession = (items) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart on auth change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      if (currentUser) {
        try {
          const remote = await fetchUserCart(currentUser.uid);
          if (!cancelled) setItems(remote);
        } catch {
          if (!cancelled) setItems(readSession());
        }
      } else {
        setItems(readSession());
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  // Sync to session on change
  useEffect(() => {
    if (!loading) writeSession(items);
  }, [items, loading]);

  const addToCart = useCallback(
    async (product) => {
      const existing = items.find(
        (i) =>
          i.productId === product.id &&
          (i.color || "default") === (product.color || "default") &&
          (i.size || "default") === (product.size || "default")
      );

      const currentQty = existing?.quantity || 0;
      const stock = product.stockQuantity ?? 99;
      if (stock <= 0) {
        toast.error("Out of stock");
        return;
      }
      if (currentQty >= stock) {
        toast.error(`Only ${stock} in stock`);
        return;
      }

      const payload = {
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || product.image || "",
        price: product.price,
        discountPrice: product.discountPrice || null,
        color: product.color || "default",
        size: product.size || "default",
        stockQuantity: stock,
      };

      if (currentUser) {
        try {
          const itemId = await addItemToUserCart(currentUser.uid, payload);
          setItems((prev) => {
            const idx = prev.findIndex((i) => i.id === itemId);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
              return copy;
            }
            return [...prev, { id: itemId, ...payload, quantity: 1 }];
          });
        } catch {
          toast.error("Failed to add to cart");
          return;
        }
      } else {
        const itemId = `${product.id}_${product.color || "default"}_${product.size || "default"}`;
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === itemId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
            return copy;
          }
          return [...prev, { id: itemId, ...payload, quantity: 1 }];
        });
      }
      toast.success("Added to cart");
    },
    [currentUser, items]
  );

  const updateQuantity = useCallback(
    async ({ itemId, quantity }) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      const capped = Math.min(Math.max(1, quantity), item.stockQuantity || 99);
      if (capped !== quantity) toast(`Max stock: ${item.stockQuantity}`);

      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: capped } : i)));
      if (currentUser) {
        try {
          await updateUserCartQuantity(currentUser.uid, itemId, capped);
        } catch {}
      }
    },
    [currentUser, items]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      if (currentUser) {
        try {
          await removeItemFromUserCart(currentUser.uid, itemId);
        } catch {}
      }
      toast.success("Removed from cart");
    },
    [currentUser]
  );

  const clearCart = useCallback(async () => {
    const ids = items.map((i) => i.id);
    setItems([]);
    if (currentUser) {
      try {
        await clearUserCart(currentUser.uid, ids);
      } catch {}
    }
  }, [currentUser, items]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + (i.discountPrice || i.price) * i.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shipping = subtotal > 0 ? (subtotal > 1000 ? 0 : 99) : 0;
    return { subtotal, tax, shipping, grandTotal: subtotal + tax + shipping };
  }, [items]);

  const value = useMemo(
    () => ({ items, loading, addToCart, updateQuantity, removeFromCart, clearCart, totals }),
    [items, loading, addToCart, updateQuantity, removeFromCart, clearCart, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
