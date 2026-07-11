import { Classroom } from '../../types';
import { ClassroomFormValues } from './ClassroomForm';

export type ClassroomFormErrors = Partial<Record<'name' | 'capacity' | 'type' | 'status', string>>;

export function validateClassroomForm(
  values: ClassroomFormValues,
  existingClassrooms: Classroom[],
  excludeId?: string
): ClassroomFormErrors {
  const errors: ClassroomFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Room name cannot be empty.';
  } else {
    const duplicate = existingClassrooms.some(
      c => c.id !== excludeId && c.name.trim().toLowerCase() === values.name.trim().toLowerCase()
    );
    if (duplicate) errors.name = 'A room with this name already exists.';
  }

  if (!values.capacity || values.capacity <= 0) {
    errors.capacity = 'Capacity must be greater than 0.';
  }

  if (!values.type) {
    errors.type = 'Room type is required.';
  }

  if (!values.status) {
    errors.status = 'Status is required.';
  }

  return errors;
}
