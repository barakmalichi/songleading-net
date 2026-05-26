"use client";

import type { DesignSettings } from "@/types/song";
import { applyTheme, boardDesignPresets, themePresets } from "@/lib/themes";

export function DesignControls({
  design,
  onChange
}: {
  design: DesignSettings;
  onChange: (design: DesignSettings) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-[#121518] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div>
        <h3 className="font-bold text-slate-100">Design</h3>
        <p className="text-sm text-slate-400">Readable defaults with practical controls.</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-semibold text-slate-200">Board design</div>
        <div className="grid gap-2">
          {boardDesignPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`grid gap-2 rounded-lg border p-2 text-left transition ${
                design.themeId === preset.id
                  ? "border-amber-500 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.16)]"
                  : "border-white/10 bg-[#181c20] hover:border-white/20"
              }`}
              onClick={() => onChange(applyTheme(design, preset.id))}
            >
              <div
                className="slide-aspect relative overflow-hidden rounded-md"
                style={previewStyle(preset.settings)}
              >
                <div className="absolute inset-x-[10%] top-[34%] space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-current opacity-90" />
                  <div className="mx-auto h-2.5 w-4/5 rounded-full bg-current opacity-80" />
                </div>
                <div className="absolute bottom-[8%] left-[10%] h-1 w-2/5 rounded-full bg-current opacity-35" />
              </div>
              <div className="grid gap-0.5">
                <span className="font-bold text-slate-100">{preset.name}</span>
                <span className="text-xs leading-5 text-slate-400">{preset.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <label className="grid gap-1 text-sm font-semibold text-slate-200">
        Theme
        <select
          className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100"
          value={design.themeId}
          onChange={(event) => onChange(applyTheme(design, event.target.value))}
        >
          {themePresets.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-200">
          Text
          <input
            type="color"
            className="h-10 rounded-lg border border-white/10 bg-[#0c0f11]"
            value={design.textColor}
            onChange={(event) => onChange({ ...design, textColor: event.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-200">
          Background
          <input
            type="color"
            className="h-10 rounded-lg border border-white/10 bg-[#0c0f11]"
            value={design.backgroundColor}
            onChange={(event) =>
              onChange({ ...design, backgroundColor: event.target.value, backgroundImage: "" })
            }
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold text-slate-200">
        Background image URL
        <input
          className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100 placeholder:text-slate-500"
          value={design.backgroundImage}
          onChange={(event) => onChange({ ...design, backgroundImage: event.target.value })}
          placeholder="Optional image URL"
        />
      </label>
      <Control label="Font size" value={design.fontSize} min={28} max={320} onChange={(fontSize) => onChange({ ...design, fontSize })} />
      <Control label="Text box width" value={design.textBoxWidth} min={42} max={100} onChange={(textBoxWidth) => onChange({ ...design, textBoxWidth })} />
      <Control label="Line spacing" value={Math.round(design.lineSpacing * 100)} min={90} max={170} onChange={(lineSpacing) => onChange({ ...design, lineSpacing: lineSpacing / 100 })} />
      <Control label="Margins" value={design.margins} min={2} max={14} onChange={(margins) => onChange({ ...design, margins })} />
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-200">
          Alignment
          <select
            className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100"
            value={design.textAlign}
            onChange={(event) => onChange({ ...design, textAlign: event.target.value as DesignSettings["textAlign"] })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-200">
          Format
          <select
            className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100"
            value={design.aspectRatio}
            onChange={(event) => onChange({ ...design, aspectRatio: event.target.value as DesignSettings["aspectRatio"] })}
          >
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-200">
        {[
          ["showSongTitle", "Song title"],
          ["showSectionTitle", "Section title"],
          ["showSlideNumbers", "Slide numbers"],
          ["showCopyrightFooter", "Copyright"]
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#181c20] p-2">
            <input
              type="checkbox"
              checked={Boolean(design[key as keyof DesignSettings])}
              onChange={(event) =>
                onChange({ ...design, [key]: event.target.checked } as DesignSettings)
              }
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

function previewStyle(settings: Partial<DesignSettings>): React.CSSProperties {
  const background = settings.backgroundImage || settings.backgroundColor;
  return {
    backgroundColor: settings.backgroundColor,
    backgroundImage: background?.startsWith("linear") ? background : undefined,
    color: settings.textColor
  };
}

function Control({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-200">
      <span className="flex justify-between">
        {label}
        <span className="text-slate-400">{value}</span>
      </span>
      <input
        className="accent-amber-500"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
