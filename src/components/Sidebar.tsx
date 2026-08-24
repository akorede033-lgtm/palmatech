import React from 'react';
import { NavTab } from '../types';
import {
  LayoutDashboard,
  Grid,
  Users,
  ClipboardList,
  CheckSquare,
  Bug,
  Tractor,
  Boxes,
  Wrench,
  DollarSign,
  BarChart3,
  Sparkles,
  Database,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount?: number;
  pestAlertsCount?: number;
}

interface NavSection {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount = 0,
  pestAlertsCount = 0,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'blocks', label: 'Farm Blocks (500 ha)', icon: Grid },
        { id: 'workers', label: 'Field Labor & Roster', icon: Users },
        {
          id: 'daily_reports',
          label: 'Daily Work Reports',
          icon: ClipboardList,
          badge: pendingApprovalsCount,
          badgeColor: 'bg-amber-500 text-slate-950',
        },
        { id: 'inspections', label: 'Estate Inspections', icon: CheckSquare },
      ],
    },
    {
      title: 'Agronomy & Field Assets',
      items: [
        {
          id: 'pest_disease',
          label: 'Pest & Disease Hub',
          icon: Bug,
          badge: pestAlertsCount,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'harvest', label: 'FFB Harvest Logs', icon: Tractor },
        { id: 'inventory', label: 'Inventory & Inputs', icon: Boxes },
        { id: 'equipment', label: 'Fleet & Machinery', icon: Wrench },
      ],
    },
    {
      title: 'Intelligence & Financials',
      items: [
        { id: 'expenses', label: 'Expenses & Cost/Ha', icon: DollarSign },
        { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'ai_agronomist', label: 'AI Agronomist Bot', icon: Sparkles },
        { id: 'database_setup', label: 'Database & Sync', icon: Database },
      ],
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-950/90 backdrop-blur text-slate-300 border-r border-slate-800/80 flex-shrink-0 flex flex-col justify-between rounded-2xl shadow-xl p-2 my-1">
      <div>
        {/* Module Header */}
        <div className="px-3 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              Estate Modules
            </span>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-800/60">
            20 BLOCKS
          </span>
        </div>

        {/* Grouped Nav Items */}
        <nav className="p-1.5 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-md font-semibold'
                        : 'hover:bg-slate-900 hover:text-slate-100 text-slate-400 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                            item.badgeColor || 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Quick estate stats footer */}
      <div className="p-3.5 m-1.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2 hidden md:block">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estate Metrics</span>
          <span className="text-[10px] font-mono text-emerald-400">Active</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Total Plantation:</span>
          <span className="font-semibold text-slate-200 font-mono">500.0 Ha</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Stand Density:</span>
          <span className="font-semibold text-slate-200 font-mono">138 Palms/Ha</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Monthly FFB Target:</span>
          <span className="font-bold text-emerald-400 font-mono">1,050.0 MT</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
        </div>
      </div>
    </aside>
  );
};
