import React from 'react';
import { SettingsSection } from '../SettingsFields';
import { CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  const facts = [
    { label: 'Project Name', value: 'Nexus Timetable Scheduler' },
    { label: 'Version', value: '1.0.0' },
    { label: 'Frontend', value: 'React 19 + TypeScript' },
    { label: 'Styling', value: 'Tailwind CSS v4' },
    { label: 'Build Tool', value: 'Vite' },
    { label: 'Runtime Mode', value: 'Client-Side Only' }
  ];

  return (
    <SettingsSection title="About" description="Everything runs locally in your browser.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {facts.map(f => (
          <div key={f.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{f.label}</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-emerald-900">No Backend, No Database</p>
          <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
            All teachers, courses, classrooms, batches, and generated timetables live entirely in this browser tab's React
            state. Settings are saved to your browser's local storage. Nothing is sent to a server.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
