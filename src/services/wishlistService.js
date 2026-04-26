import { collection, deleteDoc, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const TIMEOUT_MS = 8000;

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("wishlist-timeout")), TIMEOUT_MS)),
  ]);

export const fetchWishlist = async (uid) => {
  const snapshot = await withTimeout(getDocs(collection(db, "users", uid, "wishlist")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addToWishlist = async (uid, product) => {
  const ref = doc(db, "users", uid, "wishlist", product.id);
  await withTimeout(
    setDoc(ref, {
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || product.image || "",
      price: product.price,
      discountPrice: product.discountPrice || null,
      category: product.category || "",
      rating: product.rating || 0,
      addedAt: serverTimestamp(),
    })
  );
};

export const removeFromWishlist = async (uid, productId) => {
  await withTimeout(deleteDoc(doc(db, "users", uid, "wishlist", productId)));
};
