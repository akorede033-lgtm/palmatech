import React, { useState } from 'react';
import { DailyWorkReport, Worker, FarmBlock, InventoryItem, UserRole } from '../types';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  AlertCircle,
  FileCheck,
  Search,
  X,
  Layers,
  UserCheck,
} from 'lucide-react';

interface DailyReportViewProps {
  reports: DailyWorkReport[];
  workers: Worker[];
  blocks: FarmBlock[];
  inventory: InventoryItem[];
  currentRole: UserRole;
  onSubmitReport: (report: DailyWorkReport) => void;
  onApproveReport: (reportId: string, status: 'Approved' | 'Rejected', approverName: string) => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  reports = [],
  workers = [],
  blocks = [],
  inventory = [],
  currentRole,
  onSubmitReport,
  onApproveReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Form Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [workerId, setWorkerId] = useState(workers[0]?.id || '');
  const [blockId, setBlockId] = useState('BLK-01');
  const [taskPerformed, setTaskPerformed] = useState<DailyWorkReport['taskPerformed']>('Harvesting & Collecting');
  const [description, setDescription] = useState('');
  const [quantityCompleted, setQuantityCompleted] = useState<number>(4.5);
  const [unit, setUnit] = useState('Tonnes FFB');
  const [hoursWorked, setHoursWorked] = useState<number>(7.5);
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQty, setMaterialQty] = useState(10);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1592417817098-8f3d6eb1626f?w=600&auto=format&fit=crop');

  const safeReports = reports || [];
  const safeWorkers = workers || [];
  const safeBlocks = blocks || [];
  const safeInventory = inventory || [];

  const filteredReports = safeReports.filter((r) => {
    if (!r) return false;
    const matchesSearch =
      (r.workerName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (r.blockId || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (r.taskPerformed || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || (r.supervisorApproval || '').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWorkerObj = workers.find((w) => w.id === workerId) || workers[0];

    const materialsUsed = selectedMaterialId
      ? [
          {
            itemId: selectedMaterialId,
            name: inventory.find((i) => i.id === selectedMaterialId)?.name || 'Material',
            quantity: Number(materialQty),
            unit: inventory.find((i) => i.id === selectedMaterialId)?.unit || 'Units',
          },
        ]
      : undefined;

    const newReport: DailyWorkReport = {
      id: `DWR-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      workerId: selectedWorkerObj.id,
      workerName: selectedWorkerObj.name,
      blockId,
      taskPerformed,
      description,
      quantityCompleted: Number(quantityCompleted),
      unit,
      hoursWorked: Number(hoursWorked),
      problemsEncountered: problemsEncountered || undefined,
      materialsUsed,
      photoEvidenceUrl: photoUrl || undefined,
      supervisorApproval: 'Pending',
      submittedAt: new Date().toISOString(),
    };

    onSubmitReport(newReport);
    setIsSubmitModalOpen(false);
    setDescription('');
    setProblemsEncountered('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <span>Daily Work Reports & Field Log</span>
          </h2>
          <p className="text-xs text-slate-500">
            Field worker task logs, completed output quantities, and supervisor approval workflow
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Approval Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Daily Report</span>
          </button>
        </div>
      </div>

      {/* Reports Roster Cards */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-emerald-300 transition-all flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  Block {report.blockId}
                </span>
                <span className="text-xs font-bold text-slate-900">{report.taskPerformed}</span>
                <span className="text-[11px] text-slate-400">• {report.date}</span>

                <span
                  className={`ml-auto px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    report.supervisorApproval === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : report.supervisorApproval === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {report.supervisorApproval === 'Approved' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : report.supervisorApproval === 'Rejected' ? (
                    <XCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3 animate-spin" />
                  )}
                  {report.supervisorApproval}
                </span>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "{report.description}"
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div>
                  Worker: <strong className="text-slate-900">{report.workerName}</strong>
                </div>
                <div>
                  Quantity Completed:{' '}
                  <strong className="text-emerald-700 font-bold">
                    {report.quantityCompleted} {report.unit}
                  </strong>
                </div>
                <div>
                  Hours Worked: <strong>{report.hoursWorked} hrs</strong>
                </div>
              </div>

              {report.problemsEncountered && (
                <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Problem Noticed:</strong> {report.problemsEncountered}
                  </span>
                </div>
              )}

              {report.materialsUsed && report.materialsUsed.length > 0 && (
                <div className="text-xs text-slate-500">
                  Materials Used:{' '}
                  {report.materialsUsed.map((m) => `${m.quantity} ${m.unit} of ${m.name}`).join(', ')}
                </div>
              )}
            </div>

            {/* Photo Evidence & Approval Action Column */}
            <div className="flex flex-col sm:flex-row md:flex-col justify-between items-end gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
              {report.photoEvidenceUrl && (
                <div className="relative group">
                  <img
                    src={report.photoEvidenceUrl}
                    alt="Work Photo Evidence"
                    className="w-24 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <span className="text-[9px] bg-slate-900/80 text-white px-1.5 py-0.5 rounded absolute bottom-1 right-1 flex items-center gap-0.5">
                    <Camera className="w-2.5 h-2.5" /> Photo
                  </span>
                </div>
              )}

              {/* Approval Actions for Supervisors / Managers */}
              {report.supervisorApproval === 'Pending' &&
                (currentRole === 'Supervisor' || currentRole === 'Manager' || currentRole === 'Admin') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onApproveReport(report.id, 'Rejected', 'Field Supervisor')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded border border-rose-200 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApproveReport(report.id, 'Approved', 'Field Supervisor')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-sm cursor-pointer"
                    >
                      Approve Work
                    </button>
                  </div>
                )}

              {report.supervisorApproval === 'Approved' && (
                <div className="text-[11px] text-slate-400 text-right">
                  Approved by <strong className="text-slate-700">{report.approvedBy || 'Supervisor'}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Work Report Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Submit Field Work Report</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Worker</label>
                  <select
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Block</label>
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
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Task Performed</label>
                <select
                  value={taskPerformed}
                  onChange={(e) => setTaskPerformed(e.target.value as DailyWorkReport['taskPerformed'])}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                >
                  <option value="Harvesting & Collecting">Harvesting & Collecting</option>
                  <option value="Frond Pruning">Frond Pruning (1-Frond Rule)</option>
                  <option value="Circle & Path Spraying">Circle & Path Spraying</option>
                  <option value="Manuring / Fertilizing">Manuring / Fertilizing</option>
                  <option value="Loose Fruit Collection">Loose Fruit Collection</option>
                  <option value="Drainage Maintenance">Drainage Maintenance</option>
                  <option value="Weed Control">Weed Control</option>
                  <option value="Road Upkeep">Road Upkeep</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Work Description & Rows Covered</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Harvested mature bunches in Rows 1 to 14. Collected loose fruit."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quantityCompleted}
                    onChange={(e) => setQuantityCompleted(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tonnes FFB">Tonnes FFB</option>
                    <option value="Bags (50kg)">Bags (50kg)</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Palms">Palms</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Problems Encountered (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Heavy undergrowth, damaged frond, or broken harvesting pole"
                  value={problemsEncountered}
                  onChange={(e) => setProblemsEncountered(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Material Usage */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Material Used (Optional)</label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">None</option>
                    {inventory.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMaterialId && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Qty Used</label>
                    <input
                      type="number"
                      value={materialQty}
                      onChange={(e) => setMaterialQty(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Photo Evidence Image URL</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold shadow cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
