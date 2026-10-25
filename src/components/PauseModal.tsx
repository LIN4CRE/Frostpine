/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div
      data-testid="pause-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto text-white select-none"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Winter Sanctuary
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Game Paused</h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Take a cozy breather in Frostpine Hollow.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer shadow-md"
          >
            Resume Clearing (Esc / P)
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isMuted ? '🔇 Unmute Audio' : '🔊 Mute Audio'}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-red-950/50 hover:text-red-300 text-slate-400 font-medium rounded-xl text-xs transition cursor-pointer"
          >
            Reset Valley Run
          </button>
        </div>
      </div>
    </div>
  );
};
