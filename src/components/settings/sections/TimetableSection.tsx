import React from 'react';
import { AppSettings } from '../settingsTypes';
import { SettingsSection, SettingsRow, SettingsToggle, SettingsTextInput, SettingsNumberInput } from '../SettingsFields';

interface TimetableSectionProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function TimetableSection({ settings, onChange }: TimetableSectionProps) {
  return (
    <SettingsSection title="Timetable" description="Grid boundaries and layout preferences (display only — the active preset's slots remain the scheduling source of truth).">
      <SettingsRow label="Start Time">
        <SettingsTextInput value={settings.startTime} onChange={v => onChange('startTime', v)} ariaLabel="Start time" />
      </SettingsRow>

      <SettingsRow label="End Time">
        <SettingsTextInput value={settings.endTime} onChange={v => onChange('endTime', v)} ariaLabel="End time" />
      </SettingsRow>

      <SettingsRow label="Slot Duration" description="Minutes per lecture slot.">
        <SettingsNumberInput value={settings.slotDurationMinutes} onChange={v => onChange('slotDurationMinutes', v)} min={15} max={180} ariaLabel="Slot duration in minutes" />
      </SettingsRow>

      <SettingsRow label="Lunch Duration" description="Minutes reserved for the lunch break.">
        <SettingsNumberInput value={settings.lunchDurationMinutes} onChange={v => onChange('lunchDurationMinutes', v)} min={0} max={180} ariaLabel="Lunch duration in minutes" />
      </SettingsRow>

      <SettingsRow label="Allow Saturday" description="Include Saturday as a working day.">
        <SettingsToggle checked={settings.allowSaturday} onChange={v => onChange('allowSaturday', v)} label="Allow Saturday" />
      </SettingsRow>

      <SettingsRow label="Gap Optimization" description="Preferred default — use the 'Compact Gaps' toggle above the generator to apply it.">
        <SettingsToggle checked={settings.gapOptimization} onChange={v => onChange('gapOptimization', v)} label="Gap optimization" />
      </SettingsRow>

      <SettingsRow label="Compact Teachers" description="Preferred default — use the 'Cluster Instructor Shifts' toggle above the generator to apply it.">
        <SettingsToggle checked={settings.compactTeachers} onChange={v => onChange('compactTeachers', v)} label="Compact teachers" />
      </SettingsRow>
    </SettingsSection>
  );
}
