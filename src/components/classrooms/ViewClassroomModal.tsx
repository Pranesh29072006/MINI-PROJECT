import React, { useMemo } from 'react';
import { Classroom, Subject, Teacher, ClassBatch, TimetableSession } from '../../types';
import Modal from '../shared/Modal';
import { ProgressBar, SummaryTile, StatusBadge } from '../dashboard/shared';
import { buildClassroomRows } from '../../lib/dashboardStats';
import { Eye, Users } from 'lucide-react';

interface ViewClassroomModalProps {
  classroom: Classroom;
  subjects: Subject[];
  teachers: Teacher[];
  classBatches: ClassBatch[];
  sessions: TimetableSession[];
  onClose: () => void;
}

export default function ViewClassroomModal({ classroom, subjects, teachers, classBatches, sessions, onClose }: ViewClassroomModalProps) {
  const row = buildClassroomRows([classroom], sessions)[0];

  const subjectsUsed = useMemo(() => Array.from(new Set(row.sessions.map(s => s.subjectId))), [row.sessions]);
  const teachersUsed = useMemo(() => Array.from(new Set(row.sessions.map(s => s.teacherId))), [row.sessions]);
  const batchesUsed = useMemo(() => Array.from(new Set(row.sessions.map(s => s.classBatchId))), [row.sessions]);

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const batchMap = new Map(classBatches.map(b => [b.id, b]));

  return (
    <Modal
      open
      onClose={onClose}
      title={classroom.name}
      subtitle={`Room ID: ${classroom.id}`}
      icon={<Eye className="w-4.5 h-4.5" />}
      labelId="view-classroom-title"
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
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
            classroom.type === 'lab' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
          }`}
        >
          {classroom.type === 'lab' ? 'Lab Room' : 'Theory Room'}
        </span>
        <StatusBadge status={row.status} />
        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Users className="w-2.5 h-2.5" />
          {classroom.capacity} capacity
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <SummaryTile label="Scheduled Hrs" value={row.scheduledHours} />
        <SummaryTile label="Available Hrs" value={row.availableHours} />
        <SummaryTile label="Weekly Occupancy" value={`${row.usagePercent}%`} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Usage</span>
          <span className="text-[10px] font-bold text-slate-600">{row.usagePercent}%</span>
        </div>
        <ProgressBar percent={row.usagePercent} colorClass={row.usagePercent >= 80 ? 'bg-rose-500' : row.usagePercent >= 40 ? 'bg-amber-500' : 'bg-emerald-500'} />
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Associated Sessions</span>
        <p className="text-xs text-slate-600 mt-1">{row.sessions.length} session(s) scheduled this week</p>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Associated Teachers</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {teachersUsed.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None</span>
          ) : (
            teachersUsed.map(id => (
              <span key={id} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm">
                {teacherMap.get(id)?.name || id}
              </span>
            ))
          )}
        </div>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Associated Batches</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {batchesUsed.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None</span>
          ) : (
            batchesUsed.map(id => (
              <span key={id} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm">
                {batchMap.get(id)?.name || id}
              </span>
            ))
          )}
        </div>
      </div>

      {subjectsUsed.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subjects Held Here</span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {subjectsUsed.map(id => (
              <span key={id} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm" title={subjectMap.get(id)?.name}>
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
