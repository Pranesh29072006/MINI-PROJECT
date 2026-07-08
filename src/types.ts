export interface Teacher {
  id: string;
  name: string;
  dept: string;
  maxHoursPerWeek: number;
  preferredSubjects: string[]; // Subject IDs
  unavailability: { day: string; slots: string[] }[]; // Day and slot labels (e.g. "09:00 - 10:00")
}

export interface Subject {
  id: string; // e.g. "CS301"
  name: string;
  dept: string;
  weeklyHours: number;
  isLab: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'theory' | 'lab';
}

export interface ClassBatch {
  id: string;
  name: string; // e.g., "CSE-3A"
  size: number;
  subjects: string[]; // Subject IDs to schedule
}

export interface TimeSlot {
  day: string; // "Monday", "Tuesday", etc.
  time: string; // "09:00 - 10:00" etc.
  isBreak?: boolean;
}

export interface TimetableSession {
  id: string;
  day: string;
  time: string;
  classBatchId: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
}

export interface TimetableConflict {
  type: 'teacher_double_booking' | 'room_double_booking' | 'class_double_booking' | 'teacher_unavailability' | 'room_type_mismatch' | 'room_capacity_overflow';
  message: string;
  sessionIds: string[];
  severity: 'high' | 'warning';
}

export interface GeneratorRequest {
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  classBatches: ClassBatch[];
  timeSlots: TimeSlot[];
  optimizeForGaps?: boolean;
  optimizeForTeacherCompactness?: boolean;
}

export interface GeneratorResponse {
  sessions: TimetableSession[];
  conflicts: TimetableConflict[];
  aiNotes?: string;
  success: boolean;
}
