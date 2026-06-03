"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, Category } from '@/lib/db';
import { Loader2, PlusCircle } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import CustomSelect from '@/components/CustomSelect';

export default function AddTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const cats = await db.getCategories();
      setCategories(cats);
      // Default category based on type
      const defaultCat = cats.find(c => c.type === type);
      setCategory(defaultCat?.name || '');
      setLoading(false);
    }
    load();
  }, []);

  // Update category options when type changes
  useEffect(() => {
    const defaultCat = categories.find(c => c.type === type);
    setCategory(defaultCat?.name || '');
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    setSubmitting(true);
    try {
      await db.addTransaction({
        type,
        amount: Number(amount),
        category,
        description,
        date,
      });
      router.push('/transactions');
    } catch (err) {
      console.error('Failed to add transaction', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-slate-950 text-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 glass-card">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">Add Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="flex space-x-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={type === 'expense'}
              onChange={() => setType('expense')}
              className="form-radio text-rose-500"
            />
            <span className="text-rose-400">Expense</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="income"
              checked={type === 'income'}
              onChange={() => setType('income')}
              className="form-radio text-emerald-500"
            />
            <span className="text-emerald-400">Income</span>
          </label>
        </div>
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#1E293B] text-white border border-[#334155] rounded-[10px] focus:outline-none focus:border-[#10B981] placeholder-[#64748B] transition-all"
          />
        </div>
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
          <CustomSelect
            value={category}
            onChange={val => setCategory(val)}
            options={categories
              .filter(c => c.type === type)
              .map(c => ({
                value: c.name,
                label: c.name
              }))}
          />
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., Grocery shopping"
            className="w-full px-4 py-2.5 bg-[#1E293B] text-white border border-[#334155] rounded-[10px] focus:outline-none focus:border-[#10B981] placeholder-[#64748B] transition-all"
          />
        </div>
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#1E293B] text-white border border-[#334155] rounded-[10px] focus:outline-none focus:border-[#10B981] placeholder-[#64748B] transition-all"
          />
        </div>
        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 rounded-[10px] transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <PlusCircle className="h-5 w-5" /> Add Transaction
            </>
          )}
        </button>
      </form>
    </div>
  );
}
