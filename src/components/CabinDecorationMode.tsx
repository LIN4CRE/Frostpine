/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cabin,
  CabinCustomization,
  DecorCatalogItem,
  FULL_DECOR_CATALOG,
  PlacedDecoration,
} from '../game/rules.ts';

interface CabinDecorationModeProps {
  cabin: Cabin;
  frostGems: number;
  onClose: () => void;
  onSaveCustomization: (cabinId: string, custom: CabinCustomization) => void;
  onAddDecoration: (cabinId: string, decor: PlacedDecoration, cost: number) => void;
  onRemoveDecoration: (cabinId: string, instanceId: string, refund: number) => void;
  onRotateDecoration: (cabinId: string, instanceId: string) => void;
}

interface PlacementSpot {
  id: string;
  name: string;
  relX: number;
  relZ: number;
  type: 'porch' | 'ground';
}

const CABIN_SPOTS: PlacementSpot[] = [
  { id: 'spot-porch-left', name: 'Front Porch Left', relX: -2.0, relZ: 3.6, type: 'porch' },
  { id: 'spot-porch-right', name: 'Front Porch Right', relX: 2.0, relZ: 3.6, type: 'porch' },
  { id: 'spot-driveway', name: 'Driveway Welcome Gate', relX: 0, relZ: 6.2, type: 'ground' },
  { id: 'spot-deck', name: 'Deck Overlook', relX: 4.2, relZ: 1.0, type: 'ground' },
  { id: 'spot-courtyard', name: 'Hearth Courtyard', relX: -4.0, relZ: -1.5, type: 'ground' },
  { id: 'spot-garden', name: 'Pine Garden Corner', relX: 3.5, relZ: -3.5, type: 'ground' },
];

