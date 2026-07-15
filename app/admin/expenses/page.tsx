"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Receipt, UserCircle, Briefcase, Wrench, Package, AlertCircle } from "lucide-react";

type Expense = {
  id: string;
  expense_type: 'salary' | 'supplies' | 'maintenance' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    expense_type: 'salary' as Expense['expense_type'],
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch expenses");
      setExpenses(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add expense");
      
      setExpenses([data, ...expenses]);
      setIsModalOpen(false);
      setFormData({
        expense_type: 'salary',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSalaries = expenses
    .filter(e => e.expense_type === 'salary')
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const totalOtherExpenses = expenses
    .filter(e => e.expense_type !== 'salary')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const getExpenseIcon = (type: string) => {
    switch (type) {
      case 'salary': return <UserCircle className="text-blue-500" size={20} />;
      case 'supplies': return <Package className="text-amber-500" size={20} />;
      case 'maintenance': return <Wrench className="text-gray-500" size={20} />;
      default: return <Briefcase className="text-purple-500" size={20} />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Expenses & Salaries</h1>
          <p className="text-coffee-600">Track and manage outgoing cash flows.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-coffee-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-coffee-900 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Record
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200 flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <UserCircle size={28} />
          </div>
          <div>
            <p className="text-coffee-500 font-medium mb-1">Total Salaries</p>
            <h2 className="text-3xl font-bold font-serif text-coffee-900">{formatPrice(totalSalaries)}</h2>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200 flex items-center gap-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Receipt size={28} />
          </div>
          <div>
            <p className="text-coffee-500 font-medium mb-1">Other Expenses</p>
            <h2 className="text-3xl font-bold font-serif text-coffee-900">{formatPrice(totalOtherExpenses)}</h2>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-coffee-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-coffee-50/50 border-b border-coffee-200 text-coffee-800 text-sm">
              <tr>
                <th className="font-medium p-4 pl-6">Type</th>
                <th className="font-medium p-4">Description</th>
                <th className="font-medium p-4">Date</th>
                <th className="font-medium p-4 pr-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-800"></div>
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-coffee-400 font-medium">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-coffee-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {getExpenseIcon(expense.expense_type)}
                        <span className="capitalize font-medium text-coffee-900">
                          {expense.expense_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-coffee-700">{expense.description}</td>
                    <td className="p-4 text-coffee-600 text-sm">
                      {format(new Date(expense.expense_date), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 pr-6 text-right font-medium text-coffee-900">
                      {formatPrice(expense.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-coffee-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
              <h3 className="text-xl font-bold font-serif text-coffee-900">Log Expense</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-coffee-400 hover:text-coffee-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">Type</label>
                <select
                  required
                  value={formData.expense_type}
                  onChange={e => setFormData({...formData, expense_type: e.target.value as any})}
                  className="w-full rounded-xl border-coffee-200 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 py-2.5 px-3 border outline-none bg-white"
                >
                  <option value="salary">Salary</option>
                  <option value="supplies">Supplies</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe Salary - July"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border-coffee-200 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 py-2.5 px-3 border outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-500">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full rounded-xl border-coffee-200 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 py-2.5 pl-8 pr-3 border outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={e => setFormData({...formData, expense_date: e.target.value})}
                    className="w-full rounded-xl border-coffee-200 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 py-2.5 px-3 border outline-none bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-coffee-200 text-coffee-700 font-medium hover:bg-coffee-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-coffee-800 text-white font-medium hover:bg-coffee-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
