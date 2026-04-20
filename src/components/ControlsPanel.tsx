'use client';

import { useStore, PRESETS } from '@/store/useStore';
import {
  Settings,
  UserRoundX,
  UserRoundCheck,
  Palette,
  Ghost,
  SunMedium,
  Contrast,
  Droplets,
  Sparkles,
  Layers,
  Type,
  LayoutGrid,
  Zap,
} from 'lucide-react';

export default function ControlsPanel() {
  const {
    mode, setMode,
    density, setDensity,
    fontSize, setFontSize,
    characterSet, setCharacterSet,
    isColorMode, setIsColorMode,
    useAiBackgroundRemoval, setUseAiBackgroundRemoval,
    contrast, setContrast,
    exposure, setExposure,
    saturation, setSaturation,
    vibrance, setVibrance,
    darkIntensity, setDarkIntensity,
    applyPreset,
  } = useStore();

  return (
    <aside className="w-[300px] shrink-0 bg-[#0a0a0a] h-full overflow-y-auto border-r border-[#222] flex flex-col text-sm select-none">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#222] sticky top-0 bg-[#0a0a0a] z-10">
        <Settings size={18} className="text-green-500" />
        <h2 className="text-green-500 font-bold uppercase tracking-widest text-xs">
          Controls
        </h2>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {/* ───── Presets ───── */}
        <Section icon={<Zap size={12} />} label="Presets">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold border border-[#333] text-green-600 hover:bg-green-600/20 hover:border-green-500 hover:text-green-400 transition-all"
              >
                {p.name}
              </button>
            ))}
          </div>
        </Section>

        {/* ───── Render Mode ───── */}
        <Section icon={<Layers size={12} />} label="Render Mode">
          <div className="flex bg-[#151515] rounded p-0.5 border border-[#222]">
            <button
              className={`flex-1 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition-all ${
                mode === 'brightness'
                  ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'text-gray-500 hover:text-green-500'
              }`}
              onClick={() => setMode('brightness')}
            >
              Standard
            </button>
            <button
              className={`flex-1 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition-all ${
                mode === 'sequential'
                  ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]'
                  : 'text-gray-500 hover:text-green-500'
              }`}
              onClick={() => setMode('sequential')}
            >
              Sequential
            </button>
          </div>
        </Section>

        {/* ───── AI Isolation ───── */}
        <Section icon={<Sparkles size={12} />} label="AI Isolation">
          <button
            className={`w-full py-2 px-3 rounded flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider font-bold transition-all border ${
              useAiBackgroundRemoval
                ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.1)]'
                : 'bg-[#151515] border-[#222] text-gray-500 hover:text-gray-400'
            }`}
            onClick={() => setUseAiBackgroundRemoval(!useAiBackgroundRemoval)}
          >
            {useAiBackgroundRemoval ? (
              <UserRoundCheck size={14} />
            ) : (
              <UserRoundX size={14} />
            )}
            {useAiBackgroundRemoval ? 'Subject Isolated' : 'Full Background'}
          </button>
        </Section>

        {/* ───── Palette ───── */}
        <Section icon={<Palette size={12} />} label="Palette">
          <button
            className={`w-full py-2 px-3 rounded flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider font-bold transition-all border ${
              isColorMode
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                : 'bg-green-500/10 border-green-500/40 text-green-400'
            }`}
            onClick={() => setIsColorMode(!isColorMode)}
          >
            <Palette size={14} />
            {isColorMode ? 'RGB Vibrant' : 'Monochrome'}
          </button>
        </Section>

        {/* ───── Character Set ───── */}
        <Section icon={<Type size={12} />} label={mode === 'brightness' ? 'Char Scale (Dark → Light)' : 'Sequential String'}>
          <textarea
            value={characterSet}
            onChange={(e) => setCharacterSet(e.target.value)}
            spellCheck={false}
            className="w-full bg-[#080808] border border-[#222] p-2 rounded text-green-500 font-mono text-xs focus:outline-none focus:border-green-500/50 focus:shadow-[0_0_10px_rgba(0,255,0,0.05)] min-h-[56px] resize-y transition-all"
          />
        </Section>

        {/* ───── Grid / Typography ───── */}
        <Section icon={<LayoutGrid size={12} />} label="Grid & Typography">
          <Slider
            label="Resolution"
            value={density}
            min={3}
            max={32}
            step={1}
            suffix="px"
            onChange={setDensity}
          />
          <Slider
            label="Font Size"
            value={fontSize}
            min={3}
            max={48}
            step={1}
            suffix="px"
            onChange={setFontSize}
          />
        </Section>

        {/* ───── Image Processing ───── */}
        <Section icon={<SunMedium size={12} />} label="Image Processing">
          <Slider
            label="Dark Threshold"
            icon={<Ghost size={10} />}
            value={darkIntensity}
            min={0}
            max={0.8}
            step={0.02}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={setDarkIntensity}
          />
          <Slider
            label="Exposure"
            icon={<SunMedium size={10} />}
            value={exposure}
            min={0.2}
            max={3}
            step={0.05}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={setExposure}
          />
          <Slider
            label="Contrast"
            icon={<Contrast size={10} />}
            value={contrast}
            min={0.2}
            max={3}
            step={0.05}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={setContrast}
          />
          <Slider
            label="Saturation"
            icon={<Droplets size={10} />}
            value={saturation}
            min={0}
            max={3}
            step={0.05}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={setSaturation}
          />
          <Slider
            label="Vibrance"
            icon={<Sparkles size={10} />}
            value={vibrance}
            min={0}
            max={3}
            step={0.05}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={setVibrance}
          />
        </Section>
      </div>
    </aside>
  );
}

/* ─────────────────── reusable sub-components ─────────────────── */

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] text-green-700 uppercase font-bold tracking-widest">
        {icon}
        {label}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Slider({
  label,
  icon,
  value,
  min,
  max,
  step,
  suffix,
  format,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const display = format ? format(value) : `${value}${suffix ?? ''}`;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-gray-500 flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className="text-green-600 tabular-nums font-semibold">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
