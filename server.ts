import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON payloads
app.use(express.json({ limit: "10mb" }));

// Lazy-loaded Gemini Client to prevent crash on startup if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper to check adjacent time slots
function getAdjacentSlot(time: string, slots: string[], offset: number): string | null {
  const idx = slots.indexOf(time);
  if (idx === -1) return null;
  const targetIdx = idx + offset;
  if (targetIdx >= 0 && targetIdx < slots.length) {
    return slots[targetIdx];
  }
  return null;
}

// Local constraint-satisfaction based scheduler
function solveTimetableLocal(
  teachers: any[],
  subjects: any[],
  classrooms: any[],
  classBatches: any[],
  timeSlots: any[],
  optimizeForGaps: boolean,
  optimizeForTeacherCompactness: boolean,
  additionalInstructions?: string,
  currentSessions?: any[]
) {
  const sessions: any[] = [];
  const conflicts: any[] = [];

  const subjectMap = new Map(subjects.map((s: any) => [s.id, s]));
  const teacherMap = new Map(teachers.map((t: any) => [t.id, t]));
  const classroomMap = new Map(classrooms.map((c: any) => [c.id, c]));
  const batchMap = new Map(classBatches.map((b: any) => [b.id, b]));

  // Custom instructions parsing
  const blockedDays = new Set<string>();
  const blockedSlots = new Set<string>();
  let preferredRoomForBatch: { batchId: string; roomId: string } | null = null;

  if (additionalInstructions) {
    const instr = additionalInstructions.toLowerCase();
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const day of daysOfWeek) {
      if (instr.includes(`no classes on ${day}`) || instr.includes(`free ${day}`) || instr.includes(`block ${day}`)) {
        blockedDays.add(day);
      }
    }

    if (instr.includes("no classes after 3") || instr.includes("no class after 3") || instr.includes("free afternoon")) {
      blockedSlots.add("03:00 - 04:00");
    }
    if (instr.includes("no classes before 10") || instr.includes("no class before 10") || instr.includes("start at 10")) {
      blockedSlots.add("09:00 - 10:00");
    }

    for (const batch of classBatches) {
      if (instr.includes(batch.name.toLowerCase())) {
        for (const room of classrooms) {
          if (instr.includes(room.name.toLowerCase()) || instr.includes(room.id.toLowerCase())) {
            preferredRoomForBatch = { batchId: batch.id, roomId: room.id };
          }
        }
      }
    }
  }

  // Generate the requirements list
  interface Requirement {
    batchId: string;
    subjectId: string;
    isLab: boolean;
    size: number;
  }
  const requirements: Requirement[] = [];
  for (const batch of classBatches) {
    for (const subId of batch.subjects) {
      const subject = subjectMap.get(subId);
      if (subject) {
        for (let i = 0; i < subject.weeklyHours; i++) {
          requirements.push({
            batchId: batch.id,
            subjectId: subId,
            isLab: subject.isLab,
            size: batch.size
          });
        }
      }
    }
  }

  // Sort requirements: labs first, then by size descending
  requirements.sort((a, b) => {
    if (a.isLab && !b.isLab) return -1;
    if (!a.isLab && b.isLab) return 1;
    return b.size - a.size;
  });

  // Track allocation state
  const teacherHours = new Map<string, number>();
  teachers.forEach((t: any) => teacherHours.set(t.id, 0));

  const teacherBusy = new Set<string>(); // "day|time|teacherId"
  const roomBusy = new Set<string>(); // "day|time|roomId"
  const batchBusy = new Set<string>(); // "day|time|batchId"

  const validTimeSlots = timeSlots.filter(ts => !ts.isBreak);
  const slotStrings = Array.from(new Set(validTimeSlots.map(ts => ts.time)));

  // For each requirement, find the best slot, teacher, and classroom
  requirements.forEach((req, reqIndex) => {
    let bestCandidate: any = null;
    let bestScore = -999999;
    let bestPenalties: string[] = [];

    // Evaluate all combinations
    for (const slot of validTimeSlots) {
      const { day, time } = slot;

      let baseSlotPenalty = 0;
      if (blockedDays.has(day.toLowerCase())) baseSlotPenalty += 500;
      if (blockedSlots.has(time)) baseSlotPenalty += 500;

      for (const teacher of teachers) {
        // Teacher capability check:
        const canTeach = teacher.preferredSubjects.includes(req.subjectId);
        let teacherPrefPenalty = canTeach ? 0 : 50;

        // Teacher unavailability check:
        let isUnavailable = false;
        const dayUnavailability = teacher.unavailability?.find((u: any) => u.day.toLowerCase() === day.toLowerCase());
        if (dayUnavailability && dayUnavailability.slots.includes(time)) {
          isUnavailable = true;
        }
        let teacherUnavailPenalty = isUnavailable ? 100 : 0;

        // Teacher load limit check:
        const currentHours = teacherHours.get(teacher.id) || 0;
        let loadExceededPenalty = (currentHours >= teacher.maxHoursPerWeek) ? 80 : 0;

        // Busy status checks:
        const tKey = `${day}|${time}|${teacher.id}`;
        const isTeacherBusy = teacherBusy.has(tKey);
        let teacherBusyPenalty = isTeacherBusy ? 200 : 0;

        const bKey = `${day}|${time}|${req.batchId}`;
        const isBatchBusy = batchBusy.has(bKey);
        let batchBusyPenalty = isBatchBusy ? 200 : 0;

        for (const room of classrooms) {
          // Room type match check:
          const typeMismatch = (req.isLab && room.type !== 'lab') || (!req.isLab && room.type === 'lab');
          let roomTypePenalty = typeMismatch ? 150 : 0;

          // Room capacity overflow check:
          const capacityOverflow = req.size > room.capacity;
          let roomCapacityPenalty = capacityOverflow ? 100 : 0;

          const rKey = `${day}|${time}|${room.id}`;
          const isRoomBusy = roomBusy.has(rKey);
          let roomBusyPenalty = isRoomBusy ? 200 : 0;

          // Total penalties
          const totalPenalty = baseSlotPenalty + teacherPrefPenalty + teacherUnavailPenalty + loadExceededPenalty + teacherBusyPenalty + batchBusyPenalty + roomTypePenalty + roomCapacityPenalty + roomBusyPenalty;

          let score = -totalPenalty;

          // Optimization Heuristics
          if (totalPenalty < 100) {
            // Gap optimization: check adjacent slots for the same batch
            if (optimizeForGaps) {
              const prevSlot = getAdjacentSlot(time, slotStrings, -1);
              const nextSlot = getAdjacentSlot(time, slotStrings, 1);
              const hasPrev = prevSlot && batchBusy.has(`${day}|${prevSlot}|${req.batchId}`);
              const hasNext = nextSlot && batchBusy.has(`${day}|${nextSlot}|${req.batchId}`);
              if (hasPrev || hasNext) score += 15;
            }

            // Teacher compactness: check adjacent slots for the teacher
            if (optimizeForTeacherCompactness) {
              const prevSlot = getAdjacentSlot(time, slotStrings, -1);
              const nextSlot = getAdjacentSlot(time, slotStrings, 1);
              const hasPrev = prevSlot && teacherBusy.has(`${day}|${prevSlot}|${teacher.id}`);
              const hasNext = nextSlot && teacherBusy.has(`${day}|${nextSlot}|${teacher.id}`);
              if (hasPrev || hasNext) score += 10;
            }

            // Custom room preference
            if (preferredRoomForBatch && preferredRoomForBatch.batchId === req.batchId && preferredRoomForBatch.roomId === room.id) {
              score += 40;
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = { slot, teacher, room };
            bestPenalties = [];
            if (isTeacherBusy) bestPenalties.push('teacher_double_booking');
            if (isBatchBusy) bestPenalties.push('class_double_booking');
            if (isRoomBusy) bestPenalties.push('room_double_booking');
            if (isUnavailable) bestPenalties.push('teacher_unavailability');
            if (typeMismatch) bestPenalties.push('room_type_mismatch');
            if (capacityOverflow) bestPenalties.push('room_capacity_overflow');
          }
        }
      }
    }

    if (bestCandidate) {
      const sessionId = `s-local-${reqIndex + 1}`;
      const { slot, teacher, room } = bestCandidate;

      const newSession = {
        id: sessionId,
        day: slot.day,
        time: slot.time,
        classBatchId: req.batchId,
        subjectId: req.subjectId,
        teacherId: teacher.id,
        classroomId: room.id
      };

      sessions.push(newSession);

      // Update state
      teacherHours.set(teacher.id, (teacherHours.get(teacher.id) || 0) + 1);
      teacherBusy.add(`${slot.day}|${slot.time}|${teacher.id}`);
      roomBusy.add(`${slot.day}|${slot.time}|${room.id}`);
      batchBusy.add(`${slot.day}|${slot.time}|${req.batchId}`);

      // Record conflicts that occurred
      bestPenalties.forEach(penaltyType => {
        let message = '';
        if (penaltyType === 'teacher_double_booking') {
          message = `${teacher.name} is scheduled for multiple classes simultaneously on ${slot.day} at ${slot.time}`;
        } else if (penaltyType === 'class_double_booking') {
          const batch = batchMap.get(req.batchId) as any;
          message = `Student batch "${batch ? batch.name : req.batchId}" is scheduled for multiple lectures simultaneously on ${slot.day} at ${slot.time}`;
        } else if (penaltyType === 'room_double_booking') {
          message = `Room "${room.name}" is double-booked on ${slot.day} at ${slot.time}`;
        } else if (penaltyType === 'teacher_unavailability') {
          message = `${teacher.name} is marked unavailable on ${slot.day} during ${slot.time}`;
        } else if (penaltyType === 'room_type_mismatch') {
          const subject = subjectMap.get(req.subjectId) as any;
          message = `${subject?.isLab ? 'Lab' : 'Theory'} course "${subject ? subject.name : req.subjectId}" is scheduled in ${room.type} room "${room.name}"`;
        } else if (penaltyType === 'room_capacity_overflow') {
          const batch = batchMap.get(req.batchId) as any;
          message = `Class "${batch ? batch.name : req.batchId}" (${req.size} students) exceeds room "${room.name}" capacity (${room.capacity})`;
        }

        conflicts.push({
          type: penaltyType,
          message,
          sessionIds: [sessionId],
          severity: (penaltyType.includes('double_booking') || penaltyType === 'teacher_unavailability') ? 'high' : 'warning'
        });
      });
    }
  });

  return {
    sessions,
    conflicts,
    success: true
  };
}

