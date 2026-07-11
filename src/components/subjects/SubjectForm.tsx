import React from 'react';

export interface SubjectFormValues {
  id: string;
  name: string;
  dept: string;
  weeklyHours: number;
  isLab: boolean;
}

interface SubjectFormProps {
  values: SubjectFormValues;
  onChange: (values: SubjectFormValues) => void;
  errors?: Partial<Record<'id' | 'name' | 'weeklyHours', string>>;
  idPrefix: string;
  lockCode?: boolean;
}

export default function SubjectForm({ values, onChange, errors, idPrefix, lockCode = false }: SubjectFormProps) {
  const update = (patch: Partial<SubjectFormValues>) => onChange({ ...values, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-id`} className="block text-xs font-medium text-slate-700 mb-1">
          Course Code *
        </label>
        <input
          id={`${idPrefix}-id`}
          type="text"
          value={values.id}
          disabled={lockCode}
          onChange={e => update({ id: e.target.value })}
          placeholder="e.g. CS302"
          aria-invalid={!!errors?.id}
          className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            errors?.id ? 'border-rose-300' : 'border-slate-200'
          } ${lockCode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        />
        {lockCode && <p className="text-[10px] text-slate-400 mt-1">Course code cannot be changed once created (used across batches &amp; sessions).</p>}
        {errors?.id && <p className="text-[11px] text-rose-600 mt-1">{errors.id}</p>}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-name`} className="block text-xs font-medium text-slate-700 mb-1">
          Course Name *
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={values.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Design & Analysis of Algorithms"
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
            Department
          </label>
          <input
            id={`${idPrefix}-dept`}
            type="text"
            value={values.dept}
            onChange={e => update({ dept: e.target.value })}
            placeholder="e.g. CSE"
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-hours`} className="block text-xs font-medium text-slate-700 mb-1">
            Weekly Hours *
          </label>
          <input
            id={`${idPrefix}-hours`}
            type="number"
            min="1"
            max="20"
            value={values.weeklyHours}
            onChange={e => update({ weeklyHours: Number(e.target.value) })}
            aria-invalid={!!errors?.weeklyHours}
            className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors?.weeklyHours ? 'border-rose-300' : 'border-slate-200'
            }`}
          />
          {errors?.weeklyHours && <p className="text-[11px] text-rose-600 mt-1">{errors.weeklyHours}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          id={`${idPrefix}-islab`}
          checked={values.isLab}
          onChange={e => update({ isLab: e.target.checked })}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor={`${idPrefix}-islab`} className="text-xs font-medium text-slate-700 select-none cursor-pointer">
          Is this a Practical / Lab Course?
        </label>
      </div>
    </div>
  );
}
