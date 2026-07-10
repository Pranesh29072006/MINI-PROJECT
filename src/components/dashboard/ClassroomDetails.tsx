import React, { useMemo, useState } from 'react';
import { Classroom, Subject, Teacher, ClassBatch, TimetableSession } from '../../types';
import { DAYS, DAILY_SLOTS } from '../../data/presets';
import { buildClassroomRows, exportRowsAsCSV, ClassroomRow } from '../../lib/dashboardStats';
import { ModalToolbar, ModalSelect, StatusBadge, EmptyState, SummaryTile, ProgressBar } from './shared';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';

interface ClassroomDetailsProps {
  classrooms: Classroom[];
  subjects: Subject[];
  teachers: Teacher[];
  classBatches: ClassBatch[];
  sessions: TimetableSession[];
}

type SortKey = 'name' | 'capacity' | 'usage';

export default function ClassroomDetails({ classrooms, subjects, teachers, classBatches, sessions }: ClassroomDetailsProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t])), [teachers]);
  const batchMap = useMemo(() => new Map(classBatches.map(b => [b.id, b])), [classBatches]);
  const allRows = useMemo(() => buildClassroomRows(classrooms, sessions), [classrooms, sessions]);

  const rows = useMemo(() => {
    let result = allRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r => r.classroom.name.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') result = result.filter(r => r.classroom.type === typeFilter);

    return [...result].sort((a, b) => {
      if (sortKey === 'name') return a.classroom.name.localeCompare(b.classroom.name);
      if (sortKey === 'capacity') return b.classroom.capacity - a.classroom.capacity;
      return b.usagePercent - a.usagePercent;
    });
  }, [allRows, search, typeFilter, sortKey]);

  const totalRooms = classrooms.length;
  const avgUsage = allRows.length > 0 ? Math.round(allRows.reduce((s, r) => s + r.usagePercent, 0) / allRows.length) : 0;
  const totalScheduled = allRows.reduce((s, r) => s + r.scheduledHours, 0);
  const totalCapacitySeats = classrooms.reduce((s, r) => s + r.capacity, 0);

  const handleExport = () => {
    exportRowsAsCSV(
      'classrooms.csv',
      ['Name', 'Capacity', 'Type', 'Usage %', 'Scheduled Hours', 'Available Hours', 'Status'],
      rows.map(r => [r.classroom.name, r.classroom.capacity, r.classroom.type, r.usagePercent, r.scheduledHours, r.availableHours, r.status])
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryTile label="Total Rooms" value={totalRooms} />
        <SummaryTile label="Avg Usage" value={`${avgUsage}%`} />
        <SummaryTile label="Scheduled Hours" value={totalScheduled} />
        <SummaryTile label="Total Seating" value={totalCapacitySeats} />
      </div>

      <ModalToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search rooms..." onExportCSV={handleExport} onPrint={() => window.print()}>
        <ModalSelect
          value={typeFilter}
          onChange={setTypeFilter}
          ariaLabel="Filter by room type"
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'theory', label: 'Theory' },
            { value: 'lab', label: 'Lab' }
          ]}
        />
        <ModalSelect
          value={sortKey}
          onChange={v => setSortKey(v as SortKey)}
          ariaLabel="Sort rooms"
          options={[
            { value: 'name', label: 'Sort: Name' },
            { value: 'capacity', label: 'Sort: Capacity' },
            { value: 'usage', label: 'Sort: Usage' }
          ]}
        />
      </ModalToolbar>

      {rows.length === 0 ? (
        <EmptyState title="No classrooms found" message="Try adjusting your search or filters, or add rooms from the Classrooms & Labs tab." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map(row => (
            <ClassroomCard
              key={row.classroom.id}
              row={row}
              subjectMap={subjectMap}
              teacherMap={teacherMap}
              batchMap={batchMap}
              expanded={expandedId === row.classroom.id}
              onToggle={() => setExpandedId(prev => (prev === row.classroom.id ? null : row.classroom.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClassroomCard({
  row,
  subjectMap,
  teacherMap,
  batchMap,
  expanded,
  onToggle
}: {
  row: ClassroomRow;
  subjectMap: Map<string, Subject>;
  teacherMap: Map<string, Teacher>;
  batchMap: Map<string, ClassBatch>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { classroom } = row;

  const subjectsUsed = Array.from(new Set(row.sessions.map(s => s.subjectId)));
  const teachersUsed = Array.from(new Set(row.sessions.map(s => s.teacherId)));
  const batchesUsed = Array.from(new Set(row.sessions.map(s => s.classBatchId)));

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
      <button type="button" onClick={onToggle} className="w-full text-left p-4 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <h4 className="font-semibold text-slate-900 text-sm truncate">{classroom.name}</h4>
            </div>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                classroom.type === 'lab' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}
            >
              {classroom.type === 'lab' ? 'Lab Room' : 'Theory Room'}
            </span>
          </div>
          <StatusBadge status={row.status} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{classroom.capacity}</span>
          <span className="text-slate-400">capacity</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <ProgressBar percent={row.usagePercent} colorClass={row.usagePercent >= 80 ? 'bg-rose-500' : row.usagePercent >= 40 ? 'bg-amber-500' : 'bg-emerald-500'} />
          <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{row.usagePercent}%</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {row.scheduledHours} scheduled · {row.availableHours} available hrs/week
        </p>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Weekly Schedule</p>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Subjects</p>
              <p className="text-slate-700">{subjectsUsed.length === 0 ? '—' : subjectsUsed.map(id => subjectMap.get(id)?.id || id).join(', ')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Teachers</p>
              <p className="text-slate-700">{teachersUsed.length === 0 ? '—' : teachersUsed.map(id => teacherMap.get(id)?.name || id).join(', ')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Batches</p>
              <p className="text-slate-700">{batchesUsed.length === 0 ? '—' : batchesUsed.map(id => batchMap.get(id)?.name || id).join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
