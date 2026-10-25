/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SnowGridConfig {
  gridSize: number;       // e.g. 64x64 cells
  worldSize: number;      // e.g. 128m x 128m
}

export interface CabinCustomization {
  wallColor: string;       // e.g. 'cedar' | 'birch' | 'nordic-red' | 'spruce'
  roofStyle: string;       // e.g. 'slate' | 'gingerbread' | 'red-shingle' | 'ice-blue'
  trimStyle: string;       // e.g. 'carved-pine' | 'brass-wreath' | 'holly-arch'
  windowGlow: string;      // e.g. 'amber' | 'hearth-gold' | 'aurora-aqua' | 'rose'
}

export interface Cabin {
  id: string;
  name: string;
  title: string;
  description: string;
  x: number;
  z: number;
  radius: number;
  discovered: boolean;
  clearanceThreshold: number; // percentage of access road cleared to rescue (e.g. 0.70)
  accessRoadCells: number[];  // cell indices of the road leading to this cabin
  customization: CabinCustomization;
  rewards: number;            // Frost Gems
}

export interface DecorItem {
  id: string;
  name: string;
  category: 'lighting' | 'furniture' | 'festive' | 'structure';
  cost: number;
  unlocked: boolean;
  description: string;
}

export interface DecorSlot {
  id: string;
  name: string;
  x: number;
  z: number;
  occupiedItemId: string | null;
  allowedCategories: Array<'lighting' | 'furniture' | 'festive' | 'structure'>;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetType: 'clear_road' | 'discover_cabin' | 'total_snow' | 'decorate_town';
  targetValue: number;
  currentValue: number;
  completed: boolean;
  rewardGems: number;
}

export interface VehiclePhysics {
  x: number;
  z: number;
  angle: number;           // yaw in radians
  speed: number;           // current forward/backward speed
  steerAngle: number;
  bladeLowered: boolean;
  saltSpreader: boolean;
}

export const INITIAL_CABINS: Cabin[] = [
  {
    id: 'cabin-gingerbread',
    name: 'Gingerbread Hearth',
    title: 'Warm Chalet by the Pines',
    description: 'An alpine wooden chalet nestled by the eastern pine grove with a stone chimney.',
    x: 28,
    z: -26,
    radius: 7,
    discovered: false,
    clearanceThreshold: 0.65,
    accessRoadCells: [],
    customization: {
      wallColor: 'cedar',
      roofStyle: 'gingerbread',
      trimStyle: 'brass-wreath',
      windowGlow: 'amber',
    },
    rewards: 150,
  },
  {
    id: 'cabin-starlight',
    name: 'Starlight Ski Lodge',
    title: 'A-Frame Mountain Retreat',
    description: 'A classic high-pitched A-frame lodge overlooking the northern hillside trails.',
    x: -32,
    z: -34,
    radius: 8,
    discovered: false,
    clearanceThreshold: 0.70,
    accessRoadCells: [],
    customization: {
      wallColor: 'nordic-red',
      roofStyle: 'slate',
      trimStyle: 'carved-pine',
      windowGlow: 'hearth-gold',
    },
    rewards: 200,
  },
  {
    id: 'cabin-peppermint',
    name: 'Peppermint Mill',
    title: 'Riverside Timber Haven',
    description: 'A charming waterside outpost beside the frozen mill pond and winter bridge.',
    x: -36,
    z: 22,
    radius: 7,
    discovered: false,
    clearanceThreshold: 0.65,
    accessRoadCells: [],
    customization: {
      wallColor: 'spruce',
      roofStyle: 'red-shingle',
      trimStyle: 'holly-arch',
      windowGlow: 'aurora-aqua',
    },
    rewards: 250,
  },
  {
    id: 'cabin-aurora',
    name: 'Aurora Observatory',
    title: 'Dome-Topped Stone Lodge',
    description: 'A cozy stone cottage with a panoramic glass cupola positioned for aurora viewing.',
    x: 32,
    z: 30,
    radius: 7,
    discovered: false,
    clearanceThreshold: 0.75,
    accessRoadCells: [],
    customization: {
      wallColor: 'birch',
      roofStyle: 'ice-blue',
      trimStyle: 'carved-pine',
      windowGlow: 'aurora-aqua',
    },
    rewards: 300,
  },
  {
    id: 'cabin-workshop',
    name: "Santa's Holiday Outpost",
    title: 'Grand Festive Workshop',
    description: 'The master holiday workshop adorned with festive carvings and a warm hearth.',
    x: 0,
    z: -48,
    radius: 9,
    discovered: false,
    clearanceThreshold: 0.80,
    accessRoadCells: [],
    customization: {
      wallColor: 'nordic-red',
      roofStyle: 'gingerbread',
      trimStyle: 'brass-wreath',
      windowGlow: 'hearth-gold',
    },
    rewards: 450,
  },
];

