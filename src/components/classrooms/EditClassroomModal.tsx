import React, { useState } from 'react';
import { Classroom } from '../../types';
import Modal from '../shared/Modal';
import ClassroomForm, { ClassroomFormValues } from './ClassroomForm';
import { validateClassroomForm, ClassroomFormErrors } from './validateClassroom';
import { Pencil } from 'lucide-react';

interface EditClassroomModalProps {
  classroom: Classroom;
  classrooms: Classroom[];
  onSave: (updated: Classroom) => void;
  onClose: () => void;
}

export default function EditClassroomModal({ classroom, classrooms, onSave, onClose }: EditClassroomModalProps) {
  const [values, setValues] = useState<ClassroomFormValues>({
    name: classroom.name,
    capacity: classroom.capacity,
    type: classroom.type,
    status: classroom.manualStatus || 'available'
  });
  const [errors, setErrors] = useState<ClassroomFormErrors>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateClassroomForm(values, classrooms, classroom.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...classroom,
      name: values.name.trim(),
      capacity: Number(values.capacity),
      type: values.type,
      manualStatus: values.status
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Classroom"
      subtitle="Update room information and status."
      icon={<Pencil className="w-4.5 h-4.5" />}
      labelId="edit-classroom-title"
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
            form="edit-classroom-form"
            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <form id="edit-classroom-form" onSubmit={handleSave}>
        <ClassroomForm values={values} onChange={setValues} errors={errors} idPrefix="edit-classroom" showStatus />
      </form>
    </Modal>
  );
}
