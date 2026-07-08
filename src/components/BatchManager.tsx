import React, { useState } from 'react';
import { ClassBatch, Subject } from '../types';
import { Plus, Trash2, Users, BookOpen } from 'lucide-react';

interface BatchManagerProps {
  classBatches: ClassBatch[];
  subjects: Subject[];
  onUpdateClassBatches: (batches: ClassBatch[]) => void;
}

export default function BatchManager({ classBatches, subjects, onUpdateClassBatches }: BatchManagerProps) {
  const [name, setName] = useState('');
  const [size, setSize] = useState(45);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBatch: ClassBatch = {
      id: 'B-' + Date.now(),
      name: name.trim(),
      size: Number(size) || 45,
      subjects: selectedSubjects
    };

    onUpdateClassBatches([...classBatches, newBatch]);
    setName('');
    setSize(45);
    setSelectedSubjects([]);
  };

  const handleDeleteBatch = (id: string) => {
    onUpdateClassBatches(classBatches.filter(b => b.id !== id));
  };

  const handleToggleSubject = (subId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Batch Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Add Student Cohort (Batch)
        </h3>

        <form onSubmit={handleAddBatch} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Batch / Class Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. CSE-3A, ME-1B"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Number of Students</label>
            <input
              type="number"
              min="5"
              max="200"
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Core Curriculum selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Curriculum (Selected Subjects)
            </label>
            <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1 bg-slate-50">
              {subjects.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-4">Add subjects in the "Subjects" tab to configure curriculum</p>
              ) : (
                subjects.map(sub => (
                  <label key={sub.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-slate-100 rounded cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(sub.id)}
                      onChange={() => handleToggleSubject(sub.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700">{sub.id}</span>
                    <span className="text-slate-500 truncate">- {sub.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Student Batch
          </button>
        </form>
      </div>

      {/* Cohorts List */}
      <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Registered Student Cohorts</h3>
          <span className="text-xs text-slate-500 font-medium">{classBatches.length} Cohorts total</span>
        </div>

        {classBatches.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No student cohorts listed yet</p>
            <p className="text-xs text-slate-400 mt-1">Load presets or add student groups on the left</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classBatches.map(batch => (
              <div key={batch.id} className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 hover:border-slate-200 hover:shadow-sm transition-all">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{batch.name}</h4>
                      <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {batch.size} Students
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteBatch(batch.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Curriculum Courses:</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {batch.subjects.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No courses selected</span>
                      ) : (
                        batch.subjects.map(subId => {
                          const subObj = subjects.find(s => s.id === subId);
                          return (
                            <span
                              key={subId}
                              className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md shadow-sm"
                              title={subObj?.name || subId}
                            >
                              {subId} {subObj?.isLab ? '🔬' : ''}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
