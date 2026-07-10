import React from 'react';
import { Subject } from '../../types';
import { DAYS, DAILY_SLOTS } from '../../data/presets';
import { Calendar, BookOpen, Plus, CheckSquare, Square } from 'lucide-react';

export interface InstructorFormValues {
  name: string;
  dept: string;
  maxHours: number;
  selectedSubjects: string[];
  unavailList: { day: string; slots: string[] }[];
}

interface InstructorFormProps {
  values: InstructorFormValues;
  onChange: (values: InstructorFormValues) => void;
  subjects: Subject[];
  errors?: Partial<Record<'name' | 'dept' | 'maxHours', string>>;
  idPrefix: string;
}

export default function InstructorForm({ values, onChange, subjects, errors, idPrefix }: InstructorFormProps) {
  const [unavailDay, setUnavailDay] = React.useState(DAYS[0]);
  const [unavailSlot, setUnavailSlot] = React.useState(DAILY_SLOTS[0]);

  const update = (patch: Partial<InstructorFormValues>) => onChange({ ...values, ...patch });

  const handleToggleSubject = (subId: string) => {
    update({
      selectedSubjects: values.selectedSubjects.includes(subId)
        ? values.selectedSubjects.filter(id => id !== subId)
        : [...values.selectedSubjects, subId]
    });
  };

  const handleSelectAllSubjects = () => update({ selectedSubjects: subjects.map(s => s.id) });
  const handleClearAllSubjects = () => update({ selectedSubjects: [] });

  const handleAddUnavailability = () => {
    const existing = values.unavailList.find(u => u.day === unavailDay);
    if (existing) {
      if (existing.slots.includes(unavailSlot)) return;
      update({
        unavailList: values.unavailList.map(u => (u.day === unavailDay ? { ...u, slots: [...u.slots, unavailSlot] } : u))
      });
    } else {
      update({ unavailList: [...values.unavailList, { day: unavailDay, slots: [unavailSlot] }] });
    }
  };

  const handleRemoveUnavailability = (day: string, slot: string) => {
    update({
      unavailList: values.unavailList
        .map(u => (u.day === day ? { ...u, slots: u.slots.filter(s => s !== slot) } : u))
        .filter(u => u.slots.length > 0)
    });
  };

  const handleClearAllUnavailability = () => update({ unavailList: [] });

  const totalUnavailSlots = values.unavailList.reduce((sum, u) => sum + u.slots.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="block text-xs font-medium text-slate-700 mb-1">
          Full Name *
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={values.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Dr. Grace Hopper"
          aria-invalid={!!errors?.name}
          className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors?.name ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        {errors?.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-dept`} className="block text-xs font-medium text-slate-700 mb-1">
            Department *
          </label>
          <input
            id={`${idPrefix}-dept`}
            type="text"
            value={values.dept}
            onChange={e => update({ dept: e.target.value })}
            placeholder="e.g. CSE"
            aria-invalid={!!errors?.dept}
            className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors?.dept ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors?.dept && <p className="text-[11px] text-rose-600 mt-1">{errors.dept}</p>}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-maxhours`} className="block text-xs font-medium text-slate-700 mb-1">
            Max Hours/Week *
          </label>
          <input
            id={`${idPrefix}-maxhours`}
            type="number"
            min="1"
            max="40"
            value={values.maxHours}
            onChange={e => update({ maxHours: Number(e.target.value) })}
            aria-invalid={!!errors?.maxHours}
            className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors?.maxHours ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors?.maxHours && <p className="text-[11px] text-rose-600 mt-1">{errors.maxHours}</p>}
        </div>
      </div>

      {/* Preferred Subjects */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            Preferred Subjects
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
        <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1 bg-slate-50">
          {subjects.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-2">Add subjects first to select specializations</p>
          ) : (
            subjects.map(sub => (
              <label key={sub.id} className="flex items-center gap-2 px-1.5 py-1 hover:bg-slate-100 rounded cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={values.selectedSubjects.includes(sub.id)}
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Unavailable Time Slots
          </label>
          {totalUnavailSlots > 0 && (
            <button type="button" onClick={handleClearAllUnavailability} className="text-[10px] font-semibold text-slate-500 hover:text-rose-600">
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1 items-center">
          <select
            value={unavailDay}
            onChange={e => setUnavailDay(e.target.value)}
            aria-label="Unavailability day"
            className="col-span-2 text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2"
          >
            {DAYS.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={unavailSlot}
            onChange={e => setUnavailSlot(e.target.value)}
            aria-label="Unavailability time slot"
            className="col-span-2 text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2"
          >
            {DAILY_SLOTS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddUnavailability}
            aria-label="Add slot"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md py-1.5 px-2 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {totalUnavailSlots > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 p-1.5 bg-rose-50/50 border border-rose-100/50 rounded-lg max-h-20 overflow-y-auto">
            {values.unavailList.map(u =>
              u.slots.map(s => (
                <span
                  key={`${u.day}-${s}`}
                  className="inline-flex items-center gap-1 bg-white border border-rose-100 text-[10px] text-rose-800 font-medium px-2 py-0.5 rounded-full shadow-sm"
                >
                  {u.day.substring(0, 3)}: {s.split(' ')[0]}
                  <button
                    type="button"
                    onClick={() => handleRemoveUnavailability(u.day, s)}
                    aria-label={`Remove ${u.day} ${s}`}
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
    </div>
  );
}
