import React, { useState } from 'react';
import { Equipment, UserRole } from '../types';
import {
  Wrench,
  Plus,
  Tractor,
  Truck,
  Fuel,
  Calendar,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';

interface EquipmentViewProps {
  equipment: Equipment[];
  currentRole: UserRole;
  onAddEquipment: (item: Equipment) => void;
  onUpdateStatus: (id: string, status: Equipment['currentStatus']) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  equipment = [],
  currentRole,
  onAddEquipment,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Equipment['type']>('Tractor');
  const [operatorName, setOperatorName] = useState('Tractor Operator Anton');
  const [condition, setCondition] = useState<Equipment['condition']>('Good');
  const [fuelUsage, setFuelUsage] = useState<number>(380);

  const safeEquipment = equipment || [];

  const filteredEquipment = safeEquipment.filter(
    (e) =>
      e &&
      ((e.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (e.equipmentId || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (e.operatorName || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextCode = `EQP-${(equipment.length + 1).toString().padStart(3, '0')}`;
    const newEquipment: Equipment = {
      id: nextCode,
      equipmentId: `${type.substring(0, 4).toUpperCase()}-${(equipment.length + 1).toString().padStart(2, '0')}`,
      name,
      type,
      operatorName,
      condition,
      fuelUsageLitersMonth: Number(fuelUsage),
      currentStatus: 'In Service',
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextServiceDue: '2026-09-15',
    };

    onAddEquipment(newEquipment);
    setIsAddModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <span>Machinery & Equipment Fleet Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tractors, FFB mini-grabbers, 10-ton tipper trucks, motorcycles, motorized cutters, and fuel logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Machine</span>
          </button>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEquipment.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{item.equipmentId} • {item.type}</span>
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                <span className="text-xs text-slate-500">Assigned Operator: {item.operatorName}</span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  item.currentStatus === 'In Service'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.currentStatus === 'Scheduled Maintenance'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.currentStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>
                Condition: <strong className="text-slate-800">{item.condition}</strong>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>Fuel Usage: <strong className="text-slate-800">{item.fuelUsageLitersMonth} L/Mo</strong></span>
              </div>
              <div>
                Last Service: <strong className="text-slate-800">{item.lastMaintenanceDate}</strong>
              </div>
              <div>
                Next Service Due: <strong className="text-indigo-700">{item.nextServiceDue}</strong>
              </div>
            </div>

            {item.notes && (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                "{item.notes}"
              </p>
            )}

            <div className="flex justify-end space-x-2 pt-1">
              {item.currentStatus !== 'In Service' && (
                <button
                  onClick={() => onUpdateStatus(item.id, 'In Service')}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Mark In Service
                </button>
              )}
              {item.currentStatus === 'In Service' && (
                <button
                  onClick={() => onUpdateStatus(item.id, 'Scheduled Maintenance')}
                  className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded text-[11px] font-semibold border border-amber-200 cursor-pointer"
                >
                  Schedule Service
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tractor className="w-4 h-4 text-indigo-600" />
                <span>Register Machine / Vehicle</span>
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
                <label className="block font-medium text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kubota M8540 4WD Palm Tractor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Equipment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Equipment['type'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tractor">Tractor</option>
                    <option value="Mini-Grabber">Mini-Grabber</option>
                    <option value="4x4 Truck">4x4 Truck</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Chainsaw">Chainsaw</option>
                    <option value="Motorized Cutter">Motorized Cutter</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Operator</label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Equipment['condition'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Service">Needs Service</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Fuel (Liters)</label>
                  <input
                    type="number"
                    required
                    value={fuelUsage}
                    onChange={(e) => setFuelUsage(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
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
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold shadow cursor-pointer"
              >
                Register Equipment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
