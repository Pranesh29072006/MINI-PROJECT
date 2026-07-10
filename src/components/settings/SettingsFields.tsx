import React from 'react';

export function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function SettingsTextInput({
  value,
  onChange,
  placeholder,
  ariaLabel
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="w-44 text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
    />
  );
}

export function SettingsNumberInput({
  value,
  onChange,
  min,
  max,
  ariaLabel
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(Number(e.target.value))}
      aria-label={ariaLabel}
      className="w-24 text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
    />
  );
}

export function SettingsSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      aria-label={ariaLabel}
      className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsColorInput({ value, onChange, ariaLabel }: { value: string; onChange: (v: string) => void; ariaLabel: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5"
      />
      <span className="text-[10px] font-mono text-slate-400 uppercase">{value}</span>
    </div>
  );
}

export function SettingsDayPicker({ value, onChange, days }: { value: string[]; onChange: (v: string[]) => void; days: string[] }) {
  const toggleDay = (day: string) => {
    onChange(value.includes(day) ? value.filter(d => d !== day) : [...value, day]);
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {days.map(day => (
        <button
          key={day}
          type="button"
          onClick={() => toggleDay(day)}
          aria-pressed={value.includes(day)}
          className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${
            value.includes(day) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          {day.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}
