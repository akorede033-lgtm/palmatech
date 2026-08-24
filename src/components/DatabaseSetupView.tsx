import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Key,
  ShieldCheck,
  Search,
  Code2,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_POSTGRES_SCHEMA_SQL,
  inspectSupabaseDatabase,
  SupabaseInspectionReport,
  EXPECTED_PLANTATION_TABLES,
} from '../lib/supabase';

export const DatabaseSetupView: React.FC = () => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [report, setReport] = useState<SupabaseInspectionReport | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState(config.anonKey || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInspect = async () => {
    setIsInspecting(true);
    setVerifyMessage(null);
    try {
      const res = await inspectSupabaseDatabase();
      setReport(res);
      setConfig(getSupabaseConfig());
    } catch (err: any) {
      console.error('Database inspection error:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleVerify = async () => {
    setIsInspecting(true);
    setVerifyMessage(null);
    try {
      const res = await inspectSupabaseDatabase();
      setReport(res);
      if (res.isConnected) {
        setVerifyMessage(`Connection Verified Successfully! Target endpoint (${res.url}) responded to REST API ping.`);
      } else {
        setVerifyMessage(`Connection Error: ${res.statusMessage}`);
      }
    } catch (err: any) {
      setVerifyMessage(`Connection failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_POSTGRES_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || !inputKey) return;
    saveSupabaseConfig(inputUrl, inputKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    handleInspect();
  };

  useEffect(() => {
    handleInspect();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-500/30 text-emerald-400">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide font-display">Database Setup & Inspection</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-full font-mono">
                Supabase PostgreSQL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Read-only database diagnostic, live schema inspector, and SQL schema export for PALMATECH.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Status:</span>
          {report?.isConnected || config.isConnected ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Connected ({config.source === 'env' ? 'ENV' : 'Config'})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Database Management Actions</span>
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* 1. Inspect Database Button */}
          <button
            onClick={handleInspect}
            disabled={isInspecting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Search className={`w-4 h-4 text-emerald-400 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>Inspect Database</span>
          </button>

          {/* 2. Copy SQL Schema Button */}
          <button
            onClick={handleCopySql}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {copiedSql ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied SQL Schema!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>

          {/* 3. Verify Connection Button */}
          <button
            onClick={handleVerify}
            disabled={isInspecting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>Verify Connection</span>
          </button>
        </div>

        {/* Verification Message */}
        {verifyMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 font-medium">
            {verifyMessage}
          </div>
        )}
      </div>

      {/* Live Connection & Table Inspection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Details Card */}
        <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>1. Supabase Connection Credentials</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Source: {config.source || 'none'}
            </span>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Supabase Project URL (<code className="text-emerald-400 font-mono">NEXT_PUBLIC_SUPABASE_URL</code>)
              </label>
              <input
                type="url"
                required
                placeholder="https://your-project.supabase.co"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Publishable / Anon Key (<code className="text-emerald-400 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>)
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Credentials Saved & Verified</span>
                </>
              ) : (
                <span>Save Credentials to Local Connection</span>
              )}
            </button>
          </form>
        </div>

        {/* Schema Health Summary Card */}
        <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>2. Schema Inspection Summary</span>
            </h3>
            {report && (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                {report.existingTables.length} / {EXPECTED_PLANTATION_TABLES.length} Tables Found
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-300 font-medium">Expected PALMATECH Core Tables:</div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {EXPECTED_PLANTATION_TABLES.map((tableName) => {
                const isFound = report?.existingTables.includes(tableName);
                return (
                  <div
                    key={tableName}
                    className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                      isFound
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-mono">{tableName}</span>
                    {isFound ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Missing</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SQL Schema Preview */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Complete PostgreSQL DDL Schema for Supabase</span>
          </h3>
          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Copy All DDL'}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto">
          <pre>{SUPABASE_POSTGRES_SCHEMA_SQL.slice(0, 1400)}...</pre>
        </div>
      </div>
    </div>
  );
};
