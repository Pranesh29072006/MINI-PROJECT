import { Subject } from '../../types';
import { SubjectFormValues } from './SubjectForm';

export type SubjectFormErrors = Partial<Record<'id' | 'name' | 'weeklyHours', string>>;

export function validateSubjectForm(
  values: SubjectFormValues,
  existingSubjects: Subject[],
  excludeId?: string
): SubjectFormErrors {
  const errors: SubjectFormErrors = {};

  if (!values.id.trim()) {
    errors.id = 'Course code cannot be empty.';
  } else {
    const duplicate = existingSubjects.some(
      s => s.id !== excludeId && s.id.toUpperCase() === values.id.trim().toUpperCase()
    );
    if (duplicate) errors.id = `Course code "${values.id.trim().toUpperCase()}" already exists.`;
  }

  if (!values.name.trim()) {
    errors.name = 'Course name cannot be empty.';
  }

  if (!values.weeklyHours || values.weeklyHours <= 0) {
    errors.weeklyHours = 'Weekly hours must be greater than 0.';
  }

  return errors;
}
