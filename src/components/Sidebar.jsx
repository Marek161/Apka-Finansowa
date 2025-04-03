import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaHome,
  FaWallet,
  FaChartPie,
  FaCog,
  FaMoneyBill,
  FaUser,
} from "react-icons/fa";

// Konfiguracja elementów menu
const menuItems = [
  { path: "/", icon: FaHome, label: "Pulpit" },
  { path: "/transactions", icon: FaWallet, label: "Transakcje" },
  { path: "/budgets", icon: FaMoneyBill, label: "Budżety" },
  { path: "/settings", icon: FaCog, label: "Ustawienia" },
];

// Komponent paska bocznego zawierający nawigację
const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Nie wyświetlaj sidebar jeśli użytkownik nie jest zalogowany
  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-gray-800/30 border-r border-gray-700/40 min-h-screen p-4">
      {/* Sekcja z informacjami o profilu użytkownika */}
      <div className="flex items-center space-x-3 mb-8 p-3 bg-gray-700/30 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          <FaUser className="text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {currentUser.displayName || currentUser.email}
          </p>
          <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
        </div>
      </div>

      {/* Menu głównej nawigacji */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          // Sprawdzenie czy dana pozycja menu jest aktywna
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
              }`}
            >
              <item.icon
                className={`flex-shrink-0 w-5 h-5 ${
                  isActive ? "text-green-400" : "text-gray-400"
                }`}
              />
              <span className="font-medium">{item.label}</span>
              {/* Wskaźnik aktywnej pozycji menu */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
