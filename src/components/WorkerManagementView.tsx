import React, { useState, useMemo } from 'react';
import { Worker, AttendanceRecord, FarmBlock, UserRole, DailyWorkReport } from '../types';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarCheck,
  Phone,
  Briefcase,
  Layers,
  X,
  UserCheck,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ClipboardList,
  Compass,
  Filter,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

interface WorkerManagementViewProps {
  workers: Worker[];
  attendance: AttendanceRecord[];
  blocks: FarmBlock[];
  dailyReports?: DailyWorkReport[];
  currentRole: UserRole;
  onAddWorker: (worker: Worker) => void;
  onUpdateAttendance: (attendance: AttendanceRecord[]) => void;
}

export const WorkerManagementView: React.FC<WorkerManagementViewProps> = ({
  workers = [],
  attendance = [],
  blocks = [],
  dailyReports = [],
  currentRole,
  onAddWorker,
  onUpdateAttendance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'attendance'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // Add Worker Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Worker['role']>('Harvester');
  const [newBlockId, setNewBlockId] = useState('BLK-01');
  const [newRate, setNewRate] = useState(45.0);

  // Today Date for Attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const safeWorkers = workers || [];
  const safeAttendance = attendance || [];
  const safeBlocks = blocks || [];
  const safeDailyReports = dailyReports || [];

  // Helper to derive Sector for a given block ID
  const getSectorForBlock = (blockId: string) => {
    const num = parseInt(blockId?.replace(/\D/g, '') || '0', 10);
    if (num >= 1 && num <= 5) return 'North Sector (BLK 01–05)';
    if (num >= 6 && num <= 10) return 'East Sector (BLK 06–10)';
    if (num >= 11 && num <= 15) return 'South Sector (BLK 11–15)';
    if (num >= 16 && num <= 20) return 'West Sector (BLK 16–20)';
    return 'Estate Sector';
  };

  const filteredWorkers = useMemo(() => {
    return safeWorkers.filter((w) => {
      if (!w) return false;
      const matchesSearch =
        (w.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (w.workerId || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (w.phone || '').includes(searchQuery);

      const matchesRole = roleFilter === 'all' || w.role === roleFilter;
      const matchesBlock = blockFilter === 'all' || w.assignedBlockId === blockFilter;

      return matchesSearch && matchesRole && matchesBlock;
    });
  }, [safeWorkers, searchQuery, roleFilter, blockFilter]);

  // Attendance metrics for selected date
  const attendanceMetrics = useMemo(() => {
    const dateRecords = safeAttendance.filter((a) => a.date === selectedDate);
    const presentCount = dateRecords.filter((a) => a.status === 'Present').length;
    const lateCount = dateRecords.filter((a) => a.status === 'Late').length;
    const leaveCount = dateRecords.filter((a) => a.status === 'On Leave').length;
    const absentCount = dateRecords.filter((a) => a.status === 'Absent').length;
    const recordedTotal = dateRecords.length;
    const attendanceRate =
      safeWorkers.length > 0
        ? Math.round(((presentCount + lateCount) / safeWorkers.length) * 100)
        : 0;

    return { presentCount, lateCount, leaveCount, absentCount, recordedTotal, attendanceRate };
  }, [safeAttendance, selectedDate, safeWorkers]);

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `WRK-${(safeWorkers.length + 1).toString().padStart(3, '0')}`;
    const newWorker: Worker = {
      id: nextId,
      workerId: `PALM-W${(safeWorkers.length + 1).toString().padStart(2, '0')}`,
      name: newName,
      phone: newPhone || '+60 12-345 6000',
      role: newRole,
      assignedBlockId: newBlockId,
      employmentStatus: 'Active',
      joinedDate: todayStr,
      dailyRate: Number(newRate),
    };

    onAddWorker(newWorker);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
  };

  const handleToggleAttendance = (worker: Worker, newStatus: AttendanceRecord['status']) => {
    const existingIndex = safeAttendance.findIndex(
      (a) => a.workerId === worker.id && a.date === selectedDate
    );

    let updatedList = [...safeAttendance];
    if (existingIndex >= 0) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        status: newStatus,
        checkInTime: newStatus === 'Present' ? '06:30 AM' : newStatus === 'Late' ? '07:15 AM' : undefined,
      };
    } else {
      updatedList.push({
        id: `ATT-${Date.now()}`,
        date: selectedDate,
        workerId: worker.id,
        workerName: worker.name,
        status: newStatus,
        checkInTime: newStatus === 'Present' ? '06:30 AM' : newStatus === 'Late' ? '07:15 AM' : undefined,
        assignedBlockId: worker.assignedBlockId,
      });
    }

    onUpdateAttendance(updatedList);
  };

  // Recent work logs for selected worker
  const selectedWorkerReports = useMemo(() => {
    if (!selectedWorker) return [];
    const name = selectedWorker.name.toLowerCase();
    const id = selectedWorker.id;
    const workerCode = selectedWorker.workerId?.toLowerCase();

    return safeDailyReports
      .filter((r) => {
        if (!r) return false;
        const rWorker = (r.workerName || '').toLowerCase();
        const rId = r.workerId;
        return (
          rWorker === name ||
          rId === id ||
          (workerCode && rWorker.includes(workerCode)) ||
          r.assignedBlockId === selectedWorker.assignedBlockId
        );
      })
      .slice(0, 5);
  }, [selectedWorker, safeDailyReports]);

  // Selected worker's attendance history
  const selectedWorkerAttendance = useMemo(() => {
    if (!selectedWorker) return [];
    return safeAttendance
      .filter((a) => a && (a.workerId === selectedWorker.id || a.workerName === selectedWorker.name))
      .slice(-5);
  }, [selectedWorker, safeAttendance]);

  return (
    <div className="space-y-6">
      {/* 1. Header Controls & Sub-tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/95 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30 uppercase tracking-widest font-mono">
              Workforce Operations
            </span>
            <span className="text-xs text-slate-400 font-medium">{safeWorkers.length} Active Personnel</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display mt-1">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Field Labor & Worker Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Estate Roster • Duty Assignments • Real-Time Daily Attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeSubTab === 'directory'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Worker Directory
            </button>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeSubTab === 'attendance'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Attendance Logger
            </button>
          </div>

          {(currentRole === 'Admin' || currentRole === 'Manager' || currentRole === 'Supervisor') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Worker</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Directory Tab */}
      {activeSubTab === 'directory' ? (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search worker name, ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-800 text-slate-300 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Roles & Trades</option>
              <option value="Harvester">Harvester</option>
              <option value="Pruner">Pruner</option>
              <option value="Sprayer">Sprayer</option>
              <option value="Tractor Driver">Tractor Driver</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Field Worker">Field Worker</option>
            </select>

            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-800 text-slate-300 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Assigned Blocks</option>
              {safeBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} - {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => {
              const sectorName = getSectorForBlock(worker.assignedBlockId);
              const initials = (worker.name || 'W')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={worker.id}
                  onClick={() => setSelectedWorker(worker)}
                  className="bg-slate-900/95 p-4 rounded-2xl border border-slate-800 shadow-md hover:border-emerald-500/70 transition-all space-y-3 cursor-pointer group hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30 font-mono">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {worker.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">{worker.workerId}</span>
                      </div>
                    </div>

                    <StatusBadge
                      label={worker.employmentStatus}
                      variant={worker.employmentStatus === 'Active' ? 'optimal' : 'warning'}
                      size="sm"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Role:
                      </span>
                      <span className="font-semibold text-slate-200">{worker.role}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-slate-500" /> Assigned:
                      </span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {worker.assignedBlockId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Compass className="w-3.5 h-3.5 text-slate-500" /> Sector:
                      </span>
                      <span className="text-slate-300 text-[11px] truncate max-w-[140px]">
                        {sectorName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-500" /> Contact:
                      </span>
                      <span className="font-mono text-slate-300 text-[11px]">{worker.phone}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400 text-[11px]">Daily Wage:</span>
                      <span className="font-bold text-emerald-400 font-mono text-xs">
                        ${worker.dailyRate?.toFixed(2)}/day
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span className="font-mono text-[10px]">Joined: {worker.joinedDate}</span>
                    <span className="text-emerald-400 font-medium group-hover:underline flex items-center">
                      View Profile <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. Attendance Logger Tab */
        <div className="bg-slate-900/95 rounded-2xl shadow-md border border-slate-800 p-5 space-y-4">
          {/* Header & Date Picker */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>Daily Attendance Roster & Check-In Logger</span>
              </h3>
              <p className="text-xs text-slate-400">Record on-duty attendance, late arrivals, approved leave, or absences</p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-300">Roster Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs p-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Attendance KPI Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Present (On-Duty)</span>
              <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {attendanceMetrics.presentCount}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Late Arrival</span>
              <p className="text-base font-bold text-amber-400 font-mono mt-0.5">
                {attendanceMetrics.lateCount}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">On Approved Leave</span>
              <p className="text-base font-bold text-sky-400 font-mono mt-0.5">
                {attendanceMetrics.leaveCount}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Absent</span>
              <p className="text-base font-bold text-rose-400 font-mono mt-0.5">
                {attendanceMetrics.absentCount}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Attendance Rate</span>
              <p className="text-base font-bold text-slate-100 font-mono mt-0.5">
                {attendanceMetrics.attendanceRate}%
              </p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="p-3.5">Worker Info</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Assigned Block</th>
                  <th className="p-3.5">Today Status</th>
                  <th className="p-3.5 text-right">Log Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {safeWorkers.map((worker) => {
                  const record = safeAttendance.find(
                    (a) => a.workerId === worker.id && a.date === selectedDate
                  );
                  const currentStatus = record?.status || 'Present';

                  return (
                    <tr
                      key={worker.id}
                      onClick={() => setSelectedWorker(worker)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-white">{worker.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{worker.workerId}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">{worker.role}</td>
                      <td className="p-3.5 font-semibold text-emerald-400 font-mono">
                        {worker.assignedBlockId}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge
                          label={`${currentStatus}${record?.checkInTime ? ` (${record.checkInTime})` : ''}`}
                          variant={
                            currentStatus === 'Present'
                              ? 'optimal'
                              : currentStatus === 'Late'
                              ? 'warning'
                              : currentStatus === 'On Leave'
                              ? 'pending'
                              : 'critical'
                          }
                          size="sm"
                        />
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex rounded-xl shadow-sm bg-slate-950 p-1 space-x-1 border border-slate-800">
                          <button
                            onClick={() => handleToggleAttendance(worker, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(worker, 'Late')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              currentStatus === 'Late'
                                ? 'bg-amber-600 text-white font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(worker, 'On Leave')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              currentStatus === 'On Leave'
                                ? 'bg-sky-600 text-white font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            Leave
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(worker, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            Absent
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
      )}

      {/* 4. Interactive Worker Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-700 overflow-y-auto text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border-b border-slate-700 flex justify-between items-start sticky top-0 z-10">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-base border border-emerald-500/30 font-mono shadow-inner">
                  {(selectedWorker.name || 'W')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white font-display">
                      {selectedWorker.name}
                    </h3>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                      {selectedWorker.workerId}
                    </span>
                    <StatusBadge
                      label={selectedWorker.employmentStatus}
                      variant={selectedWorker.employmentStatus === 'Active' ? 'optimal' : 'warning'}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedWorker.role} • Assigned to <strong>{selectedWorker.assignedBlockId}</strong> ({getSectorForBlock(selectedWorker.assignedBlockId)})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Worker Profile Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Designation / Role</span>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedWorker.role}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Field Labor</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Block</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedWorker.assignedBlockId}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {getSectorForBlock(selectedWorker.assignedBlockId).split('(')[0]}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Daily Wage Rate</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    ${selectedWorker.dailyRate?.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Per Standard Shift</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Enrollment Date</span>
                  <p className="text-sm font-mono text-slate-200 mt-0.5">{selectedWorker.joinedDate}</p>
                  <span className="text-[10px] text-slate-500">Registered Staff</span>
                </div>
              </div>

              {/* Contact & Station Details */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">
                  Personnel Information & Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center space-x-2 text-slate-200">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono">{selectedWorker.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-200">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs">{getSectorForBlock(selectedWorker.assignedBlockId)}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Log History for this Worker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    <span>Attendance Records ({selectedWorker.name})</span>
                  </span>
                </div>

                {selectedWorkerAttendance.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedWorkerAttendance.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2.5 bg-slate-950/70 rounded-xl text-[11px] border border-slate-800 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300">{rec.date}</span>
                          {rec.checkInTime && (
                            <span className="text-slate-500 font-mono text-[10px]">
                              @ {rec.checkInTime}
                            </span>
                          )}
                        </div>
                        <StatusBadge
                          label={rec.status}
                          variant={
                            rec.status === 'Present'
                              ? 'optimal'
                              : rec.status === 'Late'
                              ? 'warning'
                              : rec.status === 'On Leave'
                              ? 'pending'
                              : 'critical'
                          }
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/50 rounded-xl text-[11px] text-slate-400 border border-slate-800 text-center">
                    No specific attendance entries recorded yet for this worker.
                  </div>
                )}
              </div>

              {/* Recent Work Activity from Daily Reports */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    <span>Recent Work Activity & Logs</span>
                  </span>
                </div>

                {selectedWorkerReports.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedWorkerReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-2.5 bg-slate-950/70 rounded-xl text-[11px] border border-slate-800 flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-white">{report.taskPerformed}</strong>
                          <span className="text-slate-400 ml-2 font-mono text-[10px]">
                            Block {report.assignedBlockId}
                          </span>
                          <p className="text-slate-400 text-[10px] font-mono">{report.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-emerald-300 font-bold">
                            {report.quantityCompleted} {report.unit}
                          </span>
                          <StatusBadge
                            label={report.supervisorApproval}
                            variant={report.supervisorApproval === 'Approved' ? 'optimal' : 'warning'}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/50 rounded-xl text-[11px] text-slate-400 border border-slate-800 text-center">
                    No recent specific field logs associated with {selectedWorker.name}.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Worker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateWorker}
            className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden space-y-4 p-6 text-white animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Register New Farm Worker</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Full Worker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adewale"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+60 12-345 6789"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Primary Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Worker['role'])}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Harvester">Harvester</option>
                    <option value="Pruner">Pruner</option>
                    <option value="Sprayer">Sprayer</option>
                    <option value="Tractor Driver">Tractor Driver</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Field Worker">Field Worker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Assigned Block</label>
                  <select
                    value={newBlockId}
                    onChange={(e) => setNewBlockId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {safeBlocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Daily Wage Rate ($)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-md cursor-pointer"
              >
                Complete Registration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
