import React, { useMemo, useState } from 'react';
import { Teacher, Subject, TimetableSession } from '../../types';
import { DAYS, DAILY_SLOTS } from '../../data/presets';
import { buildInstructorRows, exportRowsAsCSV, InstructorRow } from '../../lib/dashboardStats';
import { ModalToolbar, ModalSelect, StatusBadge, EmptyState, SummaryTile, ProgressBar } from './shared';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface InstructorDetailsProps {
  teachers: Teacher[];
  subjects: Subject[];
  sessions: TimetableSession[];
}

type SortKey = 'name' | 'dept' | 'hours';

export default function InstructorDetails({ teachers, subjects, sessions }: InstructorDetailsProps) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const allRows = useMemo(() => buildInstructorRows(teachers, sessions), [teachers, sessions]);

  const departments = useMemo(() => Array.from(new Set(teachers.map(t => t.dept))).sort(), [teachers]);

  const rows = useMemo(() => {
    let result = allRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r => r.teacher.name.toLowerCase().includes(q) || r.teacher.dept.toLowerCase().includes(q));
    }
    if (deptFilter !== 'all') result = result.filter(r => r.teacher.dept === deptFilter);
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);

    return [...result].sort((a, b) => {
      if (sortKey === 'name') return a.teacher.name.localeCompare(b.teacher.name);
      if (sortKey === 'dept') return a.teacher.dept.localeCompare(b.teacher.dept);
      return b.assignedHours - a.assignedHours;
    });
  }, [allRows, search, deptFilter, statusFilter, sortKey]);

  const totalTeachers = teachers.length;
  const totalDepartments = departments.length;
  const totalCapacity = teachers.reduce((sum, t) => sum + t.maxHoursPerWeek, 0);
  const avgHours = allRows.length > 0 ? Math.round((allRows.reduce((s, r) => s + r.assignedHours, 0) / allRows.length) * 10) / 10 : 0;

  const handleExport = () => {
    exportRowsAsCSV(
      'instructors.csv',
      ['Name', 'Department', 'Preferred Subjects', 'Max Hours', 'Assigned Hours', 'Load %', 'Status'],
      rows.map(r => [
        r.teacher.name,
        r.teacher.dept,
        r.teacher.preferredSubjects.join('; '),
        r.teacher.maxHoursPerWeek,
        r.assignedHours,
        r.loadPercent,
        r.status
      ])
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryTile label="Total Teachers" value={totalTeachers} />
        <SummaryTile label="Departments" value={totalDepartments} />
        <SummaryTile label="Weekly Capacity" value={`${totalCapacity} hrs`} />
        <SummaryTile label="Average Hours" value={`${avgHours} hrs`} />
      </div>

      <ModalToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search instructors..." onExportCSV={handleExport} onPrint={() => window.print()}>
        <ModalSelect
          value={deptFilter}
          onChange={setDeptFilter}
          ariaLabel="Filter by department"
          options={[{ value: 'all', label: 'All Departments' }, ...departments.map(d => ({ value: d, label: d }))]}
        />
        <ModalSelect
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel="Filter by availability"
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'available', label: 'Available' },
            { value: 'busy', label: 'Busy' },
            { value: 'unavailable', label: 'Unavailable' }
          ]}
        />
        <ModalSelect
          value={sortKey}
          onChange={v => setSortKey(v as SortKey)}
          ariaLabel="Sort instructors"
          options={[
            { value: 'name', label: 'Sort: Name' },
            { value: 'dept', label: 'Sort: Department' },
            { value: 'hours', label: 'Sort: Hours' }
          ]}
        />
      </ModalToolbar>

      {rows.length === 0 ? (
        <EmptyState title="No instructors found" message="Try adjusting your search or filters, or add instructors from the Instructors Database tab." />
      ) : (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Preferred Subjects</th>
                <th className="py-2.5 px-3 text-center">Max Hrs</th>
                <th className="py-2.5 px-3 text-center">Assigned</th>
                <th className="py-2.5 px-3">Load</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => (
                <InstructorTableRow
                  key={row.teacher.id}
                  row={row}
                  subjectMap={subjectMap}
                  expanded={expandedId === row.teacher.id}
                  onToggle={() => setExpandedId(prev => (prev === row.teacher.id ? null : row.teacher.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InstructorTableRow({
  row,
  subjectMap,
  expanded,
  onToggle
}: {
  row: InstructorRow;
  subjectMap: Map<string, Subject>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { teacher } = row;

  return (
    <>
      <tr className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="py-2.5 px-3 text-slate-400">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
              {teacher.name.split(' ').map(p => p[0]).slice(-2).join('').toUpperCase()}
            </div>
            <span className="font-semibold text-slate-800">{teacher.name}</span>
          </div>
        </td>
        <td className="py-2.5 px-3">
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{teacher.dept}</span>
        </td>
        <td className="py-2.5 px-3 text-slate-500 max-w-[160px] truncate">
          {teacher.preferredSubjects.length > 0 ? teacher.preferredSubjects.join(', ') : '—'}
        </td>
        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{teacher.maxHoursPerWeek}</td>
        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{row.assignedHours}</td>
        <td className="py-2.5 px-3 w-28">
          <div className="flex items-center gap-2">
            <ProgressBar percent={row.loadPercent} colorClass={row.loadPercent >= 90 ? 'bg-rose-500' : row.loadPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'} />
            <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{row.loadPercent}%</span>
          </div>
        </td>
        <td className="py-2.5 px-3 text-center">
          <StatusBadge status={row.status} />
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Weekly Timetable</p>
                {row.sessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No sessions scheduled yet.</p>
                ) : (
                  <div className="space-y-1">
                    {DAYS.map(day => {
                      const daySessions = row.sessions.filter(s => s.day === day);
                      if (daySessions.length === 0) return null;
                      return (
                        <div key={day} className="flex items-start gap-2 text-[11px]">
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

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Unavailable Slots</p>
                  {(teacher.unavailability?.length || 0) === 0 ? (
                    <p className="text-xs text-slate-400 italic">None specified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {teacher.unavailability.map(u =>
                        u.slots.map(slot => (
                          <span key={`${u.day}-${slot}`} className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            {u.day.slice(0, 3)} {slot.split(' ')[0]}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Preferred Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.preferredSubjects.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">None specified.</span>
                    ) : (
                      teacher.preferredSubjects.map(subId => (
                        <span key={subId} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md" title={subjectMap.get(subId)?.name}>
                          {subId}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Teaching Load</p>
                    <p className="text-sm font-black text-slate-900">{row.loadPercent}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Compact Score</p>
                    <p className="text-sm font-black text-slate-900">{row.compactScore}/100</p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
