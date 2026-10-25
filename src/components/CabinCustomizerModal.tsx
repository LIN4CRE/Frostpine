/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cabin, CabinCustomization } from '../game/rules.ts';

interface CabinCustomizerModalProps {
  cabin: Cabin | null;
  onClose: () => void;
  onSave: (cabinId: string, custom: CabinCustomization) => void;
}

export const CabinCustomizerModal: React.FC<CabinCustomizerModalProps> = ({
  cabin,
  onClose,
  onSave,
}) => {
  if (!cabin) return null;

  const [wallColor, setWallColor] = useState(cabin.customization.wallColor);
  const [roofStyle, setRoofStyle] = useState(cabin.customization.roofStyle);
  const [trimStyle, setTrimStyle] = useState(cabin.customization.trimStyle);
  const [windowGlow, setWindowGlow] = useState(cabin.customization.windowGlow);

  const handleApply = () => {
    onSave(cabin.id, { wallColor, roofStyle, trimStyle, windowGlow });
    onClose();
  };

  return (
    <div
      data-testid="cabin-customizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 pointer-events-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Cabin Exterior Workshop
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 mt-0.5">
              {cabin.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{cabin.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Customizer"
          >
            ✕
          </button>
        </div>

        {/* Customization Controls */}
        <div className="flex flex-col gap-4 text-xs">
          {/* 1. Timber Wall Finish */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Timber Wall Exterior
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cedar', name: 'Cedar Log', color: '#854d0e' },
                { id: 'nordic-red', name: 'Nordic Red', color: '#991b1b' },
                { id: 'spruce', name: 'Spruce Forest', color: '#365314' },
                { id: 'birch', name: 'White Birch', color: '#e2e8f0' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWallColor(w.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                    wallColor === w.id
                      ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: w.color }}
                  />
                  <span className="font-semibold text-slate-200">{w.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Roof Shingle Style */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Roof Shingle &amp; Snow Gables
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'slate', name: 'Alpine Slate', color: '#334155' },
                { id: 'gingerbread', name: 'Gingerbread', color: '#78350f' },
                { id: 'red-shingle', name: 'Festive Red', color: '#881337' },
                { id: 'ice-blue', name: 'Ice Shimmer', color: '#0284c7' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoofStyle(r.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                    roofStyle === r.id
                      ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="font-semibold text-slate-200">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Window Hearth Glow */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Warm Window Hearth Glow
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'amber', name: 'Candlelight', color: '#f59e0b' },
                { id: 'hearth-gold', name: 'Hearth Gold', color: '#f97316' },
                { id: 'aurora-aqua', name: 'Aurora Aqua', color: '#14b8a6' },
                { id: 'rose', name: 'Warm Rose', color: '#f43f5e' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setWindowGlow(g.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                    windowGlow === g.id
                      ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="font-semibold text-slate-200">{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Porch Trim & Door Wreath */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Holiday Porch Trim &amp; Wreath
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'brass-wreath', name: 'Brass Wreath' },
                { id: 'carved-pine', name: 'Carved Pine' },
                { id: 'holly-arch', name: 'Holly Berry Arch' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrimStyle(t.id)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    trimStyle === t.id
                      ? 'border-amber-400 bg-slate-800 text-amber-300 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
          >
            Apply Exterior Style
          </button>
        </div>
      </div>
    </div>
  );
};
