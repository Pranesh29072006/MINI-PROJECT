import { TimetableSession, Teacher, Subject, Classroom, ClassBatch, TimetableConflict } from '../types';

export function checkTimetableConflicts(
  sessions: TimetableSession[],
  teachers: Teacher[],
  subjects: Subject[],
  classrooms: Classroom[],
  classBatches: ClassBatch[]
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  // Create lookups for faster resolution
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const classroomMap = new Map(classrooms.map(c => [c.id, c]));
  const batchMap = new Map(classBatches.map(b => [b.id, b]));

  // Track busy slots for resources: Key = "day|time|resourceId" -> array of session IDs
  const teacherBusy = new Map<string, string[]>();
  const roomBusy = new Map<string, string[]>();
  const batchBusy = new Map<string, string[]>();

  for (const session of sessions) {
    const { id, day, time, teacherId, classroomId, classBatchId, subjectId } = session;
    const timeKey = `${day}|${time}`;

    const teacherKey = `${timeKey}|${teacherId}`;
    const roomKey = `${timeKey}|${classroomId}`;
    const batchKey = `${timeKey}|${classBatchId}`;

    // 1. Teacher Double Booking
    if (teacherId) {
      if (!teacherBusy.has(teacherKey)) {
        teacherBusy.set(teacherKey, []);
      }
      teacherBusy.get(teacherKey)!.push(id);
    }

    // 2. Room Double Booking
    if (classroomId) {
      if (!roomBusy.has(roomKey)) {
        roomBusy.set(roomKey, []);
      }
      roomBusy.get(roomKey)!.push(id);
    }

    // 3. Class Batch Double Booking
    if (classBatchId) {
      if (!batchBusy.has(batchKey)) {
        batchBusy.set(batchKey, []);
      }
      batchBusy.get(batchKey)!.push(id);
    }

    // 4. Individual Session Checks: Room type and capacity, teacher availability
    const teacher = teacherMap.get(teacherId);
    const subject = subjectMap.get(subjectId);
    const classroom = classroomMap.get(classroomId);
    const batch = batchMap.get(classBatchId);

    if (teacher) {
      // Check if teacher is unavailable at this day/time
      const dayUnavailability = teacher.unavailability?.find(u => u.day.toLowerCase() === day.toLowerCase());
      if (dayUnavailability && dayUnavailability.slots.includes(time)) {
        conflicts.push({
          type: 'teacher_unavailability',
          message: `${teacher.name} is marked unavailable on ${day} during ${time}`,
          sessionIds: [id],
          severity: 'high'
        });
      }
    }

    if (subject && classroom) {
      // 5. Room Type Mismatch
      if (subject.isLab && classroom.type !== 'lab') {
        conflicts.push({
          type: 'room_type_mismatch',
          message: `Lab course "${subject.name}" is scheduled in theory classroom "${classroom.name}"`,
          sessionIds: [id],
          severity: 'warning'
        });
      } else if (!subject.isLab && classroom.type === 'lab') {
        conflicts.push({
          type: 'room_type_mismatch',
          message: `Theory course "${subject.name}" is scheduled in lab room "${classroom.name}"`,
          sessionIds: [id],
          severity: 'warning'
        });
      }
    }

    if (batch && classroom) {
      // 6. Room Capacity Overflow
      if (batch.size > classroom.capacity) {
        conflicts.push({
          type: 'room_capacity_overflow',
          message: `Class "${batch.name}" (${batch.size} students) exceeds room "${classroom.name}" capacity (${classroom.capacity})`,
          sessionIds: [id],
          severity: 'warning'
        });
      }
    }
  }

  // Analyze busy maps for double bookings
  teacherBusy.forEach((sessionIds, key) => {
    if (sessionIds.length > 1) {
      const parts = key.split('|');
      const day = parts[0];
      const time = parts[1];
      const teacherId = parts[2];
      const teacher = teacherMap.get(teacherId);
      const name = teacher ? teacher.name : teacherId;

      conflicts.push({
        type: 'teacher_double_booking',
        message: `${name} is scheduled for multiple classes simultaneously on ${day} at ${time}`,
        sessionIds,
        severity: 'high'
      });
    }
  });

  roomBusy.forEach((sessionIds, key) => {
    if (sessionIds.length > 1) {
      const parts = key.split('|');
      const day = parts[0];
      const time = parts[1];
      const roomId = parts[2];
      const classroom = classroomMap.get(roomId);
      const name = classroom ? classroom.name : roomId;

      conflicts.push({
        type: 'room_double_booking',
        message: `Room "${name}" is double-booked on ${day} at ${time}`,
        sessionIds,
        severity: 'high'
      });
    }
  });

  batchBusy.forEach((sessionIds, key) => {
    if (sessionIds.length > 1) {
      const parts = key.split('|');
      const day = parts[0];
      const time = parts[1];
      const batchId = parts[2];
      const batch = batchMap.get(batchId);
      const name = batch ? batch.name : batchId;

      conflicts.push({
        type: 'class_double_booking',
        message: `Student batch "${name}" is scheduled for multiple lectures simultaneously on ${day} at ${time}`,
        sessionIds,
        severity: 'high'
      });
    }
  });

  return conflicts;
}
