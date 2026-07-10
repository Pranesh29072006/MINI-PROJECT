import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, User2, Palette, CalendarDays, Wand2, Download, Info, X, RotateCcw } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useThemeApplier } from '../../hooks/useThemeApplier';
import { AppSettings, DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from './settingsTypes';
import GeneralSection from './sections/GeneralSection';
import AppearanceSection from './sections/AppearanceSection';
import TimetableSection from './sections/TimetableSection';
import GenerationSection from './sections/GenerationSection';
import ExportSection from './sections/ExportSection';
import AboutSection from './sections/AboutSection';

type SettingsTab = 'general' | 'appearance' | 'timetable' | 'generation' | 'export' | 'about';

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'general', label: 'General', icon: <User2 className="w-4 h-4" /> },
  { key: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  { key: 'timetable', label: 'Timetable', icon: <CalendarDays className="w-4 h-4" /> },
  { key: 'generation', label: 'Generation', icon: <Wand2 className="w-4 h-4" /> },
  { key: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> },
  { key: 'about', label: 'About', icon: <Info className="w-4 h-4" /> }
];

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  presetNames: string[];
}

export default function SettingsModal({ open, onClose, presetNames }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useLocalStorage<AppSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const containerRef = useFocusTrap(open, onClose);
  useThemeApplier(settings.theme);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings to their defaults?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6" role="presentation">
      <div onClick={handleBackdropClick} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-nexus-fade-in" aria-hidden="true" />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        tabIndex={-1}
        className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col md:flex-row overflow-hidden animate-nexus-scale-in outline-none"
      >
        {/* Sidebar */}
        <div className="w-full md:w-52 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 shrink-0 flex md:flex-col">
          <div className="hidden md:flex items-center gap-2 px-4 py-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <span id="settings-modal-title" className="text-xs font-extrabold text-slate-900">
              Settings
            </span>
          </div>

          <nav className="flex md:flex-col gap-1 p-2 overflow-x-auto md:overflow-visible flex-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  activeTab === tab.key ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block p-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-white hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 md:hidden">
            <span className="text-xs font-extrabold text-slate-900">Settings</span>
            <button type="button" onClick={onClose} aria-label="Close settings" className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="hidden md:flex items-center justify-end px-6 py-3.5 border-b border-slate-100 shrink-0">
            <button type="button" onClick={onClose} aria-label="Close settings" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
            {activeTab === 'general' && <GeneralSection settings={settings} onChange={updateSetting} presetNames={presetNames} />}
            {activeTab === 'appearance' && <AppearanceSection settings={settings} onChange={updateSetting} />}
            {activeTab === 'timetable' && <TimetableSection settings={settings} onChange={updateSetting} />}
            {activeTab === 'generation' && <GenerationSection settings={settings} onChange={updateSetting} />}
            {activeTab === 'export' && <ExportSection settings={settings} onChange={updateSetting} />}
            {activeTab === 'about' && <AboutSection />}
          </div>

          <div className="md:hidden p-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
