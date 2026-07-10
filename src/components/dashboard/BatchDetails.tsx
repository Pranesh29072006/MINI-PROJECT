import React, { useMemo, useState } from 'react';
import { ClassBatch, Subject, TimetableSession } from '../../types';
import { DAYS, DAILY_SLOTS } from '../../data/presets';
import { buildBatchRows, exportRowsAsCSV, BatchRow } from '../../lib/dashboardStats';
import { ModalToolbar, ModalSelect, EmptyState, SummaryTile, ProgressBar } from './shared';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';

interface BatchDetailsProps {
  classBatches: ClassBatch[];
  subjects: Subject[];
  sessions: TimetableSession[];
}

type SortKey = 'name' | 'size' | 'completion';

export default function BatchDetails({ classBatches, subjects, sessions }: BatchDetailsProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const allRows = useMemo(() => buildBatchRows(classBatches, subjects, sessions), [classBatches, subjects, sessions]);

  const rows = useMemo(() => {
    let result = allRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r => r.batch.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      if (sortKey === 'name') return a.batch.name.localeCompare(b.batch.name);
      if (sortKey === 'size') return b.batch.size - a.batch.size;
      return b.completionPercent - a.completionPercent;
    });
  }, [allRows, search, sortKey]);

  const totalBatches = classBatches.length;
  const totalStudents = classBatches.reduce((s, b) => s + b.size, 0);
  const avgCompletion = allRows.length > 0 ? Math.round(allRows.reduce((s, r) => s + r.completionPercent, 0) / allRows.length) : 0;
  const totalSubjectsCovered = classBatches.reduce((s, b) => s + b.subjects.length, 0);

  const handleExport = () => {
    exportRowsAsCSV(
      'batches.csv',
      ['Name', 'Students', 'Subjects', 'Required Hours', 'Scheduled Hours', 'Remaining Hours', 'Completion %'],
      rows.map(r => [r.batch.name, r.batch.size, r.batch.subjects.length, r.requiredHours, r.scheduledHours, r.remainingHours, r.completionPercent])
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryTile label="Total Batches" value={totalBatches} />
        <SummaryTile label="Total Students" value={totalStudents} />
        <SummaryTile label="Subjects Covered" value={totalSubjectsCovered} />
        <SummaryTile label="Avg Completion" value={`${avgCompletion}%`} />
      </div>

      <ModalToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search batches..." onExportCSV={handleExport} onPrint={() => window.print()}>
        <ModalSelect
          value={sortKey}
          onChange={v => setSortKey(v as SortKey)}
          ariaLabel="Sort batches"
          options={[
            { value: 'name', label: 'Sort: Name' },
            { value: 'size', label: 'Sort: Size' },
            { value: 'completion', label: 'Sort: Completion' }
          ]}
        />
      </ModalToolbar>

      {rows.length === 0 ? (
        <EmptyState title="No batches found" message="Try adjusting your search, or add student cohorts from the Student Cohorts tab." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map(row => (
            <BatchCard
              key={row.batch.id}
              row={row}
              subjectMap={subjectMap}
              expanded={expandedId === row.batch.id}
              onToggle={() => setExpandedId(prev => (prev === row.batch.id ? null : row.batch.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BatchCard({
  row,
  subjectMap,
  expanded,
  onToggle
}: {
  row: BatchRow;
  subjectMap: Map<string, Subject>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { batch } = row;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
      <button type="button" onClick={onToggle} className="w-full text-left p-4 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <h4 className="font-semibold text-slate-900 text-sm truncate">{batch.name}</h4>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {batch.size} students
            </div>
          </div>
          <span className="text-sm font-black text-slate-900 shrink-0">{row.completionPercent}%</span>
        </div>

        <div className="mt-3">
          <ProgressBar percent={row.completionPercent} colorClass={row.completionPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {row.scheduledHours} of {row.requiredHours} hrs scheduled · {row.remainingHours} remaining
        </p>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Curriculum</p>
            <div className="flex flex-wrap gap-1">
              {batch.subjects.length === 0 ? (
                <span className="text-slate-400 italic">No courses selected.</span>
              ) : (
                batch.subjects.map(subId => {
                  const sub = subjectMap.get(subId);
                  return (
                    <span key={subId} className="bg-white border border-slate-200 rounded px-2 py-0.5 font-medium text-slate-700">
                      {subId} {sub?.isLab ? '🔬' : ''}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Lab Sessions</p>
              <p className="font-black text-slate-900">{row.labSessions}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Theory Sessions</p>
              <p className="font-black text-slate-900">{row.theorySessions}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Daily Timetable Preview</p>
            {row.sessions.length === 0 ? (
              <p className="text-slate-400 italic">No sessions scheduled.</p>
            ) : (
              <div className="space-y-1">
                {DAYS.map(day => {
                  const daySessions = row.sessions.filter(s => s.day === day);
                  if (daySessions.length === 0) return null;
                  return (
                    <div key={day} className="flex items-start gap-2">
                      <span className="w-16 shrink-0 font-bold text-slate-500">{day.slice(0, 3)}</span>
                      <div className="flex flex-wrap gap-1">
                        {daySessions
                          .sort((a, b) => DAILY_SLOTS.indexOf(a.time) - DAILY_SLOTS.indexOf(b.time))
                          .map(s => (
                            <span key={s.id} className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                              {s.subjectId} · {s.time.split(' ')[0]}
                            </span>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
