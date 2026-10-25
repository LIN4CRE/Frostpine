/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AtmospherePreset } from '../game/scene/environment.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface TitleScreenProps {
  onStart: () => void;
  atmosphere: AtmospherePreset;
  setAtmosphere: (preset: AtmospherePreset) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  atmosphere,
  setAtmosphere,
}) => {
  return (
    <div
      data-testid="title-screen"
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 md:p-12 pointer-events-auto bg-gradient-to-b from-slate-950/75 via-slate-900/50 to-slate-950/85 text-white select-none overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Top Header & Atmosphere Switcher */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Cozy Winter Holiday Simulator
        </div>

        {/* Atmosphere Selector & PWA Install */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-full border border-sky-500/20 text-xs">
            {(['twilight', 'sunset', 'aurora', 'morning'] as AtmospherePreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setAtmosphere(preset)}
                className={`px-2.5 sm:px-3 py-1 rounded-full capitalize font-medium transition-all ${
                  atmosphere === preset
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Emblem */}
      <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-4 sm:gap-6 my-auto py-2">
        <svg
          viewBox="0 0 520 140"
          className="w-full max-w-lg drop-shadow-lg"
          aria-label="Frostpine Snow Plough Logo"
        >
          {/* Snowy Mountain Silhouette */}
          <path
            d="M 60 90 L 120 30 L 160 70 L 220 20 L 280 80 L 320 40 L 380 90 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          {/* Snowflake Crest */}
          <g transform="translate(260, 36) scale(0.9)">
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="-12" y1="-12" x2="12" y2="12" stroke="#38bdf8" strokeWidth="2" />
            <line x1="-12" y1="12" x2="12" y2="-12" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="0" cy="0" r="3.5" fill="#f59e0b" />
          </g>
          {/* Primary Bespoke Typography */}
          <text
            x="260"
            y="95"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="42"
            fontWeight="900"
            letterSpacing="6"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            FROSTPINE
          </text>
          <text
            x="260"
            y="126"
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="18"
            fontWeight="700"
            letterSpacing="8"
          >
            SNOW PLOUGH &amp; CABINS
          </text>
        </svg>

        <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
          Clear the deep snow drifts to rescue hidden cozy chalets, customize exterior cabin styles,
          and decorate your holiday town with festive lights and furniture.
        </p>

        {/* Primary Start CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <button
            data-start="true"
            data-testid="start-game-btn"
            onClick={onStart}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base rounded-full shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Clearing Snow (Enter / Space)
          </button>
        </div>
      </div>

      {/* Flat Single Control-Hint Line in bottom safe margin */}
      <div className="text-center text-[11px] sm:text-xs text-slate-400 tracking-wider">
        <span className="hidden md:inline">WASD / Arrows Move · Space Lower Blade · C Camera · Esc Pause</span>
        <span className="md:hidden">Touch Virtual Controls · Responsive across Android &amp; Tablets</span>
      </div>
    </div>
  );
};
