import React from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaWallet,
} from "react-icons/fa";

const DashboardStats = ({ stats }) => {
  // Formatowanie liczb w walucie
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Karty ze statystykami
  const statCards = [
    {
      title: "Całkowity przychód",
      value: formatCurrency(stats.totalIncome),
      icon: <FaArrowUp className="text-green-400" />,
      className: "bg-green-900/20 border-green-700/50",
      iconClass: "bg-green-500/30",
    },
    {
      title: "Całkowity wydatek",
      value: formatCurrency(stats.totalExpense),
      icon: <FaArrowDown className="text-red-400" />,
      className: "bg-red-900/20 border-red-700/50",
      iconClass: "bg-red-500/30",
    },
    {
      title: "Saldo",
      value: formatCurrency(stats.balance),
      icon: <FaWallet className="text-cyan-400" />,
      className: "bg-cyan-900/20 border-cyan-700/50",
      iconClass: "bg-cyan-500/30",
    },
    {
      title: "Liczba transakcji",
      value: stats.count,
      icon: <FaExchangeAlt className="text-purple-400" />,
      className: "bg-purple-900/20 border-purple-700/50",
      iconClass: "bg-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`animated-card bg-gray-800/90 ${card.className} border rounded-lg p-6 animate-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-lg mr-4 ${card.iconClass}`}
            >
              {card.icon}
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-white text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
