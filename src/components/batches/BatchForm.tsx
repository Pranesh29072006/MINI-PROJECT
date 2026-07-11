import React, { useState } from 'react';
import { Subject } from '../../types';
import { Users, BookOpen, CheckSquare, Square, Search } from 'lucide-react';

export interface BatchFormValues {
  name: string;
  size: number;
  selectedSubjects: string[];
}

interface BatchFormProps {
  values: BatchFormValues;
  onChange: (values: BatchFormValues) => void;
  subjects: Subject[];
  errors?: Partial<Record<'name' | 'size' | 'subjects', string>>;
  idPrefix: string;
}

export default function BatchForm({ values, onChange, subjects, errors, idPrefix }: BatchFormProps) {
  const [subjectSearch, setSubjectSearch] = useState('');

  const update = (patch: Partial<BatchFormValues>) => onChange({ ...values, ...patch });

  const handleToggleSubject = (subId: string) => {
    update({
      selectedSubjects: values.selectedSubjects.includes(subId)
        ? values.selectedSubjects.filter(id => id !== subId)
        : [...values.selectedSubjects, subId]
    });
  };

  const handleSelectAllSubjects = () => update({ selectedSubjects: subjects.map(s => s.id) });
  const handleClearAllSubjects = () => update({ selectedSubjects: [] });

  const filteredSubjects = subjects.filter(
    s =>
      s.id.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="block text-xs font-medium text-slate-700 mb-1">
          Batch / Class Name *
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={values.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. CSE-3A, ME-1B"
          aria-invalid={!!errors?.name}
          className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors?.name ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        {errors?.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-size`} className="block text-xs font-medium text-slate-700 mb-1">
          Number of Students *
        </label>
        <input
          id={`${idPrefix}-size`}
          type="number"
          min="1"
          max="500"
          value={values.size}
          onChange={e => update({ size: Number(e.target.value) })}
          aria-invalid={!!errors?.size}
          className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors?.size ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        {errors?.size && <p className="text-[11px] text-rose-600 mt-1">{errors.size}</p>}
      </div>

      {/* Curriculum selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Curriculum (Assigned Subjects) *
          </label>
          {subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllSubjects}
                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <CheckSquare className="w-3 h-3" /> Select All
              </button>
              <button
                type="button"
                onClick={handleClearAllSubjects}
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700"
              >
                <Square className="w-3 h-3" /> Clear All
              </button>
            </div>
          )}
        </div>

        {subjects.length > 0 && (
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={subjectSearch}
              onChange={e => setSubjectSearch(e.target.value)}
              placeholder="Search subjects..."
              aria-label="Search subjects"
              className="w-full text-xs pl-7 pr-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        )}

        <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1 bg-slate-50">
          {subjects.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-4">Add subjects in the "Courses" tab to configure curriculum</p>
          ) : filteredSubjects.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-4">No subjects match "{subjectSearch}"</p>
          ) : (
            filteredSubjects.map(sub => (
              <label key={sub.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-slate-100 rounded cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={values.selectedSubjects.includes(sub.id)}
                  onChange={() => handleToggleSubject(sub.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-700">{sub.id}</span>
                <span className="text-slate-500 truncate">- {sub.name}</span>
                {sub.isLab && <span className="ml-auto text-[9px] text-amber-600 font-bold">LAB</span>}
              </label>
            ))
          )}
        </div>
        {errors?.subjects && <p className="text-[11px] text-rose-600 mt-1">{errors.subjects}</p>}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Users className="w-3 h-3" />
        {values.selectedSubjects.length} subject(s) selected
      </div>
    </div>
  );
}
