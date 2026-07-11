import React from 'react';
import { ClassBatch, Subject, TimetableSession } from '../../types';
import Modal from '../shared/Modal';
import { ProgressBar, SummaryTile } from '../dashboard/shared';
import { buildBatchRows } from '../../lib/dashboardStats';
import { Eye, Users, BookOpen, FlaskConical } from 'lucide-react';

interface ViewBatchModalProps {
  batch: ClassBatch;
  subjects: Subject[];
  sessions: TimetableSession[];
  onClose: () => void;
}

export default function ViewBatchModal({ batch, subjects, sessions, onClose }: ViewBatchModalProps) {
  const row = buildBatchRows([batch], subjects, sessions)[0];
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const theorySubjects = batch.subjects.filter(id => !subjectMap.get(id)?.isLab);
  const labSubjects = batch.subjects.filter(id => subjectMap.get(id)?.isLab);

  return (
    <Modal
      open
      onClose={onClose}
      title={batch.name}
      subtitle="Student cohort details (read-only)"
      icon={<Eye className="w-4.5 h-4.5" />}
      labelId="view-batch-title"
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
      <div className="flex gap-2">
        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Users className="w-2.5 h-2.5" />
          {batch.size} Students
        </span>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <SummaryTile label="Total Subjects" value={batch.subjects.length} />
        <SummaryTile label="Theory" value={theorySubjects.length} />
        <SummaryTile label="Lab" value={labSubjects.length} />
        <SummaryTile label="Weekly Hours" value={row.requiredHours} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Curriculum Summary</span>
          <span className="text-[10px] font-bold text-slate-600">{row.completionPercent}% scheduled</span>
        </div>
        <ProgressBar percent={row.completionPercent} />
        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded-lg py-1.5">
            <p className="text-sm font-black text-slate-900">{row.scheduledHours}</p>
            <p className="text-[9px] uppercase font-bold text-slate-400">Generated</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg py-1.5">
            <p className="text-sm font-black text-slate-900">{row.remainingHours}</p>
            <p className="text-[9px] uppercase font-bold text-slate-400">Remaining</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg py-1.5">
            <p className="text-sm font-black text-slate-900">{row.requiredHours}</p>
            <p className="text-[9px] uppercase font-bold text-slate-400">Total Reqd.</p>
          </div>
        </div>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Theory Subjects
        </span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {theorySubjects.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None specified</span>
          ) : (
            theorySubjects.map(subId => {
              const subObj = subjectMap.get(subId);
              return (
                <span
                  key={subId}
                  className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm"
                  title={subObj?.name}
                >
                  {subId}
                </span>
              );
            })
          )}
        </div>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider flex items-center gap-1">
          <FlaskConical className="w-3 h-3" /> Lab Subjects
        </span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {labSubjects.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None specified</span>
          ) : (
            labSubjects.map(subId => {
              const subObj = subjectMap.get(subId);
              return (
                <span
                  key={subId}
                  className="bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm"
                  title={subObj?.name}
                >
                  {subId}
                </span>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
