import { Teacher, Subject, Classroom, ClassBatch, TimetableSession } from '../types';
import { DAYS, DAILY_SLOTS } from '../data/presets';

export type InstructorStatus = 'available' | 'busy' | 'unavailable';

export interface InstructorRow {
  teacher: Teacher;
  assignedHours: number;
  loadPercent: number; // assignedHours / maxHoursPerWeek
  unavailableSlotCount: number;
  status: InstructorStatus;
  sessions: TimetableSession[];
  compactScore: number; // 0-100, higher = fewer distinct days for the same session count
}

export function buildInstructorRows(teachers: Teacher[], sessions: TimetableSession[]): InstructorRow[] {
  return teachers.map(teacher => {
    const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
    const assignedHours = teacherSessions.length;
    const loadPercent = teacher.maxHoursPerWeek > 0 ? Math.min(100, Math.round((assignedHours / teacher.maxHoursPerWeek) * 100)) : 0;
    const unavailableSlotCount = teacher.unavailability?.reduce((sum, u) => sum + u.slots.length, 0) || 0;

    let status: InstructorStatus = 'available';
    if (assignedHours >= teacher.maxHoursPerWeek && teacher.maxHoursPerWeek > 0) status = 'unavailable';
    else if (loadPercent >= 60) status = 'busy';

    const distinctDays = new Set(teacherSessions.map(s => s.day)).size;
    const compactScore = assignedHours === 0
      ? 100
      : Math.max(0, Math.round(100 - ((distinctDays - 1) / Math.max(1, DAYS.length - 1)) * 100));

    return { teacher, assignedHours, loadPercent, unavailableSlotCount, status, sessions: teacherSessions, compactScore };
  });
}

export interface CourseRow {
  subject: Subject;
  scheduledHours: number;
  remainingHours: number;
  progressPercent: number;
  assignedTeacherIds: string[];
  batchesUsing: ClassBatch[];
}

export function buildCourseRows(subjects: Subject[], sessions: TimetableSession[], classBatches: ClassBatch[]): CourseRow[] {
  return subjects.map(subject => {
    const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
    const scheduledHours = subjectSessions.length;
    const remainingHours = Math.max(0, subject.weeklyHours - scheduledHours);
    const progressPercent = subject.weeklyHours > 0 ? Math.min(100, Math.round((scheduledHours / subject.weeklyHours) * 100)) : 0;
    const assignedTeacherIds = Array.from(new Set(subjectSessions.map(s => s.teacherId)));
    const batchesUsing = classBatches.filter(b => b.subjects.includes(subject.id));

    return { subject, scheduledHours, remainingHours, progressPercent, assignedTeacherIds, batchesUsing };
  });
}

export type RoomStatus = 'available' | 'busy' | 'maintenance';

export interface ClassroomRow {
  classroom: Classroom;
  scheduledHours: number;
  availableHours: number;
  usagePercent: number;
  status: RoomStatus;
  sessions: TimetableSession[];
}

export function buildClassroomRows(classrooms: Classroom[], sessions: TimetableSession[]): ClassroomRow[] {
  const totalUsableSlots = DAYS.length * DAILY_SLOTS.filter(t => t !== '12:00 - 01:00').length;

  return classrooms.map(classroom => {
    const roomSessions = sessions.filter(s => s.classroomId === classroom.id);
    const scheduledHours = roomSessions.length;
    const availableHours = Math.max(0, totalUsableSlots - scheduledHours);
    const usagePercent = totalUsableSlots > 0 ? Math.round((scheduledHours / totalUsableSlots) * 100) : 0;

    let status: RoomStatus = 'available';
    if (usagePercent >= 80) status = 'maintenance';
    else if (usagePercent >= 40) status = 'busy';

    return { classroom, scheduledHours, availableHours, usagePercent, status, sessions: roomSessions };
  });
}

