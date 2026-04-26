import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { mockProducts } from "../data/mockProducts";

const productsCollection = collection(db, "products");
const FIRESTORE_TIMEOUT_MS = 8000;

const withTimeout = async (promise, timeoutMs = FIRESTORE_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("firestore-timeout")), timeoutMs);
    }),
  ]);
};

const applyClientFilters = (products, filters) => {
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER);
  const minRating = Number(filters.minRating || 0);

  return products.filter((product) => {
    const effectivePrice = Number(product.discountPrice || product.price || 0);
    const rating = Number(product.rating || 0);

    const categoryPass = filters.category ? product.category === filters.category : true;
    const pricePass = effectivePrice >= minPrice && effectivePrice <= maxPrice;
    const ratingPass = rating >= minRating;

    return categoryPass && pricePass && ratingPass;
  });
};

const applySort = (products, sortBy) => {
  const sortable = [...products];

  switch (sortBy) {
    case "priceLowHigh":
      return sortable.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    case "priceHighLow":
      return sortable.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    case "highestRated":
      return sortable.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "newest":
    default:
      return sortable.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );
  }
};

export const listProducts = async ({ search = "", filters = {}, sortBy = "newest" } = {}) => {
  const constraints = [limit(100)];

  if (filters.category) {
    constraints.push(where("category", "==", filters.category));
  }

  if (sortBy === "newest") {
    constraints.push(orderBy("createdAt", "desc"));
  }

  let firestoreProducts = [];
  try {
    const snapshot = await withTimeout(getDocs(query(productsCollection, ...constraints)));
    firestoreProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch {
    firestoreProducts = [];
  }

  let products = [...firestoreProducts, ...mockProducts];

  if (search) {
    const lowered = search.toLowerCase();
    products = products.filter((product) => product.name.toLowerCase().includes(lowered));
  }

  products = applyClientFilters(products, filters);
  products = applySort(products, sortBy);

  return products;
};

export const getProductById = async (productId) => {
  if (productId?.startsWith("mock-")) {
    return mockProducts.find((item) => item.id === productId) || null;
  }

  try {
    const snapshot = await withTimeout(getDoc(doc(db, "products", productId)));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
  } catch {
    return mockProducts.find((item) => item.id === productId) || null;
  }

  return mockProducts.find((item) => item.id === productId) || null;
};
