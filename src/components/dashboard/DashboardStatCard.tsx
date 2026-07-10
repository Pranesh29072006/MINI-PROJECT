import React, { useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface DashboardStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  subtitle: string;
  tooltip: string;
  accentClass: string; // e.g. 'bg-indigo-50 text-indigo-600'
  trend?: { direction: 'up' | 'down'; percent: number };
  onClick: () => void;
  className?: string;
}

let rippleId = 0;

export default function DashboardStatCard({
  icon,
  label,
  value,
  suffix,
  subtitle,
  tooltip,
  accentClass,
  trend,
  onClick,
  className = ''
}: DashboardStatCardProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const animatedValue = useCountUp(value);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const size = Math.max(rect.width, rect.height) * 1.2;
      const id = ++rippleId;
      setRipples(prev => [
        ...prev,
        { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size }
      ]);
      window.setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }
    onClick();
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      aria-label={`${label}: ${value}. ${tooltip}`}
      className={`group relative overflow-hidden text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
        ${className}`}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-indigo-400/40 pointer-events-none animate-nexus-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}

      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 ${accentClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-[1px] rounded-full ${
                trend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {trend.direction === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {trend.percent}%
            </span>
          )}
        </div>
        <p className="text-lg font-black text-slate-900 leading-tight animate-nexus-count-pop" key={value}>
          {animatedValue}
          {suffix}
        </p>
        <p className="text-[10px] text-slate-400 font-medium truncate">{subtitle}</p>
      </div>

      <span
        role="tooltip"
        className={`pointer-events-none absolute left-4 -top-2 -translate-y-full z-20 whitespace-nowrap rounded-lg bg-slate-900 text-white text-[10px] font-medium px-2.5 py-1.5 shadow-lg transition-all duration-150 ${
          showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        {tooltip}
        <span className="absolute left-4 top-full w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
      </span>
    </button>
  );
}
