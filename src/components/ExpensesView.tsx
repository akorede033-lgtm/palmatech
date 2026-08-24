import React, { useState } from 'react';
import { ExpenseRecord, UserRole } from '../types';
import {
  DollarSign,
  Plus,
  Receipt,
  PieChart,
  CheckCircle2,
  Clock,
  Search,
  X,
  CreditCard,
} from 'lucide-react';

interface ExpensesViewProps {
  expenses: ExpenseRecord[];
  currentRole: UserRole;
  onAddExpense: (expense: ExpenseRecord) => void;
  onApproveExpense: (id: string, approvedBy: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses = [],
  currentRole,
  onApproveExpense,
  onAddExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseRecord['category']>('Fertilizer & Chemicals');
  const [amount, setAmount] = useState<number>(4500.0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<ExpenseRecord['paymentMethod']>('Bank Transfer');
  const [vendor, setVendor] = useState('AgroChem Supplies Ltd.');
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop');

  const safeExpenses = expenses || [];

  const filteredExpenses = safeExpenses.filter((e) => {
    if (!e) return false;
    const matchesSearch =
      (e.description || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (e.vendor || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (e.expenseId || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalSpent = safeExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `EXP-${(expenses.length + 1).toString().padStart(3, '0')}`;
    const newExpense: ExpenseRecord = {
      id: newCode,
      expenseId: newCode,
      date: new Date().toISOString().split('T')[0],
      category,
      amount: Number(amount),
      description,
      paymentMethod,
      vendor,
      receiptUrl: receiptUrl || undefined,
      isApproved: currentRole === 'Accountant' || currentRole === 'Admin' || currentRole === 'Manager',
      approvedBy:
        currentRole === 'Accountant' || currentRole === 'Admin' || currentRole === 'Manager'
          ? `${currentRole} Verified`
          : undefined,
    };

    onAddExpense(newExpense);
    setIsAddModalOpen(false);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Farm Financial & Expense Accounting</span>
          </h2>
          <p className="text-xs text-slate-500">
            Labor payroll, fertilizer procurement, diesel fuel, equipment maintenance, and capital investments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Expense Categories</option>
            <option value="Labor / Payroll">Labor / Payroll</option>
            <option value="Fertilizer & Chemicals">Fertilizer & Chemicals</option>
            <option value="Equipment Fuel & Diesel">Equipment Fuel & Diesel</option>
            <option value="Maintenance & Repairs">Maintenance & Repairs</option>
            <option value="Capital Investment">Capital Investment</option>
            <option value="Utilities & Admin">Utilities & Admin</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Operational Expenditure</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-400 mt-0.5">Commercial Plantation Operating Budget</p>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Fertilizer & Agrochemical Spend</span>
          <div className="text-2xl font-bold text-emerald-950 mt-1">$12,450.00</div>
          <p className="text-xs text-emerald-800/80 mt-0.5">32% of total operational expenditure</p>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Labor & Harvester Payroll</span>
          <div className="text-2xl font-bold text-blue-950 mt-1">$18,900.00</div>
          <p className="text-xs text-blue-800/80 mt-0.5">Field Workers, Harvesters, and Drivers</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Expense ID & Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description & Vendor</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Amount ($)</th>
                <th className="p-3">Audit Approval</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{expense.expenseId}</div>
                    <div className="text-[10px] text-slate-400">{expense.date}</div>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{expense.category}</td>
                  <td className="p-3 text-slate-700">
                    <div className="font-semibold text-slate-900">{expense.description}</div>
                    <div className="text-[10px] text-slate-400">Vendor: {expense.vendor}</div>
                  </td>
                  <td className="p-3 text-slate-600">{expense.paymentMethod}</td>
                  <td className="p-3 font-bold text-slate-900 text-sm">
                    ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                        expense.isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {expense.isApproved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 animate-spin" /> Pending Approval
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {!expense.isApproved &&
                      (currentRole === 'Accountant' || currentRole === 'Admin' || currentRole === 'Manager') && (
                        <button
                          onClick={() => onApproveExpense(expense.id, 'Accountant')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded text-[11px] cursor-pointer"
                        >
                          Approve Voucher
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Log Operational Expense Voucher</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseRecord['category'])}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                >
                  <option value="Labor / Payroll">Labor / Payroll</option>
                  <option value="Fertilizer & Chemicals">Fertilizer & Chemicals</option>
                  <option value="Equipment Fuel & Diesel">Equipment Fuel & Diesel</option>
                  <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                  <option value="Capital Investment">Capital Investment</option>
                  <option value="Utilities & Admin">Utilities & Admin</option>
                  <option value="Transport & Shipping">Transport & Shipping</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as ExpenseRecord['paymentMethod'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Company Credit Card">Company Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Purpose / Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Procurement of 200 bags NPK 15-15-15 fertilizer for Block 01 - 04"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold shadow cursor-pointer"
              >
                Log Voucher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
