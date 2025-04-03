import React from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

// Rejestracja komponentów Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

// Komponent wyświetlający przegląd finansów z wykresami
const FinancialOverview = () => {
  // Konfiguracja danych dla wykresu kołowego kategorii wydatków
  const expenseData = {
    labels: [
      "Żywność",
      "Transport",
      "Mieszkanie",
      "Rozrywka",
      "Zdrowie",
      "Inne",
    ],
    datasets: [
      {
        data: [25, 15, 35, 10, 8, 7],
        backgroundColor: [
          "#FF6384", // Kolor dla kategorii Żywność
          "#36A2EB", // Kolor dla kategorii Transport
          "#FFCE56", // Kolor dla kategorii Mieszkanie
          "#4BC0C0", // Kolor dla kategorii Rozrywka
          "#9966FF", // Kolor dla kategorii Zdrowie
          "#C9CBCF", // Kolor dla kategorii Inne
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#C9CBCF",
        ],
      },
    ],
  };

  // Konfiguracja danych dla wykresu liniowego salda
  const balanceData = {
    labels: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj"],
    datasets: [
      {
        label: "Saldo",
        data: [2500, 2800, 2200, 3000, 3750],
        fill: false,
        borderColor: "#4F46E5",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Przegląd finansów
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wykres kołowy wydatków */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Wydatki według kategorii
          </h3>
          <div className="h-64">
            <Doughnut
              data={expenseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: document.documentElement.classList.contains("dark")
                        ? "white"
                        : "black",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Wykres liniowy salda */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Zmiana salda
          </h3>
          <div className="h-64">
            <Line
              data={balanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: document.documentElement.classList.contains("dark")
                        ? "white"
                        : "black",
                    },
                  },
                  x: {
                    ticks: {
                      color: document.documentElement.classList.contains("dark")
                        ? "white"
                        : "black",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
