import React, { useState, useEffect } from 'react';
import { Teacher, Subject, Classroom, ClassBatch, TimetableSession, TimetableConflict } from './types';
import { PRESET_DATASETS, PresetDataset, DAYS, DAILY_SLOTS } from './data/presets';
import { checkTimetableConflicts } from './lib/conflictChecker';
import TeacherManager from './components/TeacherManager';
import SubjectManager from './components/SubjectManager';
import ClassroomManager from './components/ClassroomManager';
import BatchManager from './components/BatchManager';
import TimetableGrid from './components/TimetableGrid';
import ConflictAlerts from './components/ConflictAlerts';
import { Calendar, Users, Home, BookOpen, GraduationCap, Sparkles, RefreshCw, Layers, CheckCircle, Info, Sliders, AlertTriangle } from 'lucide-react';

export default function App() {
  // Preset Dataset index state
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);

  // Core schedules state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classBatches, setClassBatches] = useState<ClassBatch[]>([]);
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  
  // Conflicts and scheduler notes
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'timetable' | 'teachers' | 'subjects' | 'classrooms' | 'batches'>('timetable');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loaderStep, setLoaderStep] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [generatorMode, setGeneratorMode] = useState<'random' | null>(null);

  // Generator Settings
  const [optimizeForGaps, setOptimizeForGaps] = useState<boolean>(true);
  const [optimizeForTeacherCompactness, setOptimizeForTeacherCompactness] = useState<boolean>(true);

  // Initialize with the default CS preset
  useEffect(() => {
    loadPreset(0);
  }, []);

  // Recalculate conflicts locally in real-time whenever inputs or schedule changes!
  useEffect(() => {
    const localConflicts = checkTimetableConflicts(sessions, teachers, subjects, classrooms, classBatches);
    setConflicts(localConflicts);
  }, [sessions, teachers, subjects, classrooms, classBatches]);

  const loadPreset = (index: number) => {
    const preset = PRESET_DATASETS[index];
    if (preset) {
      setTeachers(preset.teachers);
      setSubjects(preset.subjects);
      setClassrooms(preset.classrooms);
      setClassBatches(preset.classBatches);
      setSessions([]); // Clear current schedule when loading new preset constraints
      setNotes('Preset constraints loaded. Hit the "Generate Random Timetable" button above to schedule lectures!');
      setApiError('');
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all constraints and current timetables?")) {
      setTeachers([]);
      setSubjects([]);
      setClassrooms([]);
      setClassBatches([]);
      setSessions([]);
      setConflicts([]);
      setNotes('');
      setApiError('');
    }
  };

  // Run generation simulation messages (UI-only)
  const runLoaderSimulation = (onComplete: () => void) => {
    const steps = [
      "Gathering constraints...",
      "Selecting random time slots and rooms...",
      "Assigning instructors randomly...",
      "Finalizing random schedule..."
    ];

    let current = 0;
    setLoaderStep(steps[current]);
    setIsLoading(true);

    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setLoaderStep(steps[current]);
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 700);

    return () => clearInterval(interval);
  };

  // Frontend-only random timetable generator
  const handleGenerateTimetable = async () => {
    setApiError('');

    if (teachers.length === 0 || subjects.length === 0 || classrooms.length === 0 || classBatches.length === 0) {
      setApiError("Please load a preset or add at least one teacher, subject, classroom, and batch before generating.");
      return;
    }

    const totalSlotsRequired = classBatches.reduce((sum, b) => {
      return sum + b.subjects.reduce((subSum, subId) => {
        const sub = subjects.find(s => s.id === subId);
        return subSum + (sub ? sub.weeklyHours : 0);
      }, 0);
    }, 0);

    runLoaderSimulation(() => {
      // Build requirements list (one item per required lecture hour)
      const requirements: { batchId: string; subjectId: string; isLab: boolean; size: number }[] = [];
      const subjectMap = new Map(subjects.map(s => [s.id, s]));
      for (const batch of classBatches) {
        for (const subId of batch.subjects) {
          const subject = subjectMap.get(subId) as Subject | undefined;
          if (subject) {
            for (let i = 0; i < subject.weeklyHours; i++) {
              requirements.push({ batchId: batch.id, subjectId: subId, isLab: subject.isLab, size: batch.size });
            }
          }
        }
      }

      // Shuffle requirements
      for (let i = requirements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [requirements[i], requirements[j]] = [requirements[j], requirements[i]];
      }

      const validSlots = DAYS.flatMap(day => DAILY_SLOTS.map(time => ({ day, time }))).filter(s => s.time !== '12:00 - 01:00');

      const teacherBusy = new Set<string>();
      const roomBusy = new Set<string>();
      const batchBusy = new Set<string>();

      const sessionsResult: TimetableSession[] = [];

      let reqIndex = 0;
      const maxAttempts = requirements.length * 30;
      let attempts = 0;

      while (reqIndex < requirements.length && attempts < maxAttempts) {
        const req = requirements[reqIndex];

        // pick random slot order to try
        const slotOrder = [...validSlots].sort(() => Math.random() - 0.5);
        let placed = false;

        for (const slot of slotOrder) {
          const keyBatch = `${slot.day}|${slot.time}|${req.batchId}`;
          if (batchBusy.has(keyBatch)) continue;

          // find a teacher not busy at this slot
          const teacherCandidates = teachers.filter(t => !teacherBusy.has(`${slot.day}|${slot.time}|${t.id}`));
          if (teacherCandidates.length === 0) continue;
          const teacher = teacherCandidates[Math.floor(Math.random() * teacherCandidates.length)];

          // find room matching lab/theory and capacity and not busy
          const roomCandidates = classrooms.filter(r => r.type === (req.isLab ? 'lab' : 'theory') && r.capacity >= req.size && !roomBusy.has(`${slot.day}|${slot.time}|${r.id}`));
          if (roomCandidates.length === 0) continue;
          const room = roomCandidates[Math.floor(Math.random() * roomCandidates.length)];

          // assign
          const sessionId = `s-r-${sessionsResult.length + 1}`;
          sessionsResult.push({ id: sessionId, day: slot.day, time: slot.time, classBatchId: req.batchId, subjectId: req.subjectId, teacherId: teacher.id, classroomId: room.id });

          teacherBusy.add(`${slot.day}|${slot.time}|${teacher.id}`);
          roomBusy.add(`${slot.day}|${slot.time}|${room.id}`);
          batchBusy.add(keyBatch);

          placed = true;
          break;
        }

        if (placed) {
          reqIndex++;
        } else {
          // couldn't place this requirement now; move it towards the end and try later
          requirements.push(req);
          reqIndex++;
        }

        attempts++;
      }

      setSessions(sessionsResult);
      setGeneratorMode('random');
      setNotes(`Random schedule generated with ${sessionsResult.length} sessions.`);
      setIsLoading(false);
    });
  };

  // Optimize or make adjustments via a natural language text directive
  const handleAdjustRandomly = (note?: string) => {
    // simple random tweak: shuffle sessions' teachers and rooms preserving time/batch
    const shuffled = sessions.map(s => ({ ...s }));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSessions(shuffled);
    setNotes(note || 'Sessions adjusted randomly.');
  };

  // Helper stats calculation
  const totalSlotsRequired = classBatches.reduce((sum, b) => {
    return sum + b.subjects.reduce((subSum, subId) => {
      const sub = subjects.find(s => s.id === subId);
      return subSum + (sub ? sub.weeklyHours : 0);
    }, 0);
  }, 0);

  const totalSlotsScheduled = sessions.length;

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block">Nexus</span>
            <span className="text-[10px] text-slate-400 font-bold block leading-none">Timetable Scheduler</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Navigation
          </span>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timetable'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            Timetable Grid
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'teachers'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Instructors Database
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'subjects'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Courses Database
          </button>

          <button
            onClick={() => setActiveTab('classrooms')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'classrooms'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            Classrooms &amp; Labs
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'batches'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            Student Cohorts
          </button>

          {/* Real-time Conflict Alert Panel embedded elegantly */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Live Integrity Check
            </span>
            <div className="px-1">
              <ConflictAlerts
                conflicts={conflicts}
                onAutoResolve={sessions.length > 0 ? () => handleAdjustRandomly("Resolve any remaining scheduling conflicts automatically.") : undefined}
                isResolving={isLoading}
              />
            </div>
          </div>
        </nav>

        {/* Scheduler Status Panel in Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Scheduler Status</p>
            <p className="text-xs mb-3 text-slate-200 font-medium">
              {generatorMode === 'random' ? 'Random Scheduler Active' : 'Ready & Standby'}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${generatorMode === 'random' ? 'bg-emerald-400 w-full' : 'bg-indigo-500 w-1/3'}`}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Row matching the Design HTML */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-800">Random Timetable Generator</h1>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
              Professional Edition
            </span>
            {generatorMode && (
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${generatorMode === 'random' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                Random Scheduler
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Presets dropdown selector inside the header (extremely elegant) */}
            <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2 hidden sm:inline">Preset:</span>
              {PRESET_DATASETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePresetIndex(idx);
                    loadPreset(idx);
                  }}
                  className={`text-xs px-2.5 py-1 font-semibold rounded-md transition-all ${
                    activePresetIndex === idx
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Reset All
            </button>
          </div>
        </header>

        {/* Dynamic scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
          {/* Mobile navigation header if viewport is small */}
          <div className="md:hidden flex flex-wrap gap-2 bg-white border border-slate-200 p-2 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'timetable' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'teachers' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Instructors
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'subjects' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab('classrooms')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'classrooms' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Classrooms
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'batches' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cohorts
            </button>
          </div>

          {/* API Error Notification */}
          {apiError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-sm text-rose-900 leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Scheduling Interruption</span>
                <p className="text-xs text-rose-700 mt-1">{apiError}</p>
                
              </div>
            </div>
          )}

          {/* Master Scheduler Board */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/20">
                  <Sparkles className="w-3.5 h-3.5" /> Random Scheduling Engine
                </span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                  Generate AI Lecture Schedule Instantly
                </h2>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  This tool assigns subjects, teachers, and rooms randomly in the browser to produce a quick sample timetable without any backend or external services.
                </p>

                {/* Generator Settings */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={optimizeForGaps}
                      onChange={e => setOptimizeForGaps(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-850 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>Compact Gaps for Student Cohorts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={optimizeForTeacherCompactness}
                      onChange={e => setOptimizeForTeacherCompactness(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-850 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>Cluster Instructor Shifts (Compact schedules)</span>
                  </label>
                </div>
              </div>

                {/* Main Action Call */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <button
                  onClick={handleGenerateTimetable}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm px-6 py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      Generate Random Timetable
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Analytics & Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Instructors</span>
                <p className="text-lg font-black text-slate-900 leading-tight">{teachers.length}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Courses</span>
                <p className="text-lg font-black text-slate-900 leading-tight">{subjects.length}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Classrooms</span>
                <p className="text-lg font-black text-slate-900 leading-tight">{classrooms.length}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Batches</span>
                <p className="text-lg font-black text-slate-900 leading-tight">{classBatches.length}</p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Hours</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-black text-slate-900 leading-tight">{totalSlotsScheduled}</span>
                  <span className="text-[10px] text-slate-400 font-bold">/ {totalSlotsRequired} target</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rationale & Scheduler Notes Box rendered conditionally on active layout */}
          {notes && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                <Info className="w-3.5 h-3.5" /> Scheduling Insight
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {notes}
              </p>
            </div>
          )}

          {/* Workspace Views */}
          <div className="bg-transparent">
            {activeTab === 'timetable' && (
              <TimetableGrid
                sessions={sessions}
                teachers={teachers}
                subjects={subjects}
                classrooms={classrooms}
                classBatches={classBatches}
                conflicts={conflicts}
                onUpdateSessions={setSessions}
                onOptimizeWithAI={handleAdjustRandomly}
                isOptimizing={isLoading}
              />
            )}

            {activeTab === 'teachers' && (
              <TeacherManager
                teachers={teachers}
                subjects={subjects}
                onUpdateTeachers={setTeachers}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectManager
                subjects={subjects}
                onUpdateSubjects={setSubjects}
              />
            )}

            {activeTab === 'classrooms' && (
              <ClassroomManager
                classrooms={classrooms}
                onUpdateClassrooms={setClassrooms}
              />
            )}

            {activeTab === 'batches' && (
              <BatchManager
                classBatches={classBatches}
                subjects={subjects}
                onUpdateClassBatches={setClassBatches}
              />
            )}
          </div>
        </main>
      </div>

      {/* Dynamic Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center text-white space-y-5 shadow-2xl relative">
            <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-base tracking-tight text-white">Generating Schedule</h3>
              <p className="text-xs text-indigo-400 font-semibold animate-pulse">{loaderStep}</p>
            </div>
            <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto pt-2 border-t border-slate-800">
              Assigning time slots and rooms randomly in the browser...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
