import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface MetricKpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: React.ElementType;
  iconColorClass?: string;
  iconBgClass?: string;
  progressPercent?: number;
  progressColorClass?: string;
  actionText?: string;
  onClick?: () => void;
  trend?: {
    text: string;
    isPositive?: boolean;
  };
}

export const MetricKpiCard: React.FC<MetricKpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColorClass = 'text-emerald-400',
  iconBgClass = 'bg-emerald-950/80 border-emerald-800/40',
  progressPercent,
  progressColorClass = 'bg-emerald-500',
  actionText,
  onClick,
  trend,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/95 p-5 rounded-2xl shadow-md border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
        onClick ? 'hover:shadow-emerald-950/20 hover:shadow-lg' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
            {title}
          </span>
          <div
            className={`p-2 rounded-xl border ${iconBgClass} ${iconColorClass} transition-colors group-hover:scale-105 duration-200`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>

          {trend && (
            <div className="mt-1 text-[11px] font-medium flex items-center gap-1">
              <span className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                {trend.text}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80">
        {progressPercent !== undefined && (
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-2 border border-slate-800/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColorClass}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate pr-2">{subtitle}</span>
          {actionText && (
            <span className="text-emerald-400 font-semibold flex items-center flex-shrink-0 group-hover:underline">
              {actionText} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
