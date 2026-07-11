import React, { useState } from 'react';
import { Classroom, Subject, Teacher, ClassBatch, TimetableSession } from '../types';
import { Plus, Trash2, Home, Users, Eye, Pencil } from 'lucide-react';
import ClassroomForm, { ClassroomFormValues } from './classrooms/ClassroomForm';
import { validateClassroomForm, ClassroomFormErrors } from './classrooms/validateClassroom';
import ViewClassroomModal from './classrooms/ViewClassroomModal';
import EditClassroomModal from './classrooms/EditClassroomModal';
import ToastStack from './shared/ToastStack';
import { useToast } from '../hooks/useToast';
import { buildClassroomRows } from '../lib/dashboardStats';

interface ClassroomManagerProps {
  classrooms: Classroom[];
  subjects: Subject[];
  teachers: Teacher[];
  classBatches: ClassBatch[];
  sessions: TimetableSession[];
  onUpdateClassrooms: (classrooms: Classroom[]) => void;
}

const EMPTY_FORM: ClassroomFormValues = { name: '', capacity: 50, type: 'theory', status: 'available' };

export default function ClassroomManager({ classrooms, subjects, teachers, classBatches, sessions, onUpdateClassrooms }: ClassroomManagerProps) {
  const [formValues, setFormValues] = useState<ClassroomFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<ClassroomFormErrors>({});
  const [viewingRoom, setViewingRoom] = useState<Classroom | null>(null);
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const { toasts, showToast, dismissToast } = useToast();

  const roomRows = buildClassroomRows(classrooms, sessions);
  const statusByRoomId = new Map(roomRows.map(r => [r.classroom.id, r.status]));

  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateClassroomForm(formValues, classrooms);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const newClassroom: Classroom = {
      id: 'R-' + Date.now(),
      name: formValues.name.trim(),
      capacity: Number(formValues.capacity),
      type: formValues.type
    };

    onUpdateClassrooms([...classrooms, newClassroom]);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    showToast(`✅ ${newClassroom.name} added successfully.`);
  };

  const handleDeleteClassroom = (id: string) => {
    const room = classrooms.find(c => c.id === id);
    onUpdateClassrooms(classrooms.filter(c => c.id !== id));
    if (room) showToast(`🗑 ${room.name} removed.`);
  };

  const handleSaveEdit = (updated: Classroom) => {
    onUpdateClassrooms(classrooms.map(c => (c.id === updated.id ? updated : c)));
    setEditingRoom(null);
    showToast('✅ Updated successfully.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add Classroom Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Home className="w-4 h-4 text-indigo-600" />
          Add Classroom or Lab
        </h3>

        <form onSubmit={handleAddClassroom} className="space-y-4">
          <ClassroomForm values={formValues} onChange={setFormValues} errors={formErrors} idPrefix="add-classroom" />

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Classroom
          </button>
        </form>
      </div>

      {/* Classrooms List */}
      <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Location Facilities</h3>
          <span className="text-xs text-slate-500 font-medium">{classrooms.length} Rooms total</span>
        </div>

        {classrooms.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No classrooms or labs listed yet</p>
            <p className="text-xs text-slate-400 mt-1">Load presets or add facilities on the left</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map(room => (
              <div key={room.id} className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{room.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                      room.type === 'lab'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {room.type === 'lab' ? 'Lab Room' : 'Theory Room'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setViewingRoom(room)}
                      aria-label={`View ${room.name}`}
                      title="View Details"
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingRoom(room)}
                      aria-label={`Edit ${room.name}`}
                      title="Edit Record"
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1.5 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClassroom(room.id)}
                      aria-label={`Delete ${room.name}`}
                      title="Delete Record"
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Max Capacity:</span>
                    <span className="font-semibold text-slate-900">{room.capacity} students</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      statusByRoomId.get(room.id) === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : statusByRoomId.get(room.id) === 'busy'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {statusByRoomId.get(room.id)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingRoom && (
        <ViewClassroomModal
          classroom={viewingRoom}
          subjects={subjects}
          teachers={teachers}
          classBatches={classBatches}
          sessions={sessions}
          onClose={() => setViewingRoom(null)}
        />
      )}

      {editingRoom && (
        <EditClassroomModal classroom={editingRoom} classrooms={classrooms} onSave={handleSaveEdit} onClose={() => setEditingRoom(null)} />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
