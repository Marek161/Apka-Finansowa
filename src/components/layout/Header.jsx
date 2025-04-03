// Komponent nagłówka aplikacji zawierający nawigację i menu użytkownika
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaPlus,
  FaHistory,
  FaChartPie,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaUser,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

const Header = () => {
  // Pobieranie danych użytkownika ze store'a
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  // Stan kontrolujący tryb ciemny/jasny
  const [darkMode, setDarkMode] = useState(false);
  // Stan kontrolujący widoczność menu profilu
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Funkcja przełączająca tryb ciemny/jasny
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Obsługa wylogowania użytkownika
  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdown(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      {/* Główny kontener nagłówka */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Lewa strona nagłówka z logo i menu */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-primary-600 dark:text-primary-400 font-bold text-xl"
              >
                FinanseApp
              </Link>
            </div>
            {/* Menu nawigacyjne dla widoku desktop */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-primary-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FaHome className="mr-1" /> Pulpit
              </Link>
              <Link
                to="/transactions/add"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FaPlus className="mr-1" /> Dodaj
              </Link>
              <Link
                to="/transactions/history"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FaHistory className="mr-1" /> Historia
              </Link>
              <Link
                to="/budget"
                className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FaChartPie className="mr-1" /> Budżet
              </Link>
            </nav>
          </div>

          {/* Prawa strona nagłówka z przyciskami ustawień i profilu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Przycisk przełączania trybu ciemnego/jasnego */}
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {darkMode ? (
                <FaSun className="h-6 w-6" />
              ) : (
                <FaMoon className="h-6 w-6" />
              )}
            </button>

            {/* Menu profilu użytkownika */}
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Otwórz menu użytkownika</span>
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                </button>
              </div>

              {/* Rozwijane menu profilu */}
              {profileDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {/* Informacje o użytkowniku */}
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium">
                      {user?.displayName || "Jan Kowalski"}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  {/* Linki do ustawień i wylogowania */}
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaCog className="inline mr-2" /> Ustawienia
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Wyloguj
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