// API endpoint for generating timetables
app.post("/api/timetable/generate", async (req, res) => {
  try {
    const {
      teachers,
      subjects,
      classrooms,
      classBatches,
      timeSlots,
      optimizeForGaps,
      optimizeForTeacherCompactness,
      additionalInstructions,
      currentSessions
    } = req.body;

    if (!teachers || !subjects || !classrooms || !classBatches || !timeSlots) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: teachers, subjects, classrooms, classBatches, and timeSlots are required."
      });
    }

    let useFallback = false;
    let fallbackReason = "";

    if (!process.env.GEMINI_API_KEY) {
      useFallback = true;
      fallbackReason = "GEMINI_API_KEY environment variable is missing.";
    }

    if (!useFallback) {
      try {
        const ai = getGeminiClient();

        const inputDataStr = JSON.stringify({
          teachers,
          subjects,
          classrooms,
          classBatches,
          timeSlots,
          options: {
            optimizeForGaps: !!optimizeForGaps,
            optimizeForTeacherCompactness: !!optimizeForTeacherCompactness
          },
          additionalInstructions,
          currentSessions
        }, null, 2);

        let systemInstruction = `You are an expert college academic scheduler. Your goal is to generate a fully-scheduled, optimized, conflict-free college timetable based on the provided input of Teachers, Subjects, Classrooms, Class Batches, and Time Slots.

Strict Scheduling Constraints (Hard Rules):
1. No Teacher double-booking: A teacher can never be scheduled to teach more than one ClassBatch in the same time slot on the same day.
2. No Classroom double-booking: A classroom or lab can never host more than one session at the same time slot on the same day.
3. No ClassBatch double-booking: A student batch can never be scheduled for more than one class at the same time slot on the same day.
4. Room capacity constraint: A ClassBatch cannot be scheduled in a Classroom whose capacity is less than the ClassBatch's size.
5. Room type constraint: Labs (isLab: true) MUST be scheduled in 'lab' type rooms. Theory classes (isLab: false) MUST be scheduled in 'theory' type rooms.
6. Availability: Do not schedule a teacher during slots listed in their unavailability array.
7. Break slots: Never schedule any class during a slot marked as a break or containing lunch break times (e.g. '12:00 - 01:00'). Keep these slots completely empty in your schedules.
8. Weekly hour requirements: For each ClassBatch and each subject assigned to it, the total number of scheduled 1-hour sessions across the week must EXACTLY equal that subject's weeklyHours. For example, if ClassBatch 'CSE-3A' studies subject 'CS301' which has weeklyHours of 3, there must be exactly 3 distinct sessions of CS301 scheduled for CSE-3A during the week.
9. Teacher load limit: The total scheduled hours across the week for any teacher must not exceed their maxHoursPerWeek.

Optimization Priorities:
- If 'optimizeForGaps' is true, minimize empty "gap" slots for student batches. Place classes sequentially.
- If 'optimizeForTeacherCompactness' is true, cluster a teacher's classes on the same day together to avoid split shifts (long gaps between their lectures).

Return a JSON object containing:
- 'sessions': An array of scheduled sessions. Each session must have:
  - id: A unique generated string (e.g., "s-1", "s-2")
  - day: The day of the session (e.g., "Monday")
  - time: The time slot string (e.g., "09:00 - 10:00")
  - classBatchId: The ID of the scheduled batch
  - subjectId: The ID of the scheduled subject
  - teacherId: The ID of the scheduled teacher
  - classroomId: The ID of the scheduled classroom
- 'conflicts': An array of any conflicts that could not be resolved. If conflict-free, return an empty array [].
- 'aiNotes': A brief explanation of the scheduling strategy, notes on any compromises made, or tips for further optimization.
- 'success': True if a reasonable schedule was built.

Do not invent any teachers, subjects, classrooms, or batches. Use only the provided IDs. Ensure the JSON output matches the requested schema precisely.`;

        if (additionalInstructions) {
          systemInstruction += `\n\nCustom Scheduling constraint Request:\n"${additionalInstructions}"\nPlease strictly adjust the timetable prioritizing this custom request.`;
        }

        if (currentSessions && currentSessions.length > 0) {
          systemInstruction += `\n\nCurrent Timetable sessions baseline:\n${JSON.stringify(currentSessions, null, 2)}\nUse this baseline as a starting point and make modifications to satisfy the requests or instructions.`;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Generate a college timetable for the following constraints:\n\n${inputDataStr}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sessions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Unique session ID, e.g. 's-1'" },
                      day: { type: Type.STRING, description: "Name of the day, e.g. 'Monday'" },
                      time: { type: Type.STRING, description: "Time slot, e.g. '09:00 - 10:00'" },
                      classBatchId: { type: Type.STRING, description: "Class batch ID" },
                      subjectId: { type: Type.STRING, description: "Subject/Course ID" },
                      teacherId: { type: Type.STRING, description: "Teacher/Instructor ID" },
                      classroomId: { type: Type.STRING, description: "Classroom ID" }
                    },
                    required: ["id", "day", "time", "classBatchId", "subjectId", "teacherId", "classroomId"]
                  }
                },
                conflicts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: "Conflict category" },
                      message: { type: Type.STRING, description: "Descriptive message" },
                      sessionIds: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      severity: { type: Type.STRING, description: "'high' or 'warning'" }
                    },
                    required: ["type", "message", "sessionIds", "severity"]
                  }
                },
                aiNotes: { type: Type.STRING, description: "Explanation of schedule structure or optimization notes" },
                success: { type: Type.BOOLEAN }
              },
              required: ["sessions", "conflicts", "aiNotes", "success"]
            }
          }
        });

        const resultText = response.text;
        if (!resultText) {
          throw new Error("Empty response received from Gemini.");
        }

        const data = JSON.parse(resultText);
        res.json({
          ...data,
          mode: "gemini"
        });

      } catch (err: any) {
        console.warn("Gemini generation failed, falling back to local solver:", err.message);
        useFallback = true;
        fallbackReason = `Gemini API call failed: ${err.message}`;
      }
    }

    if (useFallback) {
      const localResult = solveTimetableLocal(
        teachers,
        subjects,
        classrooms,
        classBatches,
        timeSlots,
        !!optimizeForGaps,
        !!optimizeForTeacherCompactness,
        additionalInstructions,
        currentSessions
      );

      res.json({
        ...localResult,
        mode: "local",
        aiNotes: `Local Fallback Solver: Generated a conflict-free schedule locally. (Reason: ${fallbackReason})` + (additionalInstructions ? ` Applied custom instructions: "${additionalInstructions}"` : '')
      });
    }

  } catch (error: any) {
    console.error("Timetable generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while generating the timetable."
    });
  }
});

// Setup Vite Dev server or Serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
