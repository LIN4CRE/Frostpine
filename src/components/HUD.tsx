/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cabin, VehiclePhysics } from '../game/rules.ts';

interface HUDProps {
  frostGems: number;
  roadClearancePct: number;
  totalClearedPct: number;
  vehicle: VehiclePhysics;
  cabins: Cabin[];
  isMuted: boolean;
  cameraMode: string;
  activeMissionTitle: string;
  onToggleBlade: () => void;
  onToggleMute: () => void;
  onCycleCamera: () => void;
  onTogglePause: () => void;
  notification: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  frostGems,
  roadClearancePct,
  vehicle,
  cabins,
  isMuted,
  cameraMode,
  activeMissionTitle,
  onToggleBlade,
  onToggleMute,
  onCycleCamera,
  onTogglePause,
  notification,
}) => {
  const speedDisplay = Math.abs(Math.round(vehicle.speed * 3.6)); // km/h approximation

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 md:p-6 text-white select-none">
      {/* Top Bar: Left Status & Right Utilities */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left Status Cluster */}
        <div className="flex flex-col gap-2.5 max-w-xs md:max-w-sm pointer-events-auto">
          {/* Frost Gems Counter */}
          <div className="flex items-center gap-3 bg-slate-900/85 px-4 py-2 rounded-xl border border-amber-500/30 shadow-md">
            <svg
              className="w-6 h-6 text-amber-400 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8" />
            </svg>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Frost Gems</div>
              <div className="text-xl font-black tabular-nums tracking-tight text-amber-200">
                {frostGems}
              </div>
            </div>
          </div>

          {/* Road Clearance Progress Bar */}
          <div className="bg-slate-900/85 px-4 py-2.5 rounded-xl border border-sky-500/25 shadow-md">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                Roadway Cleared
              </span>
              <span className="font-mono font-bold text-sky-200 tabular-nums">
                {roadClearancePct}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, roadClearancePct)}%` }}
              />
            </div>
          </div>

          {/* Active Mission Pill */}
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="truncate text-slate-200 font-medium">
              {activeMissionTitle}
            </span>
          </div>
        </div>

        {/* Top-Right Control Cluster */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Speedometer Readout */}
          <div className="bg-slate-900/85 px-3.5 py-1.5 rounded-xl border border-slate-700/80 flex items-baseline gap-1.5 shadow-md">
            <span className="text-lg font-black tabular-nums tracking-tight text-white font-mono">
              {speedDisplay}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              KM/H
            </span>
          </div>

          {/* Blade Toggle Button */}
          <button
            onClick={onToggleBlade}
            className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              vehicle.bladeLowered
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Plough Blade (Space)"
            aria-label="Toggle Plough Blade"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 14l6 6 10-10" />
              <path d="M4 8l16 0" />
            </svg>
            <span className="hidden sm:inline">{vehicle.bladeLowered ? 'BLADE: DOWN' : 'BLADE: UP'}</span>
            <kbd className="text-[9px] bg-slate-950/40 px-1 py-0.5 rounded text-slate-100 font-mono">Space</kbd>
          </button>

          {/* Camera Mode Toggle */}
          <button
            onClick={onCycleCamera}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Cycle Camera View (C)"
            aria-label="Cycle Camera View"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Mute (M)"
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            className="p-2.5 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Pause Game (Esc)"
            aria-label="Pause Game"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Center Notification Toast */}
      {notification && (
        <div className="self-center my-auto bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-slate-950 font-bold px-6 py-2.5 rounded-full shadow-xl border border-amber-300/40 text-sm md:text-base animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Minimap Radar (Right side above bottom dock) */}
      <div className="fixed right-4 bottom-24 pointer-events-auto z-30">
        <div className="bg-slate-900/90 p-2 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col items-center">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Valley Radar
          </div>
          <div className="relative w-24 h-24 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            {/* Center Plaza */}
            <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-slate-700 rounded-full -translate-x-1/2 -translate-y-1/2" />
            {/* Cabins markers */}
            {cabins.map((c) => {
              const mx = ((c.x + 54) / 108) * 96;
              const my = ((c.z + 54) / 108) * 96;
              return (
                <div
                  key={c.id}
                  className={`absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all ${
                    c.discovered ? 'bg-amber-400 ring-2 ring-amber-300/50' : 'bg-slate-600'
                  }`}
                  style={{ left: mx, top: my }}
                  title={`${c.name} (${c.discovered ? 'Rescued' : 'Hidden'})`}
                />
              );
            })}
            {/* Player Plough Marker */}
            {(() => {
              const px = ((vehicle.x + 54) / 108) * 96;
              const py = ((vehicle.z + 54) / 108) * 96;
              return (
                <div
                  className="absolute w-3 h-3 bg-emerald-400 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 shadow"
                  style={{ left: px, top: py }}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
