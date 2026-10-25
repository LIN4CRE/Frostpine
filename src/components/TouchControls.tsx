import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  Home,
} from 'lucide-react';
import { Cabin, VehiclePhysics } from '../game/rules.ts';

export interface TouchInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
}

interface TouchControlsProps {
  vehicleState: VehiclePhysics;
  nearestCabin: Cabin | null;
  nearestCabinDistance: number;
  cameraMode: string;
  onInputChange: (inputs: TouchInputState) => void;
  onToggleBlade: () => void;
  onToggleSalt: () => void;
  onCycleCamera: () => void;
  onTogglePause: () => void;
  onInteractCabin?: (cabin: Cabin) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  vehicleState,
  nearestCabin,
  nearestCabinDistance,
  cameraMode,
  onInputChange,
  onToggleBlade,
  onToggleSalt,
  onCycleCamera,
  onTogglePause,
  onInteractCabin,
}) => {
  // Current active touch inputs
  const [inputs, setInputs] = useState<TouchInputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
  });



  // Trigger haptic vibration if supported
  const vibrate = (ms = 12) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {
      // Haptics not allowed
    }
  };

  // Helper to update specific input state and notify parent
  const setInputKey = (key: keyof TouchInputState, active: boolean) => {
    setInputs((prev) => {
      if (prev[key] === active) return prev;
      const next = { ...prev, [key]: active };
      onInputChange(next);
      return next;
    });
    if (active) vibrate(12);
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-30 flex flex-col justify-between overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Context-Sensitive Interaction Prompt (e.g. Near Cabin) */}
      <div className="flex justify-center w-full pointer-events-auto px-4 my-auto">
        {nearestCabin && nearestCabinDistance <= 14 && (
          <button
            onClick={() => {
              vibrate(25);
              onInteractCabin?.(nearestCabin);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-xl shadow-amber-900/50 border border-amber-300/40 animate-bounce active:scale-95 transition pointer-events-auto"
          >
            <Home className="w-5 h-5 text-amber-100" />
            <span>
              {nearestCabin.discovered ? `Decorate ${nearestCabin.name}` : `Discover ${nearestCabin.name}!`}
            </span>
          </button>
        )}
      </div>

      {/* Bottom Main Touch Controls (Ergonomic Thumb Zones) */}
      <div className="flex items-end justify-between w-full pointer-events-none px-2 pb-1">
        {/* LEFT THUMB: Steering Controls */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {/* Boost / Turbo button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setInputKey('boost', true);
            }}
            onPointerUp={() => setInputKey('boost', false)}
            onPointerCancel={() => setInputKey('boost', false)}
            onPointerLeave={() => setInputKey('boost', false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-lg backdrop-blur-md border ${
              inputs.boost
                ? 'bg-amber-500 border-amber-300 text-slate-950 scale-105'
                : 'bg-slate-900/80 border-slate-700/80 text-amber-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>TURBO</span>
          </button>

          {/* Steer Left & Right Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                setInputKey('left', true);
              }}
              onPointerUp={() => setInputKey('left', false)}
              onPointerCancel={() => setInputKey('left', false)}
              onPointerLeave={() => setInputKey('left', false)}
              aria-label="Steer Left"
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-white shadow-2xl backdrop-blur-md border-2 transition-all active:scale-90 ${
                inputs.left
                  ? 'bg-cyan-500/90 border-cyan-300 scale-95 shadow-cyan-500/40 text-slate-950'
                  : 'bg-slate-900/85 border-slate-700/80 text-cyan-300 hover:border-cyan-500/50'
              }`}
            >
              <ChevronLeft className="w-9 h-9 stroke-[3]" />
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                setInputKey('right', true);
              }}
              onPointerUp={() => setInputKey('right', false)}
              onPointerCancel={() => setInputKey('right', false)}
              onPointerLeave={() => setInputKey('right', false)}
              aria-label="Steer Right"
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-bold text-white shadow-2xl backdrop-blur-md border-2 transition-all active:scale-90 ${
                inputs.right
                  ? 'bg-cyan-500/90 border-cyan-300 scale-95 shadow-cyan-500/40 text-slate-950'
                  : 'bg-slate-900/85 border-slate-700/80 text-cyan-300 hover:border-cyan-500/50'
              }`}
            >
              <ChevronRight className="w-9 h-9 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* CENTER / QUICK ACTION: Blade & Salt Spreader */}
        <div className="pointer-events-auto flex items-center gap-2 mb-1">
          {/* Blade Toggle */}
          <button
            onClick={() => {
              vibrate(20);
              onToggleBlade();
            }}
            className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all active:scale-90 shadow-xl backdrop-blur-md ${
              vehicleState.bladeLowered
                ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-300 text-slate-950 font-black ring-2 ring-amber-400/40'
                : 'bg-slate-900/85 border-slate-700 text-slate-300 hover:border-slate-500 font-bold'
            }`}
          >
            <span className="text-[10px] tracking-wider uppercase">Blade</span>
            <span className="text-xs font-black">
              {vehicleState.bladeLowered ? 'DOWN' : 'UP'}
            </span>
          </button>

          {/* Salt Spreader Toggle */}
          {vehicleState.upgrades.saltSpreaderLevel > 0 && (
            <button
              onClick={() => {
                vibrate(20);
                onToggleSalt();
              }}
              className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all active:scale-90 shadow-xl backdrop-blur-md ${
                vehicleState.saltSpreaderActive
                  ? 'bg-gradient-to-b from-cyan-500 to-blue-600 border-cyan-300 text-white font-black animate-pulse ring-2 ring-cyan-400/40'
                  : 'bg-slate-900/85 border-slate-700 text-slate-300 font-bold'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300 mb-0.5" />
              <span className="text-[10px] uppercase font-bold">
                {vehicleState.saltSpreaderActive ? 'SALT ON' : 'SALT'}
              </span>
            </button>
          )}
        </div>

        {/* RIGHT THUMB: Drive Pedals (Gas Forward & Brake / Reverse) */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Reverse / Brake Pedal */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setInputKey('backward', true);
            }}
            onPointerUp={() => setInputKey('backward', false)}
            onPointerCancel={() => setInputKey('backward', false)}
            onPointerLeave={() => setInputKey('backward', false)}
            aria-label="Reverse and Brake"
            className={`w-16 h-18 sm:w-18 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold shadow-2xl backdrop-blur-md border-2 transition-all active:scale-90 ${
              inputs.backward
                ? 'bg-rose-600 border-rose-300 text-white scale-95 shadow-rose-600/40'
                : 'bg-slate-900/85 border-rose-500/50 text-rose-400 hover:border-rose-400'
            }`}
          >
            <ArrowDown className="w-6 h-6 stroke-[3]" />
            <span className="text-[10px] font-black uppercase mt-0.5">REV / STOP</span>
          </button>

          {/* Drive / Gas Pedal */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setInputKey('forward', true);
            }}
            onPointerUp={() => setInputKey('forward', false)}
            onPointerCancel={() => setInputKey('forward', false)}
            onPointerLeave={() => setInputKey('forward', false)}
            aria-label="Drive Forward"
            className={`w-18 h-20 sm:w-20 sm:h-22 rounded-2xl flex flex-col items-center justify-center font-black shadow-2xl backdrop-blur-md border-2 transition-all active:scale-90 ${
              inputs.forward
                ? 'bg-emerald-500 border-emerald-200 text-slate-950 scale-95 shadow-emerald-500/50'
                : 'bg-slate-900/90 border-emerald-500/60 text-emerald-400 hover:border-emerald-400'
            }`}
          >
            <ArrowUp className="w-8 h-8 stroke-[3.5]" />
            <span className="text-xs font-black uppercase tracking-wider mt-0.5">DRIVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
