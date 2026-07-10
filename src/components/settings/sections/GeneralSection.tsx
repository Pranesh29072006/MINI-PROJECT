import React from 'react';
import { AppSettings } from '../settingsTypes';
import { SettingsSection, SettingsRow, SettingsToggle, SettingsTextInput, SettingsSelect, SettingsDayPicker } from '../SettingsFields';
import { DAYS, DAILY_SLOTS } from '../../../data/presets';

interface GeneralSectionProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  presetNames: string[];
}

export default function GeneralSection({ settings, onChange, presetNames }: GeneralSectionProps) {
  return (
    <SettingsSection title="General" description="Application identity, calendar, and defaults.">
      <SettingsRow label="Application Name" description="Displayed across the app header and exports.">
        <SettingsTextInput value={settings.appName} onChange={v => onChange('appName', v)} ariaLabel="Application name" />
      </SettingsRow>

      <SettingsRow label="Academic Year">
        <SettingsTextInput value={settings.academicYear} onChange={v => onChange('academicYear', v)} ariaLabel="Academic year" />
      </SettingsRow>

      <SettingsRow label="Semester">
        <SettingsSelect
          value={settings.semester}
          onChange={v => onChange('semester', v)}
          ariaLabel="Semester"
          options={[
            { value: 'Odd Semester', label: 'Odd Semester' },
            { value: 'Even Semester', label: 'Even Semester' },
            { value: 'Summer Term', label: 'Summer Term' }
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Working Days" description="Days included in the timetable grid.">
        <SettingsDayPicker value={settings.workingDays} onChange={v => onChange('workingDays', v)} days={DAYS} />
      </SettingsRow>

      <SettingsRow label="Lunch Break" description="Reserved slot excluded from scheduling.">
        <SettingsSelect
          value={settings.lunchBreakSlot}
          onChange={v => onChange('lunchBreakSlot', v)}
          ariaLabel="Lunch break slot"
          options={DAILY_SLOTS.map(s => ({ value: s, label: s }))}
        />
      </SettingsRow>

      <SettingsRow label="Time Format">
        <SettingsSelect
          value={settings.timeFormat}
          onChange={v => onChange('timeFormat', v)}
          ariaLabel="Time format"
          options={[
            { value: '12h', label: '12 Hour' },
            { value: '24h', label: '24 Hour' }
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Auto Save" description="Persist settings automatically to this browser.">
        <SettingsToggle checked={settings.autoSave} onChange={v => onChange('autoSave', v)} label="Auto save" />
      </SettingsRow>

      <SettingsRow label="Default Dataset" description="Preset loaded automatically on next app start.">
        <SettingsSelect<string>
          value={String(settings.defaultPresetIndex)}
          onChange={v => onChange('defaultPresetIndex', Number(v))}
          ariaLabel="Default dataset"
          options={presetNames.map((name, idx) => ({ value: String(idx), label: name }))}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
