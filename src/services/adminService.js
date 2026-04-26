import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const TIMEOUT_MS = 8000;

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("admin-timeout")), TIMEOUT_MS)),
  ]);

// ── Metrics ──────────────────────────────────────────────────────────────────

export const getAdminMetrics = async () => {
  const [productsSnap, usersSnap, ordersSnap] = await Promise.all([
    withTimeout(getCountFromServer(collection(db, "products"))),
    withTimeout(getCountFromServer(collection(db, "users"))),
    withTimeout(getDocs(query(collection(db, "orders"), limit(500)))),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data());
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totals?.grandTotal || 0), 0);

  const statusCounts = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  return {
    totalProducts: productsSnap.data().count,
    totalUsers: usersSnap.data().count,
    totalOrders: orders.length,
    totalRevenue,
    statusCounts,
  };
};

// ── Products CRUD ────────────────────────────────────────────────────────────

export const listAllProducts = async () => {
  const snap = await withTimeout(
    getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"), limit(200)))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data) => {
  const ref = await withTimeout(
    addDoc(collection(db, "products"), {
      ...data,
      price: Number(data.price) || 0,
      discountPrice: Number(data.discountPrice) || 0,
      stockQuantity: Number(data.stockQuantity) || 0,
      rating: Number(data.rating) || 0,
      reviewsCount: Number(data.reviewsCount) || 0,
      images: data.images || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return ref.id;
};

export const updateProduct = async (productId, data) => {
  await withTimeout(
    updateDoc(doc(db, "products", productId), {
      ...data,
      price: Number(data.price) || 0,
      discountPrice: Number(data.discountPrice) || 0,
      stockQuantity: Number(data.stockQuantity) || 0,
      updatedAt: serverTimestamp(),
    })
  );
};

export const deleteProduct = async (productId) => {
  await withTimeout(deleteDoc(doc(db, "products", productId)));
};

// ── Users ────────────────────────────────────────────────────────────────────

export const listAllUsers = async () => {
  const snap = await withTimeout(
    getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(200)))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const setUserRole = async (uid, role) => {
  await withTimeout(
    setDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() }, { merge: true })
  );
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const listAllOrders = async () => {
  const snap = await withTimeout(
    getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(500)))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateOrderStatusAdmin = async (orderId, status) => {
  await withTimeout(
    updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() })
  );
};
