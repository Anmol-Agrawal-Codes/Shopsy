import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const TIMEOUT_MS = 8000;

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("review-timeout")), TIMEOUT_MS)),
  ]);

export const fetchReviews = async (productId) => {
  const ref = collection(db, "products", productId, "reviews");
  const snapshot = await withTimeout(getDocs(query(ref, orderBy("createdAt", "desc"))));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addReview = async (productId, uid, { rating, comment, displayName }) => {
  const ref = doc(db, "products", productId, "reviews", uid);
  await withTimeout(
    setDoc(ref, {
      uid,
      displayName: displayName || "Anonymous",
      rating: Number(rating),
      comment: comment || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  await recomputeProductRating(productId);
};

export const updateReview = async (productId, uid, { rating, comment }) => {
  const ref = doc(db, "products", productId, "reviews", uid);
  await withTimeout(
    updateDoc(ref, {
      rating: Number(rating),
      comment: comment || "",
      updatedAt: serverTimestamp(),
    })
  );
  await recomputeProductRating(productId);
};

export const deleteReview = async (productId, uid) => {
  await withTimeout(deleteDoc(doc(db, "products", productId, "reviews", uid)));
  await recomputeProductRating(productId);
};

export const getUserReview = async (productId, uid) => {
  const ref = doc(db, "products", productId, "reviews", uid);
  const snapshot = await withTimeout(getDoc(ref));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

const recomputeProductRating = async (productId) => {
  try {
    const reviews = await fetchReviews(productId);
    if (!reviews.length) {
      await updateDoc(doc(db, "products", productId), { rating: 0, reviewsCount: 0 });
      return;
    }
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await updateDoc(doc(db, "products", productId), {
      rating: Math.round(avg * 10) / 10,
      reviewsCount: reviews.length,
    });
  } catch {
    // Non-blocking: mock products or permission issues should not break review flow
  }
};
