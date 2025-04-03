import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChartLine,
  FaWallet,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { getColorFromName, getInitials } from "../../services/avatarService";

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  {
    currentUser && (
      <div className="flex items-center space-x-3 p-4 border-t border-gray-700">
        <div
          className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium"
          style={{
            backgroundColor: getColorFromName(
              currentUser?.displayName || currentUser?.email || ""
            ),
          }}
        >
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Avatar użytkownika"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = getInitials(
                  currentUser?.displayName || currentUser?.email || ""
                );
              }}
            />
          ) : (
            getInitials(currentUser?.displayName || currentUser?.email || "")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {currentUser.displayName || "Użytkownik"}
          </p>
          <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
        </div>
      </div>
    );
  }
};

export default Sidebar;
