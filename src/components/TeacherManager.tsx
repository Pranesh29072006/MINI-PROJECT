import React, { useState } from 'react';
import { Teacher, Subject } from '../types';
import { Plus, Trash2, Calendar, User, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { DAYS, DAILY_SLOTS } from '../data/presets';

interface TeacherManagerProps {
  teachers: Teacher[];
  subjects: Subject[];
  onUpdateTeachers: (teachers: Teacher[]) => void;
}

export default function TeacherManager({ teachers, subjects, onUpdateTeachers }: TeacherManagerProps) {
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [maxHours, setMaxHours] = useState(16);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [unavailDay, setUnavailDay] = useState(DAYS[0]);
  const [unavailSlot, setUnavailSlot] = useState(DAILY_SLOTS[0]);
  const [unavailList, setUnavailList] = useState<{ day: string; slots: string[] }[]>([]);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTeacher: Teacher = {
      id: 'T-' + Date.now(),
      name: name.trim(),
      dept: dept.trim() || 'CSE',
      maxHoursPerWeek: Number(maxHours) || 16,
      preferredSubjects: selectedSubjects,
      unavailability: unavailList
    };

    onUpdateTeachers([...teachers, newTeacher]);
    setName('');
    setDept('');
    setMaxHours(16);
    setSelectedSubjects([]);
    setUnavailList([]);
  };

  const handleDeleteTeacher = (id: string) => {
    onUpdateTeachers(teachers.filter(t => t.id !== id));
  };

  const handleToggleSubject = (subId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleAddUnavailability = () => {
    const existing = unavailList.find(u => u.day === unavailDay);
    if (existing) {
      if (existing.slots.includes(unavailSlot)) return;
      setUnavailList(prev => 
        prev.map(u => u.day === unavailDay ? { ...u, slots: [...u.slots, unavailSlot] } : u)
      );
    } else {
      setUnavailList(prev => [...prev, { day: unavailDay, slots: [unavailSlot] }]);
    }
  };

  const handleRemoveUnavailability = (day: string, slot: string) => {
    setUnavailList(prev => 
      prev.map(u => u.day === day ? { ...u, slots: u.slots.filter(s => s !== slot) } : u)
          .filter(u => u.slots.length > 0)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Teacher Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          Add New Instructor
        </h3>

        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Grace Hopper"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={dept}
                onChange={e => setDept(e.target.value)}
                placeholder="e.g. CSE"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max Hours/Week</label>
              <input
                type="number"
                min="2"
                max="40"
                value={maxHours}
                onChange={e => setMaxHours(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Preferred Subjects */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              Specialization / Subjects
            </label>
            <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1 bg-slate-50">
              {subjects.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-2">Add subjects first to select specializations</p>
              ) : (
                subjects.map(sub => (
                  <label key={sub.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-slate-100 rounded cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(sub.id)}
                      onChange={() => handleToggleSubject(sub.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-slate-700">{sub.id}</span>
                    <span className="text-slate-400 truncate">- {sub.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Unavailability Manager */}
          <div className="border-t border-slate-100 pt-3">
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Instructor Unavailability Slots
            </label>
            <div className="grid grid-cols-5 gap-1 items-center">
              <select
                value={unavailDay}
                onChange={e => setUnavailDay(e.target.value)}
                className="col-span-2 text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={unavailSlot}
                onChange={e => setUnavailSlot(e.target.value)}
                className="col-span-2 text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2"
              >
                {DAILY_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                type="button"
                onClick={handleAddUnavailability}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md py-1.5 px-2 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Render current teacher unavailability list */}
            {unavailList.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 p-1.5 bg-rose-50/50 border border-rose-100/50 rounded-lg max-h-20 overflow-y-auto">
                {unavailList.map(u => 
                  u.slots.map(s => (
                    <span key={`${u.day}-${s}`} className="inline-flex items-center gap-1 bg-white border border-rose-100 text-[10px] text-rose-800 font-medium px-2 py-0.5 rounded-full shadow-sm">
                      {u.day.substring(0, 3)}: {s.split(' ')[0]}
                      <button
                        type="button"
                        onClick={() => handleRemoveUnavailability(u.day, s)}
                        className="hover:text-rose-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Instructor
          </button>
        </form>
      </div>

      {/* Teachers List */}
      <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Instructors Database</h3>
          <span className="text-xs text-slate-500 font-medium">{teachers.length} Instructors total</span>
        </div>

        {teachers.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No instructors added yet</p>
            <p className="text-xs text-slate-400 mt-1">Load CSE preset or fill the form on the left</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(teacher => (
              <div key={teacher.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{teacher.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {teacher.dept}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {teacher.maxHoursPerWeek} hrs max
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Specializations */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teaches:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.preferredSubjects.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None specified</span>
                      ) : (
                        teacher.preferredSubjects.map(subId => {
                          const subObj = subjects.find(s => s.id === subId);
                          return (
                            <span key={subId} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm" title={subObj?.name}>
                              {subId}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Unavailability Block */}
                {teacher.unavailability && teacher.unavailability.length > 0 && (
                  <div className="mt-3 border-t border-slate-100/60 pt-2">
                    <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Busy slots:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.unavailability.map(u => 
                        u.slots.map(s => (
                          <span key={`${u.day}-${s}`} className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            {u.day.substring(0, 3)} {s.split(' ')[0]}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
