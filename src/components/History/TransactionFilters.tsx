import React from 'react';
import { TransactionFilters } from '../../types/transaction';
import { chains } from '../../config/chains';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export default function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        value={filters.status || 'all'}
        onChange={(e) => onChange({
          ...filters,
          status: e.target.value === 'all' ? undefined : e.target.value as any
        })}
        className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>

      <select
        value={filters.chainId || 'all'}
        onChange={(e) => onChange({
          ...filters,
          chainId: e.target.value === 'all' ? undefined : Number(e.target.value)
        })}
        className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
      >
        <option value="all">All Chains</option>
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>

      <select
        value={filters.timeRange || 'all'}
        onChange={(e) => onChange({
          ...filters,
          timeRange: e.target.value as any
        })}
        className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
      >
        <option value="all">All Time</option>
        <option value="day">Last 24 Hours</option>
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
      </select>
    </div>
  );
}