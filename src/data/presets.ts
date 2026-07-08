import { Teacher, Subject, Classroom, ClassBatch, TimeSlot } from '../types';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DAILY_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 01:00', // LUNCH BREAK
  '01:00 - 02:00',
  '02:00 - 03:00',
  '03:00 - 04:00'
];

export interface PresetDataset {
  name: string;
  description: string;
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  classBatches: ClassBatch[];
}

export const PRESET_DATASETS: PresetDataset[] = [
  {
    name: "Computer Science & Engineering",
    description: "Standard CS department schedule covering theory of computation, algorithms, compilers, networks, databases, and labs.",
    teachers: [
      {
        id: "T1",
        name: "Prof. Alan Turing",
        dept: "CSE",
        maxHoursPerWeek: 16,
        preferredSubjects: ["CS301", "CS302"],
        unavailability: [
          { day: "Monday", slots: ["09:00 - 10:00"] },
          { day: "Wednesday", slots: ["03:00 - 04:00"] }
        ]
      },
      {
        id: "T2",
        name: "Dr. Grace Hopper",
        dept: "CSE",
        maxHoursPerWeek: 16,
        preferredSubjects: ["CS303", "CS304"],
        unavailability: [
          { day: "Friday", slots: ["01:00 - 02:00", "02:00 - 03:00"] }
        ]
      },
      {
        id: "T3",
        name: "Dr. Claude Shannon",
        dept: "CSE",
        maxHoursPerWeek: 14,
        preferredSubjects: ["CS305", "CS306"],
        unavailability: []
      },
      {
        id: "T4",
        name: "Prof. Ada Lovelace",
        dept: "CSE",
        maxHoursPerWeek: 12,
        preferredSubjects: ["CS307", "CS302"],
        unavailability: [
          { day: "Tuesday", slots: ["09:00 - 10:00"] }
        ]
      },
      {
        id: "T5",
        name: "Dr. Richard Feynman",
        dept: "Physics",
        maxHoursPerWeek: 10,
        preferredSubjects: ["EE101"],
        unavailability: [
          { day: "Thursday", slots: ["11:00 - 12:00", "01:00 - 02:00"] }
        ]
      }
    ],
    subjects: [
      { id: "CS301", name: "Theory of Computation", dept: "CSE", weeklyHours: 3, isLab: false },
      { id: "CS302", name: "Design & Analysis of Algorithms", dept: "CSE", weeklyHours: 4, isLab: false },
      { id: "CS303", name: "Compiler Design", dept: "CSE", weeklyHours: 3, isLab: false },
      { id: "CS304", name: "Database Management Systems", dept: "CSE", weeklyHours: 3, isLab: false },
      { id: "CS305", name: "Computer Networks", dept: "CSE", weeklyHours: 3, isLab: false },
      { id: "CS306", name: "Cryptography & Network Security", dept: "CSE", weeklyHours: 3, isLab: false },
      { id: "CS307", name: "Web Development Lab", dept: "CSE", weeklyHours: 4, isLab: true },
      { id: "EE101", name: "Digital Electronics", dept: "ECE", weeklyHours: 3, isLab: false }
    ],
    classrooms: [
      { id: "R101", name: "Room 301 (Theory)", capacity: 60, type: "theory" },
      { id: "R102", name: "Room 302 (Theory)", capacity: 45, type: "theory" },
      { id: "R103", name: "Seminar Hall", capacity: 120, type: "theory" },
      { id: "L201", name: "CSE Lab A", capacity: 50, type: "lab" },
      { id: "L202", name: "CSE Lab B", capacity: 40, type: "lab" }
    ],
    classBatches: [
      { id: "B1", name: "CSE-3A", size: 52, subjects: ["CS301", "CS302", "CS304", "CS307"] },
      { id: "B2", name: "CSE-3B", size: 40, subjects: ["CS301", "CS302", "CS305", "CS307"] },
      { id: "B3", name: "CSE-4A", size: 35, subjects: ["CS303", "CS306", "EE101"] }
    ]
  },
  {
    name: "Electronics & Communication",
    description: "Standard ECE department schedule covering analog circuits, microcontrollers, signal processing, and labs.",
    teachers: [
      {
        id: "T11",
        name: "Prof. Nikola Tesla",
        dept: "ECE",
        maxHoursPerWeek: 16,
        preferredSubjects: ["EC301", "EC302"],
        unavailability: []
      },
      {
        id: "T12",
        name: "Dr. James Maxwell",
        dept: "ECE",
        maxHoursPerWeek: 14,
        preferredSubjects: ["EC303", "EC304"],
        unavailability: [
          { day: "Monday", slots: ["02:00 - 03:00"] }
        ]
      },
      {
        id: "T13",
        name: "Prof. Heinrich Hertz",
        dept: "ECE",
        maxHoursPerWeek: 12,
        preferredSubjects: ["EC305", "EC302"],
        unavailability: []
      }
    ],
    subjects: [
      { id: "EC301", name: "Analog & Digital Communication", dept: "ECE", weeklyHours: 4, isLab: false },
      { id: "EC302", name: "Microprocessors & Microcontrollers", dept: "ECE", weeklyHours: 3, isLab: false },
      { id: "EC303", name: "Signals and Systems", dept: "ECE", weeklyHours: 4, isLab: false },
      { id: "EC304", name: "Microcontroller Lab", dept: "ECE", weeklyHours: 4, isLab: true },
      { id: "EC305", name: "Electromagnetic Fields", dept: "ECE", weeklyHours: 3, isLab: false }
    ],
    classrooms: [
      { id: "R201", name: "ECE Room 201", capacity: 55, type: "theory" },
      { id: "R202", name: "ECE Room 202", capacity: 45, type: "theory" },
      { id: "L203", name: "Embedded Systems Lab", capacity: 35, type: "lab" }
    ],
    classBatches: [
      { id: "B11", name: "ECE-3A", size: 42, subjects: ["EC301", "EC302", "EC303", "EC304"] },
      { id: "B12", name: "ECE-3B", size: 30, subjects: ["EC301", "EC303", "EC305", "EC304"] }
    ]
  }
];
