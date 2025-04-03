import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const DashboardSummary = () => {
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  const fetchTransactions = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // First, create the composite index in Firebase console using the link in the error
      // Then use the query
      const transactionsRef = collection(db, 'transactions');
      
      // Use a simpler query first to avoid index issues
      const q = query(
        transactionsRef,
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      let totalIncome = 0;
      let totalExpenses = 0;
      
      querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }
      });
      
      setSummary({
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Przychody</h2>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {loading ? '...' : `${summary.income.toFixed(2)} PLN`}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Wydatki</h2>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {loading ? '...' : `${summary.expenses.toFixed(2)} PLN`}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bilans</h2>
        <p className={`text-2xl font-bold ${
          summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {loading ? '...' : `${summary.balance.toFixed(2)} PLN`}
        </p>
      </div>
    </div>
  );
};

export default DashboardSummary;