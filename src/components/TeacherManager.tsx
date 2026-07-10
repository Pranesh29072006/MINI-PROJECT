import React, { useState } from 'react';
import { Teacher, Subject } from '../types';
import { Plus, Trash2, User, Clock, Eye, Pencil } from 'lucide-react';
import InstructorForm, { InstructorFormValues } from './teachers/InstructorForm';
import { validateInstructorForm, InstructorFormErrors } from './teachers/validateInstructor';
import EditInstructorModal from './teachers/EditInstructorModal';
import ViewInstructorModal from './teachers/ViewInstructorModal';
import ToastStack from './shared/ToastStack';
import { useToast } from '../hooks/useToast';

interface TeacherManagerProps {
  teachers: Teacher[];
  subjects: Subject[];
  onUpdateTeachers: (teachers: Teacher[]) => void;
}

const EMPTY_FORM: InstructorFormValues = {
  name: '',
  dept: '',
  maxHours: 16,
  selectedSubjects: [],
  unavailList: []
};

export default function TeacherManager({ teachers, subjects, onUpdateTeachers }: TeacherManagerProps) {
  const [formValues, setFormValues] = useState<InstructorFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<InstructorFormErrors>({});
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toasts, showToast, dismissToast } = useToast();

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateInstructorForm(formValues, teachers);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const newTeacher: Teacher = {
      id: 'T-' + Date.now(),
      name: formValues.name.trim(),
      dept: formValues.dept.trim(),
      maxHoursPerWeek: Number(formValues.maxHours),
      preferredSubjects: formValues.selectedSubjects,
      unavailability: formValues.unavailList
    };

    onUpdateTeachers([...teachers, newTeacher]);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    showToast(`✅ ${newTeacher.name} added successfully.`);
  };

  const handleDeleteTeacher = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    onUpdateTeachers(teachers.filter(t => t.id !== id));
    if (teacher) showToast(`🗑 ${teacher.name} removed.`);
  };

  const handleSaveEdit = (updated: Teacher) => {
    onUpdateTeachers(teachers.map(t => (t.id === updated.id ? updated : t)));
    setEditingTeacher(null);
    showToast('✅ Instructor updated successfully.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Teacher Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          Add New Instructor
        </h3>

        <form onSubmit={handleAddTeacher} className="space-y-4">
          <InstructorForm values={formValues} onChange={setFormValues} subjects={subjects} errors={formErrors} idPrefix="add-instructor" />

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Instructor
          </button>
        </form>
      </div>

      {/* Teachers List */}
      <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Instructors Database</h3>
          <span className="text-xs text-slate-500 font-medium">{teachers.length} Instructors total</span>
        </div>

        {teachers.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No instructors added yet</p>
            <p className="text-xs text-slate-400 mt-1">Load CSE preset or fill the form on the left</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(teacher => (
              <div key={teacher.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{teacher.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {teacher.dept}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {teacher.maxHoursPerWeek} hrs max
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewingTeacher(teacher)}
                        aria-label={`View ${teacher.name}`}
                        title="View"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTeacher(teacher)}
                        aria-label={`Edit ${teacher.name}`}
                        title="Edit"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        aria-label={`Delete ${teacher.name}`}
                        title="Delete"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teaches:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.preferredSubjects.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None specified</span>
                      ) : (
                        teacher.preferredSubjects.map(subId => {
                          const subObj = subjects.find(s => s.id === subId);
                          return (
                            <span key={subId} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm" title={subObj?.name}>
                              {subId}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Unavailability Block */}
                {teacher.unavailability && teacher.unavailability.length > 0 && (
                  <div className="mt-3 border-t border-slate-100/60 pt-2">
                    <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Busy slots:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.unavailability.map(u =>
                        u.slots.map(s => (
                          <span key={`${u.day}-${s}`} className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            {u.day.substring(0, 3)} {s.split(' ')[0]}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingTeacher && <ViewInstructorModal teacher={viewingTeacher} subjects={subjects} onClose={() => setViewingTeacher(null)} />}

      {editingTeacher && (
        <EditInstructorModal
          teacher={editingTeacher}
          teachers={teachers}
          subjects={subjects}
          onSave={handleSaveEdit}
          onClose={() => setEditingTeacher(null)}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
