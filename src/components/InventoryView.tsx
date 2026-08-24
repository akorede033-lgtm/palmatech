import React, { useState } from 'react';
import { InventoryItem, UserRole } from '../types';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Warehouse,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Package,
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  currentRole: UserRole;
  onAddItem: (item: InventoryItem) => void;
  onUpdateStock: (id: string, delta: number, type: 'add' | 'subtract') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory = [],
  currentRole,
  onAddItem,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Fertilizer');
  const [currentStock, setCurrentStock] = useState<number>(100);
  const [unit, setUnit] = useState('Bags (50kg)');
  const [minimumStockLevel, setMinimumStockLevel] = useState<number>(20);
  const [supplier, setSupplier] = useState('AgroChem International');
  const [unitCost, setUnitCost] = useState<number>(35.0);
  const [location, setLocation] = useState('Main Warehouse A');

  const safeInventory = inventory || [];

  const filteredItems = safeInventory.filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (item.itemCode || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (item.supplier || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const lowStockItems = safeInventory.filter((item) => item && item.currentStock <= item.minimumStockLevel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `INV-${(inventory.length + 1).toString().padStart(3, '0')}`;
    const newItem: InventoryItem = {
      id: newCode,
      itemCode: newCode,
      name,
      category,
      currentStock: Number(currentStock),
      unit,
      minimumStockLevel: Number(minimumStockLevel),
      supplier,
      unitCost: Number(unitCost),
      lastRestockedDate: new Date().toISOString().split('T')[0],
      location,
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            <span>Farm Inputs & Warehouse Inventory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Fertilizers, herbicides, pesticides, field tools, worker PPE, diesel fuel, and spare parts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Fertilizer">Fertilizers</option>
            <option value="Herbicide">Herbicides</option>
            <option value="Pesticide">Pesticides</option>
            <option value="Tools & Equipment">Tools & Equipment</option>
            <option value="PPE">PPE & Safety</option>
            <option value="Fuel">Fuel & Lubricants</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Item</span>
          </button>
        </div>
      </div>

      {/* Low Stock Reorder Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm text-xs">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce flex-shrink-0" />
            <div>
              <strong className="text-amber-100 uppercase tracking-wider block">Reorder Alert: {lowStockItems.length} Low Stock Item(s)</strong>
              <span>
                {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit} left)`).join(', ')}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-800 text-amber-100 rounded font-semibold text-[11px] self-end sm:self-center">
            Restock Suggested
          </span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Item Code & Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock Level</th>
                <th className="p-3">Warehouse Location</th>
                <th className="p-3">Unit Cost</th>
                <th className="p-3">Supplier</th>
                <th className="p-3 text-right">Stock Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minimumStockLevel;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.itemCode}</div>
                    </td>
                    <td className="p-3 text-slate-700">{item.category}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.currentStock.toLocaleString()} {item.unit}
                        </span>
                        {isLow && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded uppercase">
                            Low
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Min Threshold: {item.minimumStockLevel} {item.unit}</div>
                    </td>
                    <td className="p-3 text-slate-600">{item.location}</td>
                    <td className="p-3 font-semibold text-slate-800">${item.unitCost.toFixed(2)}</td>
                    <td className="p-3 text-slate-600">{item.supplier}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => onUpdateStock(item.id, 10, 'subtract')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs cursor-pointer"
                          title="Log Stock Usage (-10)"
                        >
                          - Use
                        </button>
                        <button
                          onClick={() => onUpdateStock(item.id, 20, 'add')}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold text-xs cursor-pointer"
                          title="Restock (+20)"
                        >
                          + Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                <span>Add Warehouse Inventory Item</span>
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
                <label className="block font-medium text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Urea 46% Nitrogen Fertilizer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                  >
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Herbicide">Herbicide</option>
                    <option value="Pesticide">Pesticide</option>
                    <option value="Tools & Equipment">Tools & Equipment</option>
                    <option value="PPE">PPE</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Spare Parts">Spare Parts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit Type</label>
                  <input
                    type="text"
                    required
                    placeholder="Bags (50kg), Liters..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    required
                    value={minimumStockLevel}
                    onChange={(e) => setMinimumStockLevel(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-teal-500"
                  />
                </div>
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
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded font-semibold shadow cursor-pointer"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
