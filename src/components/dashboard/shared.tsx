import React from 'react';
import { Inbox, Search, FileDown, Printer } from 'lucide-react';

export function StatusBadge({ status }: { status: 'available' | 'busy' | 'unavailable' | 'maintenance' }) {
  const styles: Record<string, string> = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    busy: 'bg-amber-50 text-amber-700 border-amber-100',
    unavailable: 'bg-rose-50 text-rose-700 border-rose-100',
    maintenance: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  const labels: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    unavailable: 'Unavailable',
    maintenance: 'Maintenance'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function ModalSearchBar({
  value,
  onChange,
  placeholder = 'Search...'
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[160px]">
      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
    </div>
  );
}

export function ModalSelect({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="text-xs bg-white border border-slate-200 rounded-lg py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ModalToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  onExportCSV,
  onPrint,
  children
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  onExportCSV?: () => void;
  onPrint?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ModalSearchBar value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
      {children}
      <div className="flex items-center gap-1.5 ml-auto">
        {onExportCSV && (
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-2 rounded-lg transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" /> CSV
          </button>
        )}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-300 mb-3">
        <Inbox className="w-7 h-7" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ProgressBar({ percent, colorClass = 'bg-indigo-500' }: { percent: number; colorClass?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function SummaryTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
      <p className="text-lg font-black text-slate-900 leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ProgressCircle({ percent, size = 128, label }: { percent: number; size?: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-slate-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-indigo-500 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900">{clamped}%</span>
        {label && <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">{label}</span>}
      </div>
    </div>
  );
}

export function BarList({
  data,
  colorClass = 'bg-indigo-500',
  maxItems = 8
}: {
  data: { label: string; value: number }[];
  colorClass?: string;
  maxItems?: number;
}) {
  const items = data.slice(0, maxItems);
  const max = Math.max(1, ...items.map(d => d.value));

  if (items.length === 0) {
    return <p className="text-xs text-slate-400 italic py-2">No data available.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 truncate text-slate-600 font-medium" title={item.label}>
            {item.label}
          </span>
          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${colorClass} transition-all duration-500`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right font-bold text-slate-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
