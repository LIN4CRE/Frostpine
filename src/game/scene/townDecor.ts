/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export function createDecorMesh(itemId: string): THREE.Group {
  const group = new THREE.Group();

  switch (itemId) {
    case 'decor-tree-grand': {
      // Grand Holiday Tree
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.8, 8), trunkMat);
      trunk.position.y = 0.9;
      group.add(trunk);

      // Layered pine cones
      const pineMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

      const tiers = [
        { r: 2.4, h: 2.2, y: 2.2 },
        { r: 1.8, h: 1.8, y: 3.6 },
        { r: 1.2, h: 1.5, y: 4.8 },
      ];

      tiers.forEach(({ r, h, y }) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), pineMat);
        cone.position.y = y;
        group.add(cone);

        const snow = new THREE.Mesh(new THREE.ConeGeometry(r * 1.02, h * 0.4, 8), snowMat);
        snow.position.y = y + h * 0.35;
        group.add(snow);
      });

      // Golden Star at top
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfbbf24,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      });
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), starMat);
      star.position.y = 5.9;
      group.add(star);

      // Festive light
      const treeLight = new THREE.PointLight(0xfbbf24, 2.0, 10);
      treeLight.position.set(0, 4.0, 0);
      group.add(treeLight);

      // Ornaments
      const ornColors = [0xef4444, 0x3b82f6, 0xeab308, 0xa855f7];
      for (let i = 0; i < 18; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: ornColors[i % ornColors.length],
          metalness: 0.8,
          roughness: 0.2,
        });
        const orn = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat);
        const theta = (i / 18) * Math.PI * 6;
        const radius = 1.8 - (i / 18) * 1.1;
        const py = 2.0 + (i / 18) * 3.2;
        orn.position.set(Math.cos(theta) * radius, py, Math.sin(theta) * radius);
        group.add(orn);
      }
      break;
    }

    case 'decor-firepit': {
      // Stone Firepit
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
      for (let i = 0; i < 10; i++) {
        const rad = (i / 10) * Math.PI * 2;
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), stoneMat);
        stone.position.set(Math.cos(rad) * 1.0, 0.2, Math.sin(rad) * 1.0);
        group.add(stone);
      }

      // Glowing Ember Coals
      const emberMat = new THREE.MeshStandardMaterial({
        color: 0x7c2d12,
        emissive: 0xf97316,
        emissiveIntensity: 2.2,
      });
      const embers = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 8), emberMat);
      embers.position.y = 0.15;
      group.add(embers);

      // Fire light
      const fireLight = new THREE.PointLight(0xf97316, 2.2, 8);
      fireLight.position.set(0, 0.6, 0);
      group.add(fireLight);

      // Logs
      const logMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
      for (let l = 0; l < 3; l++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6), logMat);
        log.rotation.z = Math.PI / 3;
        log.rotation.y = (l / 3) * Math.PI;
        log.position.y = 0.3;
        group.add(log);
      }
      break;
    }

    case 'decor-adirondack': {
      // Pair of Wooden Chairs
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
      const blanketMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 });

      [-0.7, 0.7].forEach((cx, idx) => {
        const chair = new THREE.Group();
        chair.position.set(cx, 0, 0);
        chair.rotation.y = idx === 0 ? 0.3 : -0.3;

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.7), chairMat);
        seat.position.set(0, 0.35, 0);
        chair.add(seat);

        // Angled Back
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.06), chairMat);
        back.position.set(0, 0.7, -0.3);
        back.rotation.x = -0.2;
        chair.add(back);

        // Plaid Blanket
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.08), blanketMat);
        blanket.position.set(0, 0.68, -0.28);
        blanket.rotation.x = -0.2;
        chair.add(blanket);

        // Legs
        [-0.3, 0.3].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), chairMat);
          leg.position.set(lx, 0.17, 0.25);
          chair.add(leg);
        });

        group.add(chair);
      });
      break;
    }

    case 'decor-stringlights': {
      // Fairy Garland Posts
      const postMat = new THREE.MeshStandardMaterial({ color: 0x5c381e, roughness: 0.8 });
      const lightMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 2.0,
      });

      [-1.4, 1.4].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), postMat);
        post.position.set(px, 1.1, 0);
        group.add(post);
      });

      // Garland catenary curve
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const x = -1.4 + t * 2.8;
        const sag = Math.sin(t * Math.PI) * 0.45;
        const y = 2.1 - sag;

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lightMat);
        bulb.position.set(x, y, 0);
        group.add(bulb);
      }

      const garlandLight = new THREE.PointLight(0xf59e0b, 1.4, 6);
      garlandLight.position.set(0, 1.8, 0);
      group.add(garlandLight);
      break;
    }

    case 'decor-lamp-vintage': {
      // Victorian Lamppost
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.6 });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 3.2, 8), ironMat);
      post.position.y = 1.6;
      group.add(post);

      // Lantern Glass
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xf59e0b,
        emissiveIntensity: 2.2,
      });
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.45, 6), glassMat);
      lantern.position.y = 3.35;
      group.add(lantern);

      // Lantern Cap
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 6), ironMat);
      cap.position.y = 3.65;
      group.add(cap);

      // Red bow
      const bowMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const bow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), bowMat);
      bow.position.set(0, 2.8, 0.15);
      group.add(bow);

      // Warm spot/point light
      const lampLight = new THREE.PointLight(0xf59e0b, 2.5, 9);
      lampLight.position.set(0, 3.3, 0);
      group.add(lampLight);
      break;
    }

    case 'decor-snowman-family': {
      // Snowman Trio
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.95 });
      const coalMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
      const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

      const trio = [
        { x: -0.7, scale: 0.9 },
        { x: 0.3, scale: 1.15 },
        { x: 1.1, scale: 0.65 },
      ];

      trio.forEach(({ x, scale }) => {
        const sm = new THREE.Group();
        sm.position.set(x, 0, 0);
        sm.scale.set(scale, scale, scale);

        // Body
        const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), snowMat);
        bottom.position.y = 0.6;
        sm.add(bottom);

        const mid = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), snowMat);
        mid.position.y = 1.4;
        sm.add(mid);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), snowMat);
        head.position.y = 2.05;
        sm.add(head);

        // Carrot nose
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 6), carrotMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.05, 0.4);
        sm.add(nose);

        // Scarf
        const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 8, 16), scarfMat);
        scarf.rotation.x = Math.PI / 2;
        scarf.position.y = 1.75;
        sm.add(scarf);

        // Top hat on middle snowman
        if (scale > 1.0) {
          const hatMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 12), hatMat);
          brim.position.y = 2.38;
          sm.add(brim);

          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 12), hatMat);
          crown.position.y = 2.6;
          sm.add(crown);
        }

        group.add(sm);
      });
      break;
    }

    case 'decor-cocoa-cart': {
      // Hot Cocoa Chalet Cart
      const cartMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
      const counter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.0), cartMat);
      counter.position.y = 0.45;
      group.add(counter);

      // Striped awning
      const awningMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const awning = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.4, 4), awningMat);
      awning.position.y = 2.1;
      awning.rotation.y = Math.PI / 4;
      group.add(awning);

      // Posts
      const postMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
      [-0.8, 0.8].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8), postMat);
        post.position.set(px, 1.45, 0.4);
        group.add(post);
      });

      // Warm Cocoa Mug
      const mugMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
      });
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 8), mugMat);
      mug.position.set(0, 1.0, 0);
      group.add(mug);
      break;
    }

    case 'decor-reindeer-lights': {
      // Illuminated Crystal Reindeer
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.2,
      });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.4), crystalMat);
      body.position.y = 1.2;
      group.add(body);

      // Neck & Head
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), crystalMat);
      neck.position.set(0, 1.7, 0.6);
      neck.rotation.x = -0.3;
      group.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.5), crystalMat);
      head.position.set(0, 2.05, 0.8);
      group.add(head);

      // Antlers
      [-0.15, 0.15].forEach((ax) => {
        const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.6, 6), crystalMat);
        antler.position.set(ax, 2.35, 0.7);
        antler.rotation.z = ax > 0 ? 0.35 : -0.35;
        group.add(antler);
      });

      // Legs
      [
        [-0.3, 0.6],
        [0.3, 0.6],
        [-0.3, -0.5],
        [0.3, -0.5],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), crystalMat);
        leg.position.set(lx, 0.5, lz);
        group.add(leg);
      });

      const deerLight = new THREE.PointLight(0x38bdf8, 2.0, 8);
      deerLight.position.set(0, 1.4, 0);
      group.add(deerLight);
      break;
    }

    case 'decor-ice-sculpture': {
      // Swan Ice Carving
      const iceMat = new THREE.MeshStandardMaterial({
        color: 0xcffafe,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.1,
      });

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.4, 12), iceMat);
      base.position.y = 0.2;
      group.add(base);

      const swanBody = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), iceMat);
      swanBody.scale.set(0.8, 0.6, 1.2);
      swanBody.position.set(0, 0.7, 0);
      group.add(swanBody);

      // Swan neck
      const neckGeo = new THREE.TorusGeometry(0.35, 0.09, 8, 16, Math.PI);
      const neck = new THREE.Mesh(neckGeo, iceMat);
      neck.position.set(0, 1.15, 0.5);
      neck.rotation.x = Math.PI / 2;
      group.add(neck);
      break;
    }

    case 'decor-hot-tub': {
      // Cedar Hot Tub Barrel
      const tubMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      const tub = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.0, 16, 1, true), tubMat);
      tub.position.y = 0.5;
      group.add(tub);

      // Steaming Water
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.4,
        roughness: 0.1,
      });
      const water = new THREE.Mesh(new THREE.CircleGeometry(1.35, 16), waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.85;
      group.add(water);

      // Wooden Steps
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.4), tubMat);
      step.position.set(0, 0.15, 1.5);
      group.add(step);
      break;
    }

    default:
      break;
  }

  return group;
}