export interface BatchRow {
  batch: ClassBatch;
  requiredHours: number;
  scheduledHours: number;
  remainingHours: number;
  completionPercent: number;
  labSessions: number;
  theorySessions: number;
  sessions: TimetableSession[];
}

export function buildBatchRows(classBatches: ClassBatch[], subjects: Subject[], sessions: TimetableSession[]): BatchRow[] {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  return classBatches.map(batch => {
    const requiredHours = batch.subjects.reduce((sum, subId) => sum + (subjectMap.get(subId)?.weeklyHours || 0), 0);
    const batchSessions = sessions.filter(s => s.classBatchId === batch.id);
    const scheduledHours = batchSessions.length;
    const remainingHours = Math.max(0, requiredHours - scheduledHours);
    const completionPercent = requiredHours > 0 ? Math.min(100, Math.round((scheduledHours / requiredHours) * 100)) : 0;
    const labSessions = batchSessions.filter(s => subjectMap.get(s.subjectId)?.isLab).length;
    const theorySessions = scheduledHours - labSessions;

    return { batch, requiredHours, scheduledHours, remainingHours, completionPercent, labSessions, theorySessions, sessions: batchSessions };
  });
}

export interface ScheduledHoursAnalytics {
  requiredHours: number;
  scheduledHours: number;
  remainingHours: number;
  completionPercent: number;
  hoursByDay: { label: string; value: number }[];
  hoursByBatch: { label: string; value: number }[];
  hoursByTeacher: { label: string; value: number }[];
  hoursByClassroom: { label: string; value: number }[];
  busiestTeacher: { label: string; value: number } | null;
  busiestClassroom: { label: string; value: number } | null;
  leastUsedRoom: { label: string; value: number } | null;
  averageDailySessions: number;
}

export function buildScheduledHoursAnalytics(
  sessions: TimetableSession[],
  teachers: Teacher[],
  classrooms: Classroom[],
  classBatches: ClassBatch[],
  subjects: Subject[]
): ScheduledHoursAnalytics {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const requiredHours = classBatches.reduce(
    (sum, b) => sum + b.subjects.reduce((s2, subId) => s2 + (subjectMap.get(subId)?.weeklyHours || 0), 0),
    0
  );
  const scheduledHours = sessions.length;
  const remainingHours = Math.max(0, requiredHours - scheduledHours);
  const completionPercent = requiredHours > 0 ? Math.min(100, Math.round((scheduledHours / requiredHours) * 100)) : 0;

  const hoursByDay = DAYS.map(day => ({ label: day, value: sessions.filter(s => s.day === day).length }));

  const hoursByBatch = classBatches.map(b => ({
    label: b.name,
    value: sessions.filter(s => s.classBatchId === b.id).length
  }));

  const hoursByTeacher = teachers.map(t => ({
    label: t.name,
    value: sessions.filter(s => s.teacherId === t.id).length
  }));

  const hoursByClassroom = classrooms.map(r => ({
    label: r.name,
    value: sessions.filter(s => s.classroomId === r.id).length
  }));

  const maxBy = (rows: { label: string; value: number }[]) =>
    rows.length === 0 ? null : rows.reduce((a, b) => (b.value > a.value ? b : a));
  const minBy = (rows: { label: string; value: number }[]) =>
    rows.length === 0 ? null : rows.reduce((a, b) => (b.value < a.value ? b : a));

  const averageDailySessions = DAYS.length > 0 ? Math.round((scheduledHours / DAYS.length) * 10) / 10 : 0;

  return {
    requiredHours,
    scheduledHours,
    remainingHours,
    completionPercent,
    hoursByDay,
    hoursByBatch,
    hoursByTeacher,
    hoursByClassroom,
    busiestTeacher: maxBy(hoursByTeacher),
    busiestClassroom: maxBy(hoursByClassroom),
    leastUsedRoom: minBy(hoursByClassroom),
    averageDailySessions
  };
}

export function exportRowsAsCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
