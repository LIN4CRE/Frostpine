/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createHazardTexture } from './textures.ts';

export interface PloughMeshParts {
  group: THREE.Group;
  bladePivot: THREE.Group;
  wheels: THREE.Mesh[];
  beaconLight: THREE.PointLight;
  beaconMesh: THREE.Mesh;
  headlights: THREE.SpotLight[];
  exhaustMesh: THREE.Mesh;
  spreaderDisc: THREE.Mesh;
  smokeParticles: THREE.Points;
  smokeData: { positions: Float32Array; ages: Float32Array; maxAge: number };
}

export function createSnowPloughModel(): PloughMeshParts {
  const root = new THREE.Group();

  // Materials
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Deep cozy alpine crimson
    roughness: 0.35,
    metalness: 0.2,
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937, // Heavy dark iron
    roughness: 0.85,
    metalness: 0.5,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
  });

  const interiorGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.6,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.9,
    metalness: 0.05,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.25,
    metalness: 0.8,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.3,
    metalness: 0.75,
  });

  const hazardTexture = createHazardTexture();
  const hazardMat = new THREE.MeshStandardMaterial({
    map: hazardTexture,
    roughness: 0.4,
    metalness: 0.1,
  });

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.0,
    roughness: 0.2,
  });

  // 1. Lower Chassis Frame
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.4, 3.2);
  const chassis = new THREE.Mesh(chassisGeo, frameMat);
  chassis.position.y = 0.5;
  chassis.castShadow = true;
  root.add(chassis);

  // 2. Engine Hood / Nose (front section)
  const hoodGeo = new THREE.BoxGeometry(1.4, 0.7, 1.4);
  const hood = new THREE.Mesh(hoodGeo, bodyMat);
  hood.position.set(0, 0.95, 0.8);
  hood.castShadow = true;
  root.add(hood);

  // Hood radiator grill
  const grillGeo = new THREE.BoxGeometry(1.2, 0.5, 0.08);
  const grill = new THREE.Mesh(grillGeo, frameMat);
  grill.position.set(0, 0.95, 1.51);
  root.add(grill);

  // 3. Enclosed Driver Cab (rear-center section)
  const cabGeo = new THREE.BoxGeometry(1.5, 1.1, 1.4);
  const cab = new THREE.Mesh(cabGeo, bodyMat);
  cab.position.set(0, 1.35, -0.5);
  cab.castShadow = true;
  root.add(cab);

  // Cab Roof Cap with snow dusting
  const roofGeo = new THREE.BoxGeometry(1.6, 0.12, 1.5);
  const roof = new THREE.Mesh(roofGeo, frameMat);
  roof.position.set(0, 1.95, -0.5);
  root.add(roof);

  const roofSnowGeo = new THREE.BoxGeometry(1.5, 0.06, 1.4);
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const roofSnow = new THREE.Mesh(roofSnowGeo, snowMat);
  roofSnow.position.set(0, 2.03, -0.5);
  root.add(roofSnow);

  // 4. Windows (Front, Sides, Back)
  const fWinGeo = new THREE.PlaneGeometry(1.2, 0.55);
  const fWin = new THREE.Mesh(fWinGeo, glassMat);
  fWin.position.set(0, 1.45, 0.21);
  root.add(fWin);

  const bWin = new THREE.Mesh(fWinGeo, glassMat);
  bWin.position.set(0, 1.45, -1.21);
  bWin.rotation.y = Math.PI;
  root.add(bWin);

  const sideWinGeo = new THREE.PlaneGeometry(0.9, 0.55);
  const lWin = new THREE.Mesh(sideWinGeo, glassMat);
  lWin.position.set(-0.76, 1.45, -0.5);
  lWin.rotation.y = -Math.PI / 2;
  root.add(lWin);

  const rWin = new THREE.Mesh(sideWinGeo, glassMat);
  rWin.position.set(0.76, 1.45, -0.5);
  rWin.rotation.y = Math.PI / 2;
  root.add(rWin);

  // Interior Dashboard Warm Glow
  const dashGeo = new THREE.BoxGeometry(0.8, 0.1, 0.3);
  const dash = new THREE.Mesh(dashGeo, interiorGlowMat);
  dash.position.set(0, 1.1, 0.05);
  root.add(dash);

  // 5. Wheels (4 Knobby Winter Tires)
  const wheels: THREE.Mesh[] = [];
  const wheelRadius = 0.44;
  const wheelWidth = 0.35;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, wheelWidth + 0.02, 12);
  rimGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.9, 0.44, 1.0],  // Front Left
    [0.9, 0.44, 1.0],   // Front Right
    [-0.95, 0.48, -0.9], // Rear Left (slightly larger)
    [0.95, 0.48, -0.9],  // Rear Right
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    root.add(wheelGroup);
    wheels.push(tire);
  });

  // 6. Front Snow Plough Blade & Hydraulics
  const bladePivot = new THREE.Group();
  bladePivot.position.set(0, 0.4, 1.6); // at front bumper
  root.add(bladePivot);

  // Hydraulic lift arms
  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
  armGeo.rotateX(Math.PI / 2.3);

  const armL = new THREE.Mesh(armGeo, frameMat);
  armL.position.set(-0.5, 0.1, 0.35);
  bladePivot.add(armL);

  const armR = new THREE.Mesh(armGeo, frameMat);
  armR.position.set(0.5, 0.1, 0.35);
  bladePivot.add(armR);

  // Curved heavy blade mesh
  const bladeWidth = 3.2;
  const bladeGeo = new THREE.CylinderGeometry(1.4, 1.4, bladeWidth, 16, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
  bladeGeo.rotateZ(Math.PI / 2); // Axis along X (left to right)
  bladeGeo.rotateX(Math.PI / 2); // Curve cupped forward

  const blade = new THREE.Mesh(bladeGeo, steelMat);
  blade.position.set(0, 0.15, 0.7);
  blade.castShadow = true;
  bladePivot.add(blade);

  // Bottom scrape bar with hazard stripes
  const scrapeBarGeo = new THREE.BoxGeometry(bladeWidth + 0.1, 0.16, 0.08);
  const scrapeBar = new THREE.Mesh(scrapeBarGeo, hazardMat);
  scrapeBar.position.set(0, -0.18, 0.75);
  scrapeBar.castShadow = true;
  bladePivot.add(scrapeBar);

  // 7. Roof Flashing Amber Beacon
  const beaconMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 12), beaconMat);
  beaconMesh.position.set(0, 2.15, -0.5);
  root.add(beaconMesh);

  const beaconLight = new THREE.PointLight(0xf59e0b, 1.5, 8);
  beaconLight.position.set(0, 2.3, -0.5);
  root.add(beaconLight);

  // 8. Front Headlights (Warm glow + spot lights)
  const headlights: THREE.SpotLight[] = [];
  const headlightGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xfef08a,
    emissiveIntensity: 1.5,
  });

  const hlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
  hlGeo.rotateX(Math.PI / 2);

  [-0.55, 0.55].forEach((hx) => {
    const hlMesh = new THREE.Mesh(hlGeo, headlightGlowMat);
    hlMesh.position.set(hx, 0.95, 1.52);
    root.add(hlMesh);

    const spot = new THREE.SpotLight(0xffedd5, 2.5, 18, Math.PI / 5, 0.4);
    spot.position.set(hx, 0.95, 1.55);
    spot.target.position.set(hx, 0.1, 10.0);
    root.add(spot);
    root.add(spot.target);
    headlights.push(spot);
  });

  // 9. Rear Salt Spreader
  const spreaderHopperGeo = new THREE.ConeGeometry(0.45, 0.6, 6);
  spreaderHopperGeo.rotateX(Math.PI);
  const hopper = new THREE.Mesh(spreaderHopperGeo, frameMat);
  hopper.position.set(0, 0.9, -1.8);
  root.add(hopper);

  const spreaderDiscGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8);
  const spreaderDisc = new THREE.Mesh(spreaderDiscGeo, steelMat);
  spreaderDisc.position.set(0, 0.45, -1.8);
  root.add(spreaderDisc);

  // 10. Exhaust Pipe & Smoke
  const exhaustGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
  const exhaustMesh = new THREE.Mesh(exhaustGeo, frameMat);
  exhaustMesh.position.set(0.68, 1.6, -0.1);
  exhaustMesh.rotation.z = -0.1;
  root.add(exhaustMesh);

  // Exhaust smoke particle pool
  const maxSmoke = 16;
  const smokePositions = new Float32Array(maxSmoke * 3);
  const smokeAges = new Float32Array(maxSmoke);
  for (let i = 0; i < maxSmoke; i++) {
    smokePositions[i * 3] = 0.68;
    smokePositions[i * 3 + 1] = 2.0;
    smokePositions[i * 3 + 2] = -0.1;
    smokeAges[i] = (i / maxSmoke) * 1.5;
  }

  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));

  const smokeMat = new THREE.PointsMaterial({
    color: 0xe2e8f0,
    size: 0.35,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  root.add(smokeParticles);

  // 11. Soft Contact Shadow Disc
  const shadowGeo = new THREE.CircleGeometry(1.6, 24);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  root.add(shadow);

  return {
    group: root,
    bladePivot,
    wheels,
    beaconLight,
    beaconMesh,
    headlights,
    exhaustMesh,
    spreaderDisc,
    smokeParticles,
    smokeData: { positions: smokePositions, ages: smokeAges, maxAge: 1.5 },
  };
}
