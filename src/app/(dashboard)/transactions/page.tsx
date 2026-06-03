'use client';

import React, { useEffect, useState } from 'react';
import { db, Transaction, Category } from '@/lib/db';
import { 
  Search, 
  Filter, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X,
  FileText,
  Calendar,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';
import ConfirmModal from '@/components/ConfirmModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this-month' | 'last-30-days' | 'last-3-months' | 'this-year'>('all');

  const loadTransactions = async () => {
    try {
      const [txs, cats] = await Promise.all([
        db.getTransactions(),
        db.getCategories()
      ]);
      setTransactions(txs);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await loadTransactions();
      setLoading(false);
    }
    loadData();
  }, []);

  const confirmDelete = async () => {
    if (!txToDelete) return;
    setIsDeleting(true);
    try {
      await db.deleteTransaction(txToDelete);
      // Reload list
      await loadTransactions();
      setTxToDelete(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search filter (description or category)
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Type filter
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    // 3. Category filter
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    // 4. Date filter
    let matchesDate = true;
    const txDate = new Date(tx.date);
    const now = new Date();
    
    if (dateFilter === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchesDate = txDate >= startOfMonth;
    } else if (dateFilter === 'last-30-days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = txDate >= thirtyDaysAgo;
    } else if (dateFilter === 'last-3-months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      matchesDate = txDate >= threeMonthsAgo;
    } else if (dateFilter === 'this-year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      matchesDate = txDate >= startOfYear;
    }

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  // Calculate stats for the filtered set
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const filteredBalance = filteredIncome - filteredExpense;

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
  };

  // Format Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-350 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-sm text-slate-400">
            View, search, and audit your complete transaction history.
          </p>
        </div>
        <Link
          href="/add-transaction"
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          Add Transaction
        </Link>
      </div>

      {/* Filter Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
        <div className="px-4 py-2">
          <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider block">Filtered Income</span>
          <span className="text-xl font-bold text-emerald-450 mt-1 block">{formatCurrency(filteredIncome)}</span>
        </div>
        <div className="px-4 py-2 border-t sm:border-t-0 sm:border-l border-slate-800">
          <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider block">Filtered Expenses</span>
          <span className="text-xl font-bold text-red-450 mt-1 block">{formatCurrency(filteredExpense)}</span>
        </div>
        <div className="px-4 py-2 border-t sm:border-t-0 sm:border-l border-slate-800">
          <span className="text-xs text-slate-450 font-semibold uppercase tracking-wider block">Net Segment Balance</span>
          <span className={`text-xl font-bold mt-1 block ${filteredBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(filteredBalance)}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2 pl-9 pr-4 text-slate-200 text-sm placeholder-slate-500 outline-none transition-all"
              placeholder="Search descriptions or categories..."
            />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val as any)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'income', label: '↓ Income', color: '#10B981' },
                { value: 'expense', label: '↑ Expense', color: '#EF4444' }
              ]}
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <CustomSelect
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Food', label: 'Food' },
                { value: 'Transport', label: 'Transport' },
                { value: 'Rent', label: 'Rent' },
                { value: 'Shopping', label: 'Shopping' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'Health', label: 'Health' },
                { value: 'Education', label: 'Education' },
                { value: 'Salary', label: 'Salary' },
                { value: 'Freelance', label: 'Freelance' },
                { value: 'Business', label: 'Business' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </div>

          {/* Date Filter */}
          <div className="md:col-span-2">
            <CustomSelect
              value={dateFilter}
              onChange={(val) => setDateFilter(val as any)}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'this-month', label: 'This Month' },
                { value: 'last-30-days', label: 'Last 30 Days' },
                { value: 'last-3-months', label: 'Last 3 Months' },
                { value: 'this-year', label: 'This Year' }
              ]}
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={resetFilters}
            className="md:col-span-1 flex items-center justify-center gap-1 text-xs text-slate-450 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl py-2 px-3 transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <X className="h-4 w-4" />
            <span className="md:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        {loading ? (
          <div className="text-center py-12 text-slate-450">Loading transactions ledger...</div>
        ) : filteredTransactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Details</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredTransactions.map((tx) => {
                    const cat = categories.find(c => c.name === tx.category && c.type === tx.type);
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/15 transition-colors">
                        {/* Date */}
                        <td className="py-4 px-6 text-sm text-slate-350 font-medium">
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        {/* Details */}
                        <td className="py-4 px-6">
                          <div className="max-w-xs font-semibold text-slate-200 truncate" title={tx.description}>
                            {tx.description || tx.category}
                          </div>
                        </td>
                        {/* Category Tag */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-1.5 rounded-lg border shrink-0" 
                              style={{ 
                                backgroundColor: `${cat?.color || '#6B7280'}15`, 
                                borderColor: `${cat?.color || '#6B7280'}35` 
                              }}
                            >
                              <CategoryIcon 
                                name={cat?.icon || 'HelpCircle'} 
                                className="h-4 w-4" 
                                style={{ color: cat?.color || '#6B7280' }} 
                              />
                            </div>
                            <span className="text-sm text-slate-300 font-medium">{tx.category}</span>
                          </div>
                        </td>
                        {/* Type Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${
                            isIncome 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {isIncome ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {tx.type}
                          </span>
                        </td>
                        {/* Amount */}
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setTxToDelete(tx.id)}
                            className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-slate-850">
              {filteredTransactions.map((tx) => {
                const cat = categories.find(c => c.name === tx.category && c.type === tx.type);
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="p-4 flex flex-col gap-3 hover:bg-slate-800/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <button
                        onClick={() => setTxToDelete(tx.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="p-2 rounded-lg border shrink-0" 
                          style={{ 
                            backgroundColor: `${cat?.color || '#6B7280'}15`, 
                            borderColor: `${cat?.color || '#6B7280'}35` 
                          }}
                        >
                          <CategoryIcon 
                            name={cat?.icon || 'HelpCircle'} 
                            className="h-4 w-4" 
                            style={{ color: cat?.color || '#6B7280' }} 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">{tx.description || tx.category}</p>
                          <span className="text-[10px] text-slate-450">{tx.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-extrabold ${isIncome ? 'text-emerald-450' : 'text-red-450'}`}>
                          {isIncome ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16 px-4 text-slate-500 flex flex-col items-center gap-3">
            <div className="bg-slate-900 p-4 rounded-full border border-slate-800 text-slate-650">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-350">No transactions found</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or search to view other history.</p>
            </div>
            {transactions.length === 0 ? (
              <Link
                href="/add-transaction"
                className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
              >
                Log your first transaction
              </Link>
            ) : (
              <button
                onClick={resetFilters}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction?"
        isDeleting={isDeleting}
      />
    </div>
  );
}
