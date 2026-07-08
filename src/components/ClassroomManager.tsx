import React, { useState } from 'react';
import { Classroom } from '../types';
import { Plus, Trash2, Home, Users } from 'lucide-react';

interface ClassroomManagerProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (classrooms: Classroom[]) => void;
}

export default function ClassroomManager({ classrooms, onUpdateClassrooms }: ClassroomManagerProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [type, setType] = useState<'theory' | 'lab'>('theory');

  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClassroom: Classroom = {
      id: 'R-' + Date.now(),
      name: name.trim(),
      capacity: Number(capacity) || 50,
      type
    };

    onUpdateClassrooms([...classrooms, newClassroom]);
    setName('');
    setCapacity(50);
    setType('theory');
  };

  const handleDeleteClassroom = (id: string) => {
    onUpdateClassrooms(classrooms.filter(c => c.id !== id));
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
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Room Name / No.</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Room 301, Lab B"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Student Capacity</label>
            <input
              type="number"
              min="10"
              max="500"
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Room Usage Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('theory')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  type === 'theory'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Theory Classroom
              </button>
              <button
                type="button"
                onClick={() => setType('lab')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  type === 'lab'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Practical / Lab Room
              </button>
            </div>
          </div>

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
                  <button
                    onClick={() => handleDeleteClassroom(room.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Max Capacity:</span>
                  <span className="font-semibold text-slate-900">{room.capacity} students</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