export const INITIAL_DECOR_CATALOG: DecorItem[] = [
  {
    id: 'decor-tree-grand',
    name: 'Grand Town Holiday Tree',
    category: 'festive',
    cost: 100,
    unlocked: true,
    description: 'A magnificent 6-meter fir tree decorated with gold baubles, twinkling lights, and a glowing star.',
  },
  {
    id: 'decor-firepit',
    name: 'Cozy Stone Firepit',
    category: 'furniture',
    cost: 80,
    unlocked: true,
    description: 'Cracking cedar logs encircled by rustic river stones, radiating gentle warmth.',
  },
  {
    id: 'decor-adirondack',
    name: 'Tartan Adirondack Chairs',
    category: 'furniture',
    cost: 50,
    unlocked: true,
    description: 'A pair of handcrafted timber chairs draped in cozy plaid wool blankets.',
  },
  {
    id: 'decor-stringlights',
    name: 'Warm Fairy Garland',
    category: 'lighting',
    cost: 60,
    unlocked: true,
    description: 'Swags of glowing golden amber micro-lights strung along wooden posts.',
  },
  {
    id: 'decor-lamp-vintage',
    name: 'Festive Victorian Lamppost',
    category: 'lighting',
    cost: 70,
    unlocked: true,
    description: 'Classic wrought-iron lamppost wrapped in pine garland and a red velvet ribbon.',
  },
  {
    id: 'decor-snowman-family',
    name: 'Friendly Snowman Trio',
    category: 'festive',
    cost: 90,
    unlocked: true,
    description: 'Three joyful snowfolk with carrot noses, knit scarves, and charcoal smiles.',
  },
  {
    id: 'decor-cocoa-cart',
    name: 'Steaming Hot Cocoa Chalet',
    category: 'structure',
    cost: 140,
    unlocked: false,
    description: 'A charming wooden cart serving hot chocolate with marshmallow toppings and cinnamon sticks.',
  },
  {
    id: 'decor-reindeer-lights',
    name: 'Illuminated Crystal Reindeer',
    category: 'festive',
    cost: 180,
    unlocked: false,
    description: 'Sculpted crystalline reindeer that glow with serene icy brilliance.',
  },
  {
    id: 'decor-ice-sculpture',
    name: 'Swan Ice Carving',
    category: 'festive',
    cost: 160,
    unlocked: false,
    description: 'Intricately carved translucent ice sculpture reflecting twilight hues.',
  },
  {
    id: 'decor-hot-tub',
    name: 'Cedar Hot Tub Barrel',
    category: 'furniture',
    cost: 220,
    unlocked: false,
    description: 'Steaming outdoor cedar tub framed with cedar steps and evergreen boughs.',
  },
];

