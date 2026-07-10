import React, { useMemo, useState } from 'react';
import { Subject, Teacher, ClassBatch, TimetableSession } from '../../types';
import { buildCourseRows, exportRowsAsCSV, CourseRow } from '../../lib/dashboardStats';
import { ModalToolbar, ModalSelect, EmptyState, SummaryTile, ProgressBar } from './shared';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CourseDetailsProps {
  subjects: Subject[];
  teachers: Teacher[];
  classBatches: ClassBatch[];
  sessions: TimetableSession[];
}

type SortKey = 'name' | 'dept' | 'hours' | 'completion';

export default function CourseDetails({ subjects, teachers, classBatches, sessions }: CourseDetailsProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t])), [teachers]);
  const allRows = useMemo(() => buildCourseRows(subjects, sessions, classBatches), [subjects, sessions, classBatches]);
  const departments = useMemo(() => Array.from(new Set(subjects.map(s => s.dept))).sort(), [subjects]);

  const rows = useMemo(() => {
    let result = allRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r => r.subject.id.toLowerCase().includes(q) || r.subject.name.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') result = result.filter(r => (typeFilter === 'lab' ? r.subject.isLab : !r.subject.isLab));
    if (deptFilter !== 'all') result = result.filter(r => r.subject.dept === deptFilter);

    return [...result].sort((a, b) => {
      if (sortKey === 'name') return a.subject.name.localeCompare(b.subject.name);
      if (sortKey === 'dept') return a.subject.dept.localeCompare(b.subject.dept);
      if (sortKey === 'hours') return b.subject.weeklyHours - a.subject.weeklyHours;
      return b.progressPercent - a.progressPercent;
    });
  }, [allRows, search, typeFilter, deptFilter, sortKey]);

  const totalCourses = subjects.length;
  const theoryCount = subjects.filter(s => !s.isLab).length;
  const labCount = subjects.filter(s => s.isLab).length;
  const totalWeeklyHours = subjects.reduce((sum, s) => sum + s.weeklyHours, 0);

  const handleExport = () => {
    exportRowsAsCSV(
      'courses.csv',
      ['Code', 'Name', 'Department', 'Weekly Hours', 'Type', 'Assigned Teachers', 'Scheduled Hours', 'Remaining Hours'],
      rows.map(r => [
        r.subject.id,
        r.subject.name,
        r.subject.dept,
        r.subject.weeklyHours,
        r.subject.isLab ? 'Lab' : 'Theory',
        r.assignedTeacherIds.map(id => teacherMap.get(id)?.name || id).join('; '),
        r.scheduledHours,
        r.remainingHours
      ])
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryTile label="Total Courses" value={totalCourses} />
        <SummaryTile label="Theory Courses" value={theoryCount} />
        <SummaryTile label="Lab Courses" value={labCount} />
        <SummaryTile label="Weekly Hours" value={totalWeeklyHours} />
      </div>

      <ModalToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search courses..." onExportCSV={handleExport} onPrint={() => window.print()}>
        <ModalSelect
          value={typeFilter}
          onChange={setTypeFilter}
          ariaLabel="Filter by type"
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'theory', label: 'Theory' },
            { value: 'lab', label: 'Lab' }
          ]}
        />
        <ModalSelect
          value={deptFilter}
          onChange={setDeptFilter}
          ariaLabel="Filter by department"
          options={[{ value: 'all', label: 'All Departments' }, ...departments.map(d => ({ value: d, label: d }))]}
        />
        <ModalSelect
          value={sortKey}
          onChange={v => setSortKey(v as SortKey)}
          ariaLabel="Sort courses"
          options={[
            { value: 'name', label: 'Sort: Name' },
            { value: 'dept', label: 'Sort: Department' },
            { value: 'hours', label: 'Sort: Hours' },
            { value: 'completion', label: 'Sort: Completion' }
          ]}
        />
      </ModalToolbar>

      {rows.length === 0 ? (
        <EmptyState title="No courses found" message="Try adjusting your search or filters, or add courses from the Courses Database tab." />
      ) : (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3 text-center">Weekly Hrs</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => (
                <CourseTableRow
                  key={row.subject.id}
                  row={row}
                  teacherMap={teacherMap}
                  expanded={expandedId === row.subject.id}
                  onToggle={() => setExpandedId(prev => (prev === row.subject.id ? null : row.subject.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CourseTableRow({
  row,
  teacherMap,
  expanded,
  onToggle
}: {
  row: CourseRow;
  teacherMap: Map<string, Teacher>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { subject } = row;

  return (
    <>
      <tr className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={onToggle}>
        <td className="py-2.5 px-3 text-slate-400">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </td>
        <td className="py-2.5 px-3 font-semibold text-indigo-700">{subject.id}</td>
        <td className="py-2.5 px-3 font-medium text-slate-800">{subject.name}</td>
        <td className="py-2.5 px-3">
          <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">{subject.dept}</span>
        </td>
        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{subject.weeklyHours}</td>
        <td className="py-2.5 px-3 text-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
              subject.isLab ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {subject.isLab ? 'Lab' : 'Theory'}
          </span>
        </td>
        <td className="py-2.5 px-3 w-32">
          <div className="flex items-center gap-2">
            <ProgressBar percent={row.progressPercent} colorClass={row.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'} />
            <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{row.progressPercent}%</span>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Batches Studying This</p>
                {row.batchesUsing.length === 0 ? (
                  <p className="text-slate-400 italic">No batches assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {row.batchesUsing.map(b => (
                      <span key={b.id} className="bg-white border border-slate-200 rounded px-2 py-0.5 font-medium text-slate-700">
                        {b.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Teachers Capable</p>
                {row.assignedTeacherIds.length === 0 ? (
                  <p className="text-slate-400 italic">Not yet assigned to any session.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {row.assignedTeacherIds.map(id => (
                      <span key={id} className="bg-white border border-slate-200 rounded px-2 py-0.5 font-medium text-slate-700">
                        {teacherMap.get(id)?.name || id}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Labs Required</p>
                  <p className="font-black text-slate-900">{subject.isLab ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Remaining Sessions</p>
                  <p className="font-black text-slate-900">{row.remainingHours}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
