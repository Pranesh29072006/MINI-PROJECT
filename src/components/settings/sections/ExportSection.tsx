import React from 'react';
import { AppSettings } from '../settingsTypes';
import { SettingsSection, SettingsRow, SettingsToggle, SettingsSelect } from '../SettingsFields';

interface ExportSectionProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function ExportSection({ settings, onChange }: ExportSectionProps) {
  return (
    <SettingsSection title="Export" description="Defaults applied when exporting or printing from any modal.">
      <SettingsRow label="Default Format">
        <SettingsSelect
          value={settings.exportFormat}
          onChange={v => onChange('exportFormat', v)}
          ariaLabel="Export format"
          options={[
            { value: 'csv', label: 'CSV' },
            { value: 'json', label: 'JSON' }
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Print Orientation">
        <SettingsSelect
          value={settings.printOrientation}
          onChange={v => onChange('printOrientation', v)}
          ariaLabel="Print orientation"
          options={[
            { value: 'landscape', label: 'Landscape' },
            { value: 'portrait', label: 'Portrait' }
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Include Statistics" description="Add summary metrics to exports.">
        <SettingsToggle checked={settings.includeStatistics} onChange={v => onChange('includeStatistics', v)} label="Include statistics" />
      </SettingsRow>

      <SettingsRow label="Include Teacher Load" description="Add per-teacher hour totals to exports.">
        <SettingsToggle checked={settings.includeTeacherLoad} onChange={v => onChange('includeTeacherLoad', v)} label="Include teacher load" />
      </SettingsRow>

      <SettingsRow label="Include Classroom Usage" description="Add per-room utilization to exports.">
        <SettingsToggle checked={settings.includeClassroomUsage} onChange={v => onChange('includeClassroomUsage', v)} label="Include classroom usage" />
      </SettingsRow>
    </SettingsSection>
  );
}
