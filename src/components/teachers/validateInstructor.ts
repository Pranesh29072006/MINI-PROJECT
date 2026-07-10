import { Teacher } from '../../types';
import { InstructorFormValues } from './InstructorForm';

export type InstructorFormErrors = Partial<Record<'name' | 'dept' | 'maxHours', string>>;

export function validateInstructorForm(
  values: InstructorFormValues,
  existingTeachers: Teacher[],
  excludeId?: string
): InstructorFormErrors {
  const errors: InstructorFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Name cannot be empty.';
  } else {
    const duplicate = existingTeachers.some(
      t => t.id !== excludeId && t.name.trim().toLowerCase() === values.name.trim().toLowerCase()
    );
    if (duplicate) errors.name = 'An instructor with this name already exists.';
  }

  if (!values.dept.trim()) {
    errors.dept = 'Department cannot be empty.';
  }

  if (!values.maxHours || values.maxHours <= 0) {
    errors.maxHours = 'Maximum hours must be greater than 0.';
  }

  return errors;
}
