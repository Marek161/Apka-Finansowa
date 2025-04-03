// Komponent wyświetlający powiadomienia użytkownika
import React from "react";
import { useNotifications } from "../contexts/NotificationsContext";

const Notifications = () => {
  const { notifications } = useNotifications();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`mb-2 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
