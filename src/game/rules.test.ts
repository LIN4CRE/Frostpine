/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SnowGrid,
  updatePloughKinematics,
  advanceWeatherSystem,
  INITIAL_CABINS,
  INITIAL_WEATHER,
  INITIAL_WEATHER_FORECAST,
  INITIAL_UPGRADES,
  WeatherCondition,
} from './rules.ts';

test('SnowGrid simulates continuous snowfall accumulation', () => {
  const grid = new SnowGrid(32, 100);
  const beforeDepth = grid.getSnowInfoAt(0, 0).depth;

  const heavySnow: WeatherCondition = {
    ...INITIAL_WEATHER,
    type: 'heavy_snow',
    snowfallRate: 0.05, // 0.05m per sec
    temperature: -5,
  };

  grid.simulateWeatherStep(heavySnow, 2.0); // 2 seconds

  const afterDepth = grid.getSnowInfoAt(0, 0).depth;
  assert.ok(afterDepth > beforeDepth, 'Snow depth must increase with snowfall');
});

test('Freezing rain generates black ice glaze', () => {
  const grid = new SnowGrid(32, 100);
  const beforeIce = grid.getSnowInfoAt(0, 0).ice;

  const rain: WeatherCondition = {
    ...INITIAL_WEATHER,
    type: 'freezing_rain',
    snowfallRate: 0.001,
    temperature: -1.0,
  };

  grid.simulateWeatherStep(rain, 3.0);

  const afterIce = grid.getSnowInfoAt(0, 0).ice;
  assert.ok(afterIce > beforeIce, 'Ice glaze must accumulate during freezing rain');
});

test('Plough pushes snow into physical side snowbanks', () => {
  const grid = new SnowGrid(32, 100);

  // Clear along center line
  const result = grid.ploughSnowAt(0, 0, 0, 3.4, INITIAL_UPGRADES, false);
  assert.ok(result.displacedVolume > 0, 'Displaced snow should be positive');

  // Verify that roadside berm cells received displaced snow
  const sideSnow = grid.getSnowInfoAt(3.0, 0); // ~3m to the side
  assert.ok(sideSnow.depth > 0, 'Side cells should receive displaced snow berm');
});

test('Ice reduces vehicle traction and tyre upgrades improve grip', () => {
  const standardVehicle = {
    x: 0,
    z: 0,
    angle: 0,
    speed: 5.0,
    steerAngle: 0,
    bladeLowered: false,
    saltSpreaderActive: false,
    upgrades: INITIAL_UPGRADES,
  };

  // Normal powder surface
  const powderMoved = updatePloughKinematics(
    standardVehicle,
    { forward: true, backward: false, left: true, right: false, brake: false, boost: false },
    { depth: 0.2, type: 'powder', ice: 0 },
    1.0,
    0.1
  );

  // Ice surface without chains
  const iceMoved = updatePloughKinematics(
    standardVehicle,
    { forward: true, backward: false, left: true, right: false, brake: false, boost: false },
    { depth: 0.2, type: 'ice', ice: 0.8 },
    1.0,
    0.1
  );

  assert.ok(
    Math.abs(iceMoved.steerAngle) < Math.abs(powderMoved.steerAngle),
    'Vehicle on ice must have reduced steering authority/slip'
  );

  // Upgraded tyres with diamond chains
  const chainedVehicle = {
    ...standardVehicle,
    upgrades: { ...INITIAL_UPGRADES, tyresLevel: 2 },
  };

  const chainedMoved = updatePloughKinematics(
    chainedVehicle,
    { forward: true, backward: false, left: true, right: false, brake: false, boost: false },
    { depth: 0.2, type: 'ice', ice: 0.8 },
    1.0,
    0.1
  );

  assert.ok(
    Math.abs(chainedMoved.steerAngle) > Math.abs(iceMoved.steerAngle),
    'Tyre chains must significantly improve steering response on ice'
  );
});

test('Dynamic weather system advances and transitions when timer expires', () => {
  const initial = { ...INITIAL_WEATHER, timeRemaining: 1.0 };
  const forecast = [...INITIAL_WEATHER_FORECAST];

  const advanced = advanceWeatherSystem(initial, forecast, 2.0);
  assert.equal(advanced.eventChanged, true, 'Weather should transition when time expires');
  assert.equal(advanced.weather.type, 'heavy_snow', 'Next forecast event should become active');
});

test('Serialization and deserialization preserve grid depth and ice state', () => {
  const grid = new SnowGrid(16, 50);
  grid.depths[10] = 1.25;
  grid.iceGlaze[10] = 0.75;
  grid.types[10] = 3;

  const data = grid.serialize();
  const restoredGrid = new SnowGrid(16, 50);
  restoredGrid.deserialize(data);

  assert.equal(Math.round(restoredGrid.depths[10] * 100), 125);
  assert.equal(Math.round(restoredGrid.iceGlaze[10] * 100), 75);
  assert.equal(restoredGrid.types[10], 3);
});
