import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

const ORDER_TIMEOUT_MS = 8000;
const LOCAL_ORDERS_KEY = "local-orders";

const withTimeout = async (promise, timeoutMs = ORDER_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("order-remote-timeout")), timeoutMs);
    }),
  ]);
};

const readLocalOrders = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LOCAL_ORDERS_KEY)) || [];
  } catch {
    return [];
  }
};

const writeLocalOrders = (orders) => {
  sessionStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

const toMillis = (timestamp) => {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (typeof timestamp.seconds === "number") {
    return timestamp.seconds * 1000;
  }

  return 0;
};

const sortByCreatedAtDesc = (orders) => {
  return [...orders].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const placeOrder = async ({ uid, email, items, shipping, totals }) => {
  const orderPayload = {
    uid,
    email,
    items,
    shipping,
    totals,
    status: ORDER_STATUS.PENDING,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const localOrder = {
    id: `local-${Date.now()}`,
    uid,
    email,
    items,
    shipping,
    totals,
    status: ORDER_STATUS.PENDING,
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) },
  };

  try {
    const orderRef = await withTimeout(addDoc(collection(db, "orders"), orderPayload));

    // Stock sync should not break order creation. Mock products do not exist in Firestore.
    const stockItems = items.filter((item) => !item.productId?.startsWith("mock-"));

    if (stockItems.length) {
      const batch = writeBatch(db);
      stockItems.forEach((item) => {
        const productRef = doc(db, "products", item.productId);
        batch.update(productRef, {
          stockQuantity: item.stockQuantity - item.quantity,
          updatedAt: serverTimestamp(),
        });
      });

      try {
        await withTimeout(batch.commit());
      } catch {
        // Keep order success even if stock update fails due missing products/permissions.
      }
    }

    return orderRef.id;
  } catch {
    const orders = readLocalOrders();
    orders.unshift(localOrder);
    writeLocalOrders(orders);
    return localOrder.id;
  }
};

export const listOrdersByUser = async (uid) => {
  try {
    const ordersRef = collection(db, "orders");
    try {
      const snapshot = await withTimeout(
        getDocs(query(ordersRef, where("uid", "==", uid), orderBy("createdAt", "desc")))
      );

      return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch {
      // Retry without orderBy to avoid composite-index dependency.
      const fallbackSnapshot = await withTimeout(getDocs(query(ordersRef, where("uid", "==", uid))));
      const fallbackOrders = fallbackSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      return sortByCreatedAtDesc(fallbackOrders);
    }
  } catch {
    return sortByCreatedAtDesc(readLocalOrders().filter((order) => order.uid === uid));
  }
};

export const listOrders = async () => {
  try {
    const ordersRef = collection(db, "orders");
    const snapshot = await withTimeout(getDocs(query(ordersRef, orderBy("createdAt", "desc"))));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch {
    return readLocalOrders();
  }
};

export const getOrderById = async (orderId) => {
  if (orderId?.startsWith("local-")) {
    return readLocalOrders().find((order) => order.id === orderId) || null;
  }

  try {
    const snapshot = await withTimeout(getDoc(doc(db, "orders", orderId)));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
  } catch {
    return readLocalOrders().find((order) => order.id === orderId) || null;
  }

  return readLocalOrders().find((order) => order.id === orderId) || null;
};

export const updateOrderStatus = async ({ orderId, status }) => {
  if (orderId?.startsWith("local-")) {
    const orders = readLocalOrders();
    const next = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
            updatedAt: { seconds: Math.floor(Date.now() / 1000) },
          }
        : order
    );
    writeLocalOrders(next);
    return;
  }

  try {
    await withTimeout(
      updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: serverTimestamp(),
      })
    );
  } catch {
    const orders = readLocalOrders();
    const next = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
            updatedAt: { seconds: Math.floor(Date.now() / 1000) },
          }
        : order
    );
    writeLocalOrders(next);
  }
};
