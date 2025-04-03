import React, { useState, useContext, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  FaHome,
  FaExchangeAlt,
  FaChartPie,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaWallet,
  FaEnvelope,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Notifications from "./Notifications";
import { ThemeContext } from "../contexts/ThemeContext";
import { getInitials } from "../services/avatarService";
import DevelopmentHelper from "./DevelopmentHelper";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Błąd podczas wylogowywania", error);
    }
  };

  const formatEmail = (email) => {
    if (!email) return "Użytkownik";
    const [username] = email.split("@");
    return username;
  };

  const userSettings = JSON.parse(localStorage.getItem("userSettings") || "{}");
  const userPhotoURL = userSettings.photoURL || currentUser?.photoURL;

  const navItems = [
    {
      path: "/dashboard",
      name: "Pulpit",
      icon: <FaHome className="text-green-400" />,
    },
    {
      path: "/transactions",
      name: "Transakcje",
      icon: <FaExchangeAlt className="text-green-400" />,
    },
    {
      path: "/budget",
      name: "Budżet",
      icon: <FaChartPie className="text-green-400" />,
    },
    {
      path: "/settings",
      name: "Ustawienia",
      icon: <FaCog className="text-green-400" />,
    },
  ];

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div
        className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm"></div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-gray-800/80 backdrop-blur-sm border-r border-gray-700/40 transition-all duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700/40">
          <div className="flex items-center">
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg shadow-lg shadow-green-500/20 mr-3">
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-green-400 to-cyan-400 opacity-75 blur"></div>
              <div className="relative">
                <FaWallet className="text-white text-xl" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-bold text-white glow-text">
                  Finanse Pro
                </h1>
                <div className="text-xs text-green-400">
                  Zarządzaj swoimi finansami
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/70 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200"
              title={sidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
            >
              {sidebarCollapsed ? (
                <FaAngleDoubleRight className="text-sm" />
              ) : (
                <FaAngleDoubleLeft className="text-sm" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${
                  sidebarCollapsed ? "justify-center" : "px-4"
                } py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-gray-900/70 text-white shadow-md border border-gray-700/50"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`
              }
              title={sidebarCollapsed ? item.name : ""}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`${
                      sidebarCollapsed ? "" : "mr-3"
                    } text-xl transition-transform duration-300 ${
                      isActive ? "scale-110" : ""
                    }`}
                  >
                    {item.icon}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <span className="ml-auto w-1.5 h-5 bg-gradient-to-b from-green-400 to-cyan-500 rounded-full"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-700/40 bg-gray-800/80 rounded-tr-lg">
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-700/40">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 mr-3 relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
                    {userPhotoURL ? (
                      <img
                        src={userPhotoURL}
                        alt="Avatar użytkownika"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            currentUser?.displayName ||
                              formatEmail(currentUser?.email)
                          )}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                        {getInitials(
                          currentUser?.displayName ||
                            formatEmail(currentUser?.email)
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser?.displayName ||
                      formatEmail(currentUser?.email)}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <FaEnvelope className="mr-1 text-green-400" />
                    <span className="truncate">{currentUser?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full ${
              sidebarCollapsed ? "p-2" : "p-4"
            } flex items-center justify-center border-t border-gray-700/40 transition-all duration-200`}
            title={sidebarCollapsed ? "Wyloguj się" : ""}
          >
            <div className="relative flex items-center justify-center">
              <span
                className={`flex items-center justify-center ${sidebarCollapsed ? "w-10 h-10" : "w-8 h-8"} rounded-full bg-red-900/50 ${sidebarCollapsed ? "" : "mr-3"}`}
              >
                <FaSignOutAlt className="text-red-400" />
              </span>
              {!sidebarCollapsed && (
                <span className="text-gray-300 font-medium">Wyloguj się</span>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-200"
          >
            <FaBars />
          </button>

          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-200"
          >
            {sidebarCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          </button>
        </div>

        <div
          className="hidden lg:block fixed left-0 top-1/2 transform -translate-y-1/2 z-40"
          style={{
            left: sidebarCollapsed ? "72px" : "256px",
            transition: "left 0.3s ease-in-out",
          }}
        >
          <button
            onClick={toggleSidebar}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-r-md shadow-lg border border-l-0 border-gray-700 transition-all duration-200"
            title={sidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
          >
            {sidebarCollapsed ? (
              <FaChevronLeft className="transform rotate-180" />
            ) : (
              <FaChevronLeft />
            )}
          </button>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <DevelopmentHelper />
    </div>
  );
};

export default Layout;
