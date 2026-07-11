import React, { useState } from 'react';
import { Subject } from '../../types';
import Modal from '../shared/Modal';
import SubjectForm, { SubjectFormValues } from './SubjectForm';
import { validateSubjectForm, SubjectFormErrors } from './validateSubject';
import { Pencil } from 'lucide-react';

interface EditSubjectModalProps {
  subject: Subject;
  subjects: Subject[];
  onSave: (updated: Subject) => void;
  onClose: () => void;
}

export default function EditSubjectModal({ subject, subjects, onSave, onClose }: EditSubjectModalProps) {
  const [values, setValues] = useState<SubjectFormValues>({
    id: subject.id,
    name: subject.name,
    dept: subject.dept,
    weeklyHours: subject.weeklyHours,
    isLab: subject.isLab
  });
  const [errors, setErrors] = useState<SubjectFormErrors>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateSubjectForm(values, subjects, subject.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...subject,
      name: values.name.trim(),
      dept: values.dept.trim() || 'CSE',
      weeklyHours: Number(values.weeklyHours),
      isLab: values.isLab
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Course"
      subtitle="Update course information."
      icon={<Pencil className="w-4.5 h-4.5" />}
      labelId="edit-subject-title"
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
            form="edit-subject-form"
            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <form id="edit-subject-form" onSubmit={handleSave}>
        <SubjectForm values={values} onChange={setValues} errors={errors} idPrefix="edit-subject" lockCode />
      </form>
    </Modal>
  );
}
