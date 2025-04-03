import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { BudgetProvider } from "./contexts/BudgetContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import NewTransaction from "./pages/Transactions/NewTransaction";
import EditTransaction from "./pages/Transactions/EditTransaction";
import Budget from "./pages/Budget";
import NewBudget from "./pages/Budget/NewBudget";
import EditBudget from "./pages/Budget/EditBudget";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import GoogleCalendarCallback from "./components/calendar/GoogleCalendarCallback";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";

// Główny komponent aplikacji, który konfiguruje dostawców kontekstu i definiuje strukturę routingu
function App() {
  return (
    // Dostawca Redux do zarządzania globalnym stanem aplikacji
    <Provider store={store}>
      {/* Router do obsługi nawigacji pomiędzy stronami */}
      <Router>
        {/* Dostawca kontekstu autoryzacji do zarządzania stanem logowania */}
        <AuthProvider>
          {/* Dostawca motywu do zarządzania ciemnym/jasnym motywem */}
          <ThemeProvider>
            {/* Dostawca powiadomień do wyświetlania komunikatów użytkownikowi */}
            <NotificationsProvider>
              {/* Dostawca budżetu do zarządzania globalnymi danymi budżetowymi */}
              <BudgetProvider>
                <Routes>
                  {/* Publiczne ścieżki dostępne dla niezalogowanych użytkowników */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/google-calendar-callback"
                    element={<GoogleCalendarCallback />}
                  />

                  {/* Chronione ścieżki wymagające uwierzytelnienia */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Layout />
                      </PrivateRoute>
                    }
                    errorElement={<ErrorPage />}
                  >
                    {/* Przekierowanie z głównego URL do pulpitu */}
                    <Route
                      index
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route
                      path="transactions/new"
                      element={<NewTransaction />}
                    />
                    <Route
                      path="transactions/edit/:id"
                      element={<EditTransaction />}
                    />
                    <Route path="budget" element={<Budget />} />
                    <Route path="budget/new" element={<NewBudget />} />
                    <Route path="budget/edit/:id" element={<EditBudget />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* Obsługa nieznanych ścieżek */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BudgetProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
