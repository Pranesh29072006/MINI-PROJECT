import React from 'react';
import { Teacher, Subject } from '../../types';
import Modal from '../shared/Modal';
import { Eye, Clock, BookOpen, Calendar } from 'lucide-react';

interface ViewInstructorModalProps {
  teacher: Teacher;
  subjects: Subject[];
  onClose: () => void;
}

export default function ViewInstructorModal({ teacher, subjects, onClose }: ViewInstructorModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={teacher.name}
      subtitle="Instructor details (read-only)"
      icon={<Eye className="w-4.5 h-4.5" />}
      labelId="view-instructor-title"
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
        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{teacher.dept}</span>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          {teacher.maxHoursPerWeek} hrs max
        </span>
      </div>

      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Preferred Subjects
        </span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {teacher.preferredSubjects.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None specified</span>
          ) : (
            teacher.preferredSubjects.map(subId => {
              const subObj = subjects.find(s => s.id === subId);
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
        <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Unavailable Slots
        </span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {teacher.unavailability.length === 0 ? (
            <span className="text-xs text-slate-400 italic">None specified</span>
          ) : (
            teacher.unavailability.map(u =>
              u.slots.map(s => (
                <span key={`${u.day}-${s}`} className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {u.day.substring(0, 3)} {s.split(' ')[0]}
                </span>
              ))
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
