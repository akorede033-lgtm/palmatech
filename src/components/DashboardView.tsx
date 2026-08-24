import React from 'react';
import {
  FarmBlock,
  Worker,
  AttendanceRecord,
  DailyWorkReport,
  PestDiseaseReport,
  HarvestRecord,
  ExpenseRecord,
  Equipment,
  UserRole,
  NavTab,
} from '../types';
import {
  Trees,
  Users,
  AlertTriangle,
  Tractor,
  DollarSign,
  ClipboardCheck,
  Bug,
  Plus,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Activity,
  ChevronRight,
  TrendingUp,
  MapPin,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Leaf,
} from 'lucide-react';
import { MetricKpiCard } from './ui/MetricKpiCard';
import { StatusBadge } from './ui/StatusBadge';

interface DashboardViewProps {
  blocks: FarmBlock[];
  workers: Worker[];
  attendance: AttendanceRecord[];
  dailyReports: DailyWorkReport[];
  pestReports: PestDiseaseReport[];
  harvests: HarvestRecord[];
  expenses: ExpenseRecord[];
  equipment?: Equipment[];
  inspections?: any[];
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
  onOpenAIAgronomist: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  blocks = [],
  workers = [],
  attendance = [],
  dailyReports = [],
  pestReports = [],
  harvests = [],
  expenses = [],
  equipment = [],
  inspections = [],
  currentRole,
  onNavigate,
  onOpenAIAgronomist,
}) => {
  // Safe array derivations
  const safeBlocks = blocks || [];
  const safeWorkers = workers || [];
  const safeAttendance = attendance || [];
  const safeDailyReports = dailyReports || [];
  const safePestReports = pestReports || [];
  const safeHarvests = harvests || [];
  const safeExpenses = expenses || [];
  const safeEquipment = equipment || [];

  // Metric Computations
  const totalAreaHa = safeBlocks.reduce((sum, b) => sum + (b?.areaHa || 0), 0) || 500.0;
  const totalBlocks = safeBlocks.length || 20;
  const totalWorkers = safeWorkers.length || 48;

  const presentCount = safeAttendance.filter((a) => a && a.status === 'Present').length;
  const attendanceRate = totalWorkers > 0 ? Math.round((presentCount / totalWorkers) * 100) : 92;

  const pendingReports = safeDailyReports.filter((r) => r && r.supervisorApproval === 'Pending');
  const completedReportsToday = safeDailyReports.filter((r) => r && r.supervisorApproval === 'Approved');

  const criticalPests = safePestReports.filter((p) => p && (p.severity === 'Critical' || p.severity === 'High'));
  const activePests = safePestReports.filter((p) => p && p.status !== 'Resolved');

  const totalHarvestMonth = safeHarvests.reduce((sum, h) => sum + (h?.quantityTonnes || 0), 0);
  const targetHarvestMonth = 1050.0;
  const harvestPct = Math.min(100, Math.round((totalHarvestMonth / targetHarvestMonth) * 100));

  const totalExpensesMonth = safeExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0);
  const costPerHectare = totalAreaHa > 0 ? (totalExpensesMonth / totalAreaHa).toFixed(2) : '0.00';

  // Farm Health Composite Index Calculation
  const pestClearRate = safeBlocks.length > 0 ? Math.round(((safeBlocks.length - activePests.length) / safeBlocks.length) * 100) : 90;
  const inspectionPassRate = safeBlocks.length > 0 ? Math.round((safeBlocks.filter((b) => b?.inspectionStatus === 'Passed').length / safeBlocks.length) * 100) : 90;
  const compositeFarmHealth = Math.round(pestClearRate * 0.4 + inspectionPassRate * 0.3 + harvestPct * 0.3);

  // Machinery fleet health
  const activeEquipmentCount = safeEquipment.filter((e) => e && e.currentStatus === 'Active').length;
  const maintenanceEquipmentCount = safeEquipment.filter((e) => e && (e.currentStatus === 'Under Maintenance' || e.currentStatus === 'Needs Repair')).length;

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Estate Executive Deck Header (Figma V2) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30 uppercase tracking-widest font-mono">
                Executive Plantation Deck
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5 font-display">
              Commercial Palm Plantation <span className="text-emerald-400 font-light">(500.0 Ha)</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5 font-normal">
              <span>Active Role: <strong className="text-emerald-300 font-semibold">{currentRole}</strong></span>
              <span className="text-slate-600">•</span>
              <span>20 Farm Blocks (25 Ha Each)</span>
              <span className="text-slate-600">•</span>
              <span>Avg Stand Density <strong className="text-slate-200 font-mono">~138 Palms/Ha</strong></span>
              <span className="text-slate-600">•</span>
              <span>Monthly Target <strong className="text-emerald-400 font-mono">1,050 MT FFB</strong></span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('daily_reports')}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Daily Report</span>
            </button>

            <button
              onClick={() => onNavigate('harvest')}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Tractor className="w-4 h-4 text-emerald-400" />
              <span>Record Harvest</span>
            </button>

            <button
              onClick={onOpenAIAgronomist}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Ask AI Agronomist</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Farm Health Indicators Bar (Figma V2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Composite Farm Health */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Farm Health Index</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{compositeFarmHealth}% Optimal</div>
          </div>
          <div className="p-2.5 bg-emerald-950/80 rounded-xl border border-emerald-800/40 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* Pest Clearance Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pest Clearance Rate</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {pestClearRate}% <span className="text-xs font-normal text-slate-400">({activePests.length} Active)</span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-950/80 rounded-xl border border-rose-800/40 text-rose-400">
            <Bug className="w-4 h-4" />
          </div>
        </div>

        {/* Inspection Compliance */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inspection Passed</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {safeBlocks.filter((b) => b?.inspectionStatus === 'Passed').length} / {totalBlocks} <span className="text-xs font-normal text-slate-400">Blocks</span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-950/80 rounded-xl border border-blue-800/40 text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Harvest Target Pacing */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harvest Pacing</span>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {harvestPct}% <span className="text-xs font-normal text-slate-400">of 1,050 MT</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-950/80 rounded-xl border border-amber-800/40 text-amber-400">
            <Tractor className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Severity Hierarchy Alerts: Critical Outbreaks vs Warning Alerts (Figma V2) */}
      <div className="space-y-3">
        {/* Critical Pest/Disease Alert Banner */}
        {criticalPests.length > 0 && (
          <div className="bg-rose-950/90 border border-rose-700/80 rounded-2xl p-4 text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/30">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-rose-900 rounded-xl text-rose-200 flex-shrink-0 mt-0.5 border border-rose-700/50">
                <AlertTriangle className="w-5 h-5 animate-pulse text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-rose-100 uppercase tracking-wider font-display">
                    Critical Alert: {criticalPests.length} Severe Pest / Disease Outbreak Detected
                  </h3>
                  <StatusBadge label="CRITICAL" variant="critical" size="sm" />
                </div>
                <p className="text-xs text-rose-200/90 mt-1">
                  {criticalPests[0].pestDiseaseType} detected in Block {criticalPests[0].blockId} affecting {criticalPests[0].affectedAreaHa} Ha ({criticalPests[0].affectedTreesCount} palms). Immediate targeted IPM spraying required.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('pest_disease')}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-sm whitespace-nowrap self-end sm:self-center cursor-pointer transition-colors"
            >
              View IPM Action Plan &rarr;
            </button>
          </div>
        )}

        {/* Warning Alert Banner (Pending Approvals or Machinery Maintenance) */}
        {pendingReports.length > 0 && (
          <div className="bg-amber-950/70 border border-amber-700/60 rounded-2xl p-3.5 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-900/80 rounded-xl text-amber-300 border border-amber-700/50">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-200 uppercase tracking-wider font-display">
                    Operational Notice: {pendingReports.length} Daily Work Reports Awaiting Verification
                  </span>
                  <StatusBadge label="ACTION PENDING" variant="warning" size="sm" />
                </div>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Field supervisors must inspect and sign off on completed harvesting and weeding tasks.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('daily_reports')}
              className="px-3.5 py-1.5 bg-amber-700/80 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm whitespace-nowrap self-end sm:self-center cursor-pointer transition-colors"
            >
              Review Reports
            </button>
          </div>
        )}
      </div>

      {/* 4. Primary 4-Card KPI Metric Grid (Figma V2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Farm Area & 20 Blocks */}
        <MetricKpiCard
          title="Estate Land Structure"
          value={totalAreaHa.toFixed(1)}
          unit="Ha"
          subtitle={`${totalBlocks} Blocks • 25 Ha Module`}
          icon={Trees}
          iconColorClass="text-emerald-400"
          iconBgClass="bg-emerald-950/80 border-emerald-800/40"
          actionText="Grid Map"
          onClick={() => onNavigate('blocks')}
          trend={{ text: '100% Commercial Density (~138 palms/ha)', isPositive: true }}
        />

        {/* Field Labor Force & Attendance */}
        <MetricKpiCard
          title="Field Labor Force"
          value={totalWorkers}
          unit="Personnel"
          subtitle={`Present Today: ${attendanceRate}% (${presentCount} workers)`}
          icon={Users}
          iconColorClass="text-blue-400"
          iconBgClass="bg-blue-950/80 border-blue-800/40"
          actionText="Roster"
          onClick={() => onNavigate('workers')}
          progressPercent={attendanceRate}
          progressColorClass="bg-blue-500"
          trend={{ text: `${presentCount} active in field today`, isPositive: attendanceRate >= 85 }}
        />

        {/* FFB Harvest Yield Month */}
        <MetricKpiCard
          title="FFB Harvest Yield"
          value={totalHarvestMonth.toFixed(1)}
          unit="MT"
          subtitle={`Target: 1,050.0 MT (${harvestPct}% Achieved)`}
          icon={Tractor}
          iconColorClass="text-amber-400"
          iconBgClass="bg-amber-950/80 border-amber-800/40"
          actionText="Dispatch"
          onClick={() => onNavigate('harvest')}
          progressPercent={harvestPct}
          progressColorClass="bg-amber-500"
          trend={{ text: `${(1050 - totalHarvestMonth).toFixed(1)} MT remaining this cycle`, isPositive: true }}
        />

        {/* Monthly Operating Expenses & Cost/Ha */}
        <MetricKpiCard
          title="Operating Expenses"
          value={`$${totalExpensesMonth.toLocaleString()}`}
          subtitle={`Cost/Ha: $${costPerHectare} (500 Ha basis)`}
          icon={DollarSign}
          iconColorClass="text-purple-400"
          iconBgClass="bg-purple-950/80 border-purple-800/40"
          actionText="Ledger"
          onClick={() => onNavigate('expenses')}
          trend={{ text: 'Within 2026 operating budget allocation', isPositive: true }}
        />
      </div>

      {/* 5. Secondary Operational Status Bar: Approvals, Surveillance, Equipment (Figma V2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Reports Workflow */}
        <div className="bg-slate-900/90 p-4 rounded-2xl shadow-md border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-950/80 text-amber-400 border border-amber-800/50 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-display">
                {pendingReports.length} Pending Daily Reports
              </div>
              <p className="text-xs text-slate-400">
                {completedReportsToday.length} reports approved today across 20 blocks
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('daily_reports')}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/40 cursor-pointer transition-colors"
          >
            Review
          </button>
        </div>

        {/* Active Pest Surveillance */}
        <div className="bg-slate-900/90 p-4 rounded-2xl shadow-md border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-950/80 text-rose-400 border border-rose-800/50 rounded-xl">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-display">
                {activePests.length} Active Pest Outbreaks
              </div>
              <p className="text-xs text-slate-400">
                Bagworm & Ganoderma surveillance in progress
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pest_disease')}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/40 cursor-pointer transition-colors"
          >
            Inspect
          </button>
        </div>

        {/* Fleet & Equipment Status */}
        <div className="bg-slate-900/90 p-4 rounded-2xl shadow-md border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-display">
                {safeEquipment.length > 0 ? `${activeEquipmentCount} / ${safeEquipment.length} Fleet Operational` : 'Fleet Operational'}
              </div>
              <p className="text-xs text-slate-400">
                {maintenanceEquipmentCount > 0 ? `${maintenanceEquipmentCount} unit in maintenance schedule` : 'Tractors, sprayers & trailers ready'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('equipment')}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/40 cursor-pointer transition-colors"
          >
            Fleet
          </button>
        </div>
      </div>

      {/* 6. Complete 20-Block Interactive Yield Matrix & Real-Time Activity Deck (Figma V2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All 20 Plantation Blocks Harvest Yield Matrix (2/3 width) */}
        <div className="lg:col-span-2 bg-slate-900/95 rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>20-Block Harvest Yield & Agronomic Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                500-Hectare Commercial Plantation (25 Ha standard module • Target: 52.5 MT/Block)
              </p>
            </div>
            <button
              onClick={() => onNavigate('blocks')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center cursor-pointer group"
            >
              Open Interactive Geographic Map <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* 20 Blocks Grid Matrix (5 columns x 4 rows) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {safeBlocks.map((block) => {
              const actualYield = block?.actualYieldTonnesMonth || 0;
              const targetYield = block?.targetYieldTonnes || 52.5;
              const pct = Math.min(100, Math.round((actualYield / targetYield) * 100));
              const isPestSevere = block?.pestStatus === 'Severe' || block?.pestStatus === 'Moderate';
              const isPestLow = block?.pestStatus === 'Low Alert';

              return (
                <div
                  key={block.id}
                  onClick={() => onNavigate('blocks')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all relative group ${
                    isPestSevere
                      ? 'bg-rose-950/40 border-rose-700/80 hover:border-rose-400 shadow-sm shadow-rose-950/20'
                      : isPestLow
                      ? 'bg-amber-950/30 border-amber-700/60 hover:border-amber-400'
                      : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 hover:border-emerald-500/70 shadow-sm'
                  }`}
                  title={`${block.name} (${block.areaHa} Ha) - ${block.palmAgeYears}y old - Planted ${block.plantingYear}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-white text-[11px]">{block.id}</span>
                    {isPestSevere ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">{block.areaHa}Ha</span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-300 mt-1 font-mono flex justify-between">
                    <span>{actualYield} MT</span>
                    <span className="text-slate-400">/ {targetYield} MT</span>
                  </div>

                  {/* Harvest progress bar */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 pt-1 border-t border-slate-700/40">
                    <span>{block.palmAgeYears}y ({block.plantingYear})</span>
                    <span className="text-emerald-400 font-medium group-hover:underline">Inspect</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 gap-2">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> &gt;90% Target</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> 70-90%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> &lt;70% or Pest Alert</span>
            </span>
            <span className="font-mono text-emerald-400 text-[10px]">Commercial Matrix: 20 Blocks Active</span>
          </div>
        </div>

        {/* Right Column: Live Field Activity Stream & PalmBot AI Assistant Card (1/3 width) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Live Activity Feed */}
          <div className="bg-slate-900/95 rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Recent Field Operations</span>
              </h3>
              <button
                onClick={() => onNavigate('daily_reports')}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {safeDailyReports.slice(0, 4).map((report) => (
                <div
                  key={report.id}
                  onClick={() => onNavigate('daily_reports')}
                  className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs border border-slate-700/60 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center font-semibold text-white">
                    <span className="truncate pr-2 font-display">{report.taskPerformed}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{report.date}</span>
                  </div>

                  <div className="text-slate-300 text-[11px] mt-1 flex justify-between">
                    <span>Worker: <strong className="text-slate-200">{report.workerName}</strong></span>
                    <span className="text-emerald-400 font-mono font-bold">Block {report.blockId}</span>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-700/40 text-[11px]">
                    <span className="font-bold text-emerald-300 font-mono">
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
          </div>

          {/* PalmBot AI Assistant Box (Figma V2) */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-emerald-600/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-display tracking-wide">PalmBot AI Farm Intelligence</span>
            </div>

            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
              Instant agronomic reasoning for Bagworm thresholds, NPK/MOP dosage calculations, frond pruning cycles, and RSPO compliance checks.
            </p>

            <button
              onClick={onOpenAIAgronomist}
              className="mt-3.5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Agronomist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
