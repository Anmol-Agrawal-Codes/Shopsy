import { adminAuth, adminDb } from "../utils/firebaseAdmin.js";

const getBearerToken = (authorization = "") => {
  if (!authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.split("Bearer ")[1]?.trim() || null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid auth token" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.admin === true) {
      return next();
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : null;

    if (role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  } catch {
    return res.status(403).json({ message: "Admin access required" });
  }
};
