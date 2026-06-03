"use client";

import React, { useEffect, useState } from 'react';
import { db, Transaction, Category } from '@/lib/db';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingUpDown,
  Calendar, 
  Loader2,
  PieChart as PieIcon,
  Award
} from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [txs, cats] = await Promise.all([
          db.getTransactions(),
          db.getCategories()
        ]);
        setTransactions(txs);
        setCategories(cats);
        
        // Default to current month or most recent month with transactions
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-slate-950 text-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  // Get unique months list for filter
  const monthsList = Array.from(
    new Set(transactions.map(t => t.date.substring(0, 7)))
  ).sort().reverse();

  // Filter transactions based on selected month
  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Compute metrics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Group expense by category
  const expenseByCategory: { [key: string]: number } = {};
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Number(t.amount);
    });

  const categoryData = Object.entries(expenseByCategory)
    .map(([name, value]) => {
      const cat = categories.find(c => c.name === name && c.type === 'expense');
      return {
        name,
        value,
        color: cat?.color || '#6B7280',
        percentage: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0
      };
    })
    .sort((a, b) => b.value - a.value);

  // Top spending category
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  // Get daily expenses trend for the selected month
  const dailyExpenses: { [day: string]: number } = {};
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const day = t.date.split('-')[2]; // Extract "DD"
      dailyExpenses[day] = (dailyExpenses[day] || 0) + Number(t.amount);
    });

  const dailyTrendData = Object.entries(dailyExpenses)
    .map(([day, amount]) => ({
      day: `Day ${day}`,
      Amount: amount
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header section with month filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-350 bg-clip-text text-transparent">
            Monthly Reports
          </h1>
          <p className="text-sm text-slate-400">
            Deep dive into your financial flows, saving rates, and category expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-emerald-400" />
          <CustomSelect
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(val)}
            options={monthsList.length > 0 ? (
              monthsList.map(m => ({
                value: m,
                label: new Date(m + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })
              }))
            ) : (
              [{ value: selectedMonth, label: 'Current Month' }]
            )}
            className="w-48"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-sm font-semibold">Total Income</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-emerald-400">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-sm font-semibold">Total Expense</span>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-red-400">{formatCurrency(totalExpense)}</h3>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-sm font-semibold">Net Savings</span>
            <TrendingUpDown className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-purple-400">{formatCurrency(netSavings)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">{savingsRate}% savings rate</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-sm font-semibold">Top Spent Category</span>
            <Award className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold mt-2 text-blue-400 truncate">
            {topCategory ? topCategory.name : 'N/A'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">
            {topCategory ? `${formatCurrency(topCategory.value)} (${topCategory.percentage}%)` : 'No expenses logged'}
          </p>
        </div>
      </div>

      {/* Detailed Analysis charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Trend */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="font-bold text-slate-200 mb-4">Daily Spending Trend</h3>
          <div className="h-80 w-full text-xs flex-1" style={{ width: '100%', minHeight: '300px' }}>
            {dailyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
                  />
                  <Line type="monotone" dataKey="Amount" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <span>No expense trend for this month</span>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown table and pie chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-slate-200">Expense Breakdown by Category</h3>
          </div>
          
          <div className="flex-1 space-y-4">
            {categoryData.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {categoryData.map(item => (
                  <div key={item.name} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 font-medium">{item.percentage}%</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-500">
                <span>No expenses recorded for this month.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
