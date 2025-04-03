// Importy niezbędnych zależności
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Komponent chroniący ścieżki wymagające autoryzacji
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Przekierowanie do strony logowania jeśli użytkownik nie jest zalogowany
    return <Navigate to="/login" />;
  }

  // Wyświetlenie zawartości chronionej jeśli użytkownik jest zalogowany
  return children;
};

export default PrivateRoute;
