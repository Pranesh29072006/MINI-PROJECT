import React from 'react';

export interface ClassroomFormValues {
  name: string;
  capacity: number;
  type: 'theory' | 'lab';
  status: 'available' | 'busy' | 'maintenance';
}

interface ClassroomFormProps {
  values: ClassroomFormValues;
  onChange: (values: ClassroomFormValues) => void;
  errors?: Partial<Record<'name' | 'capacity' | 'type' | 'status', string>>;
  idPrefix: string;
  showStatus?: boolean;
}

export default function ClassroomForm({ values, onChange, errors, idPrefix, showStatus = false }: ClassroomFormProps) {
  const update = (patch: Partial<ClassroomFormValues>) => onChange({ ...values, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="block text-xs font-medium text-slate-700 mb-1">
          Room Name / No. *
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={values.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Room 301, Lab B"
          aria-invalid={!!errors?.name}
          className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors?.name ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        {errors?.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-capacity`} className="block text-xs font-medium text-slate-700 mb-1">
          Student Capacity *
        </label>
        <input
          id={`${idPrefix}-capacity`}
          type="number"
          min="1"
          max="1000"
          value={values.capacity}
          onChange={e => update({ capacity: Number(e.target.value) })}
          aria-invalid={!!errors?.capacity}
          className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors?.capacity ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        {errors?.capacity && <p className="text-[11px] text-rose-600 mt-1">{errors.capacity}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Room Usage Category *</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => update({ type: 'theory' })}
            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
              values.type === 'theory'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Theory Classroom
          </button>
          <button
            type="button"
            onClick={() => update({ type: 'lab' })}
            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
              values.type === 'lab'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Practical / Lab Room
          </button>
        </div>
        {errors?.type && <p className="text-[11px] text-rose-600 mt-1">{errors.type}</p>}
      </div>

      {showStatus && (
        <div>
          <label htmlFor={`${idPrefix}-status`} className="block text-xs font-medium text-slate-700 mb-1">
            Status *
          </label>
          <select
            id={`${idPrefix}-status`}
            value={values.status}
            onChange={e => update({ status: e.target.value as ClassroomFormValues['status'] })}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="maintenance">Maintenance</option>
          </select>
          {errors?.status && <p className="text-[11px] text-rose-600 mt-1">{errors.status}</p>}
        </div>
      )}
    </div>
  );
}
