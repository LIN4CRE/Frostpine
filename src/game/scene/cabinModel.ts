/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Cabin, CabinCustomization } from '../rules.ts';
import { createWoodTexture } from './textures.ts';

export interface CabinVisualInstance {
  cabin: Cabin;
  root: THREE.Group;
  wallMesh: THREE.Mesh;
  roofMesh: THREE.Mesh;
  doorMesh: THREE.Mesh;
  wreathMesh: THREE.Mesh;
  windowMeshes: THREE.Mesh[];
  windowLights: THREE.PointLight[];
  chimneySmoke: THREE.Points;
  smokeData: { positions: Float32Array; ages: Float32Array };
  porchGarland: THREE.Mesh;
  updateCustomization: (custom: CabinCustomization) => void;
  setDiscovered: (discovered: boolean) => void;
}

const WALL_TINTS: Record<string, string> = {
  cedar: '#854d0e',
  birch: '#e2e8f0',
  'nordic-red': '#991b1b',
  spruce: '#365314',
};

const ROOF_COLORS: Record<string, number> = {
  slate: 0x334155,
  gingerbread: 0x78350f,
  'red-shingle': 0x881337,
  'ice-blue': 0x0284c7,
};

const GLOW_COLORS: Record<string, { color: number; emissive: number; light: number }> = {
  amber: { color: 0xfef08a, emissive: 0xf59e0b, light: 0xf59e0b },
  'hearth-gold': { color: 0xffedd5, emissive: 0xf97316, light: 0xf97316 },
  'aurora-aqua': { color: 0xccfbf1, emissive: 0x14b8a6, light: 0x14b8a6 },
  rose: { color: 0xfce7f3, emissive: 0xf43f5e, light: 0xf43f5e },
};

