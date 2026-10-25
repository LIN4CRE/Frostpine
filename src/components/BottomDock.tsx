/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cabin, DecorItem, DecorSlot, Mission } from '../game/rules.ts';
import { AtmospherePreset } from '../game/scene/environment.ts';

interface BottomDockProps {
  missions: Mission[];
  cabins: Cabin[];
  decorCatalog: DecorItem[];
  decorSlots: DecorSlot[];
  frostGems: number;
  atmosphere: AtmospherePreset;
  onSetAtmosphere: (preset: AtmospherePreset) => void;
  onSelectCabinToCustomize: (cabin: Cabin) => void;
  onPurchaseAndPlaceDecor: (slotId: string, itemId: string) => void;
  onClaimMissionReward: (missionId: string) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  missions,
  cabins,
  decorCatalog,
  decorSlots,
  frostGems,
  atmosphere,
  onSetAtmosphere,
  onSelectCabinToCustomize,
  onPurchaseAndPlaceDecor,
  onClaimMissionReward,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'missions' | 'cabins' | 'decor' | 'atmosphere'>('missions');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(decorSlots[0]?.id || '');

  return (
    <div
      data-testid="bottom-dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-4xl pointer-events-auto transition-transform duration-300"
      style={{
        transform: isCollapsed ? 'translate(-50%, calc(100% - 38px))' : 'translate(-50%, 0)',
      }}
    >
      {/* Drawer Toggle Header Button */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white px-5 py-1.5 rounded-t-xl border-t border-x border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
          aria-label={isCollapsed ? 'Show Controls Dock' : 'Hide Controls Dock'}
        >
          <span>{isCollapsed ? '▴ Expand Village Dock (H)' : '▾ Hide Dock (H)'}</span>
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-700/90 shadow-2xl p-3 md:p-4 text-white overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'missions', label: 'Missions', icon: '🎯' },
              { id: 'cabins', label: 'Hidden Cabins', icon: '🏡' },
              { id: 'decor', label: 'Festive Decor', icon: '🎄' },
              { id: 'atmosphere', label: 'Atmosphere', icon: '✨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-amber-300 tabular-nums flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-amber-500/20">
            <span>💎</span>
            <span>{frostGems} Gems</span>
          </div>
        </div>

        {/* Tab 1: Missions */}
        {activeTab === 'missions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {missions.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex justify-between items-start text-xs font-bold">
                    <span className="text-slate-100">{m.title}</span>
                    <span className="text-amber-400">+{m.rewardGems} 💎</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{m.description}</p>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (m.currentValue / m.targetValue) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-300 tabular-nums">
                    {Math.round(m.currentValue)}/{m.targetValue}
                  </span>

                  {m.completed ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                      ✓ Done
                    </span>
                  ) : m.currentValue >= m.targetValue ? (
                    <button
                      onClick={() => onClaimMissionReward(m.id)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Claim
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Hidden Cabins */}
        {activeTab === 'cabins' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {cabins.map((cabin) => (
              <div
                key={cabin.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  cabin.discovered
                    ? 'bg-slate-950/70 border-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-100 truncate">{cabin.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        cabin.discovered
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cabin.discovered ? 'Rescued' : 'Snowed In'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cabin.title}</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Glow: <strong className="text-amber-200 capitalize">{cabin.customization.windowGlow}</strong>
                  </span>
                  <button
                    onClick={() => onSelectCabinToCustomize(cabin)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm"
                  >
                    Customize Style
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Town Decorating */}
        {activeTab === 'decor' && (
          <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
            {/* Slot Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold shrink-0">Plaza Slot:</span>
              {decorSlots.map((slot) => {
                const item = decorCatalog.find((d) => d.id === slot.occupiedItemId);
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedSlotId === slot.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {slot.name} {item ? `(${item.name.slice(0, 10)}...)` : '(Empty)'}
                  </button>
                );
              })}
            </div>

            {/* Catalog Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {decorCatalog.map((item) => {
                const currentSlot = decorSlots.find((s) => s.id === selectedSlotId);
                const isPlaced = currentSlot?.occupiedItemId === item.id;
                const canAfford = frostGems >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                      isPlaced
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-100 truncate">{item.name}</span>
                        <span className="text-amber-400 font-mono text-[11px]">{item.cost} 💎</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>

                    <button
                      onClick={() => onPurchaseAndPlaceDecor(selectedSlotId, item.id)}
                      disabled={isPlaced || (!item.unlocked && !canAfford)}
                      className={`w-full py-1 rounded-lg text-xs font-bold transition-all ${
                        isPlaced
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700 cursor-default'
                          : canAfford || item.unlocked
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isPlaced ? '✓ Placed Here' : `Place in Slot (${item.cost} 💎)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Atmosphere Presets */}
        {activeTab === 'atmosphere' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
            {[
              {
                id: 'twilight',
                title: 'Cozy Twilight',
                desc: 'Deep royal blue sky, periwinkle fog, warm amber hearth light.',
                badge: 'Recommended',
              },
              {
                id: 'sunset',
                title: 'Golden Sunset',
                desc: 'Peach and violet mountain shadows with warm sunset glow.',
                badge: 'Vibrant',
              },
              {
                id: 'aurora',
                title: 'Aurora Night',
                desc: 'Magical northern lights with cyan & emerald night sky.',
                badge: 'Magical',
              },
              {
                id: 'morning',
                title: 'Winter Morning',
                desc: 'Crisp clear blue sky and sparkling white fresh powder.',
                badge: 'Crisp',
              },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onSetAtmosphere(p.id as AtmospherePreset)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  atmosphere === p.id
                    ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{p.title}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-semibold">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-amber-400">
                  {atmosphere === p.id ? '● Active Light' : 'Select'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
