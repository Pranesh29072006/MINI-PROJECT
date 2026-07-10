import React, { useState } from 'react';
import { Teacher, Subject } from '../../types';
import Modal from '../shared/Modal';
import InstructorForm, { InstructorFormValues } from './InstructorForm';
import { validateInstructorForm, InstructorFormErrors } from './validateInstructor';
import { Pencil } from 'lucide-react';

interface EditInstructorModalProps {
  teacher: Teacher;
  teachers: Teacher[];
  subjects: Subject[];
  onSave: (updated: Teacher) => void;
  onClose: () => void;
}

export default function EditInstructorModal({ teacher, teachers, subjects, onSave, onClose }: EditInstructorModalProps) {
  const [values, setValues] = useState<InstructorFormValues>({
    name: teacher.name,
    dept: teacher.dept,
    maxHours: teacher.maxHoursPerWeek,
    selectedSubjects: teacher.preferredSubjects,
    unavailList: teacher.unavailability
  });
  const [errors, setErrors] = useState<InstructorFormErrors>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateInstructorForm(values, teachers, teacher.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...teacher,
      name: values.name.trim(),
      dept: values.dept.trim(),
      maxHoursPerWeek: Number(values.maxHours),
      preferredSubjects: values.selectedSubjects,
      unavailability: values.unavailList
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Instructor"
      subtitle="Update instructor information and availability."
      icon={<Pencil className="w-4.5 h-4.5" />}
      labelId="edit-instructor-title"
      maxWidthClass="sm:max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-instructor-form"
            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <form id="edit-instructor-form" onSubmit={handleSave}>
        <InstructorForm values={values} onChange={setValues} subjects={subjects} errors={errors} idPrefix="edit-instructor" />
      </form>
    </Modal>
  );
}
