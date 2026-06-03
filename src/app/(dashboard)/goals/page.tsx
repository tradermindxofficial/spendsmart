"use client";
import React, { useEffect, useState } from "react";
import { db, Goal } from "@/lib/db";
import ConfirmModal from "@/components/ConfirmModal";
import {
  Loader2,
  PlusCircle,
  Trash2,
  Target,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
} from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [currentSaved, setCurrentSaved] = useState("0");
  const [deadline, setDeadline] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const loadGoals = async () => {
    const data = await db.getGoals();
    setGoals(data);
  };

  useEffect(() => {
    async function init() {
      await loadGoals();
      setLoading(false);
    }
    init();
  }, []);

  const resetForm = () => {
    setName("");
    setTarget("");
    setCurrentSaved("0");
    setDeadline(new Date().toISOString().split("T")[0]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target) return;
    setSubmitting(true);
    try {
      await db.addGoal({
        name: name.trim(),
        target_amount: Number(target),
        current_amount: Number(currentSaved) || 0,
        deadline,
      });
      await loadGoals();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add goal:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;
    setDeletingId(goalToDelete);
    try {
      await db.deleteGoal(goalToDelete);
      await loadGoals();
      setGoalToDelete(null);
    } catch (err) {
      console.error("Failed to delete goal:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(deadline + "T00:00:00");
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  const completedGoals = goals.filter(
    (g) => g.current_amount >= g.target_amount
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your financial goals and stay on target.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Goals
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {goals.length}
            </p>
          </div>
          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Completed
            </p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {completedGoals}
            </p>
          </div>
          <div className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-500">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Saved
            </p>
            <p className="text-2xl font-bold text-purple-400 mt-1">
              {formatCurrency(
                goals.reduce((acc, g) => acc + Number(g.current_amount), 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
            <Target className="h-10 w-10 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-200">
              No goals yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Set your first savings goal to start tracking progress.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              goal.target_amount > 0
                ? Math.round((goal.current_amount / goal.target_amount) * 100)
                : 0
            );
            const isComplete = goal.current_amount >= goal.target_amount;
            const daysLeft = getDaysLeft(goal.deadline);
            const isOverdue = daysLeft < 0;

            return (
              <div
                key={goal.id}
                className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-slate-800 hover:border-slate-700 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isComplete
                          ? "bg-emerald-500/15 border border-emerald-500/25"
                          : "bg-slate-700/60 border border-slate-600/30"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {goal.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setGoalToDelete(goal.id)}
                    disabled={deletingId === goal.id}
                    title="Delete goal"
                    className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                  >
                    {deletingId === goal.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Amounts */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Saved
                    </p>
                    <p className="text-xl font-bold text-emerald-400">
                      {formatCurrency(goal.current_amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Target
                    </p>
                    <p className="text-lg font-bold text-slate-300">
                      {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-medium">
                      Progress
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isComplete ? "text-emerald-400" : "text-slate-300"
                      }`}
                    >
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/70 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${
                        isComplete
                          ? "bg-emerald-400"
                          : progress >= 75
                          ? "bg-emerald-500"
                          : progress >= 40
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Deadline row */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <Clock
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isOverdue
                        ? "text-red-400"
                        : isComplete
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isOverdue
                        ? "text-red-400"
                        : isComplete
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {isComplete
                      ? "Goal reached! 🎉"
                      : isOverdue
                      ? `Overdue by ${Math.abs(daysLeft)} days`
                      : `${daysLeft} days left · ${formatDate(goal.deadline)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl"
            style={{ backgroundColor: "#0F172A" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/15 p-2 rounded-xl border border-emerald-500/20">
                  <Target className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-100">
                  New Savings Goal
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Goal Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Emergency Fund, New Laptop"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    backgroundColor: "#1E293B",
                    color: "#fff",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#10B981";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgba(16,185,129,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Target Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 50000"
                  required
                  style={{
                    width: "100%",
                    backgroundColor: "#1E293B",
                    color: "#fff",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#10B981";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgba(16,185,129,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Current Saved Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Already Saved (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={currentSaved}
                  onChange={(e) => setCurrentSaved(e.target.value)}
                  placeholder="0"
                  style={{
                    width: "100%",
                    backgroundColor: "#1E293B",
                    color: "#fff",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#10B981";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgba(16,185,129,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: "#1E293B",
                    color: "#fff",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    outline: "none",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#10B981";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgba(16,185,129,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Preview */}
              {target && Number(target) > 0 && (
                <div
                  style={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">
                    Progress Preview
                  </p>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((Number(currentSaved) / Number(target)) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {Math.min(100, Math.round((Number(currentSaved) / Number(target)) * 100))}% complete
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "#1E293B",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#334155";
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1E293B";
                    (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    backgroundColor: submitting ? "#059669" : "#10B981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background-color 0.2s",
                    opacity: submitting ? 0.8 : 1,
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle style={{ width: 16, height: 16 }} />
                      Save Goal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Goal?"
        isDeleting={!!deletingId}
      />
    </div>
  );
}
