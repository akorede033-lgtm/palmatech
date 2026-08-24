import React, { useState, useEffect } from 'react';
import { Database, X, Check, Copy, ExternalLink, Key, Globe, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_POSTGRES_SCHEMA_SQL,
  inspectSupabaseDatabase,
  SupabaseInspectionReport,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig?.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig?.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [report, setReport] = useState<SupabaseInspectionReport | null>(null);

  const runInspection = async () => {
    setIsInspecting(true);
    try {
      const res = await inspectSupabaseDatabase();
      setReport(res);
    } catch (e) {
      console.error('Failed database inspection', e);
    } finally {
      setIsInspecting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url || '');
      setAnonKey(cfg.anonKey || '');
      runInspection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) return;
    saveSupabaseConfig(url, anonKey);
    setSaveSuccess(true);
    await runInspection();
    setTimeout(() => {
      setSaveSuccess(false);
      onConfigSaved();
    }, 800);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_POSTGRES_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6 max-h-[90vh] overflow-y-auto text-xs">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase Cloud PostgreSQL Connection</h3>
              <p className="text-[11px] text-slate-500">
                {currentConfig.source === 'env'
                  ? 'Configured via NEXT_PUBLIC_SUPABASE_URL environment variables'
                  : 'Connect live cloud database for real-time synchronization'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Inspection / Health Status */}
        {report && (
          <div className={`p-3 rounded-xl border text-xs ${report.isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold">
                {report.isConnected ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                <span>{report.isConnected ? 'Database Connection Active' : 'Supabase Disconnected'}</span>
                {report.configSource === 'env' && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-200 text-emerald-900 rounded-full">ENV Config</span>
                )}
              </div>
              <button
                type="button"
                onClick={runInspection}
                disabled={isInspecting}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isInspecting ? 'animate-spin' : ''}`} />
                <span>Verify Connection</span>
              </button>
            </div>

            <p className="text-[11px] leading-relaxed mb-2">{report.statusMessage}</p>

            {report.isConnected && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="font-semibold block text-slate-700">Existing Tables ({report.existingTables.length}):</span>
                  <span className="text-emerald-700 font-mono text-[10px]">
                    {report.existingTables.length > 0 ? report.existingTables.join(', ') : 'None detected'}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="font-semibold block text-slate-700">Tables Needed ({report.missingTables.length}):</span>
                  <span className="text-amber-700 font-mono text-[10px]">
                    {report.missingTables.length > 0 ? report.missingTables.join(', ') : 'All 10 tables provisioned'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Publishable/Anon Key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)</span>
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Get free Supabase project</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow cursor-pointer flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Settings Saved!
                </>
              ) : (
                'Save Connection Settings'
              )}
            </button>
          </div>
        </form>

        {/* SQL Schema Script Copy Section */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PostgreSQL DDL Migration Script</span>
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy SQL
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Paste this SQL script into your Supabase SQL Editor to bootstrap or update all 10 plantation tables.
          </p>

          <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto max-h-36 font-mono text-[10px] leading-relaxed">
            {SUPABASE_POSTGRES_SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
