import React from 'react';
import { AppSettings } from '../settingsTypes';
import { SettingsSection, SettingsRow, SettingsToggle, SettingsTextInput, SettingsNumberInput, SettingsSelect } from '../SettingsFields';

interface GenerationSectionProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function GenerationSection({ settings, onChange }: GenerationSectionProps) {
  return (
    <SettingsSection title="Generation" description="Preferences for the random scheduling engine (saved defaults — the generator itself is unchanged).">
      <SettingsRow label="Random Attempts" description="Retry budget per unplaced lecture hour.">
        <SettingsNumberInput value={settings.randomAttempts} onChange={v => onChange('randomAttempts', v)} min={5} max={100} ariaLabel="Random attempts" />
      </SettingsRow>

      <SettingsRow label="Optimization Level">
        <SettingsSelect
          value={settings.optimizationLevel}
          onChange={v => onChange('optimizationLevel', v)}
          ariaLabel="Optimization level"
          options={[
            { value: 'basic', label: 'Basic' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'aggressive', label: 'Aggressive' }
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Strict Constraints" description="Never violate teacher availability or hour caps.">
        <SettingsToggle checked={settings.strictConstraints} onChange={v => onChange('strictConstraints', v)} label="Strict constraints" />
      </SettingsRow>

      <SettingsRow label="Teacher Preference" description="Prefer a subject's preferred instructors when available.">
        <SettingsToggle checked={settings.teacherPreference} onChange={v => onChange('teacherPreference', v)} label="Teacher preference" />
      </SettingsRow>

      <SettingsRow label="Room Preference" description="Prefer matching room type/capacity closely.">
        <SettingsToggle checked={settings.roomPreference} onChange={v => onChange('roomPreference', v)} label="Room preference" />
      </SettingsRow>

      <SettingsRow label="Batch Preference" description="Prefer clustering a batch's sessions on fewer days.">
        <SettingsToggle checked={settings.batchPreference} onChange={v => onChange('batchPreference', v)} label="Batch preference" />
      </SettingsRow>

      <SettingsRow label="Shuffle Seed" description="Optional label to reproduce a scheduling run.">
        <SettingsTextInput value={settings.shuffleSeed} onChange={v => onChange('shuffleSeed', v)} placeholder="e.g. run-42" ariaLabel="Shuffle seed" />
      </SettingsRow>

      <SettingsRow label="Maximum Retries" description="Passes to attempt before accepting a partial schedule.">
        <SettingsNumberInput value={settings.maximumRetries} onChange={v => onChange('maximumRetries', v)} min={1} max={10} ariaLabel="Maximum retries" />
      </SettingsRow>
    </SettingsSection>
  );
}
