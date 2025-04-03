// Komponent paska nawigacyjnego aplikacji
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaHome,
  FaExchangeAlt,
  FaHistory,
  FaChartPie,
  FaCog,
  FaWallet,
  FaChartLine,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  getColorFromName,
  getInitials,
  getAvatarUrl,
} from "../../services/avatarService";

const Navbar = () => {
  // Hook do pobierania aktualnej ścieżki
  const location = useLocation();
  const navigate = useNavigate();
  // Stan kontrolujący widoczność menu profilu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  // Wyłącz menu przy zmianie strony
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  // Aktualizacja awatara użytkownika przy każdej zmianie currentUser
  useEffect(() => {
    if (currentUser) {
      // Generujemy nowy URL avatara za każdym razem, gdy zmieni się user
      const avatarURL = getAvatarUrl(
        currentUser.photoURL,
        currentUser.displayName || currentUser.email
      );
      console.log("Ustawiam avatar URL w Navbar:", avatarURL);
      setUserAvatar(avatarURL);
    } else {
      setUserAvatar(null);
    }
  }, [currentUser]);

  // Funkcja przełączająca widoczność menu profilu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    }
  };

  // Konfiguracja elementów menu nawigacyjnego
  const navItems = [
    { path: "/", name: "Dashboard", icon: <FaHome className="mr-2" /> },
    {
      path: "/transactions/new",
      name: "Dodaj transakcję",
      icon: <FaExchangeAlt className="mr-2" />,
    },
    {
      path: "/transactions",
      name: "Historia",
      icon: <FaHistory className="mr-2" />,
    },
    { path: "/budget", name: "Budżet", icon: <FaChartPie className="mr-2" /> },
    { path: "/settings", name: "Ustawienia", icon: <FaCog className="mr-2" /> },
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 fixed w-full z-10 shadow-lg">
      {/* Główny kontener paska nawigacyjnego */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lewa strona paska z logo i menu */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white text-xl font-bold">
                FinansowaApp
              </Link>
            </div>
            {/* Menu nawigacyjne dla widoku desktop */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? "border-indigo-500 text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Prawa strona paska z menu profilu */}
          <div className="hidden md:block">
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {currentUser && (
                      <div
                        className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          backgroundColor: getColorFromName(
                            currentUser?.displayName || currentUser?.email || ""
                          ),
                        }}
                      >
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt="Avatar użytkownika"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              console.log(
                                "Błąd ładowania avatara w Navbar, używam inicjałów"
                              );
                              e.target.style.display = "none";
                              // Wyświetlamy inicjały jako fallback
                              e.target.parentNode.innerHTML = getInitials(
                                currentUser?.displayName ||
                                  currentUser?.email ||
                                  ""
                              );
                            }}
                          />
                        ) : (
                          getInitials(
                            currentUser?.displayName || currentUser?.email || ""
                          )
                        )}
                      </div>
                    )}
                  </button>
                </div>
                {/* Menu profilu użytkownika */}
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Twój profil
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Ustawienia
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={handleLogout}
                    >
                      Wyloguj
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Przycisk menu mobilnego */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobilne */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? "bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {currentUser && (
              <button
                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" />
                Wyloguj
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
