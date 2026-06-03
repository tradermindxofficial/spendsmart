'use client';

import React, { useEffect, useState } from 'react';
import { db, Transaction, Category } from '@/lib/db';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Calendar,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import CategoryIcon from '@/components/CategoryIcon';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [txs, cats] = await Promise.all([
          db.getTransactions(),
          db.getCategories()
        ]);
        setTransactions(txs);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400">Loading your summary...</div>
      </div>
    );
  }

  // 1. Math and Calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${currentYear}-${currentMonth}`; // "YYYY-MM"

  // All time balance
  const totalIncomeAllTime = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenseAllTime = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalBalance = totalIncomeAllTime - totalExpenseAllTime;

  // Monthly stats
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));
  
  const totalIncomeThisMonth = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const totalExpensesThisMonth = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const savingsThisMonth = totalIncomeThisMonth - totalExpensesThisMonth;

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Group expenses by category for Pie Chart
  const expenseByCategory: { [key: string]: number } = {};
  transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Number(t.amount);
    });

  const pieChartData = Object.entries(expenseByCategory).map(([name, value]) => {
    const categoryInfo = categories.find(c => c.name === name && c.type === 'expense');
    return {
      name,
      value,
      color: categoryInfo?.color || '#6B7280'
    };
  });

  // 6-Month data calculation for Bar Chart
  const last6MonthsData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    const monthlyTxs = transactions.filter(t => t.date.startsWith(monthStr));
    const income = monthlyTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = monthlyTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    return {
      monthStr,
      label,
      Income: income,
      Expenses: expense
    };
  }).reverse();

  // Rupees Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-350 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back! Here's your financial overview for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}.
          </p>
        </div>
        <Link
          href="/add-transaction"
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Transaction</span>
        </Link>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance: Green Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Balance</span>
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
              {formatCurrency(totalBalance)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">All-time net balance</p>
          </div>
        </div>

        {/* Total Income: Blue Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Income</span>
            <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-blue-400">
              {formatCurrency(totalIncomeThisMonth)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Earned this month</p>
          </div>
        </div>

        {/* Total Expenses: Red Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Expenses</span>
            <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-red-400">
              {formatCurrency(totalExpensesThisMonth)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Spent this month</p>
          </div>
        </div>

        {/* Total Savings: Purple Card */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400">Total Savings</span>
            <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
              <PiggyBank className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${savingsThisMonth >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {formatCurrency(savingsThisMonth)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Income minus Expenses</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses (Last 6 Months): Bar Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200">Income vs Expenses (6 Months)</h3>
          </div>
          <div className="h-80 w-full text-xs" style={{ width: '100%', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie Chart) */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PiggyBank className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200">Expense by Category</h3>
          </div>
          <div className="h-80 w-full text-xs flex-1 flex flex-col justify-center" style={{ width: '100%', minHeight: '300px' }}>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-2">
                <span>No expense data this month</span>
                <span className="text-[10px]">Add an expense to populate this chart</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions List */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-200">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Displaying the last 5 transactions</p>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => {
              const cat = categories.find(c => c.name === tx.category && c.type === tx.type);
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-slate-800/10 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl border shrink-0" 
                      style={{ 
                        backgroundColor: `${cat?.color || '#6B7280'}15`, 
                        borderColor: `${cat?.color || '#6B7280'}35` 
                      }}
                    >
                      <CategoryIcon 
                        name={cat?.icon || 'HelpCircle'} 
                        className="h-5 w-5" 
                        style={{ color: cat?.color || '#6B7280' }} 
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{tx.description || tx.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-1.5 py-0.2 rounded">
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isIncome ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
              <p className="text-sm">No transactions logged yet</p>
              <Link href="/add-transaction" className="text-xs text-emerald-400 font-semibold hover:underline">
                Create your first transaction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
