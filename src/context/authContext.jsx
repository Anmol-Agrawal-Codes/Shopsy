import React, { createContext, useContext, useEffect, useState } from "react";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, provider } from "../firebase";

const AuthContext = createContext();
const FIRESTORE_TIMEOUT_MS = 8000;

const withTimeout = async (promise, timeoutMs = FIRESTORE_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("firestore-timeout")), timeoutMs);
    }),
  ]);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseProfile = (user) => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    role: "user",
  });

  const syncUserProfile = async (user) => {
    const profileRef = doc(db, "users", user.uid);
    const fallback = baseProfile(user);

    try {
      const profileSnapshot = await withTimeout(getDoc(profileRef));

      if (!profileSnapshot.exists()) {
        const payload = {
          ...fallback,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await withTimeout(setDoc(profileRef, payload));
        setProfile(fallback);
        return;
      }

      setProfile({ role: "user", ...profileSnapshot.data() });
    } catch {
      // Keep auth usable even when Firestore is offline or blocked.
      setProfile(fallback);
    }
  };

  const signup = async ({ email, password, displayName }) => {
    await setPersistence(auth, browserSessionPersistence);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    void syncUserProfile({ ...cred.user, displayName: displayName || "" });
    return cred.user;
  };

  const login = async ({ email, password }) => {
    await setPersistence(auth, browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    await setPersistence(auth, browserSessionPersistence);
    const cred = await signInWithPopup(auth, provider);
    await syncUserProfile(cred.user);
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      try {
        if (user) {
          await syncUserProfile(user);
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    profile,
    role: profile?.role || "user",
    isAuthenticated: Boolean(currentUser),
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
