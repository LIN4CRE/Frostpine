/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Cabin,
  CabinCustomization,
  DecorItem,
  DecorSlot,
  INITIAL_CABINS,
  INITIAL_DECOR_CATALOG,
  INITIAL_DECOR_SLOTS,
  INITIAL_MISSIONS,
  Mission,
  SnowGrid,
  updatePloughKinematics,
  VehiclePhysics,
} from './game/rules.ts';
import { audio } from './game/audio.ts';
import {
  AtmospherePreset,
  EnvironmentScene,
  setupEnvironment,
} from './game/scene/environment.ts';
import { createSnowPloughModel, PloughMeshParts } from './game/scene/ploughModel.ts';
import { createCabinModel, CabinVisualInstance } from './game/scene/cabinModel.ts';
import { createDecorMesh } from './game/scene/townDecor.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { HUD } from './components/HUD.tsx';
import { BottomDock } from './components/BottomDock.tsx';
import { CabinCustomizerModal } from './components/CabinCustomizerModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';
type CameraViewMode = 'follow' | 'cab' | 'bird';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // High-level App State
  const [gameState, setGameState] = useState<GameState>('title');
  const [frostGems, setFrostGems] = useState<number>(120);
  const [roadClearancePct, setRoadClearancePct] = useState<number>(0);
  const [totalClearedPct, setTotalClearedPct] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('follow');
  const [atmosphere, setAtmosphere] = useState<AtmospherePreset>('twilight');

  // Game data state
  const [cabins, setCabins] = useState<Cabin[]>(INITIAL_CABINS);
  const [decorCatalog, setDecorCatalog] = useState<DecorItem[]>(INITIAL_DECOR_CATALOG);
  const [decorSlots, setDecorSlots] = useState<DecorSlot[]>(INITIAL_DECOR_SLOTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [selectedCabinForCustom, setSelectedCabinForCustom] = useState<Cabin | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Vehicle physics state exposed to HUD
  const [vehicleState, setVehicleState] = useState<VehiclePhysics>({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    steerAngle: 0,
    bladeLowered: true,
    saltSpreader: false,
  });

  // Mutable Game Loop Refs
  const gridRef = useRef<SnowGrid>(new SnowGrid(64, 120));
  const vehicleRef = useRef<VehiclePhysics>({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    steerAngle: 0,
    bladeLowered: true,
    saltSpreader: false,
  });

  const envRef = useRef<EnvironmentScene | null>(null);
  const ploughRef = useRef<PloughMeshParts | null>(null);
  const cabinVisualsRef = useRef<CabinVisualInstance[]>([]);
  const decorMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  const keysPressedRef = useRef<Set<string>>(new Set());
  const cameraModeRef = useRef<CameraViewMode>('follow');
  const gameStateRef = useRef<GameState>('title');
  const atmosphereRef = useRef<AtmospherePreset>('twilight');

  // Keep refs in sync with React state
  cameraModeRef.current = cameraMode;
  gameStateRef.current = gameState;
  atmosphereRef.current = atmosphere;

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3800);
  }, []);

  // Set document body data-state attribute
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Handle Autostart query parameter (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      audio.init();
      audio.resumeContext();
      setGameState('playing');
      if (envRef.current) {
        const v = vehicleRef.current;
        envRef.current.camera.position.set(
          v.x - Math.sin(v.angle) * 16,
          9.5,
          v.z - Math.cos(v.angle) * 16
        );
        envRef.current.camera.lookAt(v.x, 1.8, v.z + 8);
      }
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current.add(e.code);

      // Start game on Space/Enter from Title Screen
      if (gameStateRef.current === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        audio.init();
        audio.resumeContext();
        setGameState('playing');
        return;
      }

      // Pause toggle on Escape or KeyP
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameStateRef.current === 'playing') {
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          setGameState('playing');
        }
      }

      // Blade toggle on Space
      if (gameStateRef.current === 'playing' && e.code === 'Space') {
        e.preventDefault();
        vehicleRef.current.bladeLowered = !vehicleRef.current.bladeLowered;
        setVehicleState({ ...vehicleRef.current });
      }

      // Camera toggle on KeyC
      if (e.code === 'KeyC') {
        setCameraMode((prev) => (prev === 'follow' ? 'cab' : prev === 'cab' ? 'bird' : 'follow'));
      }

      // Mute toggle on KeyM
      if (e.code === 'KeyM') {
        const muted = audio.toggleMute();
        setIsMuted(muted);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
    };

    const onBlur = () => {
      keysPressedRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Three.js Mount & Simulation Loop Setup
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Setup Environment
    const env = setupEnvironment(container);
    envRef.current = env;

    // 2. Setup Snow Plough Model
    const plough = createSnowPloughModel();
    ploughRef.current = plough;
    env.scene.add(plough.group);

    // 3. Setup Hidden Cabins
    const cabinVisuals: CabinVisualInstance[] = [];
    INITIAL_CABINS.forEach((cabin) => {
      const vis = createCabinModel(cabin);
      env.scene.add(vis.root);
      cabinVisuals.push(vis);
    });
    cabinVisualsRef.current = cabinVisuals;

    // Initial snow mesh update
    env.updateSnowMesh(gridRef.current);

    // 4. Handle Window Resize
    const handleResize = () => {
      if (!container || !env.renderer || !env.camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      env.camera.aspect = w / h;
      env.camera.updateProjectionMatrix();
      env.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Main 60 FPS Render / Simulation Loop
    let animationFrameId = 0;
    let lastTime = performance.now();
    let hudThrottleCounter = 0;
    let titleFlyoverAngle = 0;

    const dummyPloughPos = new THREE.Vector3();
    const camTarget = new THREE.Vector3();

    function tick(now: number) {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const state = gameStateRef.current;

      // Animate Beacon Light rotation
      if (plough.beaconMesh) {
        plough.beaconMesh.rotation.y += 8.0 * dt;
      }

      // Title Screen: Scenic Camera Pan Flyover
      if (state === 'title') {
        titleFlyoverAngle += 0.25 * dt;
        const orbitRadius = 45;
        env.camera.position.x = Math.sin(titleFlyoverAngle) * orbitRadius;
        env.camera.position.z = Math.cos(titleFlyoverAngle) * orbitRadius;
        env.camera.position.y = 22 + Math.sin(titleFlyoverAngle * 0.5) * 6;
        env.camera.lookAt(0, 2, 0);

        // Gently animate falling snow
        env.updateFallingSnow(dt, env.camera.position);

        env.renderer.render(env.scene, env.camera);
        if (env.isSoftwareGl) {
          env.afterDraw(() => tick(performance.now()));
        } else {
          animationFrameId = requestAnimationFrame(tick);
        }
        return;
      }

      // Active Simulation (only tick physics when playing)
      if (state === 'playing') {
        const keys = keysPressedRef.current;
        const forward = keys.has('KeyW') || keys.has('ArrowUp');
        const backward = keys.has('KeyS') || keys.has('ArrowDown');
        const left = keys.has('KeyA') || keys.has('ArrowLeft');
        const right = keys.has('KeyD') || keys.has('ArrowRight');
        const brake = keys.has('Space') && !vehicleRef.current.bladeLowered;
        const boost = keys.has('ShiftLeft') || keys.has('ShiftRight');

        const currentSnowDepth = gridRef.current.getSnowDepthAt(
          vehicleRef.current.x,
          vehicleRef.current.z
        );

        // 1. Advance Plough Kinematics
        vehicleRef.current = updatePloughKinematics(
          vehicleRef.current,
          { forward, backward, left, right, brake, boost },
          currentSnowDepth,
          dt
        );

        const v = vehicleRef.current;

        // 2. Update Plough 3D Object Transforms
        plough.group.position.set(v.x, 0, v.z);
        plough.group.rotation.y = v.angle;

        // Front wheels turn with steer angle
        if (plough.wheels[0] && plough.wheels[1]) {
          plough.wheels[0].rotation.y = v.steerAngle;
          plough.wheels[1].rotation.y = v.steerAngle;
        }

        // Blade pitch/lift based on bladeLowered
        const targetBladeY = v.bladeLowered ? 0 : 0.45;
        plough.bladePivot.position.y = THREE.MathUtils.damp(
          plough.bladePivot.position.y,
          targetBladeY,
          10,
          dt
        );

        // Spreader spins when moving in reverse or active
        if (plough.spreaderDisc) {
          plough.spreaderDisc.rotation.y += v.speed * 4 * dt;
        }

        // Exhaust Smoke particles
        const smokeData = plough.smokeData;
        const posAttr = plough.smokeParticles.geometry.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        for (let i = 0; i < smokeData.ages.length; i++) {
          smokeData.ages[i] += dt;
          if (smokeData.ages[i] > smokeData.maxAge) {
            smokeData.ages[i] = 0;
            posArr[i * 3] = 0.68;
            posArr[i * 3 + 1] = 2.0;
            posArr[i * 3 + 2] = -0.1;
          } else {
            posArr[i * 3 + 1] += 0.8 * dt;
            posArr[i * 3 + 2] -= (v.speed * 0.4 + 0.3) * dt;
          }
        }
        posAttr.needsUpdate = true;

        // 3. Snow Ploughing Logic
        let isPloughing = false;
        if (v.bladeLowered && Math.abs(v.speed) > 0.4) {
          // Calculate blade world coordinates
          const bladeOffsetX = Math.sin(v.angle) * 2.2;
          const bladeOffsetZ = Math.cos(v.angle) * 2.2;
          const bladeWorldX = v.x + bladeOffsetX;
          const bladeWorldZ = v.z + bladeOffsetZ;

          const clearRes = gridRef.current.ploughSnowAt(bladeWorldX, bladeWorldZ, v.angle, 3.4, 0.95);
          if (clearRes.displacedVolume > 0.05) {
            isPloughing = true;
            // Update snow heightfield
            env.updateSnowMesh(gridRef.current);

            // Award Frost Gems
            if (clearRes.pointsEarned > 0) {
              setFrostGems((prev) => prev + clearRes.pointsEarned);
            }
          }
        }

        // Audio update
        audio.updateEngineSound(v.speed / 10, isPloughing);

        // 4. Check Hidden Cabins Discovery / Rescue
        dummyPloughPos.set(v.x, 0, v.z);
        const stats = gridRef.current.getClearanceStats();

        cabinVisualsRef.current.forEach((vis, idx) => {
          const cabin = vis.cabin;
          if (!cabin.discovered) {
            const clearanceForThis = stats.cabinRoadStats[idx] || 0;
            const dist = dummyPloughPos.distanceTo(vis.root.position);

            // Rescued if pathway cleared >= threshold OR player reaches the cabin directly
            if (clearanceForThis >= cabin.clearanceThreshold * 100 || dist <= cabin.radius) {
              vis.setDiscovered(true);
              audio.playCabinDiscovered();
              showToast(`🎉 Rescued ${cabin.name}! Windows glowing warm.`);
              setFrostGems((prev) => prev + cabin.rewards);

              // Update React cabins state
              setCabins((prev) =>
                prev.map((c) => (c.id === cabin.id ? { ...c, discovered: true } : c))
              );

              // Update missions
              setMissions((prev) =>
                prev.map((m) => {
                  if (m.targetType === 'discover_cabin') {
                    const nextVal = m.currentValue + 1;
                    return { ...m, currentValue: nextVal, completed: nextVal >= m.targetValue };
                  }
                  return m;
                })
              );
            }
          }

          // Animate chimney smoke for discovered cabins
          if (cabin.discovered) {
            const sData = vis.smokeData;
            const cPosAttr = vis.chimneySmoke.geometry.attributes.position as THREE.BufferAttribute;
            const cPosArr = cPosAttr.array as Float32Array;
            for (let i = 0; i < sData.ages.length; i++) {
              sData.ages[i] += dt;
              if (sData.ages[i] > 2.5) {
                sData.ages[i] = 0;
                cPosArr[i * 3] = 1.6;
                cPosArr[i * 3 + 1] = 6.4;
                cPosArr[i * 3 + 2] = -1.2;
              } else {
                cPosArr[i * 3] += (Math.sin(now * 0.002 + i) * 0.2) * dt;
                cPosArr[i * 3 + 1] += 1.1 * dt;
                cPosArr[i * 3 + 2] += 0.3 * dt;
              }
            }
            cPosAttr.needsUpdate = true;
          }
        });

        // 5. Throttled HUD State Sync (10Hz)
        hudThrottleCounter++;
        if (hudThrottleCounter % 6 === 0) {
          setRoadClearancePct(stats.roadClearancePct);
          setTotalClearedPct(stats.totalClearedPct);
          setVehicleState({ ...v });

          // Update road clearance mission
          setMissions((prev) =>
            prev.map((m) => {
              if (m.targetType === 'clear_road') {
                return {
                  ...m,
                  currentValue: stats.roadClearancePct,
                  completed: stats.roadClearancePct >= m.targetValue,
                };
              }
              if (m.targetType === 'total_snow') {
                return {
                  ...m,
                  currentValue: stats.totalClearedPct,
                  completed: stats.totalClearedPct >= m.targetValue,
                };
              }
              return m;
            })
          );
        }

        // 6. Camera Follow with Exponential Damping
        const mode = cameraModeRef.current;
        let targetCamX = v.x;
        let targetCamY = 10;
        let targetCamZ = v.z;

        if (mode === 'follow') {
          // Third-person chase cam: positioned behind vehicle looking ahead
          const followDist = 16;
          targetCamX = v.x - Math.sin(v.angle) * followDist;
          targetCamZ = v.z - Math.cos(v.angle) * followDist;
          targetCamY = 9.5;
          // Look 8 meters ahead of vehicle
          camTarget.set(
            v.x + Math.sin(v.angle) * 8,
            1.8,
            v.z + Math.cos(v.angle) * 8
          );
        } else if (mode === 'cab') {
          // Hood / Cab interior perspective
          targetCamX = v.x + Math.sin(v.angle) * 0.4;
          targetCamZ = v.z + Math.cos(v.angle) * 0.4;
          targetCamY = 2.0;
          camTarget.set(
            v.x + Math.sin(v.angle) * 16,
            1.6,
            v.z + Math.cos(v.angle) * 16
          );
        } else {
          // Bird's eye isometric
          targetCamX = v.x - 12;
          targetCamZ = v.z - 12;
          targetCamY = 28;
          camTarget.set(v.x, 0, v.z);
        }

        env.camera.position.x = THREE.MathUtils.damp(env.camera.position.x, targetCamX, 4.0, dt);
        env.camera.position.y = THREE.MathUtils.damp(env.camera.position.y, targetCamY, 4.0, dt);
        env.camera.position.z = THREE.MathUtils.damp(env.camera.position.z, targetCamZ, 4.0, dt);
        env.camera.lookAt(camTarget);

        // Update falling snow around plough
        env.updateFallingSnow(dt, plough.group.position);
      }

      // Render Scene
      env.renderer.render(env.scene, env.camera);
      if (env.isSoftwareGl) {
        env.afterDraw(() => tick(performance.now()));
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    }

    if (env.isSoftwareGl) {
      env.afterDraw(() => tick(performance.now()));
    } else {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      env.renderer.dispose();
      audio.dispose();
    };
  }, [showToast]);

  // Handle Atmosphere Change
  const handleSetAtmosphere = (preset: AtmospherePreset) => {
    setAtmosphere(preset);
    envRef.current?.setAtmosphere(preset);
  };

  // Handle Start
  const handleStartGame = () => {
    audio.init();
    audio.resumeContext();
    setGameState('playing');
    if (envRef.current) {
      const v = vehicleRef.current;
      envRef.current.camera.position.set(
        v.x - Math.sin(v.angle) * 16,
        9.5,
        v.z - Math.cos(v.angle) * 16
      );
      envRef.current.camera.lookAt(v.x, 1.8, v.z + 8);
    }
  };

  // Handle Blade Toggle
  const handleToggleBlade = () => {
    vehicleRef.current.bladeLowered = !vehicleRef.current.bladeLowered;
    setVehicleState({ ...vehicleRef.current });
  };

  // Handle Mute
  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Handle Camera Cycle
  const handleCycleCamera = () => {
    setCameraMode((prev) => (prev === 'follow' ? 'cab' : prev === 'cab' ? 'bird' : 'follow'));
  };

  // Handle Purchase and Place Decor
  const handlePurchaseAndPlaceDecor = (slotId: string, itemId: string) => {
    const item = decorCatalog.find((d) => d.id === itemId);
    const slot = decorSlots.find((s) => s.id === slotId);
    if (!item || !slot) return;

    if (!item.unlocked && frostGems < item.cost) {
      showToast('Need more Frost Gems! Plough more snow.');
      return;
    }

    // Deduct cost if not already unlocked
    if (!item.unlocked) {
      setFrostGems((prev) => prev - item.cost);
      setDecorCatalog((prev) =>
        prev.map((d) => (d.id === itemId ? { ...d, unlocked: true } : d))
      );
    }

    // Remove existing mesh from slot if any
    const existingMesh = decorMeshesRef.current.get(slotId);
    if (existingMesh && envRef.current) {
      envRef.current.scene.remove(existingMesh);
      decorMeshesRef.current.delete(slotId);
    }

    // Create and add new 3D decor mesh
    const newMesh = createDecorMesh(itemId);
    newMesh.position.set(slot.x, 0, slot.z);
    envRef.current?.scene.add(newMesh);
    decorMeshesRef.current.set(slotId, newMesh);

    // Update slots state
    setDecorSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, occupiedItemId: itemId } : s))
    );

    // Update mission "decorate_town"
    const totalDecorPlaced = decorSlots.filter((s) => s.occupiedItemId !== null).length + 1;
    setMissions((prev) =>
      prev.map((m) => {
        if (m.targetType === 'decorate_town') {
          return {
            ...m,
            currentValue: totalDecorPlaced,
            completed: totalDecorPlaced >= m.targetValue,
          };
        }
        return m;
      })
    );

    audio.playDecorPlaced();
    showToast(`🎄 Placed ${item.name} at ${slot.name}!`);
  };

  // Handle Cabin Customization Save
  const handleSaveCabinCustomization = (cabinId: string, custom: CabinCustomization) => {
    setCabins((prev) =>
      prev.map((c) => (c.id === cabinId ? { ...c, customization: custom } : c))
    );

    const visual = cabinVisualsRef.current.find((v) => v.cabin.id === cabinId);
    if (visual) {
      visual.updateCustomization(custom);
    }

    audio.playDecorPlaced();
    showToast(`✨ Updated exterior of ${visual?.cabin.name || 'Chalet'}!`);
  };

  // Claim Mission Reward
  const handleClaimMissionReward = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.completed) return;

    setFrostGems((prev) => prev + mission.rewardGems);
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
    audio.playCabinDiscovered();
    showToast(`💎 Claimed ${mission.rewardGems} Frost Gems!`);

    // Check if grand victory
    const allCompleted = missions.every((m) => (m.id === missionId ? true : m.completed));
    if (allCompleted) {
      setGameState('gameover');
    }
  };

  // Reset Run
  const handleRestart = () => {
    gridRef.current = new SnowGrid(64, 120);
    vehicleRef.current = {
      x: 0,
      z: 0,
      angle: 0,
      speed: 0,
      steerAngle: 0,
      bladeLowered: true,
      saltSpreader: false,
    };
    envRef.current?.updateSnowMesh(gridRef.current);
    cabinVisualsRef.current.forEach((vis) => vis.setDiscovered(false));
    setCabins(INITIAL_CABINS);
    setMissions(INITIAL_MISSIONS);
    setGameState('playing');
  };

  const activeMission = missions.find((m) => !m.completed) || missions[0];
  const rescuedCabinsCount = cabins.filter((c) => c.discovered).length;
  const decorPlacedCount = decorSlots.filter((s) => s.occupiedItemId !== null).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="threejs-canvas"
        className="absolute inset-0 w-full h-full"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          atmosphere={atmosphere}
          setAtmosphere={handleSetAtmosphere}
        />
      )}

      {/* In-Game World-Matched HUD */}
      {gameState === 'playing' && (
        <HUD
          frostGems={frostGems}
          roadClearancePct={roadClearancePct}
          totalClearedPct={totalClearedPct}
          vehicle={vehicleState}
          cabins={cabins}
          isMuted={isMuted}
          cameraMode={cameraMode}
          activeMissionTitle={activeMission ? activeMission.title : 'Valley Fully United!'}
          onToggleBlade={handleToggleBlade}
          onToggleMute={handleToggleMute}
          onCycleCamera={handleCycleCamera}
          onTogglePause={() => setGameState('paused')}
          notification={notification}
        />
      )}

      {/* Collapsible Bottom Control Dock */}
      {gameState === 'playing' && (
        <BottomDock
          missions={missions}
          cabins={cabins}
          decorCatalog={decorCatalog}
          decorSlots={decorSlots}
          frostGems={frostGems}
          atmosphere={atmosphere}
          onSetAtmosphere={handleSetAtmosphere}
          onSelectCabinToCustomize={(cabin) => setSelectedCabinForCustom(cabin)}
          onPurchaseAndPlaceDecor={handlePurchaseAndPlaceDecor}
          onClaimMissionReward={handleClaimMissionReward}
        />
      )}

      {/* Cabin Exterior Customizer Modal */}
      {selectedCabinForCustom && (
        <CabinCustomizerModal
          cabin={selectedCabinForCustom}
          onClose={() => setSelectedCabinForCustom(null)}
          onSave={handleSaveCabinCustomization}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameState === 'gameover' && (
        <VictoryModal
          frostGems={frostGems}
          clearedRoadPct={roadClearancePct}
          rescuedCabinsCount={rescuedCabinsCount}
          decorPlacedCount={decorPlacedCount}
          onContinue={() => setGameState('playing')}
        />
      )}
    </div>
  );
}
