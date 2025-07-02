import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⏳ loading until Firebase initializes

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // Optional: enforce email verification
      // setCurrentUser(user?.emailVerified ? user : null); ✅ Uncomment to enforce
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signOutUser = () => {
    signOut(auth).catch((err) => console.error("Logout error:", err));
  };

  return (
    <AuthContext.Provider value={{ currentUser, signOutUser }}>
      {!loading && children} {/* ⏱️ render only after auth check */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
