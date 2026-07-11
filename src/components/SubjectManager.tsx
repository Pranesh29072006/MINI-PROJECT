import React, { useState } from 'react';
import { Subject, Teacher, ClassBatch, TimetableSession } from '../types';
import { Plus, Trash2, BookOpen, Clock, Eye, Pencil } from 'lucide-react';
import SubjectForm, { SubjectFormValues } from './subjects/SubjectForm';
import { validateSubjectForm, SubjectFormErrors } from './subjects/validateSubject';
import ViewSubjectModal from './subjects/ViewSubjectModal';
import EditSubjectModal from './subjects/EditSubjectModal';
import ToastStack from './shared/ToastStack';
import { useToast } from '../hooks/useToast';

interface SubjectManagerProps {
  subjects: Subject[];
  teachers: Teacher[];
  classBatches: ClassBatch[];
  sessions: TimetableSession[];
  onUpdateSubjects: (subjects: Subject[]) => void;
}

const EMPTY_FORM: SubjectFormValues = { id: '', name: '', dept: '', weeklyHours: 3, isLab: false };

export default function SubjectManager({ subjects, teachers, classBatches, sessions, onUpdateSubjects }: SubjectManagerProps) {
  const [formValues, setFormValues] = useState<SubjectFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<SubjectFormErrors>({});
  const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toasts, showToast, dismissToast } = useToast();

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateSubjectForm(formValues, subjects);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const newSubject: Subject = {
      id: formValues.id.trim().toUpperCase(),
      name: formValues.name.trim(),
      dept: formValues.dept.trim() || 'CSE',
      weeklyHours: Number(formValues.weeklyHours),
      isLab: formValues.isLab
    };

    onUpdateSubjects([...subjects, newSubject]);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    showToast(`✅ ${newSubject.id} added successfully.`);
  };

  const handleDeleteSubject = (subId: string) => {
    onUpdateSubjects(subjects.filter(s => s.id !== subId));
    showToast(`🗑 ${subId} removed.`);
  };

  const handleSaveEdit = (updated: Subject) => {
    onUpdateSubjects(subjects.map(s => (s.id === updated.id ? updated : s)));
    setEditingSubject(null);
    showToast('✅ Updated successfully.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Subject Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Add New Subject
        </h3>

        <form onSubmit={handleAddSubject} className="space-y-4">
          <SubjectForm values={formValues} onChange={setFormValues} errors={formErrors} idPrefix="add-subject" />

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subject
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Courses Database</h3>
          <span className="text-xs text-slate-500 font-medium">{subjects.length} Subjects total</span>
        </div>

        {subjects.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No subjects added yet</p>
            <p className="text-xs text-slate-400 mt-1">Load preset or fill the form on the left</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3">Subject Name</th>
                  <th className="py-2 px-3">Dept</th>
                  <th className="py-2 px-3 text-center">Hours/Week</th>
                  <th className="py-2 px-3 text-center">Type</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-indigo-700">{sub.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{sub.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {sub.dept}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {sub.weeklyHours}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        sub.isLab
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {sub.isLab ? 'Lab' : 'Theory'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSubject(sub)}
                          aria-label={`View ${sub.name}`}
                          title="View Details"
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingSubject(sub)}
                          aria-label={`Edit ${sub.name}`}
                          title="Edit Record"
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          aria-label={`Delete ${sub.name}`}
                          title="Delete Record"
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingSubject && (
        <ViewSubjectModal
          subject={viewingSubject}
          teachers={teachers}
          classBatches={classBatches}
          sessions={sessions}
          onClose={() => setViewingSubject(null)}
        />
      )}

      {editingSubject && (
        <EditSubjectModal subject={editingSubject} subjects={subjects} onSave={handleSaveEdit} onClose={() => setEditingSubject(null)} />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
