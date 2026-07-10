import React from 'react';
import { AppSettings } from '../settingsTypes';
import { SettingsSection, SettingsRow, SettingsToggle, SettingsSelect, SettingsColorInput } from '../SettingsFields';
import { Sun, Moon, Monitor } from 'lucide-react';

interface AppearanceSectionProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function AppearanceSection({ settings, onChange }: AppearanceSectionProps) {
  const themes: { value: AppSettings['theme']; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> }
  ];

  return (
    <SettingsSection title="Appearance" description="Visual theme and interface density.">
      <SettingsRow label="Theme">
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          {themes.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange('theme', t.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                settings.theme === t.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Primary Color">
        <SettingsColorInput value={settings.primaryColor} onChange={v => onChange('primaryColor', v)} ariaLabel="Primary color" />
      </SettingsRow>

      <SettingsRow label="Accent Color">
        <SettingsColorInput value={settings.accentColor} onChange={v => onChange('accentColor', v)} ariaLabel="Accent color" />
      </SettingsRow>

      <SettingsRow label="Compact Mode" description="Reduce padding and font sizes across the UI.">
        <SettingsToggle checked={settings.compactMode} onChange={v => onChange('compactMode', v)} label="Compact mode" />
      </SettingsRow>

      <SettingsRow label="Animations" description="Enable transitions, ripples, and count-up effects.">
        <SettingsToggle checked={settings.animationsEnabled} onChange={v => onChange('animationsEnabled', v)} label="Animations" />
      </SettingsRow>

      <SettingsRow label="Rounded Corners">
        <SettingsToggle checked={settings.roundedCorners} onChange={v => onChange('roundedCorners', v)} label="Rounded corners" />
      </SettingsRow>

      <SettingsRow label="Glass Effects" description="Frosted backdrop blur on modals and overlays.">
        <SettingsToggle checked={settings.glassEffects} onChange={v => onChange('glassEffects', v)} label="Glass effects" />
      </SettingsRow>
    </SettingsSection>
  );
}
