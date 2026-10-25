/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Creates procedural textures via HTML5 2D Canvas
 * (Zero external assets / zero 404 dependencies)
 */

export function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base stone tone
  ctx.fillStyle = '#3a3a42';
  ctx.fillRect(0, 0, 512, 512);

  // Cobblestone stones
  const rows = 16;
  const cols = 16;
  const cellW = 512 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const rowOffset = (r % 2) * (cellW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const cx = c * cellW + rowOffset + (Math.sin(r * 3 + c * 2) * 4);
      const cy = r * cellH + (Math.cos(c * 2 + r * 4) * 4);
      const w = cellW * 0.85;
      const h = cellH * 0.85;

      // Stone color variation
      const shade = 70 + Math.floor(Math.sin(r * 5 + c * 7) * 20);
      ctx.fillStyle = `rgb(${shade + 10}, ${shade + 10}, ${shade + 15})`;
      
      // Draw rounded stone
      ctx.beginPath();
      ctx.roundRect(cx, cy, w, h, 6);
      ctx.fill();

      // Stone highlight
      ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Frost/snow in cracks
      ctx.strokeStyle = `rgba(220, 235, 255, 0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodTexture(tint = '#7a4f32'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 256, 256);

  // Wood grain horizontal planks
  const plankH = 32;
  for (let y = 0; y < 256; y += plankH) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    // Grain lines
    for (let g = 0; g < 4; g++) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 6 + g * 6);
      ctx.lineTo(256, y + 6 + g * 6);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSnowBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Micro sparkle noise
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 120 + Math.floor(Math.random() * 55);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f59e0b'; // amber
  ctx.fillRect(0, 0, 256, 64);

  // Black stripes
  ctx.fillStyle = '#1c1917';
  const stripeW = 24;
  for (let x = -64; x < 320; x += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeW, 0);
    ctx.lineTo(x + stripeW - 32, 64);
    ctx.lineTo(x - 32, 64);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
