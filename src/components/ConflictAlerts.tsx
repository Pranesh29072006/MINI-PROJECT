import React from 'react';
import { TimetableConflict } from '../types';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface ConflictAlertsProps {
  conflicts: TimetableConflict[];
  onAutoResolve?: () => void;
  isResolving?: boolean;
}

export default function ConflictAlerts({ conflicts, onAutoResolve, isResolving }: ConflictAlertsProps) {
  if (conflicts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-emerald-900">Schedule is 100% Conflict-Free</h4>
          <p className="text-xs text-emerald-700 mt-0.5">All teacher schedules, room allocations, and batch slots are perfectly valid.</p>
        </div>
      </div>
    );
  }

  // Sort conflicts by severity (high first)
  const sortedConflicts = [...conflicts].sort((a, b) => {
    if (a.severity === 'high' && b.severity !== 'high') return -1;
    if (a.severity !== 'high' && b.severity === 'high') return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
          </span>
        </div>
        {onAutoResolve && (
          <button
            onClick={onAutoResolve}
            disabled={isResolving}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResolving ? 'animate-spin' : ''}`} />
            Auto-resolve Conflicts
          </button>
        )}
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50">
        {sortedConflicts.map((conflict, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-3 flex gap-3 text-xs leading-relaxed ${
              conflict.severity === 'high'
                ? 'bg-rose-50 border-rose-100 text-rose-900'
                : 'bg-amber-50 border-amber-100 text-amber-900'
            }`}
          >
            {conflict.severity === 'high' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">
                {conflict.type === 'teacher_double_booking' && 'Teacher Double Booking'}
                {conflict.type === 'room_double_booking' && 'Room Double Booking'}
                {conflict.type === 'class_double_booking' && 'Class Double Booking'}
                {conflict.type === 'teacher_unavailability' && 'Teacher Unavailable'}
                {conflict.type === 'room_type_mismatch' && 'Room Type Mismatch'}
                {conflict.type === 'room_capacity_overflow' && 'Capacity Overflow'}
              </span>
              <p>{conflict.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
