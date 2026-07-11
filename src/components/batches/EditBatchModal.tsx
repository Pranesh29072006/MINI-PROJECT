import React, { useState } from 'react';
import { ClassBatch, Subject } from '../../types';
import Modal from '../shared/Modal';
import BatchForm, { BatchFormValues } from './BatchForm';
import { validateBatchForm, BatchFormErrors } from './validateBatch';
import { Pencil } from 'lucide-react';

interface EditBatchModalProps {
  batch: ClassBatch;
  classBatches: ClassBatch[];
  subjects: Subject[];
  onSave: (updated: ClassBatch) => void;
  onClose: () => void;
}

export default function EditBatchModal({ batch, classBatches, subjects, onSave, onClose }: EditBatchModalProps) {
  const [values, setValues] = useState<BatchFormValues>({
    name: batch.name,
    size: batch.size,
    selectedSubjects: batch.subjects
  });
  const [errors, setErrors] = useState<BatchFormErrors>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBatchForm(values, classBatches, batch.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      ...batch,
      name: values.name.trim(),
      size: Number(values.size),
      subjects: values.selectedSubjects
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Student Cohort"
      subtitle="Update batch information and curriculum."
      icon={<Pencil className="w-4.5 h-4.5" />}
      labelId="edit-batch-title"
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
            form="edit-batch-form"
            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <form id="edit-batch-form" onSubmit={handleSave}>
        <BatchForm values={values} onChange={setValues} subjects={subjects} errors={errors} idPrefix="edit-batch" />
      </form>
    </Modal>
  );
}
