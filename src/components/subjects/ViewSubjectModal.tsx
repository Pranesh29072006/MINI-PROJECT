import React from 'react';
import { Subject, Teacher, ClassBatch, TimetableSession } from '../../types';
import Modal from '../shared/Modal';
import { ProgressBar, SummaryTile } from '../dashboard/shared';
import { buildCourseRows } from '../../lib/dashboardStats';
import { Eye } from 'lucide-react';

interface ViewSubjectModalProps {
  subject: Subject;
  teachers: Teacher[];
  classBatches: ClassBatch[];
  sessions: TimetableSession[];
  onClose: () => void;
}

export default function ViewSubjectModal({ subject, teachers, classBatches, sessions, onClose }: ViewSubjectModalProps) {
  const row = buildCourseRows([subject], sessions, classBatches)[0];
  const teacherMap = new Map(teachers.map(t => [t.id, t]));

  return (
    <Modal
      open
      onClose={onClose}
      title={`${subject.id} — ${subject.name}`}
      subtitle="Course details (read-only)"
      icon={<Eye className="w-4.5 h-4.5" />}
      labelId="view-subject-title"
      maxWidthClass="sm:max-w-lg"
      footer={
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">{subject.dept}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            subject.isLab ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}
        >
          {subject.isLab ? 'Lab' : 'Theory'}
        </span>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{subject.weeklyHours} hrs/week</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <SummaryTile label="Scheduled" value={row.scheduledHours} />
        <SummaryTile label="Remaining" value={row.remainingHours} />
        <SummaryTile label="Completion" value={`${row.progressPercent}%`} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scheduling Progress</span>
          <span className="text-[10px] font-bold text-slate-600">{row.progressPercent}%</span>
        </div>
        <ProgressBar percent={row.progressPercent} />
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Teachers</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {row.assignedTeacherIds.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None assigned yet</span>
          ) : (
            row.assignedTeacherIds.map(id => (
              <span key={id} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm">
                {teacherMap.get(id)?.name || id}
              </span>
            ))
          )}
        </div>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Student Cohorts</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {row.batchesUsing.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None assigned yet</span>
          ) : (
            row.batchesUsing.map(b => (
              <span key={b.id} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm">
                {b.name}
              </span>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
