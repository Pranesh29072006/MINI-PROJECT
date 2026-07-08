import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, Trash2, BookOpen, Clock, Tag } from 'lucide-react';

interface SubjectManagerProps {
  subjects: Subject[];
  onUpdateSubjects: (subjects: Subject[]) => void;
}

export default function SubjectManager({ subjects, onUpdateSubjects }: SubjectManagerProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(3);
  const [isLab, setIsLab] = useState(false);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    // Check for duplicate ID
    if (subjects.some(s => s.id.toUpperCase() === id.trim().toUpperCase())) {
      alert(`Subject ID "${id.trim().toUpperCase()}" already exists!`);
      return;
    }

    const newSubject: Subject = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      dept: dept.trim() || 'CSE',
      weeklyHours: Number(weeklyHours) || 3,
      isLab
    };

    onUpdateSubjects([...subjects, newSubject]);
    setId('');
    setName('');
    setDept('');
    setWeeklyHours(3);
    setIsLab(false);
  };

  const handleDeleteSubject = (subId: string) => {
    onUpdateSubjects(subjects.filter(s => s.id !== subId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Subject Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Add New Subject
        </h3>

        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject Code</label>
            <input
              type="text"
              required
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="e.g. CS302"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design & Analysis of Algorithms"
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Hours/Week</label>
              <input
                type="number"
                min="1"
                max="10"
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isLabCheckbox"
              checked={isLab}
              onChange={e => setIsLab(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isLabCheckbox" className="text-xs font-medium text-slate-700 select-none cursor-pointer">
              Is this a Practical / Lab Course?
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subject
          </button>
        </form>
      </div>

      {/* Subjects List */}
      <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Courses Database</h3>
          <span className="text-xs text-slate-500 font-medium">{subjects.length} Subjects total</span>
        </div>

        {subjects.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No subjects added yet</p>
            <p className="text-xs text-slate-400 mt-1">Load preset or fill the form on the left</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3">Subject Name</th>
                  <th className="py-2 px-3">Dept</th>
                  <th className="py-2 px-3 text-center">Hours/Week</th>
                  <th className="py-2 px-3 text-center">Type</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-indigo-700">{sub.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{sub.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {sub.dept}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sub.weeklyHours}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        sub.isLab 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {sub.isLab ? 'Lab' : 'Theory'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
