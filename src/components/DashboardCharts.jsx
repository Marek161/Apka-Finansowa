// Komponent wyświetlający wykresy podsumowujące finanse użytkownika
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Rejestracja komponentów ChartJS
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const DashboardCharts = () => {
  // Stan przechowujący dane do wykresów
  const [chartData, setChartData] = useState({
    categories: {},
    monthlyData: {},
  });
  // Stan kontrolujący stan ładowania
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Efekt pobierający dane do wykresów przy zmianie użytkownika
  useEffect(() => {
    fetchChartData();
  }, [currentUser]);

  // Funkcja pobierająca dane do wykresów z bazy danych
  const fetchChartData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, where("userId", "==", currentUser.uid));

      const querySnapshot = await getDocs(q);

      // Przetwarzanie danych do wykresu kategorii
      const categoryData = {
        income: {},
        expense: {},
      };

      // Przetwarzanie danych do wykresu miesięcznego
      const monthlyData = {};

      querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        const date = transaction.date?.toDate
          ? transaction.date.toDate()
          : new Date();
        const month = date.toLocaleString("pl-PL", { month: "long" });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;

        // Przetwarzanie danych kategorii
        if (transaction.type === "income") {
          if (!categoryData.income[transaction.category]) {
            categoryData.income[transaction.category] = 0;
          }
          categoryData.income[transaction.category] += transaction.amount;
        } else {
          if (!categoryData.expense[transaction.category]) {
            categoryData.expense[transaction.category] = 0;
          }
          categoryData.expense[transaction.category] += transaction.amount;
        }

        // Przetwarzanie danych miesięcznych
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            income: 0,
            expense: 0,
          };
        }

        if (transaction.type === "income") {
          monthlyData[monthYear].income += transaction.amount;
        } else {
          monthlyData[monthYear].expense += transaction.amount;
        }
      });

      setChartData({
        categories: categoryData,
        monthlyData,
      });
    } catch (error) {
      console.error("Błąd podczas pobierania danych do wykresów:", error);
    } finally {
      setLoading(false);
    }
  };

  // Przygotowanie danych do wykresów kołowych kategorii
  const prepareCategoryPieData = (type) => {
    const data = chartData.categories[type] || {};
    const labels = Object.keys(data);

    // Kolory dla wykresów kołowych
    const backgroundColors = [
      "#4F46E5", // indigo-600
      "#7C3AED", // violet-600
      "#EC4899", // pink-600
      "#EF4444", // red-500
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#8B5CF6", // purple-500
    ];

    return {
      labels,
      datasets: [
        {
          data: labels.map((label) => data[label]),
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  // Przygotowanie danych do wykresu słupkowego miesięcznego
  const prepareMonthlyBarData = () => {
    const data = chartData.monthlyData || {};
    const labels = Object.keys(data).slice(-6); // Ostatnie 6 miesięcy

    return {
      labels,
      datasets: [
        {
          label: "Przychody",
          data: labels.map((label) => data[label]?.income || 0),
          backgroundColor: "rgba(16, 185, 129, 0.7)", // emerald-500
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 1,
        },
        {
          label: "Wydatki",
          data: labels.map((label) => data[label]?.expense || 0),
          backgroundColor: "rgba(239, 68, 68, 0.7)", // red-500
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Konfiguracja opcji wykresu słupkowego
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Przychody i wydatki miesięczne",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Konfiguracja opcji wykresu kołowego
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  // Wyświetlanie stanu ładowania
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        Ładowanie wykresów...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wykresy kołowe kategorii */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Przychody wg kategorii
          </h3>
          {Object.keys(chartData.categories.income || {}).length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              Brak danych o przychodach
            </div>
          ) : (
            <div className="h-64">
              <Pie
                data={prepareCategoryPieData("income")}
                options={pieOptions}
              />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Wydatki wg kategorii
          </h3>
          {Object.keys(chartData.categories.expense || {}).length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              Brak danych o wydatkach
            </div>
          ) : (
            <div className="h-64">
              <Pie
                data={prepareCategoryPieData("expense")}
                options={pieOptions}
              />
            </div>
          )}
        </div>
      </div>

      {/* Wykres słupkowy miesięczny */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Przychody i wydatki miesięczne
        </h3>
        {Object.keys(chartData.monthlyData || {}).length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            Brak danych miesięcznych
          </div>
        ) : (
          <div className="h-80">
            <Bar data={prepareMonthlyBarData()} options={barOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
