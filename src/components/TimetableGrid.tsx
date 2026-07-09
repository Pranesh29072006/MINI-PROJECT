import React, { useState } from 'react';
import { TimetableSession, Teacher, Subject, Classroom, ClassBatch, TimetableConflict } from '../types';
import { DAYS, DAILY_SLOTS } from '../data/presets';
import { Edit2, Trash2, Calendar, FileDown, Plus, X, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

interface TimetableGridProps {
  sessions: TimetableSession[];
  teachers: Teacher[];
  subjects: Subject[];
  classrooms: Classroom[];
  classBatches: ClassBatch[];
  conflicts: TimetableConflict[];
  onUpdateSessions: (sessions: TimetableSession[]) => void;
  onOptimizeWithAI?: (instruction: string) => void;
  isOptimizing?: boolean;
}

type FilterType = 'batch' | 'teacher' | 'classroom';

export default function TimetableGrid({
  sessions,
  teachers,
  subjects,
  classrooms,
  classBatches,
  conflicts,
  onUpdateSessions,
  onOptimizeWithAI,
  isOptimizing
}: TimetableGridProps) {
  const [filterType, setFilterType] = useState<FilterType>('batch');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');

  // Editing state
  const [editingCell, setEditingCell] = useState<{ day: string; time: string } | null>(null);
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editClassroomId, setEditClassroomId] = useState('');
  const [editBatchId, setEditBatchId] = useState('');

  // Manual adjustment helper
  const [customOptimizePrompt, setCustomOptimizePrompt] = useState('');

  // Automatically select the first available filter option if none selected
  React.useEffect(() => {
    if (filterType === 'batch' && classBatches.length > 0) {
      setSelectedFilterId(classBatches[0].id);
    } else if (filterType === 'teacher' && teachers.length > 0) {
      setSelectedFilterId(teachers[0].id);
    } else if (filterType === 'classroom' && classrooms.length > 0) {
      setSelectedFilterId(classrooms[0].id);
    } else {
      setSelectedFilterId('');
    }
  }, [filterType, classBatches, teachers, classrooms]);

  // Lookup Maps
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const classroomMap = new Map(classrooms.map(c => [c.id, c]));
  const batchMap = new Map(classBatches.map(b => [b.id, b]));

  // Filtering Logic
  const filteredSessions = sessions.filter(session => {
    if (filterType === 'batch') return session.classBatchId === selectedFilterId;
    if (filterType === 'teacher') return session.teacherId === selectedFilterId;
    if (filterType === 'classroom') return session.classroomId === selectedFilterId;
    return true;
  });

  const getSessionForSlot = (day: string, time: string) => {
    return filteredSessions.find(s => s.day === day && s.time === time);
  };

  // Open editor for a cell
  const handleCellClick = (day: string, time: string) => {
    if (time === '12:00 - 01:00') return; // Lunch break is uneditable

    // Find the original session in this slot (could be any session, matching current filter)
    const currentSession = getSessionForSlot(day, time);

    setEditingCell({ day, time });

    if (currentSession) {
      setEditSubjectId(currentSession.subjectId);
      setEditTeacherId(currentSession.teacherId);
      setEditClassroomId(currentSession.classroomId);
      setEditBatchId(currentSession.classBatchId);
    } else {
      setEditSubjectId('');
      setEditTeacherId('');
      setEditClassroomId('');
      // If we are filtering by batch, pre-select the batch
      setEditBatchId(filterType === 'batch' ? selectedFilterId : classBatches[0]?.id || '');
    }
  };

  // Save the custom session
  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;

    const { day, time } = editingCell;

    // Validate inputs
    if (!editSubjectId || !editTeacherId || !editClassroomId || !editBatchId) {
      alert("All fields are required to schedule a session.");
      return;
    }

    const currentSession = getSessionForSlot(day, time);

    let updatedSessions: TimetableSession[];

    if (currentSession) {
      // Modify existing session
      updatedSessions = sessions.map(s =>
        s.id === currentSession.id
          ? {
              ...s,
              subjectId: editSubjectId,
              teacherId: editTeacherId,
              classroomId: editClassroomId,
              classBatchId: editBatchId
            }
          : s
      );
    } else {
      // Add new session
      const newSession: TimetableSession = {
        id: 's-' + Date.now(),
        day,
        time,
        classBatchId: editBatchId,
        subjectId: editSubjectId,
        teacherId: editTeacherId,
        classroomId: editClassroomId
      };
      updatedSessions = [...sessions, newSession];
    }

    onUpdateSessions(updatedSessions);
    setEditingCell(null);
  };

  // Delete/Clear a session from slot
  const handleClearCell = () => {
    if (!editingCell) return;
    const { day, time } = editingCell;
    const currentSession = getSessionForSlot(day, time);

    if (currentSession) {
      onUpdateSessions(sessions.filter(s => s.id !== currentSession.id));
    }
    setEditingCell(null);
  };

  // Check if a session has any associated conflicts
  const getSessionConflicts = (sessionId: string) => {
    return conflicts.filter(c => c.sessionIds.includes(sessionId));
  };

  // Export Timetable as CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Day,Time,Batch,Subject Code,Subject Name,Instructor,Location\n";

    sessions.forEach(s => {
      const batchName = batchMap.get(s.classBatchId)?.name || s.classBatchId;
      const subName = subjectMap.get(s.subjectId)?.name || s.subjectId;
      const teachName = teacherMap.get(s.teacherId)?.name || s.teacherId;
      const roomName = classroomMap.get(s.classroomId)?.name || s.classroomId;

      const row = `"${s.day}","${s.time}","${batchName}","${s.subjectId}","${subName}","${teachName}","${roomName}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetable_export_${selectedFilterId || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Filters Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Filter Selection */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">View Schedule for:</span>
            
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setFilterType('batch')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'batch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student Batch
              </button>
              <button
                onClick={() => setFilterType('teacher')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'teacher' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Instructor
              </button>
              <button
                onClick={() => setFilterType('classroom')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'classroom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classroom / Lab
              </button>
            </div>

            {/* Selector Dropdown based on Filter Type */}
            <select
              value={selectedFilterId}
              onChange={e => setSelectedFilterId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs font-semibold py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {filterType === 'batch' && classBatches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.size} Students)</option>
              ))}
              {filterType === 'teacher' && teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.dept})</option>
              ))}
              {filterType === 'classroom' && classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === 'lab' ? 'Lab' : 'Theory'})</option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 text-sm">
              {filterType === 'batch' && `Timetable Grid: Student Batch ${batchMap.get(selectedFilterId)?.name || ''}`}
              {filterType === 'teacher' && `Instructor Schedule: ${teacherMap.get(selectedFilterId)?.name || ''}`}
              {filterType === 'classroom' && `Facility Allocation: ${classroomMap.get(selectedFilterId)?.name || ''}`}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
            Click any cell to manually edit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <th className="w-32 py-3 px-4 text-left border-r border-slate-100 bg-slate-50/60">Day</th>
                {DAILY_SLOTS.map(slot => (
                  <th key={slot} className={`py-3 px-2 text-center text-[10px] font-bold border-r last:border-r-0 border-slate-100 ${
                    slot === '12:00 - 01:00' ? 'bg-amber-50/40 text-amber-800' : ''
                  }`}>
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-slate-50/20 transition-colors">
                  {/* Day Row Header */}
                  <td className="py-4 px-4 font-bold text-xs text-slate-800 border-r border-slate-100 bg-slate-50/40 select-none">
                    {day}
                  </td>

                  {/* Hourly Grid Slots */}
                  {DAILY_SLOTS.map(slot => {
                    const isLunch = slot === '12:00 - 01:00';

                    if (isLunch) {
                      return (
                        <td key={slot} className="py-3 px-1.5 text-center border-r last:border-r-0 border-slate-100 bg-amber-50/20 select-none">
                          <span className="text-[10px] uppercase font-bold text-amber-700/60 tracking-widest block py-2">
                            Lunch Break
                          </span>
                        </td>
                      );
                    }

                    const session = getSessionForSlot(day, slot);
                    const sessionConflicts = session ? getSessionConflicts(session.id) : [];
                    const hasHighConflict = sessionConflicts.some(c => c.severity === 'high');
                    const hasWarningConflict = sessionConflicts.some(c => c.severity === 'warning');
                    
                    let cardBg = 'bg-indigo-50/50 border-l-4 border-indigo-500 text-indigo-900';
                    const isLab = session ? subjectMap.get(session.subjectId)?.isLab : false;

                    if (session) {
                      if (hasHighConflict) {
                        cardBg = 'bg-rose-50 border-l-4 border-rose-500 text-rose-900';
                      } else if (hasWarningConflict) {
                        cardBg = 'bg-amber-50 border-l-4 border-amber-500 text-amber-900';
                      } else if (isLab) {
                        cardBg = 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900';
                      } else {
                        cardBg = 'bg-indigo-50/70 border-l-4 border-indigo-500 text-indigo-900';
                      }
                    }

                    return (
                      <td
                        key={slot}
                        onClick={() => handleCellClick(day, slot)}
                        className={`p-1.5 border-r last:border-r-0 border-slate-100 transition-all cursor-pointer relative align-top h-24 group ${
                          session 
                            ? 'bg-white'
                            : 'hover:bg-indigo-50/30'
                        }`}
                      >
                        {session ? (
                          <div className={`h-full w-full flex flex-col justify-between p-2 rounded-lg transition-all text-left shadow-2xs hover:shadow-xs ${cardBg}`}>
                            <div className="space-y-0.5">
                              {/* Subject Code */}
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] leading-tight uppercase tracking-tight">
                                  {session.subjectId}
                                </span>
                                {sessionConflicts.length > 0 && (
                                  <span title={sessionConflicts[0].message}>
                                    {hasHighConflict ? (
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    )}
                                  </span>
                                )}
                              </div>
                              {/* Subject Name */}
                              <p className="text-[10px] font-medium truncate opacity-90 leading-tight">
                                {subjectMap.get(session.subjectId)?.name || 'Unknown'}
                              </p>
                            </div>

                            {/* Resource Info */}
                            <div className="space-y-0.5 pt-1 mt-1 border-t border-black/5 opacity-80">
                              {filterType !== 'teacher' && (
                                <p className="text-[9px] truncate font-medium">
                                  • {teacherMap.get(session.teacherId)?.name || 'No teacher'}
                                </p>
                              )}
                              {filterType !== 'classroom' && (
                                <p className="text-[9px] truncate font-medium">
                                  • {classroomMap.get(session.classroomId)?.name || 'No room'}
                                </p>
                              )}
                              {filterType !== 'batch' && (
                                <p className="text-[9px] truncate font-bold">
                                  • {batchMap.get(session.classBatchId)?.name || 'No batch'}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Empty/Free Slot Placeholder
                          <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 bg-indigo-50 px-2 py-1 rounded-md">
                              <Plus className="w-3 h-3" /> Schedule
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Editing Dialog / Sidebar Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Schedule Session</h3>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">
                  {editingCell.day} at {editingCell.time}
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-4">
              {/* Target Batch (Always select unless filtering by batch, which is pre-selected) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Student Cohort</label>
                <select
                  value={editBatchId}
                  onChange={e => setEditBatchId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Select Student Batch --</option>
                  {classBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.size} Students)</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Course</label>
                <select
                  value={editSubjectId}
                  onChange={e => setEditSubjectId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>[{s.id}] {s.name} ({s.isLab ? 'Lab' : 'Theory'})</option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor</label>
                <select
                  value={editTeacherId}
                  onChange={e => setEditTeacherId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Select Instructor --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.dept})</option>
                  ))}
                </select>
              </div>

              {/* Classroom */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom or Lab</label>
                <select
                  value={editClassroomId}
                  onChange={e => setEditClassroomId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Select Location --</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type === 'lab' ? 'Lab Room' : 'Theory Classroom'} - Cap: {c.capacity})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 justify-between">
                {/* Clear Session Option if occupied */}
                {getSessionForSlot(editingCell.day, editingCell.time) ? (
                  <button
                    type="button"
                    onClick={handleClearCell}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Slot
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="text-xs font-bold border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Schedule Slot
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Adjuster Row (Below main grid) */}
      {onOptimizeWithAI && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900">Manual Adjustments</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Type simple adjustments below (e.g. "Move Grace Hopper's lectures to mornings only", "Swap two sessions").
                  </p>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={customOptimizePrompt}
                      onChange={e => setCustomOptimizePrompt(e.target.value)}
                      placeholder="e.g. Try to bundle all CSE-3A lectures on Mon, Tue, and Wed only..."
                      className="flex-1 text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customOptimizePrompt.trim()) {
                          onOptimizeWithAI(customOptimizePrompt.trim());
                        }
                      }}
                      disabled={isOptimizing || !customOptimizePrompt.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                    >
                      {isOptimizing ? 'Adjusting...' : 'Apply Adjustment'}
                    </button>
                  </div>
                </div>
              </div>
        </div>
      )}
    </div>
  );
}
