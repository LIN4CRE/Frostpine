/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SnowGrid } from '../rules.ts';
import { createCobblestoneTexture, createSnowBumpTexture } from './textures.ts';

export type AtmospherePreset = 'twilight' | 'sunset' | 'aurora' | 'morning';

export interface EnvironmentScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  isSoftwareGl: boolean;
  afterDraw: (cb: () => void) => void;
  snowMesh: THREE.Mesh;
  fallingSnow: THREE.Points;
  snowParticlesData: { positions: Float32Array; velocities: Float32Array; count: number };
  dirLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  setAtmosphere: (preset: AtmospherePreset) => void;
  updateSnowMesh: (grid: SnowGrid) => void;
  updateFallingSnow: (dt: number, centerPos: THREE.Vector3) => void;
}

export function setupEnvironment(container: HTMLDivElement): EnvironmentScene {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // 1. Software WebGL Detection Guard
  const isSoftwareGl = (() => {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  })();

  // 2. Renderer Setup
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  let frameTimer = 0;
  const afterDraw = (cb: () => void) => {
    try {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl?.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl?.flush?.();
      const poll = () => {
        const state = sync && gl?.getSyncParameter?.(sync, gl.SYNC_STATUS);
        if (state === gl?.UNSIGNALED) {
          frameTimer = window.setTimeout(poll, 5);
        } else {
          if (sync) gl?.deleteSync?.(sync);
          frameTimer = window.setTimeout(cb, 60);
        }
      };
      frameTimer = window.setTimeout(poll, 5);
    } catch {
      frameTimer = window.setTimeout(cb, 60);
    }
  };

  // 3. Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
  camera.position.set(0, 16, 24);
  camera.lookAt(0, 0, 0);

  // 4. Room Environment Map
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  // 5. Lighting Rig (Warm Key + Cool Fill + Fog)
  const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
  dirLight.position.set(30, 45, 25);
  dirLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 120;
    const d = 55;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
  }
  scene.add(dirLight);

  const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.7);
  scene.add(hemiLight);

  // 6. Base Ground Plane (Roads & Cobblestone substrate)
  const groundGeo = new THREE.PlaneGeometry(120, 120, 1, 1);
  groundGeo.rotateX(-Math.PI / 2);
  const roadTex = createCobblestoneTexture();
  roadTex.repeat.set(18, 18);
  const groundMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.8,
    metalness: 0.1,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // 7. Dynamic 3D Deep Snow Layer (Heightfield Mesh)
  // Grid resolution 64x64 matches SnowGrid
  const gridRes = 64;
  const worldDim = 120;
  const snowGeo = new THREE.PlaneGeometry(worldDim, worldDim, gridRes - 1, gridRes - 1);
  snowGeo.rotateX(-Math.PI / 2);

  // Vertex colors to blend snow whiteness and alpha
  const vertCount = gridRes * gridRes;
  const colors = new Float32Array(vertCount * 3);
  for (let i = 0; i < vertCount * 3; i++) {
    colors[i] = 1.0;
  }
  snowGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const snowBumpTex = createSnowBumpTexture();
  snowBumpTex.repeat.set(24, 24);

  const snowMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.05,
    bumpMap: snowBumpTex,
    bumpScale: 0.03,
  });

  const snowMesh = new THREE.Mesh(snowGeo, snowMat);
  snowMesh.position.y = 0.02; // slightly above cobblestone
  snowMesh.receiveShadow = true;
  scene.add(snowMesh);

  // Function to update snow geometry vertices based on SnowGrid
  const updateSnowMesh = (grid: SnowGrid) => {
    const posAttr = snowGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = snowGeo.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    for (let gz = 0; gz < gridRes; gz++) {
      for (let gx = 0; gx < gridRes; gx++) {
        const vIdx = gz * gridRes + gx;
        const gridIdx = gz * gridRes + gx;
        const depth = grid.depths[gridIdx];
        const isRoad = grid.isRoad[gridIdx];

        // Deep snow has physical height up to 0.75m! Cleared path drops down flush with road
        const height = depth * 0.72;
        posArr[vIdx * 3 + 1] = height;

        // If road is cleared (depth < 0.25), darken snow vertex color to reveal cobblestone
        if (isRoad && depth < 0.28) {
          const t = depth / 0.28;
          colArr[vIdx * 3] = 0.45 + t * 0.55;
          colArr[vIdx * 3 + 1] = 0.45 + t * 0.55;
          colArr[vIdx * 3 + 2] = 0.5 + t * 0.5;
        } else {
          colArr[vIdx * 3] = 1.0;
          colArr[vIdx * 3 + 1] = 1.0;
          colArr[vIdx * 3 + 2] = 1.0;
        }
      }
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    snowGeo.computeVertexNormals();
  };

  // 8. Frozen Mill Pond (Reflective ice near Peppermint Mill at x: -36, z: 22)
  const iceGeo = new THREE.CircleGeometry(9, 32);
  iceGeo.rotateX(-Math.PI / 2);
  const iceMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.15,
    metalness: 0.4,
  });
  const iceMesh = new THREE.Mesh(iceGeo, iceMat);
  iceMesh.position.set(-36, 0.04, 22);
  scene.add(iceMesh);

  // 9. Perimeter Snowy Alpine Pine Groves (InstancedMesh)
  const treeCount = 95;
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 6);
  const foliageGeo = new THREE.ConeGeometry(1.9, 4.2, 6);
  foliageGeo.translate(0, 3.2, 0);

  // Merge simple tree geometry for instanced rendering
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x29180c, roughness: 0.9 });
  const treeSnowMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });

  const treeGroup = new THREE.Group();
  const treeFoliageMesh = new THREE.InstancedMesh(foliageGeo, treeSnowMat, treeCount);
  const treeTrunkMesh = new THREE.InstancedMesh(trunkGeo, treeTrunkMat, treeCount);
  treeFoliageMesh.castShadow = !isSoftwareGl;
  treeFoliageMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let placed = 0;

  // Place trees along perimeter bounds and hillsides
  for (let i = 0; i < treeCount; i++) {
    let tx = 0;
    let tz = 0;
    // Outer perimeter ring or mountain slope
    if (i < 65) {
      const angle = (i / 65) * Math.PI * 2;
      const dist = 48 + (Math.sin(i * 3.7) * 7);
      tx = Math.cos(angle) * dist;
      tz = Math.sin(angle) * dist;
    } else {
      // Natural clusters between cabin zones (not on roads)
      tx = (Math.sin(i * 5.1) * 38);
      tz = (Math.cos(i * 4.3) * 38);
      // Avoid center plaza
      if (Math.hypot(tx, tz) < 14) {
        tx += 18;
      }
    }

    const scale = 0.8 + Math.random() * 0.45;
    const rotY = Math.random() * Math.PI * 2;

    dummy.position.set(tx, 0, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.y = rotY;
    dummy.updateMatrix();

    treeFoliageMesh.setMatrixAt(placed, dummy.matrix);

    dummy.position.set(tx, 0.9 * scale, tz);
    dummy.updateMatrix();
    treeTrunkMesh.setMatrixAt(placed, dummy.matrix);

    placed++;
  }

  treeFoliageMesh.instanceMatrix.needsUpdate = true;
  treeTrunkMesh.instanceMatrix.needsUpdate = true;
  treeGroup.add(treeFoliageMesh);
  treeGroup.add(treeTrunkMesh);
  scene.add(treeGroup);

  // 10. Gentle Falling Snow Particle System
  const snowCount = 1400;
  const snowPositions = new Float32Array(snowCount * 3);
  const snowVelocities = new Float32Array(snowCount * 3);

  for (let i = 0; i < snowCount; i++) {
    snowPositions[i * 3] = (Math.random() - 0.5) * 80;
    snowPositions[i * 3 + 1] = Math.random() * 30;
    snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

    snowVelocities[i * 3] = (Math.random() - 0.5) * 0.8;    // gentle wind drift
    snowVelocities[i * 3 + 1] = -1.2 - Math.random() * 1.4; // fall speed
    snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }

  const snowPartGeo = new THREE.BufferGeometry();
  snowPartGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

  const snowPartMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.28,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  const fallingSnow = new THREE.Points(snowPartGeo, snowPartMat);
  scene.add(fallingSnow);

  const updateFallingSnow = (dt: number, centerPos: THREE.Vector3) => {
    const posAttr = snowPartGeo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < snowCount; i++) {
      arr[i * 3] += snowVelocities[i * 3] * dt;
      arr[i * 3 + 1] += snowVelocities[i * 3 + 1] * dt;
      arr[i * 3 + 2] += snowVelocities[i * 3 + 2] * dt;

      // Wrap around player position
      if (arr[i * 3 + 1] < 0.1) {
        arr[i * 3 + 1] = 28 + Math.random() * 4;
        arr[i * 3] = centerPos.x + (Math.random() - 0.5) * 70;
        arr[i * 3 + 2] = centerPos.z + (Math.random() - 0.5) * 70;
      }
    }
    posAttr.needsUpdate = true;
  };

  // 11. Atmosphere Presets
  const setAtmosphere = (preset: AtmospherePreset) => {
    switch (preset) {
      case 'twilight':
        scene.background = new THREE.Color(0x18182e);
        scene.fog = new THREE.FogExp2(0x1e1b4b, 0.016);
        dirLight.color.setHex(0xfef08a);
        dirLight.intensity = 1.4;
        dirLight.position.set(25, 30, 20);
        hemiLight.color.setHex(0x6366f1);
        hemiLight.groundColor.setHex(0x1e1b4b);
        hemiLight.intensity = 0.65;
        renderer.toneMappingExposure = 1.15;
        break;

      case 'sunset':
        scene.background = new THREE.Color(0x3b1836);
        scene.fog = new THREE.FogExp2(0x4a1d96, 0.014);
        dirLight.color.setHex(0xfb923c);
        dirLight.intensity = 1.9;
        dirLight.position.set(40, 18, 30);
        hemiLight.color.setHex(0xf472b6);
        hemiLight.groundColor.setHex(0x312e81);
        hemiLight.intensity = 0.7;
        renderer.toneMappingExposure = 1.25;
        break;

      case 'aurora':
        scene.background = new THREE.Color(0x0a192f);
        scene.fog = new THREE.FogExp2(0x064e3b, 0.018);
        dirLight.color.setHex(0x38bdf8);
        dirLight.intensity = 1.0;
        dirLight.position.set(10, 35, 15);
        hemiLight.color.setHex(0x10b981);
        hemiLight.groundColor.setHex(0x0f172a);
        hemiLight.intensity = 0.8;
        renderer.toneMappingExposure = 1.1;
        break;

      case 'morning':
        scene.background = new THREE.Color(0xcffafe);
        scene.fog = new THREE.FogExp2(0xbae6fd, 0.012);
        dirLight.color.setHex(0xffedd5);
        dirLight.intensity = 2.2;
        dirLight.position.set(35, 50, 35);
        hemiLight.color.setHex(0x7dd3fc);
        hemiLight.groundColor.setHex(0x334155);
        hemiLight.intensity = 0.85;
        renderer.toneMappingExposure = 1.2;
        break;
    }
  };

  // Set default atmosphere: Twilight
  setAtmosphere('twilight');

  return {
    scene,
    camera,
    renderer,
    isSoftwareGl,
    afterDraw,
    snowMesh,
    fallingSnow,
    snowParticlesData: { positions: snowPositions, velocities: snowVelocities, count: snowCount },
    dirLight,
    hemiLight,
    setAtmosphere,
    updateSnowMesh,
    updateFallingSnow,
  };
}