export const INITIAL_DECOR_SLOTS: DecorSlot[] = [
  { id: 'slot-town-center', name: 'Town Square Plaza', x: 0, z: 0, occupiedItemId: null, allowedCategories: ['festive', 'lighting', 'structure'] },
  { id: 'slot-hearth-side', name: 'Gingerbread Meadow', x: 20, z: -20, occupiedItemId: null, allowedCategories: ['furniture', 'lighting', 'festive'] },
  { id: 'slot-starlight-deck', name: 'Starlight Overlook', x: -24, z: -26, occupiedItemId: null, allowedCategories: ['furniture', 'lighting'] },
  { id: 'slot-mill-terrace', name: 'Peppermint Mill Terrace', x: -26, z: 16, occupiedItemId: null, allowedCategories: ['lighting', 'furniture', 'structure'] },
  { id: 'slot-aurora-point', name: 'Aurora Stargazing Crest', x: 24, z: 22, occupiedItemId: null, allowedCategories: ['lighting', 'festive', 'furniture'] },
  { id: 'slot-workshop-gate', name: 'Workshop Welcome Arch', x: 0, z: -36, occupiedItemId: null, allowedCategories: ['festive', 'lighting', 'structure'] },
  { id: 'slot-village-park-1', name: 'Pine Grove Rest Area', x: 12, z: -10, occupiedItemId: null, allowedCategories: ['furniture', 'lighting'] },
  { id: 'slot-village-park-2', name: 'Winter Creek Promenade', x: -14, z: 8, occupiedItemId: null, allowedCategories: ['festive', 'lighting', 'furniture'] },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission-main-street',
    title: 'Clear Main Village Promenade',
    description: 'Lower your plough blade and clear the deep snow along the main town square.',
    targetType: 'clear_road',
    targetValue: 80, // 80% road cleared
    currentValue: 0,
    completed: false,
    rewardGems: 120,
  },
  {
    id: 'mission-rescue-gingerbread',
    title: 'Rescue Gingerbread Hearth',
    description: 'Plough the snowy eastern pass to reveal and awaken the Gingerbread Hearth chalet.',
    targetType: 'discover_cabin',
    targetValue: 1,
    currentValue: 0,
    completed: false,
    rewardGems: 150,
  },
  {
    id: 'mission-decorate-square',
    title: 'Festive Village Sparkle',
    description: 'Place at least 2 decorative items in the village to bring holiday warmth to Frostpine.',
    targetType: 'decorate_town',
    targetValue: 2,
    currentValue: 0,
    completed: false,
    rewardGems: 100,
  },
  {
    id: 'mission-rescue-all',
    title: 'Awaken All Five Hidden Cabins',
    description: 'Clear pathways to all 5 secluded cabins across the valley to unite the village.',
    targetType: 'discover_cabin',
    targetValue: 5,
    currentValue: 0,
    completed: false,
    rewardGems: 400,
  },
  {
    id: 'mission-master-plougher',
    title: 'Master of Deep Snow',
    description: 'Clear over 75% of all deep snow across the entire valley roadway network.',
    targetType: 'total_snow',
    targetValue: 75,
    currentValue: 0,
    completed: false,
    rewardGems: 500,
  },
];

/**
 * Snow Grid Logic
 */
export class SnowGrid {
  readonly size: number;
  readonly worldSize: number;
  readonly halfWorld: number;
  readonly cellSize: number;
  
  // Snow depth 0.0 (cleared) to 1.0 (deep blizzard drift)
  depths: Float32Array;
  // Is this cell marked as a roadway/pathway?
  isRoad: Uint8Array;
  // Which cabin index does this road segment lead to (-1 if main road)
  cabinTag: Int8Array;

  constructor(size = 64, worldSize = 120) {
    this.size = size;
    this.worldSize = worldSize;
    this.halfWorld = worldSize / 2;
    this.cellSize = worldSize / size;

    const total = size * size;
    this.depths = new Float32Array(total);
    this.isRoad = new Uint8Array(total);
    this.cabinTag = new Int8Array(total);

    this.initializeDefaultMap();
  }

  worldToGrid(x: number, z: number): { gx: number; gz: number } {
    const gx = Math.floor(((x + this.halfWorld) / this.worldSize) * this.size);
    const gz = Math.floor(((z + this.halfWorld) / this.worldSize) * this.size);
    return {
      gx: Math.max(0, Math.min(this.size - 1, gx)),
      gz: Math.max(0, Math.min(this.size - 1, gz)),
    };
  }

  gridToWorld(gx: number, gz: number): { x: number; z: number } {
    const x = ((gx + 0.5) / this.size) * this.worldSize - this.halfWorld;
    const z = ((gz + 0.5) / this.size) * this.worldSize - this.halfWorld;
    return { x, z };
  }

  getIndex(gx: number, gz: number): number {
    return gz * this.size + gx;
  }

