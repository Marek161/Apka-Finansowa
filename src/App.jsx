import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BudgetProvider } from "./contexts/BudgetContext";
import PrivateRoute from "./components/PrivateRoute";
import AuthLayout from "./components/layouts/AuthLayout";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Leniwe ładowanie komponentów dla zoptymalizowania wydajności aplikacji
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const CreateProfile = lazy(() => import("./pages/Auth/CreateProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Transactions = lazy(() => import("./pages/Transactions"));
const NewTransaction = lazy(
  () => import("./pages/Transactions/NewTransaction")
);
const EditTransaction = lazy(
  () => import("./pages/Transactions/EditTransaction")
);
const BudgetList = lazy(() => import("./pages/Budget/BudgetList"));
const BudgetForm = lazy(() => import("./pages/Budget/BudgetForm"));

// Komponent wyświetlający animację ładowania podczas asynchronicznego wczytywania komponentów
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#121212] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Główny komponent aplikacji definiujący strukturę routingu i układu
function App() {
  return (
    <Router>
      {/* Dostawca kontekstu autoryzacji zapewniający dostęp do funkcji uwierzytelniania w całej aplikacji */}
      <AuthProvider>
        {/* Dostawca kontekstu budżetu do zarządzania globalnymi danymi budżetowymi */}
        <BudgetProvider>
          {/* Obsługa leniwego ładowania z komponentem zastępczym podczas ładowania */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Sekcja stron autoryzacji z własnym układem */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/create-profile" element={<CreateProfile />} />
              </Route>

              {/* Ścieżki chronione z głównym układem nawigacyjnym */}
              <Route
                path="/"
                element={
                  <div className="min-h-screen bg-gray-900 text-gray-100">
                    {/* Górny pasek nawigacyjny */}
                    <Navbar />
                    <div className="flex">
                      {/* Boczny panel nawigacyjny */}
                      <Sidebar />
                      {/* Główna zawartość aplikacji */}
                      <main className="flex-1 p-4">
                        <Routes>
                          <Route
                            index
                            element={
                              <PrivateRoute>
                                <Dashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="settings"
                            element={
                              <PrivateRoute>
                                <Settings />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="transactions"
                            element={
                              <PrivateRoute>
                                <Transactions />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="transactions/new"
                            element={
                              <PrivateRoute>
                                <NewTransaction />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="transactions/edit/:transactionId"
                            element={
                              <PrivateRoute>
                                <EditTransaction />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="budgets"
                            element={
                              <PrivateRoute>
                                <BudgetList />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="budgets/new"
                            element={
                              <PrivateRoute>
                                <BudgetForm />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="budgets/edit/:budgetId"
                            element={
                              <PrivateRoute>
                                <BudgetForm />
                              </PrivateRoute>
                            }
                          />
                        </Routes>
                      </main>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </BudgetProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
