import React, { useState, useEffect } from "react";
import { FaChartBar, FaChartPie, FaExclamationTriangle } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useBudget } from "../../contexts/BudgetContext";

// Rejestracja komponentów Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Kolory do wykresów
const CHART_COLORS = {
  income: "rgba(34, 197, 94, 1)", // green
  incomeBackground: "rgba(34, 197, 94, 0.2)",
  expense: "rgba(239, 68, 68, 1)", // red
  expenseBackground: "rgba(239, 68, 68, 0.2)",
  categories: [
    "rgba(34, 197, 94, 0.8)", // green
    "rgba(239, 68, 68, 0.8)", // red
    "rgba(59, 130, 246, 0.8)", // blue
    "rgba(249, 115, 22, 0.8)", // orange
    "rgba(168, 85, 247, 0.8)", // purple
    "rgba(236, 72, 153, 0.8)", // pink
    "rgba(6, 182, 212, 0.8)", // cyan
    "rgba(245, 158, 11, 0.8)", // amber
    "rgba(20, 184, 166, 0.8)", // teal
    "rgba(99, 102, 241, 0.8)", // indigo
  ],
};

const DashboardCharts = ({ transactions }) => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const { budgets, notifications } = useBudget();

  // Przetwarzanie danych transakcji do wykresów
  useEffect(() => {
    if (transactions.length > 0) {
      prepareMonthlyData(transactions);
      prepareCategoryData(transactions);
    }
  }, [transactions]);

  // Funkcja pomocnicza do pobierania nazw ostatnich 6 miesięcy
  const getLast6Months = () => {
    const months = [];
    const monthNames = [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        monthName: monthNames[d.getMonth()],
      });
    }
    return months;
  };

  // Przygotowanie danych miesięcznych
  const prepareMonthlyData = (transactions) => {
    const last6Months = getLast6Months();
    const monthlyIncomes = Array(6).fill(0);
    const monthlyExpenses = Array(6).fill(0);

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthYear = `${transactionDate.getMonth()}-${transactionDate.getFullYear()}`;

      const monthIndex = last6Months.findIndex(
        (m) => `${m.month}-${m.year}` === monthYear
      );

      if (monthIndex !== -1) {
        if (transaction.type === "income") {
          monthlyIncomes[monthIndex] += Number(transaction.amount);
        } else {
          monthlyExpenses[monthIndex] += Number(transaction.amount);
        }
      }
    });

    setMonthlyData({
      labels: last6Months.map((m) => `${m.monthName} ${m.year}`),
      datasets: [
        {
          label: "Przychody",
          data: monthlyIncomes,
          backgroundColor: CHART_COLORS.incomeBackground,
          borderColor: CHART_COLORS.income,
          borderWidth: 1,
        },
        {
          label: "Wydatki",
          data: monthlyExpenses,
          backgroundColor: CHART_COLORS.expenseBackground,
          borderColor: CHART_COLORS.expense,
          borderWidth: 1,
        },
      ],
    });
  };

  // Przygotowanie danych dla wykresu kategorii
  const prepareCategoryData = (transactions) => {
    const categories = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const category = transaction.category || "Inne";
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += transaction.amount;
      });

    // Sortujemy kategorie według wartości (od największej do najmniejszej)
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // Limit do 6 największych kategorii dla czytelności

    const categoryLabels = sortedCategories.map(([category]) => category);
    const categoryValues = sortedCategories.map(([_, value]) => value);

    setCategoryData({
      labels: categoryLabels,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: CHART_COLORS.categories.slice(
            0,
            categoryLabels.length
          ),
          borderColor: CHART_COLORS.categories.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    });
  };

  // Opcje dla wykresu słupkowego
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(75, 85, 99, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(75, 85, 99, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: function (value) {
            return value + " zł";
          },
        },
      },
    },
  };

  // Opcje dla wykresu kołowego
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value.toFixed(2)} zł (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Powiadomienia o przekroczeniu budżetu */}
      {notifications && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-red-900/30 text-red-200 border border-red-700/40 p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-400 mr-3" />
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-red-300">
                    Wydano: {notification.spent.toFixed(2)} zł z{" "}
                    {notification.amount.toFixed(2)} zł
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wykres słupkowy - przychody i wydatki w czasie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <FaChartBar className="text-green-400 mr-3" /> Przychody i wydatki
            (ostatnie 6 miesięcy)
          </h2>
          <div className="h-80">
            {monthlyData ? (
              <Bar data={monthlyData} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Brak danych do wyświetlenia</p>
              </div>
            )}
          </div>
        </div>

        {/* Wykres kołowy - przychody i wydatki */}
        <div className="bg-gray-800/30 border border-gray-700/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <FaChartPie className="text-green-400 mr-3" /> Przychody i wydatki
          </h2>
          <div className="h-80">
            {monthlyData ? (
              <Pie
                data={{
                  labels: ["Przychody", "Wydatki"],
                  datasets: [
                    {
                      data: [
                        monthlyData.datasets[0].data.reduce((a, b) => a + b, 0),
                        monthlyData.datasets[1].data.reduce((a, b) => a + b, 0),
                      ],
                      backgroundColor: [
                        CHART_COLORS.income,
                        CHART_COLORS.expense,
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={pieOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Brak danych do wyświetlenia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
