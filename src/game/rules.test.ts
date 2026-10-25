/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SnowGrid, updatePloughKinematics, INITIAL_CABINS } from './rules.ts';

test('SnowGrid initializes with deep snow and road cells', () => {
  const grid = new SnowGrid(32, 100);
  assert.equal(grid.depths.length, 32 * 32);

  // Center town square is marked as road
  const center = grid.worldToGrid(0, 0);
  const centerIdx = grid.getIndex(center.gx, center.gz);
  assert.equal(grid.isRoad[centerIdx], 1);

  // Initial depth is high
  assert.ok(grid.depths[centerIdx] > 0.5);
});

test('ploughSnowAt clears snow along blade and awards points', () => {
  const grid = new SnowGrid(32, 100);
  const initialDepth = grid.getSnowDepthAt(0, 0);

  const result = grid.ploughSnowAt(0, 0, 0, 4.0, 1.0);
  assert.ok(result.displacedVolume > 0, 'Displaced snow should be positive');
  assert.ok(result.pointsEarned > 0, 'Points earned should be positive');

  const afterDepth = grid.getSnowDepthAt(0, 0);
  assert.ok(afterDepth < initialDepth, 'Snow depth at blade should be reduced');
});

test('getClearanceStats calculates percentages correctly', () => {
  const grid = new SnowGrid(32, 100);
  const statsBefore = grid.getClearanceStats();
  assert.ok(statsBefore.totalRoadCells > 0);
  assert.equal(statsBefore.roadClearancePct, 0);

  // Plough extensively at center
  for (let i = 0; i < 10; i++) {
    grid.ploughSnowAt(0, 0, 0, 8.0, 1.0);
  }

  const statsAfter = grid.getClearanceStats();
  assert.ok(statsAfter.clearedRoadCells > 0);
});

test('updatePloughKinematics accelerates, steers, and obeys snow drag', () => {
  const initialVehicle = {
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    steerAngle: 0,
    bladeLowered: true,
    saltSpreader: false,
  };

  // Accelerate forward with blade lowered in deep snow (drag is higher)
  const moved = updatePloughKinematics(
    initialVehicle,
    { forward: true, backward: false, left: false, right: false, brake: false, boost: false },
    0.9,
    0.1
  );

  assert.ok(moved.speed > 0, 'Vehicle should accelerate forward');
  assert.ok(moved.z > 0, 'Vehicle heading should move along Z');

  // Steering right
  const steered = updatePloughKinematics(
    moved,
    { forward: true, backward: false, left: false, right: true, brake: false, boost: false },
    0.2,
    0.1
  );
  assert.ok(steered.steerAngle > 0, 'Steering angle should turn right');
});

test('Cabin configuration contains 5 unique festive chalets', () => {
  assert.equal(INITIAL_CABINS.length, 5);
  const ids = new Set(INITIAL_CABINS.map((c) => c.id));
  assert.equal(ids.size, 5, 'All cabin IDs must be distinct');
});
