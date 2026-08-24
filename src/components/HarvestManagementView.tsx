import React, { useState } from 'react';
import { HarvestRecord, FarmBlock, UserRole } from '../types';
import {
  Tractor,
  Plus,
  Truck,
  CheckCircle2,
  BarChart3,
  Search,
  X,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface HarvestManagementViewProps {
  harvests: HarvestRecord[];
  blocks: FarmBlock[];
  currentRole: UserRole;
  onAddHarvest: (harvest: HarvestRecord) => void;
}

export const HarvestManagementView: React.FC<HarvestManagementViewProps> = ({
  harvests = [],
  blocks = [],
  currentRole,
  onAddHarvest,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [blockId, setBlockId] = useState('BLK-01');
  const [quantityTonnes, setQuantityTonnes] = useState<number>(12.5);
  const [bunchCount, setBunchCount] = useState<number>(680);
  const [avgBunchWeight, setAvgBunchWeight] = useState<number>(18.4);
  const [workerCount, setWorkerCount] = useState<number>(6);
  const [harvestTeam, setHarvestTeam] = useState('Alpha Harvester Crew');
  const [transportTruck, setTransportTruck] = useState('WKN-8892 (10-Ton Tipper)');
  const [receivingMill, setReceivingMill] = useState('PalmaCentral Crude Oil Mill - Gate A');
  const [ripePct, setRipePct] = useState<number>(92);
  const [underripePct, setUnderripePct] = useState<number>(5);
  const [longStalkPct, setLongStalkPct] = useState<number>(3);
  const [notes, setNotes] = useState('');

  const safeHarvests = harvests || [];
  const safeBlocks = blocks || [];

  const filteredHarvests = safeHarvests.filter(
    (h) =>
      h &&
      ((h.blockId || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (h.transportTruckNumber || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (h.receivingMillLocation || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
  );

  const totalQuantity = safeHarvests.reduce((sum, h) => sum + (h?.quantityTonnes || 0), 0);
  const totalBunches = safeHarvests.reduce((sum, h) => sum + (h?.bunchCount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHarvest: HarvestRecord = {
      id: `HRV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      blockId,
      quantityTonnes: Number(quantityTonnes),
      bunchCount: Number(bunchCount),
      averageBunchWeightKg: Number(avgBunchWeight),
      workerCount: Number(workerCount),
      harvestTeam,
      transportTruckNumber: transportTruck,
      receivingMillLocation: receivingMill,
      ripePercentage: Number(ripePct),
      underripePercentage: Number(underripePct),
      longStalkPercentage: Number(longStalkPct),
      notes: notes || 'Fresh Fruit Bunches dispatched immediately following harvest.',
    };

    onAddHarvest(newHarvest);
    setIsAddModalOpen(false);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-amber-600" />
            <span>FFB Harvest & Dispatch Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Track Fresh Fruit Bunch (FFB) tonnage, average bunch weight, tipper truck dispatch, and mill delivery
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search harvest records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Harvest Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Total Harvest Volume</span>
          <div className="text-2xl font-bold text-amber-950 mt-1">{totalQuantity.toFixed(1)} Metric Tons</div>
          <p className="text-xs text-amber-800/80 mt-0.5">Fresh Fruit Bunches (FFB)</p>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Bunch Count</span>
          <div className="text-2xl font-bold text-emerald-950 mt-1">{totalBunches.toLocaleString()} Bunches</div>
          <p className="text-xs text-emerald-800/80 mt-0.5">Avg Bunch Weight: ~18.3 kg</p>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Quality Ripeness Standard</span>
          <div className="text-2xl font-bold text-blue-950 mt-1">92.5% Ripe</div>
          <p className="text-xs text-blue-800/80 mt-0.5">Underripe &lt;5% • Long Stalk &lt;3%</p>
        </div>
      </div>

      {/* Harvest Records List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">Date & Block</th>
                <th className="p-3">Quantity (FFB)</th>
                <th className="p-3">Bunch Metrics</th>
                <th className="p-3">Harvest Crew</th>
                <th className="p-3">Transport Truck</th>
                <th className="p-3">Receiving Mill</th>
                <th className="p-3">Quality Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHarvests.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">Block {h.blockId}</div>
                    <div className="text-[10px] text-slate-400">{h.date}</div>
                  </td>
                  <td className="p-3 font-bold text-amber-700 text-sm">{h.quantityTonnes} MT</td>
                  <td className="p-3 text-slate-700">
                    <div>{h.bunchCount} Bunches</div>
                    <div className="text-[10px] text-slate-400">Avg {h.averageBunchWeightKg} kg/bunch</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    <div>{h.harvestTeam}</div>
                    <div className="text-[10px] text-slate-400">{h.workerCount} Harvesters</div>
                  </td>
                  <td className="p-3 font-mono text-slate-800">{h.transportTruckNumber}</td>
                  <td className="p-3 text-slate-700 max-w-[180px] truncate">{h.receivingMillLocation}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {h.ripePercentage}% Ripe
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Harvest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Log Fresh Fruit Bunch (FFB) Harvest Dispatch</span>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Harvest Block</label>
                  <select
                    value={blockId}
                    onChange={(e) => setBlockId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  >
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Harvest Team</label>
                  <input
                    type="text"
                    required
                    value={harvestTeam}
                    onChange={(e) => setHarvestTeam(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quantity (Tonnes FFB)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quantityTonnes}
                    onChange={(e) => setQuantityTonnes(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bunch Count</label>
                  <input
                    type="number"
                    required
                    value={bunchCount}
                    onChange={(e) => setBunchCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Worker Count</label>
                  <input
                    type="number"
                    required
                    value={workerCount}
                    onChange={(e) => setWorkerCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Transport Vehicle / Tipper</label>
                  <input
                    type="text"
                    required
                    value={transportTruck}
                    onChange={(e) => setTransportTruck(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Receiving Palm Oil Mill</label>
                  <input
                    type="text"
                    required
                    value={receivingMill}
                    onChange={(e) => setReceivingMill(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ripe Bunches %</label>
                  <input
                    type="number"
                    value={ripePct}
                    onChange={(e) => setRipePct(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Underripe %</label>
                  <input
                    type="number"
                    value={underripePct}
                    onChange={(e) => setUnderripePct(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Long Stalk %</label>
                  <input
                    type="number"
                    value={longStalkPct}
                    onChange={(e) => setLongStalkPct(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note weather conditions, ramp arrival time, or loose fruit bag count."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-amber-500"
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
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold shadow cursor-pointer"
              >
                Confirm Dispatch Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
