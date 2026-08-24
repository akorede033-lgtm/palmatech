import React, { useState } from 'react';
import { FarmInspection, FarmBlock, UserRole } from '../types';
import {
  CheckSquare,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Star,
  Camera,
  X,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface InspectionSystemViewProps {
  inspections: FarmInspection[];
  blocks: FarmBlock[];
  currentRole: UserRole;
  onAddInspection: (inspection: FarmInspection) => void;
}

export const InspectionSystemView: React.FC<InspectionSystemViewProps> = ({
  inspections = [],
  blocks = [],
  currentRole,
  onAddInspection,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [blockId, setBlockId] = useState('BLK-01');
  const [inspectorName, setInspectorName] = useState('Ahmad Zulkifli (Supervisor)');
  const [generalScore, setGeneralScore] = useState<number>(4);
  const [palmHealthScore, setPalmHealthScore] = useState<number>(4);
  const [weedScore, setWeedScore] = useState<number>(4);
  const [pestPresence, setPestPresence] = useState<FarmInspection['pestPresence']>('None');
  const [diseasePresence, setDiseasePresence] = useState<FarmInspection['diseasePresence']>('None');
  const [drainageStatus, setDrainageStatus] = useState<FarmInspection['drainageStatus']>('Good');
  const [roadStatus, setRoadStatus] = useState<FarmInspection['roadStatus']>('Passable');
  const [workerSafetyPPE, setWorkerSafetyPPE] = useState<FarmInspection['workerSafetyPPE']>('Compliant');
  const [equipmentCondition, setEquipmentCondition] = useState<FarmInspection['equipmentCondition']>('Good');
  const [recommendations, setRecommendations] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1595123550441-d377e017de6a?w=600&auto=format&fit=crop');

  const safeInspections = inspections || [];
  const safeBlocks = blocks || [];

  const filteredInspections = safeInspections.filter(
    (i) =>
      i &&
      ((i.blockId || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (i.inspectorName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (i.recommendations || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInspection: FarmInspection = {
      id: `INS-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      blockId,
      inspectorName,
      generalConditionScore: generalScore,
      palmHealthScore,
      weedControlScore: weedScore,
      pestPresence,
      diseasePresence,
      drainageStatus,
      roadStatus,
      workerSafetyPPE,
      equipmentCondition,
      recommendations: recommendations || 'Routine inspection passed. Maintain frond pruning standards.',
      photoUrl: photoUrl || undefined,
      status: pestPresence === 'Severe' || diseasePresence !== 'None' ? 'Action Pending' : 'Completed',
    };

    onAddInspection(newInspection);
    setIsAddModalOpen(false);
    setRecommendations('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span>Farm Inspection & Agricultural Compliance</span>
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive field audits covering palm health, weed control, pests, roads, drainage, and safety
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Conduct Inspection</span>
          </button>
        </div>
      </div>

      {/* Inspections History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{insp.id} • {insp.date}</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Block {insp.blockId} Inspection Audit
                </h3>
                <span className="text-xs text-slate-500">Inspector: {insp.inspectorName}</span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  insp.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {insp.status}
              </span>
            </div>

            {/* Score Star Indicators */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">General Score</span>
                <div className="flex items-center text-amber-500 mt-0.5">
                  {Array.from({ length: insp.generalConditionScore }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-slate-800 font-bold ml-1 text-[11px]">{insp.generalConditionScore}/5</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Palm Canopy</span>
                <div className="flex items-center text-amber-500 mt-0.5">
                  {Array.from({ length: insp.palmHealthScore }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-slate-800 font-bold ml-1 text-[11px]">{insp.palmHealthScore}/5</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Weed Control</span>
                <div className="flex items-center text-amber-500 mt-0.5">
                  {Array.from({ length: insp.weedControlScore }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-slate-800 font-bold ml-1 text-[11px]">{insp.weedControlScore}/5</span>
                </div>
              </div>
            </div>

            {/* Compliance Parameters Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                Pest Presence:{' '}
                <strong className={insp.pestPresence !== 'None' ? 'text-rose-700' : 'text-slate-800'}>
                  {insp.pestPresence}
                </strong>
              </div>
              <div>
                Disease Status:{' '}
                <strong className={insp.diseasePresence !== 'None' ? 'text-rose-700' : 'text-slate-800'}>
                  {insp.diseasePresence}
                </strong>
              </div>
              <div>
                Drainage: <strong className="text-slate-800">{insp.drainageStatus}</strong>
              </div>
              <div>
                Road Condition: <strong className="text-slate-800">{insp.roadStatus}</strong>
              </div>
              <div>
                PPE Safety: <strong className="text-slate-800">{insp.workerSafetyPPE}</strong>
              </div>
              <div>
                Equipment: <strong className="text-slate-800">{insp.equipmentCondition}</strong>
              </div>
            </div>

            {/* Recommendations & Photo */}
            <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-xs text-slate-700">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Recommendations:</strong>
              <p className="italic">{insp.recommendations}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conduct Inspection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Conduct Farm Block Inspection Form</span>
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
                  <label className="block font-medium text-slate-700 mb-1">Target Block</label>
                  <select
                    value={blockId}
                    onChange={(e) => setBlockId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Inspector Name</label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Star Ratings */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">General Condition (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={generalScore}
                    onChange={(e) => setGeneralScore(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Palm Health (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={palmHealthScore}
                    onChange={(e) => setPalmHealthScore(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Weed Control (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={weedScore}
                    onChange={(e) => setWeedScore(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pest Presence</label>
                  <select
                    value={pestPresence}
                    onChange={(e) => setPestPresence(e.target.value as FarmInspection['pestPresence'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    <option value="None">None</option>
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Disease Presence</label>
                  <select
                    value={diseasePresence}
                    onChange={(e) => setDiseasePresence(e.target.value as FarmInspection['diseasePresence'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    <option value="None">None</option>
                    <option value="Ganoderma">Ganoderma</option>
                    <option value="Crown Rot">Crown Rot</option>
                    <option value="Orange Spotting">Orange Spotting</option>
                    <option value="Spear Rot">Spear Rot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Drainage</label>
                  <select
                    value={drainageStatus}
                    onChange={(e) => setDrainageStatus(e.target.value as FarmInspection['drainageStatus'])}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Good">Good</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Needs Clearing">Needs Clearing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Road Condition</label>
                  <select
                    value={roadStatus}
                    onChange={(e) => setRoadStatus(e.target.value as FarmInspection['roadStatus'])}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Passable">Passable</option>
                    <option value="Needs Grading">Needs Grading</option>
                    <option value="Flooded">Flooded</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">PPE Compliance</label>
                  <select
                    value={workerSafetyPPE}
                    onChange={(e) => setWorkerSafetyPPE(e.target.value as FarmInspection['workerSafetyPPE'])}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Minor Violations">Minor Violations</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Recommendations & Field Action Notes</label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Record frond pruning standard, road grading request, or chemical spraying."
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
                Submit Inspection Audit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
