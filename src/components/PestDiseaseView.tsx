import React, { useState } from 'react';
import { PestDiseaseReport, FarmBlock, UserRole } from '../types';
import {
  Bug,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Camera,
  Layers,
  Activity,
  Shield,
} from 'lucide-react';

interface PestDiseaseViewProps {
  reports: PestDiseaseReport[];
  blocks: FarmBlock[];
  currentRole: UserRole;
  onAddReport: (report: PestDiseaseReport) => void;
  onUpdateStatus: (id: string, status: PestDiseaseReport['status']) => void;
  onOpenAIAgronomist: (promptContext?: string) => void;
}

export const PestDiseaseView: React.FC<PestDiseaseViewProps> = ({
  reports = [],
  blocks = [],
  currentRole,
  onAddReport,
  onUpdateStatus,
  onOpenAIAgronomist,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Form State
  const [blockId, setBlockId] = useState('BLK-05');
  const [reportedBy, setReportedBy] = useState('Eko Prasetyo (Worker)');
  const [pestType, setPestType] = useState<PestDiseaseReport['pestDiseaseType']>('Bagworms (Metisa plana)');
  const [severity, setSeverity] = useState<PestDiseaseReport['severity']>('High');
  const [affectedAreaHa, setAffectedAreaHa] = useState<number>(3.5);
  const [affectedTreesCount, setAffectedTreesCount] = useState<number>(480);
  const [description, setDescription] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1595123550441-d377e017de6a?w=600&auto=format&fit=crop');

  const safeReports = reports || [];
  const safeBlocks = blocks || [];

  const filteredReports = safeReports.filter((r) => {
    if (!r) return false;
    const matchesSearch =
      (r.blockId || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (r.pestDiseaseType || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (r.reportedBy || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || (r.severity || '').toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: PestDiseaseReport = {
      id: `PST-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      blockId,
      reportedBy,
      pestDiseaseType: pestType,
      severity,
      affectedAreaHa: Number(affectedAreaHa),
      affectedTreesCount: Number(affectedTreesCount),
      description: description || 'Visual signs of foliage destruction and larval casing noted on lower fronds.',
      photoUrl: photoUrl || undefined,
      recommendedAction:
        recommendedAction || 'Deploy chemical trunk injection or biological parasitoid wasp release immediately.',
      status: 'Reported',
    };

    onAddReport(newReport);
    setIsAddModalOpen(false);
    setDescription('');
    setRecommendedAction('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-600" />
            <span>Pest & Disease Outbreak Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Integrated Pest Management (IPM), Bagworm monitoring, Ganoderma tracking, and treatment status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search pest reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Reports Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className={`p-5 rounded-xl border shadow-sm transition-all space-y-4 ${
              report.severity === 'Critical'
                ? 'bg-rose-950/5 border-rose-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold font-mono rounded">
                    Block {report.blockId}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{report.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{report.pestDiseaseType}</h3>
                <span className="text-xs text-slate-500">Reported by: {report.reportedBy}</span>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    report.severity === 'Critical'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : report.severity === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {report.severity} Severity
                </span>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    report.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : report.status === 'In Treatment'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </div>

            {/* Impact Details */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
              <div>
                Affected Land Area: <strong className="text-slate-800">{report.affectedAreaHa} Ha</strong>
              </div>
              <div>
                Affected Tree Count: <strong className="text-slate-800">{report.affectedTreesCount} Palms</strong>
              </div>
            </div>

            <p className="text-xs text-slate-700">{report.description}</p>

            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs text-rose-900 space-y-1">
              <span className="font-bold block text-rose-950 uppercase tracking-wider text-[10px]">
                Recommended IPM Action:
              </span>
              <p>{report.recommendedAction}</p>
            </div>

            {/* Status Change & AI Diagnostic Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() =>
                  onOpenAIAgronomist(
                    `Pest incident reported in Block ${report.blockId}: ${report.pestDiseaseType} with ${report.severity} severity affecting ${report.affectedAreaHa} hectares. What is the recommended treatment protocol, chemical dosage, and safety delay for harvesting?`
                  )
                }
                className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI Treatment Advisor</span>
              </button>

              <div className="flex items-center space-x-1.5">
                {report.status !== 'Resolved' && (
                  <button
                    onClick={() =>
                      onUpdateStatus(
                        report.id,
                        report.status === 'Reported' ? 'In Treatment' : 'Resolved'
                      )
                    }
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] cursor-pointer"
                  >
                    Mark {report.status === 'Reported' ? 'In Treatment' : 'Resolved'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Incident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Log Pest or Disease Outbreak</span>
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
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  >
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Reported By</label>
                  <input
                    type="text"
                    required
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pest / Disease Type</label>
                  <select
                    value={pestType}
                    onChange={(e) => setPestType(e.target.value as PestDiseaseReport['pestDiseaseType'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  >
                    <option value="Bagworms (Metisa plana)">Bagworms (Metisa plana)</option>
                    <option value="Rhinoceros Beetle (Oryctes)">Rhinoceros Beetle (Oryctes)</option>
                    <option value="Ganoderma Basal Stem Rot">Ganoderma Basal Stem Rot</option>
                    <option value="Rats (Rattus tiomanicus)">Rats (Rattus tiomanicus)</option>
                    <option value="Tirathaba Bunch Moth">Tirathaba Bunch Moth</option>
                    <option value="Nettle Caterpillars">Nettle Caterpillars</option>
                    <option value="Crown Rot">Crown Rot</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as PestDiseaseReport['severity'])}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Affected Area (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={affectedAreaHa}
                    onChange={(e) => setAffectedAreaHa(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Affected Palms Count</label>
                  <input
                    type="number"
                    required
                    value={affectedTreesCount}
                    onChange={(e) => setAffectedTreesCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Symptoms Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe frond defoliation %, larval cases per frond, or conks at palm base."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Recommended Action</label>
                <input
                  type="text"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  placeholder="e.g. Trunk injection with Acephate or sanitary trenching"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-rose-500"
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
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold shadow cursor-pointer"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
