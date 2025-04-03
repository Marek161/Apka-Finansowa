// Komponent chroniący ścieżki wymagające autoryzacji użytkownika
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Wyświetlanie stanu ładowania podczas sprawdzania autoryzacji
  if (loading) {
    return <div>Ładowanie...</div>;
  }

  // Przekierowanie do strony logowania jeśli użytkownik nie jest zalogowany
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Wyświetlenie zawartości chronionej lub przekierowanie do komponentu potomnego
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