  /**
   * Initializes cozy roadway corridors connecting the center to all cabins
   */
  initializeDefaultMap(): void {
    // Fill all with snow: 0.7 to 1.0
    for (let i = 0; i < this.depths.length; i++) {
      this.depths[i] = 0.85;
      this.isRoad[i] = 0;
      this.cabinTag[i] = -1;
    }

    // Carve road network paths:
    // Main cross roads
    this.markRoadSegment(0, 0, 0, -48, 2.5, 4); // North path to Workshop
    this.markRoadSegment(0, 0, 0, 36, 2.5, -1); // South promenade
    this.markRoadSegment(0, 0, 28, -26, 2.5, 0); // East-north path to Gingerbread
    this.markRoadSegment(0, 0, -32, -34, 2.5, 1); // West-north path to Starlight
    this.markRoadSegment(0, 0, -36, 22, 2.5, 2); // West-south path to Peppermint
    this.markRoadSegment(0, 0, 32, 30, 2.5, 3); // East-south path to Aurora
    this.markRoadSegment(0, 0, 0, 0, 6.0, -1); // Town square plaza circle
  }

  markRoadSegment(x1: number, z1: number, x2: number, z2: number, widthRadius: number, cabinIndex: number): void {
    const steps = Math.ceil(Math.hypot(x2 - x1, z2 - z1) * 2);
    for (let s = 0; s <= steps; s++) {
      const t = steps > 0 ? s / steps : 0;
      const wx = x1 + (x2 - x1) * t;
      const wz = z1 + (z2 - z1) * t;
      this.markRoadCircle(wx, wz, widthRadius, cabinIndex);
    }
  }

  markRoadCircle(cx: number, cz: number, radius: number, cabinIndex: number): void {
    const min = this.worldToGrid(cx - radius, cz - radius);
    const max = this.worldToGrid(cx + radius, cz + radius);

    for (let gz = min.gz; gz <= max.gz; gz++) {
      for (let gx = min.gx; gx <= max.gx; gx++) {
        const { x, z } = this.gridToWorld(gx, gz);
        if (Math.hypot(x - cx, z - cz) <= radius) {
          const idx = this.getIndex(gx, gz);
          this.isRoad[idx] = 1;
          if (cabinIndex >= 0) {
            this.cabinTag[idx] = cabinIndex;
          }
        }
      }
    }
  }

  /**
   * Clears snow in front of the plough blade.
   * Returns amount of snow displaced and points earned.
   */
  ploughSnowAt(
    bladeX: number,
    bladeZ: number,
    bladeAngle: number,
    bladeWidth = 3.6,
    clearDepth = 0.95
  ): { displacedVolume: number; pointsEarned: number; newlyClearedCells: number } {
    let displacedVolume = 0;
    let pointsEarned = 0;
    let newlyClearedCells = 0;

    // Sample along the blade edge
    const halfW = bladeWidth / 2;
    const samples = 7;
    const cosA = Math.cos(bladeAngle + Math.PI / 2);
    const sinA = Math.sin(bladeAngle + Math.PI / 2);

    for (let s = 0; s < samples; s++) {
      const offset = -halfW + (s / (samples - 1)) * (halfW * 2);
      const px = bladeX + cosA * offset;
      const pz = bladeZ + sinA * offset;

      const { gx, gz } = this.worldToGrid(px, pz);
      const idx = this.getIndex(gx, gz);

      const oldDepth = this.depths[idx];
      if (oldDepth > 0.05) {
        const removed = Math.min(oldDepth, clearDepth * 0.45);
        this.depths[idx] = Math.max(0, oldDepth - removed);
        displacedVolume += removed;

        // Points earned based on whether it is road and original depth
        const multiplier = this.isRoad[idx] ? 2.5 : 1.0;
        pointsEarned += Math.round(removed * 10 * multiplier);

        if (oldDepth > 0.3 && this.depths[idx] <= 0.3) {
          newlyClearedCells++;
        }
      }
    }

    return { displacedVolume, pointsEarned, newlyClearedCells };
  }

