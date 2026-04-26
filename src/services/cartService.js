import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const buildCartItemId = ({ productId, color = "default", size = "default" }) => {
  return `${productId}_${color}_${size}`;
};

export const fetchUserCart = async (uid) => {
  const snapshot = await getDocs(collection(db, "users", uid, "cartItems"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const addItemToUserCart = async (uid, payload) => {
  const itemId = buildCartItemId(payload);
  const itemRef = doc(db, "users", uid, "cartItems", itemId);

  await setDoc(
    itemRef,
    {
      productId: payload.productId,
      name: payload.name,
      image: payload.image || "",
      price: payload.price,
      discountPrice: payload.discountPrice || null,
      color: payload.color || "default",
      size: payload.size || "default",
      quantity: increment(1),
      stockQuantity: payload.stockQuantity || 0,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return itemId;
};

export const updateUserCartQuantity = async (uid, itemId, quantity) => {
  const itemRef = doc(db, "users", uid, "cartItems", itemId);
  if (quantity <= 0) {
    await deleteDoc(itemRef);
    return;
  }

  await updateDoc(itemRef, {
    quantity,
    updatedAt: new Date().toISOString(),
  });
};

export const removeItemFromUserCart = async (uid, itemId) => {
  await deleteDoc(doc(db, "users", uid, "cartItems", itemId));
};

export const clearUserCart = async (uid, itemIds) => {
  await Promise.all(itemIds.map((itemId) => removeItemFromUserCart(uid, itemId)));
};