export const CabinDecorationMode: React.FC<CabinDecorationModeProps> = ({
  cabin,
  frostGems,
  onClose,
  onSaveCustomization,
  onAddDecoration,
  onRemoveDecoration,
  onRotateDecoration,
}) => {
  const [activeTab, setActiveTab] = useState<'decor' | 'exterior' | 'placed'>('decor');
  const [selectedSpotId, setSelectedSpotId] = useState<string>(CABIN_SPOTS[0].id);
  const [selectedItemId, setSelectedItemId] = useState<string>(FULL_DECOR_CATALOG[0].id);
  const [rotationY, setRotationY] = useState<number>(0);

  // Exterior state
  const [wallColor, setWallColor] = useState(cabin.customization.wallColor);
  const [roofStyle, setRoofStyle] = useState(cabin.customization.roofStyle);
  const [trimStyle, setTrimStyle] = useState(cabin.customization.trimStyle);
  const [windowGlow, setWindowGlow] = useState(cabin.customization.windowGlow);

  const selectedItem = FULL_DECOR_CATALOG.find((d) => d.id === selectedItemId) || FULL_DECOR_CATALOG[0];
  const selectedSpot = CABIN_SPOTS.find((s) => s.id === selectedSpotId) || CABIN_SPOTS[0];

  // Check if spot already occupied
  const existingAtSpot = cabin.placedDecorations.find(
    (d) => Math.abs(d.x - (cabin.x + selectedSpot.relX)) < 0.8 && Math.abs(d.z - (cabin.z + selectedSpot.relZ)) < 0.8
  );

  const handlePlace = () => {
    if (existingAtSpot) return;
    if (frostGems < selectedItem.cost && !selectedItem.unlocked) return;

    const newDecor: PlacedDecoration = {
      instanceId: `decor-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: selectedItem.id,
      cabinId: cabin.id,
      x: cabin.x + selectedSpot.relX,
      y: selectedSpot.type === 'porch' ? 0.6 : 0.05,
      z: cabin.z + selectedSpot.relZ,
      rotationY,
    };

    onAddDecoration(cabin.id, newDecor, selectedItem.cost);
  };

  const handleSaveExterior = () => {
    onSaveCustomization(cabin.id, { wallColor, roofStyle, trimStyle, windowGlow });
  };

  return (
    <div
      data-testid="cabin-decoration-mode"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 pointer-events-auto text-white select-none"
    >
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 md:p-7 max-w-3xl w-full shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <span>🏡 Cabin Restoration &amp; Decor Mode</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-300">Unlocked &amp; Cleared</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-0.5">{cabin.name}</h2>
            <p className="text-xs text-slate-400">{cabin.title} · {cabin.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-amber-300 tabular-nums bg-slate-950/70 px-3 py-1.5 rounded-xl border border-amber-500/20">
              💎 {frostGems} Gems
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close Decor Mode"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'decor', label: 'Place Decorations', icon: '🎄' },
            { id: 'placed', label: `Placed Items (${cabin.placedDecorations.length})`, icon: '🛋️' },
            { id: 'exterior', label: 'Chalet Architecture Style', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Place New Decorations */}
        {activeTab === 'decor' && (
          <div className="flex flex-col gap-4">
            {/* 1. Placement Spot Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Placement Zone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CABIN_SPOTS.map((spot) => {
                  const isOccupied = cabin.placedDecorations.some(
                    (d) => Math.abs(d.x - (cabin.x + spot.relX)) < 0.8 && Math.abs(d.z - (cabin.z + spot.relZ)) < 0.8
                  );
                  return (
                    <button
                      key={spot.id}
                      onClick={() => setSelectedSpotId(spot.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        selectedSpotId === spot.id
                          ? 'border-amber-400 bg-amber-950/20 ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{spot.name}</div>
                      <div className="text-[10px] mt-0.5 text-slate-400">
                        {isOccupied ? '● Occupied' : '○ Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Catalog Items Grid */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Winter Item to Place
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {FULL_DECOR_CATALOG.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      selectedItemId === item.id
                        ? 'border-amber-400 bg-slate-800 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-100 truncate">{item.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">{item.cost} 💎</div>
                    </div>
                    <div className="text-[9px] text-slate-400 capitalize mt-2">{item.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Placement Preview & Action Bar */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  Target: <strong className="text-amber-300">{selectedSpot.name}</strong>
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-300">
                  Item: <strong className="text-slate-100">{selectedItem.name}</strong>
                </span>

                {/* Rotation Control */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[10px] text-slate-400">Rot:</span>
                  {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((rad, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRotationY(rad)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                        rotationY === rad ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {idx * 90}°
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePlace}
                disabled={Boolean(existingAtSpot) || frostGems < selectedItem.cost}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md ${
                  existingAtSpot
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : frostGems >= selectedItem.cost
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {existingAtSpot
                  ? 'Spot Already Occupied'
                  : frostGems >= selectedItem.cost
                  ? `Confirm Placement (${selectedItem.cost} 💎)`
                  : 'Need More Gems'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Placed Items (Rotate, Reposition, Remove & Refund) */}
        {activeTab === 'placed' && (
          <div className="flex flex-col gap-2.5">
            {cabin.placedDecorations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No decorations placed around this chalet yet. Browse the catalog to add cozy lights, furniture, or snow sculptures!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {cabin.placedDecorations.map((d, index) => {
                  const cat = FULL_DECOR_CATALOG.find((i) => i.id === d.itemId);
                  const refundAmount = Math.round((cat?.cost || 100) * 0.8);
                  return (
                    <div
                      key={`${d.instanceId}-${index}`}
                      className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-100">{cat?.name || 'Decoration'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Rotation: {Math.round((d.rotationY * 180) / Math.PI)}°
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRotateDecoration(cabin.id, d.instanceId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                          title="Rotate 90°"
                        >
                          ↻ Rotate
                        </button>
                        <button
                          onClick={() => onRemoveDecoration(cabin.id, d.instanceId, refundAmount)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-semibold cursor-pointer"
                        >
                          Sell (+{refundAmount} 💎)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Chalet Exterior Architecture */}
        {activeTab === 'exterior' && (
          <div className="flex flex-col gap-4 text-xs">
            {/* Timber Wall Finish */}
            <div>
              <label className="font-bold text-slate-300 block mb-2">Timber Wall Finish</label>
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
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: w.color }} />
                    <span className="font-semibold text-slate-200">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Roof Shingle Style */}
            <div>
              <label className="font-bold text-slate-300 block mb-2">Roof Shingles &amp; Snow Gables</label>
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
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: r.color }} />
                    <span className="font-semibold text-slate-200">{r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Window Hearth Glow */}
            <div>
              <label className="font-bold text-slate-300 block mb-2">Window Hearth Glow</label>
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
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: g.color }} />
                    <span className="font-semibold text-slate-200">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveExterior}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Apply Architectural Style
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
