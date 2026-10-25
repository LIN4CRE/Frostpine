/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Cabin,
  CabinCustomization,
  DecorCatalogItem,
  DecorSlot,
  FULL_DECOR_CATALOG,
  INITIAL_CABINS,
  INITIAL_CONTRACTS,
  INITIAL_DECOR_SLOTS,
  INITIAL_MISSIONS,
  INITIAL_UPGRADES,
  INITIAL_WEATHER,
  INITIAL_WEATHER_FORECAST,
  Mission,
  PlacedDecoration,
  SnowGrid,
  updatePloughKinematics,
  VehiclePhysics,
  VehicleUpgrades,
  WeatherCondition,
  WeatherContract,
  WeatherForecastItem,
  advanceWeatherSystem,
  UPGRADE_PRICES,
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
import { CabinDecorationMode } from './components/CabinDecorationMode.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';
type CameraViewMode = 'follow' | 'cab' | 'bird';

const SAVE_KEY = 'frostpine_save_v2';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // App & Gameplay State
  const [gameState, setGameState] = useState<GameState>('title');
  const [frostGems, setFrostGems] = useState<number>(140);
  const [roadClearancePct, setRoadClearancePct] = useState<number>(0);
  const [totalClearedPct, setTotalClearedPct] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('follow');
  const [atmosphere, setAtmosphere] = useState<AtmospherePreset>('twilight');

  // Dynamic Weather State
  const [weather, setWeather] = useState<WeatherCondition>(INITIAL_WEATHER);
  const [forecast, setForecast] = useState<WeatherForecastItem[]>(INITIAL_WEATHER_FORECAST);
  const [contracts, setContracts] = useState<WeatherContract[]>(INITIAL_CONTRACTS);

  // Vehicle Upgrades State
  const [upgrades, setUpgrades] = useState<VehicleUpgrades>(INITIAL_UPGRADES);

  // World & Cabin State
  const [cabins, setCabins] = useState<Cabin[]>(INITIAL_CABINS);
  const [decorCatalog, setDecorCatalog] = useState<DecorCatalogItem[]>(FULL_DECOR_CATALOG);
  const [decorSlots, setDecorSlots] = useState<DecorSlot[]>(INITIAL_DECOR_SLOTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [decoratingCabin, setDecoratingCabin] = useState<Cabin | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Vehicle Physics exposed to React HUD
  const [vehicleState, setVehicleState] = useState<VehiclePhysics>({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    steerAngle: 0,
    bladeLowered: true,
    saltSpreaderActive: false,
    upgrades: INITIAL_UPGRADES,
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
    saltSpreaderActive: false,
    upgrades: INITIAL_UPGRADES,
  });

  const weatherRef = useRef<WeatherCondition>(INITIAL_WEATHER);
  const forecastRef = useRef<WeatherForecastItem[]>(INITIAL_WEATHER_FORECAST);
  const contractsRef = useRef<WeatherContract[]>(INITIAL_CONTRACTS);

  const envRef = useRef<EnvironmentScene | null>(null);
  const ploughRef = useRef<PloughMeshParts | null>(null);
  const cabinVisualsRef = useRef<CabinVisualInstance[]>([]);
  const townDecorMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  const keysPressedRef = useRef<Set<string>>(new Set());
  const cameraModeRef = useRef<CameraViewMode>('follow');
  const gameStateRef = useRef<GameState>('title');
  const atmosphereRef = useRef<AtmospherePreset>('twilight');

  // Keep refs in sync with React state
  cameraModeRef.current = cameraMode;
  gameStateRef.current = gameState;
  atmosphereRef.current = atmosphere;
  weatherRef.current = weather;
  forecastRef.current = forecast;
  contractsRef.current = contracts;

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3800);
  }, []);

  // Set document body data-state
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Save / Load System Persistence
  const saveGameToStorage = useCallback(() => {
    try {
      const saveData = {
        frostGems,
        upgrades,
        cabins: cabins.map((c) => ({
          id: c.id,
          discovered: c.discovered,
          unlockedDecoration: c.unlockedDecoration,
          customization: c.customization,
          placedDecorations: c.placedDecorations,
        })),
        decorSlots,
        decorCatalog: decorCatalog.map((d) => ({ id: d.id, unlocked: d.unlocked })),
        missions,
        weather: weatherRef.current,
        forecast: forecastRef.current,
        contracts: contractsRef.current,
        gridData: gridRef.current.serialize(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch {
      // Storage unavailable
    }
  }, [frostGems, upgrades, cabins, decorSlots, decorCatalog, missions]);

  // Load saved game on startup
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.frostGems !== undefined) setFrostGems(saved.frostGems);
        if (saved.upgrades) {
          setUpgrades(saved.upgrades);
          vehicleRef.current.upgrades = saved.upgrades;
        }
        if (saved.decorSlots) setDecorSlots(saved.decorSlots);
        if (saved.missions) setMissions(saved.missions);
        if (saved.contracts) setContracts(saved.contracts);

        if (saved.cabins && Array.isArray(saved.cabins)) {
          setCabins((prev) =>
            prev.map((c) => {
              const matched = saved.cabins.find((sc: { id: string }) => sc.id === c.id);
              return matched ? { ...c, ...matched } : c;
            })
          );
        }

        if (saved.gridData) {
          gridRef.current.deserialize(saved.gridData);
        }
      }
    } catch {
      // Ignore corrupted saves
    }
  }, []);

  // Periodic Auto-save (every 30s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStateRef.current === 'playing') {
        saveGameToStorage();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [saveGameToStorage]);

  // Autostart query support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      audio.init();
      audio.resumeContext();
      setGameState('playing');
      if (envRef.current) {
        const v = vehicleRef.current;
        envRef.current.camera.position.set(v.x, 9.5, v.z - 16);
        envRef.current.camera.lookAt(v.x, 1.8, v.z + 8);
      }
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current.add(e.code);

      // Start game from title on Space/Enter
      if (gameStateRef.current === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      // Pause toggle
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

      // Salt Spreader toggle on KeyV
      if (gameStateRef.current === 'playing' && e.code === 'KeyV') {
        if (vehicleRef.current.upgrades.saltSpreaderLevel > 0) {
          vehicleRef.current.saltSpreaderActive = !vehicleRef.current.saltSpreaderActive;
          setVehicleState({ ...vehicleRef.current });
          showToast(vehicleRef.current.saltSpreaderActive ? '🧂 Salt Spreader: ACTIVE' : '🧂 Salt Spreader: OFF');
        }
      }

      // Camera cycle on KeyC
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
  }, [showToast]);

  // Main Three.js Scene Setup & Simulation Loop
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Setup Environment
    const env = setupEnvironment(container);
    envRef.current = env;

    // 2. Setup Snow Plough
    const plough = createSnowPloughModel();
    ploughRef.current = plough;
    env.scene.add(plough.group);

    // 3. Setup Cabins
    const cabinVisuals: CabinVisualInstance[] = [];
    INITIAL_CABINS.forEach((cabin) => {
      const vis = createCabinModel(cabin);
      env.scene.add(vis.root);
      cabinVisuals.push(vis);
    });
    cabinVisualsRef.current = cabinVisuals;

    // Initial snow mesh sync
    env.updateSnowMesh(gridRef.current);

    // Resize listener
    const handleResize = () => {
      if (!container || !env.renderer || !env.camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      env.camera.aspect = w / h;
      env.camera.updateProjectionMatrix();
      env.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 4. Main 60 FPS Render / Simulation Loop
    let animationFrameId = 0;
    let lastTime = performance.now();
    let hudThrottleCounter = 0;
    let weatherSimTimer = 0;
    let titleFlyoverAngle = 0;

    const dummyPloughPos = new THREE.Vector3();
    const camTarget = new THREE.Vector3();

    function tick(now: number) {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const state = gameStateRef.current;

      // Animate beacon
      if (plough.beaconMesh) {
        plough.beaconMesh.rotation.y += 8.0 * dt;
      }

      // Title Screen: Scenic Orbit Pan
      if (state === 'title') {
        titleFlyoverAngle += 0.22 * dt;
        const orbitRadius = 45;
        env.camera.position.x = Math.sin(titleFlyoverAngle) * orbitRadius;
        env.camera.position.z = Math.cos(titleFlyoverAngle) * orbitRadius;
        env.camera.position.y = 22 + Math.sin(titleFlyoverAngle * 0.5) * 6;
        env.camera.lookAt(0, 2, 0);

        env.updateFallingSnow(dt, env.camera.position, weatherRef.current);
        env.renderer.render(env.scene, env.camera);

        if (env.isSoftwareGl) {
          env.afterDraw(() => tick(performance.now()));
        } else {
          animationFrameId = requestAnimationFrame(tick);
        }
        return;
      }

      // Active Gameplay Simulation
      if (state === 'playing') {
        const keys = keysPressedRef.current;
        const forward = keys.has('KeyW') || keys.has('ArrowUp');
        const backward = keys.has('KeyS') || keys.has('ArrowDown');
        const left = keys.has('KeyA') || keys.has('ArrowLeft');
        const right = keys.has('KeyD') || keys.has('ArrowRight');
        const brake = keys.has('Space') && !vehicleRef.current.bladeLowered;
        const boost = keys.has('ShiftLeft') || keys.has('ShiftRight');

        const curWeather = weatherRef.current;

        // 1. Advance Dynamic Weather System
        weatherSimTimer += dt;
        if (weatherSimTimer >= 1.0) {
          weatherSimTimer = 0;
          const { weather: nextW, forecast: nextF, eventChanged } = advanceWeatherSystem(
            curWeather,
            forecastRef.current,
            1.0
          );
          setWeather(nextW);
          setForecast(nextF);
          weatherRef.current = nextW;
          forecastRef.current = nextF;

          if (eventChanged) {
            env.applyWeatherCondition(nextW);
            showToast(`🌦️ Weather Shift: ${nextW.name}`);
          }

          // Advance weather accumulation step across grid
          gridRef.current.simulateWeatherStep(nextW, 1.0);
          env.updateSnowMesh(gridRef.current);

          // Advance active contracts timers
          setContracts((prev) =>
            prev.map((c) => {
              if (c.active && !c.completed && !c.failed) {
                const nextTime = Math.max(0, c.timeRemaining - 1);
                return { ...c, timeRemaining: nextTime, failed: nextTime <= 0 };
              }
              return c;
            })
          );
        }

        // 2. Surface Snow Info & Kinematics
        const snowInfo = gridRef.current.getSnowInfoAt(vehicleRef.current.x, vehicleRef.current.z);

        vehicleRef.current = updatePloughKinematics(
          vehicleRef.current,
          { forward, backward, left, right, brake, boost },
          snowInfo,
          curWeather.tractionMultiplier,
          dt
        );

        const v = vehicleRef.current;

        // 3. Update Vehicle Mesh Transforms
        plough.group.position.set(v.x, 0, v.z);
        plough.group.rotation.y = v.angle;

        if (plough.wheels[0] && plough.wheels[1]) {
          plough.wheels[0].rotation.y = v.steerAngle;
          plough.wheels[1].rotation.y = v.steerAngle;
        }

        const targetBladeY = v.bladeLowered ? 0 : 0.45;
        plough.bladePivot.position.y = THREE.MathUtils.damp(
          plough.bladePivot.position.y,
          targetBladeY,
          10,
          dt
        );

        if (plough.spreaderDisc && (v.saltSpreaderActive || Math.abs(v.speed) > 1.0)) {
          plough.spreaderDisc.rotation.y += 12 * dt;
        }

        // Compact tyre tracks as wheels roll
        if (Math.abs(v.speed) > 0.4) {
          gridRef.current.compactTyreTracks(v.x - 0.9, v.z);
          gridRef.current.compactTyreTracks(v.x + 0.9, v.z);
        }

        // 4. Snow Ploughing & Snowbank Berms
        let isPloughing = false;
        if (v.bladeLowered && Math.abs(v.speed) > 0.4) {
          const bladeOffsetX = Math.sin(v.angle) * 2.2;
          const bladeOffsetZ = Math.cos(v.angle) * 2.2;
          const bladeWorldX = v.x + bladeOffsetX;
          const bladeWorldZ = v.z + bladeOffsetZ;

          const clearRes = gridRef.current.ploughSnowAt(
            bladeWorldX,
            bladeWorldZ,
            v.angle,
            3.4,
            v.upgrades,
            v.saltSpreaderActive
          );

          if (clearRes.displacedVolume > 0.05) {
            isPloughing = true;
            env.updateSnowMesh(gridRef.current);

            if (clearRes.pointsEarned > 0) {
              setFrostGems((prev) => prev + clearRes.pointsEarned);
            }
          }
        }

        // 5. Salt Spreading
        if (v.saltSpreaderActive && Math.abs(v.speed) > 0.2) {
          const rearX = v.x - Math.sin(v.angle) * 1.8;
          const rearZ = v.z - Math.cos(v.angle) * 1.8;
          gridRef.current.applySaltSpread(rearX, rearZ, 3.8);
        }

        // Audio update
        audio.updateEngineSound(v.speed / 10, isPloughing);

        // 6. Cabin Discovery & Restoration Thresholds
        dummyPloughPos.set(v.x, 0, v.z);
        const stats = gridRef.current.getClearanceStats();

        cabinVisualsRef.current.forEach((vis, idx) => {
          const cabin = vis.cabin;
          const clearanceForThis = stats.cabinRoadStats[idx] || 0;
          const dist = dummyPloughPos.distanceTo(vis.root.position);

          // Awaken / Rescue cabin
          if (!cabin.discovered) {
            if (clearanceForThis >= cabin.clearanceThreshold * 100 || dist <= cabin.radius) {
              vis.setDiscovered(true);
              audio.playCabinDiscovered();
              showToast(`🎉 Rescued ${cabin.name}! Windows glowing warm.`);
              setFrostGems((prev) => prev + cabin.rewards);

              setCabins((prev) =>
                prev.map((c) => (c.id === cabin.id ? { ...c, discovered: true } : c))
              );
            }
          }

          // Unlock Full Decoration Mode when route is fully maintained (>= 65%)
          if (cabin.discovered && !cabin.unlockedDecoration && clearanceForThis >= 65) {
            vis.cabin.unlockedDecoration = true;
            showToast(`🏡 ${cabin.name} driveway fully cleared! Decor mode unlocked.`);
            setCabins((prev) =>
              prev.map((c) => (c.id === cabin.id ? { ...c, unlockedDecoration: true } : c))
            );
          }
        });

        // 7. Throttled HUD State Sync (10Hz)
        hudThrottleCounter++;
        if (hudThrottleCounter % 6 === 0) {
          setRoadClearancePct(stats.roadClearancePct);
          setTotalClearedPct(stats.totalClearedPct);
          setVehicleState({ ...v });

          // Update missions
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

        // 8. Dynamic Camera Follow
        const mode = cameraModeRef.current;
        let targetCamX = v.x;
        let targetCamY = 10;
        let targetCamZ = v.z;

        if (mode === 'follow') {
          const followDist = 16;
          targetCamX = v.x - Math.sin(v.angle) * followDist;
          targetCamZ = v.z - Math.cos(v.angle) * followDist;
          targetCamY = 9.5;
          camTarget.set(v.x + Math.sin(v.angle) * 8, 1.8, v.z + Math.cos(v.angle) * 8);
        } else if (mode === 'cab') {
          targetCamX = v.x + Math.sin(v.angle) * 0.4;
          targetCamZ = v.z + Math.cos(v.angle) * 0.4;
          targetCamY = 2.0;
          camTarget.set(v.x + Math.sin(v.angle) * 16, 1.6, v.z + Math.cos(v.angle) * 16);
        } else {
          targetCamX = v.x - 12;
          targetCamZ = v.z - 12;
          targetCamY = 28;
          camTarget.set(v.x, 0, v.z);
        }

        env.camera.position.x = THREE.MathUtils.damp(env.camera.position.x, targetCamX, 4.0, dt);
        env.camera.position.y = THREE.MathUtils.damp(env.camera.position.y, targetCamY, 4.0, dt);
        env.camera.position.z = THREE.MathUtils.damp(env.camera.position.z, targetCamZ, 4.0, dt);
        env.camera.lookAt(camTarget);

        // Update falling snow particles with wind vectors
        env.updateFallingSnow(dt, plough.group.position, curWeather);
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

  const handleStartGame = () => {
    audio.init();
    audio.resumeContext();
    setGameState('playing');
    if (envRef.current) {
      const v = vehicleRef.current;
      envRef.current.camera.position.set(v.x, 9.5, v.z - 16);
      envRef.current.camera.lookAt(v.x, 1.8, v.z + 8);
    }
  };

  const handleToggleBlade = () => {
    vehicleRef.current.bladeLowered = !vehicleRef.current.bladeLowered;
    setVehicleState({ ...vehicleRef.current });
  };

  const handleToggleSalt = () => {
    if (vehicleRef.current.upgrades.saltSpreaderLevel > 0) {
      vehicleRef.current.saltSpreaderActive = !vehicleRef.current.saltSpreaderActive;
      setVehicleState({ ...vehicleRef.current });
      showToast(vehicleRef.current.saltSpreaderActive ? '🧂 Salt Spreader: ACTIVE' : '🧂 Salt Spreader: OFF');
    }
  };

  const handleCycleCamera = () => {
    setCameraMode((prev) => (prev === 'follow' ? 'cab' : prev === 'cab' ? 'bird' : 'follow'));
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Upgrades Purchase
  const handlePurchaseUpgrade = (type: keyof VehicleUpgrades) => {
    const curLevel = upgrades[type];
    const prices = UPGRADE_PRICES[type];
    const cost = prices[curLevel];

    if (frostGems < cost) {
      showToast('Need more Frost Gems!');
      return;
    }

    const nextUpgrades = { ...upgrades, [type]: curLevel + 1 };
    setFrostGems((prev) => prev - cost);
    setUpgrades(nextUpgrades);
    vehicleRef.current.upgrades = nextUpgrades;
    audio.playCabinDiscovered();
    showToast(`🔧 Upgraded ${type} to Tier ${curLevel + 1}!`);
    saveGameToStorage();
  };

  // Cabin Decoration Actions
  const handleAddDecorationToCabin = (cabinId: string, decor: PlacedDecoration, cost: number) => {
    setFrostGems((prev) => prev - cost);

    setCabins((prev) =>
      prev.map((c) => {
        if (c.id !== cabinId) return c;
        if (c.placedDecorations.some((d) => d.instanceId === decor.instanceId)) return c;
        return { ...c, placedDecorations: [...c.placedDecorations, decor] };
      })
    );

    // Sync 3D instance
    const vis = cabinVisualsRef.current.find((v) => v.cabin.id === cabinId);
    if (vis) {
      const existing = vis.cabin.placedDecorations.filter((d) => d.instanceId !== decor.instanceId);
      const updated = [...existing, decor];
      vis.cabin.placedDecorations = updated;
      vis.syncPlacedDecorations(updated);
    }

    setDecoratingCabin((curr) => {
      if (!curr || curr.id !== cabinId) return curr;
      if (curr.placedDecorations.some((d) => d.instanceId === decor.instanceId)) return curr;
      return { ...curr, placedDecorations: [...curr.placedDecorations, decor] };
    });

    audio.playDecorPlaced();
    showToast('✨ Decoration placed successfully!');
    saveGameToStorage();
  };

  const handleRemoveDecorationFromCabin = (cabinId: string, instanceId: string, refund: number) => {
    setFrostGems((prev) => prev + refund);
    setCabins((prev) =>
      prev.map((c) =>
        c.id === cabinId
          ? { ...c, placedDecorations: c.placedDecorations.filter((d) => d.instanceId !== instanceId) }
          : c
      )
    );

    const vis = cabinVisualsRef.current.find((v) => v.cabin.id === cabinId);
    if (vis) {
      const updated = vis.cabin.placedDecorations.filter((d) => d.instanceId !== instanceId);
      vis.cabin.placedDecorations = updated;
      vis.syncPlacedDecorations(updated);
    }

    setDecoratingCabin((curr) =>
      curr && curr.id === cabinId
        ? { ...curr, placedDecorations: curr.placedDecorations.filter((d) => d.instanceId !== instanceId) }
        : curr
    );

    audio.playDecorPlaced();
    showToast(`Sold decoration (+${refund} 💎)`);
    saveGameToStorage();
  };

  const handleRotateDecoration = (cabinId: string, instanceId: string) => {
    setCabins((prev) =>
      prev.map((c) =>
        c.id === cabinId
          ? {
              ...c,
              placedDecorations: c.placedDecorations.map((d) =>
                d.instanceId === instanceId
                  ? { ...d, rotationY: (d.rotationY + Math.PI / 2) % (Math.PI * 2) }
                  : d
              ),
            }
          : c
      )
    );

    const vis = cabinVisualsRef.current.find((v) => v.cabin.id === cabinId);
    if (vis) {
      vis.cabin.placedDecorations = vis.cabin.placedDecorations.map((d) =>
        d.instanceId === instanceId
          ? { ...d, rotationY: (d.rotationY + Math.PI / 2) % (Math.PI * 2) }
          : d
      );
      vis.syncPlacedDecorations(vis.cabin.placedDecorations);
    }

    setDecoratingCabin((curr) =>
      curr && curr.id === cabinId
        ? {
            ...curr,
            placedDecorations: curr.placedDecorations.map((d) =>
              d.instanceId === instanceId
                ? { ...d, rotationY: (d.rotationY + Math.PI / 2) % (Math.PI * 2) }
                : d
            ),
          }
        : curr
    );
  };

  const handleSaveCabinCustomization = (cabinId: string, custom: CabinCustomization) => {
    setCabins((prev) =>
      prev.map((c) => (c.id === cabinId ? { ...c, customization: custom } : c))
    );
    const vis = cabinVisualsRef.current.find((v) => v.cabin.id === cabinId);
    if (vis) {
      vis.updateCustomization(custom);
    }
    audio.playDecorPlaced();
    showToast('✨ Updated chalet architectural style!');
    saveGameToStorage();
  };

  // Town Plaza Decor Placement
  const handlePurchaseAndPlaceTownDecor = (slotId: string, itemId: string) => {
    const item = decorCatalog.find((d) => d.id === itemId);
    const slot = decorSlots.find((s) => s.id === slotId);
    if (!item || !slot) return;

    if (!item.unlocked && frostGems < item.cost) {
      showToast('Need more Frost Gems!');
      return;
    }

    if (!item.unlocked) {
      setFrostGems((prev) => prev - item.cost);
      setDecorCatalog((prev) =>
        prev.map((d) => (d.id === itemId ? { ...d, unlocked: true } : d))
      );
    }

    const existingMesh = townDecorMeshesRef.current.get(slotId);
    if (existingMesh && envRef.current) {
      envRef.current.scene.remove(existingMesh);
      townDecorMeshesRef.current.delete(slotId);
    }

    const newMesh = createDecorMesh(itemId);
    newMesh.position.set(slot.x, 0, slot.z);
    envRef.current?.scene.add(newMesh);
    townDecorMeshesRef.current.set(slotId, newMesh);

    setDecorSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, occupiedItemId: itemId } : s))
    );

    audio.playDecorPlaced();
    showToast(`🎄 Placed ${item.name} at ${slot.name}!`);
    saveGameToStorage();
  };

  const handleClaimContractReward = (contractId: string) => {
    const c = contracts.find((item) => item.id === contractId);
    if (!c || c.completed) return;
    setFrostGems((prev) => prev + c.rewardGems);
    setContracts((prev) =>
      prev.map((item) => (item.id === contractId ? { ...item, completed: true } : item))
    );
    audio.playCabinDiscovered();
    showToast(`📋 Completed contract: +${c.rewardGems} Frost Gems!`);
    saveGameToStorage();
  };

  const handleClaimMissionReward = (missionId: string) => {
    const m = missions.find((item) => item.id === missionId);
    if (!m || m.completed) return;
    setFrostGems((prev) => prev + m.rewardGems);
    setMissions((prev) =>
      prev.map((item) => (item.id === missionId ? { ...item, completed: true } : item))
    );
    audio.playCabinDiscovered();
    showToast(`💎 Claimed ${m.rewardGems} Frost Gems!`);
    saveGameToStorage();
  };

  const handleRestart = () => {
    localStorage.removeItem(SAVE_KEY);
    gridRef.current = new SnowGrid(64, 120);
    vehicleRef.current = {
      x: 0,
      z: 0,
      angle: 0,
      speed: 0,
      steerAngle: 0,
      bladeLowered: true,
      saltSpreaderActive: false,
      upgrades: INITIAL_UPGRADES,
    };
    envRef.current?.updateSnowMesh(gridRef.current);
    cabinVisualsRef.current.forEach((vis) => {
      vis.setDiscovered(false);
      vis.cabin.unlockedDecoration = false;
      vis.cabin.placedDecorations = [];
      vis.syncPlacedDecorations([]);
    });
    setCabins(INITIAL_CABINS);
    setMissions(INITIAL_MISSIONS);
    setContracts(INITIAL_CONTRACTS);
    setUpgrades(INITIAL_UPGRADES);
    setGameState('playing');
  };

  const activeMission = missions.find((m) => !m.completed) || missions[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas */}
      <div
        ref={canvasMountRef}
        data-testid="threejs-canvas"
        className="absolute inset-0 w-full h-full"
      />

      {/* Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          atmosphere={atmosphere}
          setAtmosphere={(p) => {
            setAtmosphere(p);
            envRef.current?.setAtmosphere(p);
          }}
        />
      )}

      {/* In-Game HUD */}
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
          weather={weather}
          forecast={forecast}
          onToggleBlade={handleToggleBlade}
          onToggleSalt={handleToggleSalt}
          onToggleMute={handleToggleMute}
          onCycleCamera={handleCycleCamera}
          onTogglePause={() => setGameState('paused')}
          notification={notification}
        />
      )}

      {/* Collapsible Bottom Dock */}
      {gameState === 'playing' && (
        <BottomDock
          missions={missions}
          contracts={contracts}
          cabins={cabins}
          decorCatalog={decorCatalog}
          decorSlots={decorSlots}
          frostGems={frostGems}
          upgrades={upgrades}
          atmosphere={atmosphere}
          onSetAtmosphere={(p) => {
            setAtmosphere(p);
            envRef.current?.setAtmosphere(p);
          }}
          onSelectCabinToDecorate={(cabin) => setDecoratingCabin(cabin)}
          onPurchaseAndPlaceDecor={handlePurchaseAndPlaceTownDecor}
          onClaimMissionReward={handleClaimMissionReward}
          onClaimContractReward={handleClaimContractReward}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          onSaveGame={saveGameToStorage}
        />
      )}

      {/* Dedicated Cabin Restoration & Decoration Mode */}
      {decoratingCabin && (
        <CabinDecorationMode
          cabin={decoratingCabin}
          frostGems={frostGems}
          onClose={() => setDecoratingCabin(null)}
          onSaveCustomization={handleSaveCabinCustomization}
          onAddDecoration={handleAddDecorationToCabin}
          onRemoveDecoration={handleRemoveDecorationFromCabin}
          onRotateDecoration={handleRotateDecoration}
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

      {/* Victory Modal */}
      {gameState === 'gameover' && (
        <VictoryModal
          frostGems={frostGems}
          clearedRoadPct={roadClearancePct}
          rescuedCabinsCount={cabins.filter((c) => c.discovered).length}
          decorPlacedCount={decorSlots.filter((s) => s.occupiedItemId !== null).length}
          onContinue={() => setGameState('playing')}
        />
      )}
    </div>
  );
}
