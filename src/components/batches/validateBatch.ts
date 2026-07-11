import { ClassBatch } from '../../types';
import { BatchFormValues } from './BatchForm';

export type BatchFormErrors = Partial<Record<'name' | 'size' | 'subjects', string>>;

export function validateBatchForm(
  values: BatchFormValues,
  existingBatches: ClassBatch[],
  excludeId?: string
): BatchFormErrors {
  const errors: BatchFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Batch name cannot be empty.';
  } else {
    const duplicate = existingBatches.some(
      b => b.id !== excludeId && b.name.trim().toLowerCase() === values.name.trim().toLowerCase()
    );
    if (duplicate) errors.name = 'A cohort with this name already exists.';
  }

  if (!values.size || values.size <= 0) {
    errors.size = 'Student count must be greater than 0.';
  }

  if (values.selectedSubjects.length === 0) {
    errors.subjects = 'Select at least one subject.';
  }

  return errors;
}
