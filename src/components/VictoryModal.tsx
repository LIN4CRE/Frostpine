/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface VictoryModalProps {
  frostGems: number;
  clearedRoadPct: number;
  rescuedCabinsCount: number;
  decorPlacedCount: number;
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  frostGems,
  clearedRoadPct,
  rescuedCabinsCount,
  decorPlacedCount,
  onContinue,
}) => {
  return (
    <div
      data-testid="victory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto text-white select-none"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl flex flex-col gap-6 ring-2 ring-amber-500/20">
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-2">🎄✨</div>
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Holiday Wonder Accomplished
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 mt-1">
            Frostpine Valley United!
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            All pathways are plowed, the hidden chalets are warm with glowing hearths, and the
            village sparkles with holiday cheer.
          </p>
        </div>

        {/* 4 Stat Tiles */}
        <div className="grid grid-cols-2 gap-2.5 text-left">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Roads Cleared</div>
            <div className="text-xl font-black text-sky-300 font-mono tabular-nums">{clearedRoadPct}%</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cabins Rescued</div>
            <div className="text-xl font-black text-amber-300 font-mono tabular-nums">{rescuedCabinsCount} / 5</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decor Placed</div>
            <div className="text-xl font-black text-emerald-300 font-mono tabular-nums">{decorPlacedCount}</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Frost Gems</div>
            <div className="text-xl font-black text-amber-400 font-mono tabular-nums">{frostGems} 💎</div>
          </div>
        </div>

        <button
          data-start="true"
          onClick={onContinue}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl text-sm transition cursor-pointer shadow-lg shadow-amber-500/20"
        >
          Keep Playing &amp; Decorating
        </button>
      </div>
    </div>
  );
};
