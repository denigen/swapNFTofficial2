import React from 'react';
import TransactionList from './TransactionList';
import { useTransactionHistory } from '../../hooks/useTransactionHistory';

export default function TransactionHistory() {
  const { transactions, loading } = useTransactionHistory();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transaction History</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </div>
  );
}