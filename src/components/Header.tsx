import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  User,
  Trees,
  Database,
  Bell,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  CloudSun,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSupabaseModal?: () => void;
  onOpenSupabase?: () => void;
  onOpenAIAgronomist: () => void;
  activeAlertCount?: number;
  isSupabaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenSupabaseModal,
  onOpenSupabase,
  onOpenAIAgronomist,
  activeAlertCount = 3,
  isSupabaseConnected = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const config = getSupabaseConfig();
  const handleSupabaseClick = onOpenSupabaseModal || onOpenSupabase || (() => {});

  const roles: { role: UserRole; label: string; tag: string }[] = [
    { role: 'Admin', label: 'Administrator', tag: 'Full Control' },
    { role: 'Manager', label: 'Farm Manager', tag: 'Operations & Yield' },
    { role: 'Supervisor', label: 'Field Supervisor', tag: 'Audits & Approvals' },
    { role: 'Worker', label: 'Field Worker', tag: 'Field Task Logs' },
    { role: 'Accountant', label: 'Accountant', tag: 'Cost & Ledger' },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md text-white border-b border-emerald-900/40 sticky top-0 z-40 shadow-xl transition-all">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem]">
          {/* Brand & Estate Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative p-2.5 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-xl text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30 flex items-center justify-center">
              <Trees className="w-5 h-5 text-emerald-100" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-display">
                  PALMA<span className="text-emerald-400">TECH</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 rounded-md border border-emerald-700/60 uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  500 HA • 20 BLOCKS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block font-medium tracking-tight">
                Enterprise Palm Plantation Management & AI Intelligence
              </p>
            </div>
          </div>

          {/* Center: Live Environmental Status (Figma V2 feature) */}
          <div className="hidden xl:flex items-center space-x-4 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 text-amber-300">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">29°C</span>
              <span className="text-slate-400">Partly Cloudy</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="text-[11px] text-slate-400">
              Humidity <strong className="text-slate-200 font-mono">82%</strong> • Spraying Index <strong className="text-emerald-400 font-semibold">Optimal</strong>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* AI Agronomist Trigger */}
            <button
              onClick={onOpenAIAgronomist}
              className="group relative flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-400/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              title="Open PalmBot AI Agronomist (Gemini 3.6 Flash)"
            >
              <Sparkles className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
              <span>AI Agronomist</span>
              <span className="px-1.5 py-0.2 bg-emerald-950/60 text-[9px] font-bold rounded text-emerald-200 uppercase tracking-wider">
                V2
              </span>
            </button>

            {/* Supabase Status Pill */}
            <button
              onClick={handleSupabaseClick}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Inspect or Configure Supabase Database"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-[11px]">
                {config.isConnected || isSupabaseConnected ? 'Database Connected' : 'Database Ready'}
              </span>
              {config.isConnected || isSupabaseConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Role Switcher */}
            <div className="relative flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Role Profile</span>
                <div className="relative flex items-center">
                  <select
                    value={currentRole}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {roles.map((r) => (
                      <option key={r.role} value={r.role} className="bg-slate-900 text-white font-medium">
                        {r.label} ({r.tag})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Alerts Bell */}
            <div
              onClick={() => onRoleChange(currentRole)}
              className="relative p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 cursor-pointer transition-colors"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {activeAlertCount}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Right Quick Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onOpenAIAgronomist}
              className="p-2 bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 shadow"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3 bg-slate-950/95 rounded-b-2xl px-2">
            <div className="flex items-center justify-between px-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Switch User Role:</span>
              <select
                value={currentRole}
                onChange={(e) => {
                  onRoleChange(e.target.value as UserRole);
                  setMobileMenuOpen(false);
                }}
                className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-medium"
              >
                {roles.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => {
                  handleSupabaseClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-900 text-xs text-emerald-300 font-semibold rounded-xl border border-slate-800"
              >
                <Database className="w-4 h-4" />
                <span>Supabase Database Setup & Schema</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
