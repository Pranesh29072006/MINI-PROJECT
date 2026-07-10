import React, { useMemo } from 'react';
import { Teacher, Subject, Classroom, ClassBatch, TimetableSession } from '../../types';
import { buildScheduledHoursAnalytics, exportRowsAsCSV } from '../../lib/dashboardStats';
import { ProgressCircle, BarList, SummaryTile } from './shared';
import { Flame, Building2, MapPinOff, CalendarClock, FileDown, Printer } from 'lucide-react';

interface ScheduledHoursDetailsProps {
  sessions: TimetableSession[];
  teachers: Teacher[];
  classrooms: Classroom[];
  classBatches: ClassBatch[];
  subjects: Subject[];
}

export default function ScheduledHoursDetails({ sessions, teachers, classrooms, classBatches, subjects }: ScheduledHoursDetailsProps) {
  const analytics = useMemo(
    () => buildScheduledHoursAnalytics(sessions, teachers, classrooms, classBatches, subjects),
    [sessions, teachers, classrooms, classBatches, subjects]
  );

  const handleExport = () => {
    exportRowsAsCSV(
      'scheduled_hours_analytics.csv',
      ['Metric', 'Value'],
      [
        ['Required Hours', analytics.requiredHours],
        ['Scheduled Hours', analytics.scheduledHours],
        ['Remaining Hours', analytics.remainingHours],
        ['Completion %', analytics.completionPercent],
        ['Average Daily Sessions', analytics.averageDailySessions],
        ['Busiest Teacher', analytics.busiestTeacher?.label || '—'],
        ['Busiest Classroom', analytics.busiestClassroom?.label || '—'],
        ['Least Used Room', analytics.leastUsedRoom?.label || '—'],
        ...analytics.hoursByDay.map(d => [`Hours on ${d.label}`, d.value])
      ]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-2 rounded-lg transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" /> CSV
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-2 rounded-lg transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-center bg-slate-50 border border-slate-100 rounded-2xl p-5">
        <ProgressCircle percent={analytics.completionPercent} label="Complete" />
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile label="Required Hours" value={analytics.requiredHours} />
          <SummaryTile label="Scheduled" value={analytics.scheduledHours} />
          <SummaryTile label="Remaining" value={analytics.remainingHours} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard title="Hours by Day">
          <BarList data={analytics.hoursByDay} colorClass="bg-indigo-500" />
        </ChartCard>
        <ChartCard title="Hours by Batch">
          <BarList data={analytics.hoursByBatch} colorClass="bg-teal-500" />
        </ChartCard>
        <ChartCard title="Hours by Teacher">
          <BarList data={analytics.hoursByTeacher} colorClass="bg-amber-500" />
        </ChartCard>
        <ChartCard title="Hours by Classroom">
          <BarList data={analytics.hoursByClassroom} colorClass="bg-rose-500" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InsightTile icon={<Flame className="w-4 h-4" />} label="Busiest Teacher" value={analytics.busiestTeacher?.label || '—'} accent="text-amber-600 bg-amber-50" />
        <InsightTile icon={<Building2 className="w-4 h-4" />} label="Busiest Classroom" value={analytics.busiestClassroom?.label || '—'} accent="text-rose-600 bg-rose-50" />
        <InsightTile icon={<MapPinOff className="w-4 h-4" />} label="Least Used Room" value={analytics.leastUsedRoom?.label || '—'} accent="text-slate-600 bg-slate-100" />
        <InsightTile icon={<CalendarClock className="w-4 h-4" />} label="Avg Daily Sessions" value={String(analytics.averageDailySessions)} accent="text-indigo-600 bg-indigo-50" />
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-white">
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function InsightTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="border border-slate-100 rounded-xl p-3 bg-white flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider truncate">{label}</p>
        <p className="text-xs font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}