export function createCabinModel(cabin: Cabin): CabinVisualInstance {
  const root = new THREE.Group();
  root.position.set(cabin.x, 0, cabin.z);

  // 1. Stone Foundation
  const foundGeo = new THREE.BoxGeometry(6.4, 0.6, 6.4);
  const foundMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.9,
    metalness: 0.1,
  });
  const foundation = new THREE.Mesh(foundGeo, foundMat);
  foundation.position.y = 0.3;
  foundation.receiveShadow = true;
  root.add(foundation);

  // 2. Timber Walls
  const wallGeo = new THREE.BoxGeometry(5.6, 3.2, 5.6);
  const initialWallTint = WALL_TINTS[cabin.customization.wallColor] || '#854d0e';
  const wallTex = createWoodTexture(initialWallTint);
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.75,
    metalness: 0.05,
  });
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.y = 2.2;
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  root.add(wallMesh);

  // 3. Steep Snow-Capped Roof
  const roofColor = ROOF_COLORS[cabin.customization.roofStyle] || 0x334155;
  const roofMat = new THREE.MeshStandardMaterial({
    color: roofColor,
    roughness: 0.7,
    metalness: 0.1,
  });

  // Roof gable prism
  const roofGeo = new THREE.ConeGeometry(4.8, 2.6, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.y = 4.8;
  roofMesh.castShadow = true;
  root.add(roofMesh);

  // Heavy snow blanket atop roof
  const snowBlanketGeo = new THREE.ConeGeometry(4.9, 2.3, 4);
  snowBlanketGeo.rotateY(Math.PI / 4);
  const snowMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.95,
    metalness: 0.05,
  });
  const snowRoof = new THREE.Mesh(snowBlanketGeo, snowMat);
  snowRoof.position.y = 5.0;
  root.add(snowRoof);

  // 4. Front Porch Deck & Timber Posts
  const deckGeo = new THREE.BoxGeometry(4.0, 0.2, 1.8);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x5c381e, roughness: 0.8 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 0.6, 3.4);
  root.add(deck);

  [-1.8, 1.8].forEach((px) => {
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.4, 8);
    const post = new THREE.Mesh(postGeo, deckMat);
    post.position.set(px, 1.8, 4.1);
    root.add(post);
  });

  // 5. Front Door & Festive Wreath
  const doorGeo = new THREE.BoxGeometry(1.2, 2.2, 0.1);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3f2212, roughness: 0.6 });
  const doorMesh = new THREE.Mesh(doorGeo, doorMat);
  doorMesh.position.set(0, 1.7, 2.82);
  root.add(doorMesh);

  // Door Wreath
  const wreathGeo = new THREE.TorusGeometry(0.3, 0.09, 8, 16);
  const wreathMat = new THREE.MeshStandardMaterial({
    color: 0x166534, // evergreen
    roughness: 0.8,
  });
  const wreathMesh = new THREE.Mesh(wreathGeo, wreathMat);
  wreathMesh.position.set(0, 2.0, 2.9);
  root.add(wreathMesh);

  // Small red ribbon bow on wreath
  const bowGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const bowMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
  const bow = new THREE.Mesh(bowGeo, bowMat);
  bow.position.set(0, 1.72, 2.95);
  root.add(bow);

  // 6. Windows & Warm Interior Glow
  const windowMeshes: THREE.Mesh[] = [];
  const windowLights: THREE.PointLight[] = [];

  const glowConfig = GLOW_COLORS[cabin.customization.windowGlow] || GLOW_COLORS['amber'];
  const winMat = new THREE.MeshStandardMaterial({
    color: glowConfig.color,
    emissive: cabin.discovered ? glowConfig.emissive : 0x1e293b,
    emissiveIntensity: cabin.discovered ? 1.2 : 0.1,
    roughness: 0.2,
  });

  const winGeo = new THREE.PlaneGeometry(0.9, 1.1);

  // 4 windows: 2 front, 1 left, 1 right
  const winPositions = [
    { pos: [-1.8, 2.2, 2.82], rotY: 0 },
    { pos: [1.8, 2.2, 2.82], rotY: 0 },
    { pos: [-2.82, 2.2, 0], rotY: -Math.PI / 2 },
    { pos: [2.82, 2.2, 0], rotY: Math.PI / 2 },
  ];

  winPositions.forEach(({ pos, rotY }) => {
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(pos[0], pos[1], pos[2]);
    win.rotation.y = rotY;
    root.add(win);
    windowMeshes.push(win);
  });

  // Warm interior point light
  const winLight = new THREE.PointLight(glowConfig.light, cabin.discovered ? 2.5 : 0.2, 12);
  winLight.position.set(0, 2.2, 0);
  root.add(winLight);
  windowLights.push(winLight);

  // 7. Stone Chimney & Cozy Smoke
  const chimGeo = new THREE.BoxGeometry(0.9, 3.8, 0.9);
  const chimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const chimney = new THREE.Mesh(chimGeo, chimMat);
  chimney.position.set(1.6, 4.4, -1.2);
  root.add(chimney);

  // Chimney snow rim
  const chimRimGeo = new THREE.BoxGeometry(1.05, 0.18, 1.05);
  const chimRim = new THREE.Mesh(chimRimGeo, snowMat);
  chimRim.position.set(1.6, 6.35, -1.2);
  root.add(chimRim);

  // Chimney smoke particles
  const maxSmoke = 20;
  const smokePositions = new Float32Array(maxSmoke * 3);
  const smokeAges = new Float32Array(maxSmoke);
  for (let i = 0; i < maxSmoke; i++) {
    smokePositions[i * 3] = 1.6;
    smokePositions[i * 3 + 1] = 6.4;
    smokePositions[i * 3 + 2] = -1.2;
    smokeAges[i] = (i / maxSmoke) * 2.5;
  }
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0xf1f5f9,
    size: 0.55,
    transparent: true,
    opacity: cabin.discovered ? 0.45 : 0.05,
    depthWrite: false,
  });
  const chimneySmoke = new THREE.Points(smokeGeo, smokeMat);
  root.add(chimneySmoke);

  // 8. Festive Porch Garland (illuminates when discovered)
  const garlandGeo = new THREE.BoxGeometry(4.0, 0.12, 0.12);
  const garlandMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    emissive: cabin.discovered ? 0xf59e0b : 0x000000,
    emissiveIntensity: cabin.discovered ? 0.8 : 0,
    roughness: 0.4,
  });
  const porchGarland = new THREE.Mesh(garlandGeo, garlandMat);
  porchGarland.position.set(0, 2.9, 4.1);
  root.add(porchGarland);

  // 9. Soft Ground Shadow
  const shadowGeo = new THREE.CircleGeometry(4.8, 24);
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

  // Customization updater
  const updateCustomization = (custom: CabinCustomization) => {
    // Update wall
    const tint = WALL_TINTS[custom.wallColor] || '#854d0e';
    (wallMesh.material as THREE.MeshStandardMaterial).map = createWoodTexture(tint);
    (wallMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

    // Update roof
    const rColor = ROOF_COLORS[custom.roofStyle] || 0x334155;
    (roofMesh.material as THREE.MeshStandardMaterial).color.setHex(rColor);

    // Update window glow
    const gConf = GLOW_COLORS[custom.windowGlow] || GLOW_COLORS['amber'];
    windowMeshes.forEach((w) => {
      const mat = w.material as THREE.MeshStandardMaterial;
      mat.color.setHex(gConf.color);
      if (cabin.discovered) {
        mat.emissive.setHex(gConf.emissive);
      }
    });
    windowLights.forEach((l) => {
      l.color.setHex(gConf.light);
    });
  };

  const setDiscovered = (discovered: boolean) => {
    cabin.discovered = discovered;
    const gConf = GLOW_COLORS[cabin.customization.windowGlow] || GLOW_COLORS['amber'];
    windowMeshes.forEach((w) => {
      const mat = w.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(discovered ? gConf.emissive : 0x1e293b);
      mat.emissiveIntensity = discovered ? 1.2 : 0.1;
    });
    windowLights.forEach((l) => {
      l.intensity = discovered ? 2.5 : 0.2;
    });
    (chimneySmoke.material as THREE.PointsMaterial).opacity = discovered ? 0.45 : 0.05;
    (porlandMat: THREE.MeshStandardMaterial) => {
      porlandMat.emissive.setHex(discovered ? 0xf59e0b : 0x000000);
      porlandMat.emissiveIntensity = discovered ? 0.8 : 0;
    };
    (porchGarland.material as THREE.MeshStandardMaterial).emissive.setHex(discovered ? 0xf59e0b : 0x000000);
    (porchGarland.material as THREE.MeshStandardMaterial).emissiveIntensity = discovered ? 0.8 : 0;
  };

  return {
    cabin,
    root,
    wallMesh,
    roofMesh,
    doorMesh,
    wreathMesh,
    windowMeshes,
    windowLights,
    chimneySmoke,
    smokeData: { positions: smokePositions, ages: smokeAges },
    porchGarland,
    updateCustomization,
    setDiscovered,
  };
}