  /**
   * Calculates overall road clearance and specific cabin access clearance
   */
  getClearanceStats(): {
    totalRoadCells: number;
    clearedRoadCells: number;
    roadClearancePct: number;
    totalClearedPct: number;
    cabinRoadStats: number[]; // clearance pct per cabin index 0..4
  } {
    let totalRoad = 0;
    let clearedRoad = 0;
    let totalAll = this.depths.length;
    let clearedAll = 0;

    const cabinTotals = [0, 0, 0, 0, 0];
    const cabinCleared = [0, 0, 0, 0, 0];

    for (let i = 0; i < totalAll; i++) {
      const d = this.depths[i];
      const isCleared = d <= 0.28;

      if (isCleared) clearedAll++;

      if (this.isRoad[i]) {
        totalRoad++;
        if (isCleared) clearedRoad++;

        const cTag = this.cabinTag[i];
        if (cTag >= 0 && cTag < 5) {
          cabinTotals[cTag]++;
          if (isCleared) cabinCleared[cTag]++;
        }
      }
    }

    const roadClearancePct = totalRoad > 0 ? (clearedRoad / totalRoad) * 100 : 0;
    const totalClearedPct = totalAll > 0 ? (clearedAll / totalAll) * 100 : 0;

    const cabinRoadStats = cabinTotals.map((tot, idx) => {
      return tot > 0 ? (cabinCleared[idx] / tot) * 100 : 0;
    });

    return {
      totalRoadCells: totalRoad,
      clearedRoadCells: clearedRoad,
      roadClearancePct: Math.round(roadClearancePct),
      totalClearedPct: Math.round(totalClearedPct),
      cabinRoadStats: cabinRoadStats.map((v) => Math.round(v)),
    };
  }

  /**
   * Returns snow depth at a given world position
   */
  getSnowDepthAt(wx: number, wz: number): number {
    const { gx, gz } = this.worldToGrid(wx, wz);
    return this.depths[this.getIndex(gx, gz)];
  }
}

/**
 * Pure Kinematics & Physics Step for Snow Plough
 */
export function updatePloughKinematics(
  vehicle: VehiclePhysics,
  inputs: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    brake: boolean;
    boost: boolean;
  },
  snowDepth: number,
  dt: number,
  bounds = 54
): VehiclePhysics {
  const next = { ...vehicle };

  // Steering
  const maxSteer = 0.58; // radians
  const steerSpeed = 2.8;
  if (inputs.left) {
    next.steerAngle = Math.max(-maxSteer, next.steerAngle - steerSpeed * dt);
  } else if (inputs.right) {
    next.steerAngle = Math.min(maxSteer, next.steerAngle + steerSpeed * dt);
  } else {
    // Return to center
    const decay = 4.0 * dt;
    if (Math.abs(next.steerAngle) <= decay) next.steerAngle = 0;
    else next.steerAngle -= Math.sign(next.steerAngle) * decay;
  }

  // Deep snow resistance
  // If blade is lowered into deep snow, it resists more
  const bladeDrag = next.bladeLowered ? 1.0 + snowDepth * 1.6 : 1.0;
  const surfaceDrag = 1.0 + snowDepth * 0.8;
  const totalDrag = bladeDrag * surfaceDrag;

  const maxFwdSpeed = (inputs.boost ? 14 : 9.5) / Math.sqrt(totalDrag);
  const maxRevSpeed = -4.5 / Math.sqrt(totalDrag);
  const accelRate = 7.5;
  const brakeRate = 14.0;
  const naturalDecel = 3.5 * totalDrag;

  if (inputs.forward) {
    next.speed = Math.min(maxFwdSpeed, next.speed + accelRate * dt);
  } else if (inputs.backward) {
    next.speed = Math.max(maxRevSpeed, next.speed - accelRate * dt);
  } else if (inputs.brake) {
    if (Math.abs(next.speed) <= brakeRate * dt) next.speed = 0;
    else next.speed -= Math.sign(next.speed) * brakeRate * dt;
  } else {
    // Friction deceleration
    if (Math.abs(next.speed) <= naturalDecel * dt) next.speed = 0;
    else next.speed -= Math.sign(next.speed) * naturalDecel * dt;
  }

  // Turn rate depends on speed (cannot turn while standing still)
  const wheelBase = 2.8;
  const angularVelocity = (next.speed / wheelBase) * Math.sin(next.steerAngle);
  next.angle += angularVelocity * dt;

  // Move forward in current heading
  next.x += Math.sin(next.angle) * next.speed * dt;
  next.z += Math.cos(next.angle) * next.speed * dt;

  // Clamp within world arena bounds
  next.x = Math.max(-bounds, Math.min(bounds, next.x));
  next.z = Math.max(-bounds, Math.min(bounds, next.z));

  return next;
}
