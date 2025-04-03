import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Tworzenie profilu użytkownika w Firestore
      await setDoc(doc(db, "userProfiles", user.uid), {
        email: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(profileData) {
    if (!auth.currentUser) throw new Error("No user is signed in");

    try {
      // Aktualizacja profilu w Authentication
      await updateProfile(auth.currentUser, profileData);

      // Aktualizacja profilu w Firestore
      const userProfileRef = doc(db, "userProfiles", auth.currentUser.uid);
      await updateDoc(userProfileRef, {
        ...profileData,
        updatedAt: new Date(),
      });

      // Zapisz ustawienia w localStorage
      const currentSettings = JSON.parse(
        localStorage.getItem("userSettings") || "{}"
      );
      localStorage.setItem(
        "userSettings",
        JSON.stringify({
          ...currentSettings,
          ...profileData,
        })
      );

      // Aktualizacja stanu lokalnego
      setCurrentUser((prev) => ({
        ...prev,
        ...profileData,
      }));
    } catch (error) {
      console.error("Błąd podczas aktualizacji profilu:", error);
      throw error;
    }
  }

  async function refreshUserData() {
    if (!auth.currentUser) return;

    try {
      // Pobieranie aktualnych danych z Firestore
      const userProfileRef = doc(db, "userProfiles", auth.currentUser.uid);
      const userProfileDoc = await getDoc(userProfileRef);

      if (userProfileDoc.exists()) {
        const userData = userProfileDoc.data();

        // Pobierz ustawienia z localStorage
        const savedSettings = JSON.parse(
          localStorage.getItem("userSettings") || "{}"
        );

        // Połącz dane z Firestore i localStorage
        const combinedData = {
          ...userData,
          ...savedSettings,
        };

        // Zapisz połączone dane z powrotem do localStorage
        localStorage.setItem("userSettings", JSON.stringify(combinedData));

        setCurrentUser((prev) => ({
          ...prev,
          ...combinedData,
        }));
      }
    } catch (error) {
      console.error("Błąd podczas odświeżania danych użytkownika:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Pobieranie dodatkowych danych użytkownika z Firestore
        const userProfileRef = doc(db, "userProfiles", user.uid);
        const userProfileDoc = await getDoc(userProfileRef);

        if (userProfileDoc.exists()) {
          const userData = userProfileDoc.data();
          setCurrentUser({
            ...user,
            ...userData,
          });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserData,
    auth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
