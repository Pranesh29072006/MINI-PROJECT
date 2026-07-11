import React, { useState } from 'react';
import { ClassBatch, Subject, TimetableSession } from '../types';
import { Plus, Trash2, Users, Eye, Pencil } from 'lucide-react';
import BatchForm, { BatchFormValues } from './batches/BatchForm';
import { validateBatchForm, BatchFormErrors } from './batches/validateBatch';
import ViewBatchModal from './batches/ViewBatchModal';
import EditBatchModal from './batches/EditBatchModal';
import ToastStack from './shared/ToastStack';
import { useToast } from '../hooks/useToast';

interface BatchManagerProps {
  classBatches: ClassBatch[];
  subjects: Subject[];
  sessions: TimetableSession[];
  onUpdateClassBatches: (batches: ClassBatch[]) => void;
}

const EMPTY_FORM: BatchFormValues = { name: '', size: 45, selectedSubjects: [] };

export default function BatchManager({ classBatches, subjects, sessions, onUpdateClassBatches }: BatchManagerProps) {
  const [formValues, setFormValues] = useState<BatchFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<BatchFormErrors>({});
  const [viewingBatch, setViewingBatch] = useState<ClassBatch | null>(null);
  const [editingBatch, setEditingBatch] = useState<ClassBatch | null>(null);
  const { toasts, showToast, dismissToast } = useToast();

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateBatchForm(formValues, classBatches);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const newBatch: ClassBatch = {
      id: 'B-' + Date.now(),
      name: formValues.name.trim(),
      size: Number(formValues.size),
      subjects: formValues.selectedSubjects
    };

    onUpdateClassBatches([...classBatches, newBatch]);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    showToast(`✅ ${newBatch.name} added successfully.`);
  };

  const handleDeleteBatch = (id: string) => {
    const batch = classBatches.find(b => b.id === id);
    onUpdateClassBatches(classBatches.filter(b => b.id !== id));
    if (batch) showToast(`🗑 ${batch.name} removed.`);
  };

  const handleSaveEdit = (updated: ClassBatch) => {
    onUpdateClassBatches(classBatches.map(b => (b.id === updated.id ? updated : b)));
    setEditingBatch(null);
    showToast('✅ Updated successfully.');
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
          <BatchForm values={formValues} onChange={setFormValues} subjects={subjects} errors={formErrors} idPrefix="add-batch" />

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

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewingBatch(batch)}
                        aria-label={`View ${batch.name}`}
                        title="View Details"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingBatch(batch)}
                        aria-label={`Edit ${batch.name}`}
                        title="Edit Record"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        aria-label={`Delete ${batch.name}`}
                        title="Delete Record"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

      {viewingBatch && (
        <ViewBatchModal batch={viewingBatch} subjects={subjects} sessions={sessions} onClose={() => setViewingBatch(null)} />
      )}

      {editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          classBatches={classBatches}
          subjects={subjects}
          onSave={handleSaveEdit}
          onClose={() => setEditingBatch(null)}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
