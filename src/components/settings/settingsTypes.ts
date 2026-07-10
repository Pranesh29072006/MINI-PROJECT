export interface AppSettings {
  // General
  appName: string;
  academicYear: string;
  semester: string;
  workingDays: string[];
  lunchBreakSlot: string;
  timeFormat: '12h' | '24h';
  autoSave: boolean;
  defaultPresetIndex: number;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  roundedCorners: boolean;
  glassEffects: boolean;

  // Timetable
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  lunchDurationMinutes: number;
  allowSaturday: boolean;
  gapOptimization: boolean;
  compactTeachers: boolean;

  // Generation
  randomAttempts: number;
  optimizationLevel: 'basic' | 'balanced' | 'aggressive';
  strictConstraints: boolean;
  teacherPreference: boolean;
  roomPreference: boolean;
  batchPreference: boolean;
  shuffleSeed: string;
  maximumRetries: number;

  // Export
  exportFormat: 'csv' | 'json';
  printOrientation: 'portrait' | 'landscape';
  includeStatistics: boolean;
  includeTeacherLoad: boolean;
  includeClassroomUsage: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Nexus Timetable Scheduler',
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  semester: 'Odd Semester',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  lunchBreakSlot: '12:00 - 01:00',
  timeFormat: '12h',
  autoSave: true,
  defaultPresetIndex: 0,

  theme: 'system',
  primaryColor: '#4f46e5',
  accentColor: '#0d9488',
  compactMode: false,
  animationsEnabled: true,
  roundedCorners: true,
  glassEffects: true,

  startTime: '09:00',
  endTime: '16:00',
  slotDurationMinutes: 60,
  lunchDurationMinutes: 60,
  allowSaturday: false,
  gapOptimization: true,
  compactTeachers: true,

  randomAttempts: 30,
  optimizationLevel: 'balanced',
  strictConstraints: true,
  teacherPreference: true,
  roomPreference: true,
  batchPreference: true,
  shuffleSeed: '',
  maximumRetries: 3,

  exportFormat: 'csv',
  printOrientation: 'landscape',
  includeStatistics: true,
  includeTeacherLoad: true,
  includeClassroomUsage: true
};

export const SETTINGS_STORAGE_KEY = 'nexus.settings.v1';
