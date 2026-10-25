/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SnowType = 'powder' | 'compacted' | 'wet' | 'ice';

export type WeatherEventType =
  | 'clear'
  | 'light_snow'
  | 'heavy_snow'
  | 'blizzard'
  | 'freezing_rain'
  | 'high_winds'
  | 'thaw_refreeze';

export interface WeatherCondition {
  type: WeatherEventType;
  name: string;
  intensity: number;      // 0.1 to 1.0
  temperature: number;    // Celsius, e.g. -12 to +2
  windSpeed: number;      // km/h, 5 to 65
  windAngle: number;      // radians (direction wind blows towards)
  snowfallRate: number;   // depth added per second in open areas
  visibility: number;     // 0.25 (blizzard) to 1.0 (clear)
  tractionMultiplier: number; // 0.35 (ice) to 1.0 (dry/cleared)
  duration: number;       // total seconds
  timeRemaining: number;  // seconds left in this weather phase
}

export interface WeatherForecastItem {
  type: WeatherEventType;
  name: string;
  expectedInSeconds: number;
  temperature: number;
  hazardWarning?: string;
}

export interface VehicleUpgrades {
  bladeLevel: number;       // 1: Standard (3.2m), 2: Heavy V-Blade (3.8m, +30% throw), 3: Thermal Heated (4.4m, de-ices)
  tyresLevel: number;       // 1: All-Weather, 2: Studded Diamond Chains (+60% ice traction)
  engineLevel: number;      // 1: Stock Turbo, 2: High-Torque V8 (-40% deep snow drag)
  saltSpreaderLevel: number;// 0: None, 1: Standard Rear Gritter, 2: Automated Wide-Arc Spreader
}

export interface CabinCustomization {
  wallColor: string;
  roofStyle: string;
  trimStyle: string;
  windowGlow: string;
}

export interface PlacedDecoration {
  instanceId: string;
  itemId: string;
  cabinId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
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
  unlockedDecoration: boolean;
  clearanceThreshold: number; // 0.70 (70% access cleared)
  accessRoadCells: number[];
  customization: CabinCustomization;
  placedDecorations: PlacedDecoration[];
  rewards: number;
}

export interface DecorCatalogItem {
  id: string;
  name: string;
  category: 'lighting' | 'furniture' | 'festive' | 'structure';
  cost: number;
  unlocked: boolean;
  description: string;
  placementType: 'ground' | 'porch' | 'roof';
  radius: number;
}

export interface WeatherContract {
  id: string;
  title: string;
  description: string;
  requiredWeather: WeatherEventType;
  targetCabinId?: string;
  targetRouteClearedPct: number;
  timeLimitSeconds: number;
  timeRemaining: number;
  rewardGems: number;
  completed: boolean;
  failed: boolean;
  active: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetType: 'clear_road' | 'discover_cabin' | 'total_snow' | 'decorate_town' | 'survive_blizzard';
  targetValue: number;
  currentValue: number;
  completed: boolean;
  rewardGems: number;
}

export interface VehiclePhysics {
  x: number;
  z: number;
  angle: number;           // yaw in radians
  speed: number;           // forward/backward speed
  steerAngle: number;
  bladeLowered: boolean;
  saltSpreaderActive: boolean;
  upgrades: VehicleUpgrades;
}

export const INITIAL_UPGRADES: VehicleUpgrades = {
  bladeLevel: 1,
  tyresLevel: 1,
  engineLevel: 1,
  saltSpreaderLevel: 0,
};

export const UPGRADE_PRICES = {
  bladeLevel: [0, 180, 420],
  tyresLevel: [0, 160, 380],
  engineLevel: [0, 200, 450],
  saltSpreaderLevel: [0, 150, 350],
};

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
    unlockedDecoration: false,
    clearanceThreshold: 0.65,
    accessRoadCells: [],
    customization: {
      wallColor: 'cedar',
      roofStyle: 'gingerbread',
      trimStyle: 'brass-wreath',
      windowGlow: 'amber',
    },
    placedDecorations: [],
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
    unlockedDecoration: false,
    clearanceThreshold: 0.70,
    accessRoadCells: [],
    customization: {
      wallColor: 'nordic-red',
      roofStyle: 'slate',
      trimStyle: 'carved-pine',
      windowGlow: 'hearth-gold',
    },
    placedDecorations: [],
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
    unlockedDecoration: false,
    clearanceThreshold: 0.65,
    accessRoadCells: [],
    customization: {
      wallColor: 'spruce',
      roofStyle: 'red-shingle',
      trimStyle: 'holly-arch',
      windowGlow: 'aurora-aqua',
    },
    placedDecorations: [],
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
    unlockedDecoration: false,
    clearanceThreshold: 0.75,
    accessRoadCells: [],
    customization: {
      wallColor: 'birch',
      roofStyle: 'ice-blue',
      trimStyle: 'carved-pine',
      windowGlow: 'aurora-aqua',
    },
    placedDecorations: [],
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
    unlockedDecoration: false,
    clearanceThreshold: 0.80,
    accessRoadCells: [],
    customization: {
      wallColor: 'nordic-red',
      roofStyle: 'gingerbread',
      trimStyle: 'brass-wreath',
      windowGlow: 'hearth-gold',
    },
    placedDecorations: [],
    rewards: 450,
  },
];

export const FULL_DECOR_CATALOG: DecorCatalogItem[] = [
  {
    id: 'decor-tree-grand',
    name: 'Grand Town Holiday Tree',
    category: 'festive',
    cost: 100,
    unlocked: true,
    description: 'A magnificent 6-meter fir tree decorated with gold baubles, twinkling lights, and a glowing star.',
    placementType: 'ground',
    radius: 2.5,
  },
  {
    id: 'decor-firepit',
    name: 'Cozy Stone Firepit',
    category: 'furniture',
    cost: 80,
    unlocked: true,
    description: 'Cracking cedar logs encircled by rustic river stones, radiating gentle warmth.',
    placementType: 'ground',
    radius: 1.5,
  },
  {
    id: 'decor-adirondack',
    name: 'Tartan Adirondack Chairs',
    category: 'furniture',
    cost: 50,
    unlocked: true,
    description: 'A pair of handcrafted timber chairs draped in cozy plaid wool blankets.',
    placementType: 'ground',
    radius: 1.2,
  },
  {
    id: 'decor-stringlights',
    name: 'Warm Fairy Garland',
    category: 'lighting',
    cost: 60,
    unlocked: true,
    description: 'Swags of glowing golden amber micro-lights strung along wooden posts.',
    placementType: 'ground',
    radius: 1.8,
  },
  {
    id: 'decor-lamp-vintage',
    name: 'Festive Victorian Lamppost',
    category: 'lighting',
    cost: 70,
    unlocked: true,
    description: 'Classic wrought-iron lamppost wrapped in pine garland and a red velvet ribbon.',
    placementType: 'ground',
    radius: 0.8,
  },
  {
    id: 'decor-snowman-family',
    name: 'Friendly Snowman Trio',
    category: 'festive',
    cost: 90,
    unlocked: true,
    description: 'Three joyful snowfolk with carrot noses, knit scarves, and charcoal smiles.',
    placementType: 'ground',
    radius: 1.4,
  },
  {
    id: 'decor-cocoa-cart',
    name: 'Steaming Hot Cocoa Chalet',
    category: 'structure',
    cost: 140,
    unlocked: false,
    description: 'A charming wooden cart serving hot chocolate with marshmallow toppings and cinnamon sticks.',
    placementType: 'ground',
    radius: 2.0,
  },
  {
    id: 'decor-reindeer-lights',
    name: 'Illuminated Crystal Reindeer',
    category: 'festive',
    cost: 180,
    unlocked: false,
    description: 'Sculpted crystalline reindeer that glow with serene icy brilliance.',
    placementType: 'ground',
    radius: 1.6,
  },
  {
    id: 'decor-ice-sculpture',
    name: 'Swan Ice Carving',
    category: 'festive',
    cost: 160,
    unlocked: false,
    description: 'Intricately carved translucent ice sculpture reflecting twilight hues.',
    placementType: 'ground',
    radius: 1.2,
  },
  {
    id: 'decor-hot-tub',
    name: 'Cedar Hot Tub Barrel',
    category: 'furniture',
    cost: 220,
    unlocked: false,
    description: 'Steaming outdoor cedar tub framed with cedar steps and evergreen boughs.',
    placementType: 'ground',
    radius: 2.2,
  },
];

export const INITIAL_WEATHER: WeatherCondition = {
  type: 'light_snow',
  name: 'Gentle Winter Snowfall',
  intensity: 0.4,
  temperature: -4.5,
  windSpeed: 14,
  windAngle: Math.PI / 4, // North-East
  snowfallRate: 0.0035,   // ~0.2m depth per minute
  visibility: 0.95,
  tractionMultiplier: 0.88,
  duration: 90,
  timeRemaining: 90,
};

export const INITIAL_WEATHER_FORECAST: WeatherForecastItem[] = [
  {
    type: 'heavy_snow',
    name: 'Heavy Mountain Blizzard Approaching',
    expectedInSeconds: 90,
    temperature: -8.0,
    hazardWarning: 'Expect rapid accumulation across northern passes and reduced visibility.',
  },
  {
    type: 'high_winds',
    name: 'Valley Gale Winds',
    expectedInSeconds: 220,
    temperature: -5.0,
    hazardWarning: 'Wind drifts will push snow back across exposed roads.',
  },
  {
    type: 'freezing_rain',
    name: 'Sub-Zero Freezing Rain & Black Ice',
    expectedInSeconds: 360,
    temperature: -1.0,
    hazardWarning: 'Glazed ice on roads and bridges. Salt spreaders strongly advised!',
  },
];

export interface DecorSlot {
  id: string;
  name: string;
  x: number;
  z: number;
  occupiedItemId: string | null;
  allowedCategories: Array<'lighting' | 'furniture' | 'festive' | 'structure'>;
}

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
    targetValue: 80,
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

export const INITIAL_CONTRACTS: WeatherContract[] = [
  {
    id: 'contract-blizzard-starlight',
    title: 'Emergency Medical Pass to Ski Lodge',
    description: 'Clear and maintain at least 70% of the northern Starlight Pass during active snowfall.',
    requiredWeather: 'heavy_snow',
    targetCabinId: 'cabin-starlight',
    targetRouteClearedPct: 70,
    timeLimitSeconds: 150,
    timeRemaining: 150,
    rewardGems: 320,
    completed: false,
    failed: false,
    active: true,
  },
  {
    id: 'contract-ice-peppermint',
    title: 'Peppermint Mill Bridge De-Icing',
    description: 'Use the salt spreader or thermal blade to clear black ice and deep snow along the river canal.',
    requiredWeather: 'freezing_rain',
    targetCabinId: 'cabin-peppermint',
    targetRouteClearedPct: 65,
    timeLimitSeconds: 180,
    timeRemaining: 180,
    rewardGems: 280,
    completed: false,
    failed: false,
    active: false,
  },
];

/**
 * Advanced Dynamic Snow Grid with Accumulation, Wind Drifts, and Snow Types
 */
export class SnowGrid {
  readonly size: number;
  readonly worldSize: number;
  readonly halfWorld: number;
  readonly cellSize: number;

  // Snow depth in meters (0.0 to 1.6m)
  depths: Float32Array;
  // Snow type: 0 = powder, 1 = compacted, 2 = wet, 3 = ice
  types: Uint8Array;
  // Black ice glaze 0.0 to 1.0 (freezing rain or refrozen thaw)
  iceGlaze: Float32Array;
  // Roadway mask (1 = road, 0 = open terrain)
  isRoad: Uint8Array;
  // Cabin road index
  cabinTag: Int8Array;
  // Wind shelter factor (0.0 = fully exposed, 1.0 = protected by building/trees)
  shelter: Float32Array;

  constructor(size = 64, worldSize = 120) {
    this.size = size;
    this.worldSize = worldSize;
    this.halfWorld = worldSize / 2;
    this.cellSize = worldSize / size;

    const total = size * size;
    this.depths = new Float32Array(total);
    this.types = new Uint8Array(total);
    this.iceGlaze = new Float32Array(total);
    this.isRoad = new Uint8Array(total);
    this.cabinTag = new Int8Array(total);
    this.shelter = new Float32Array(total);

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

  initializeDefaultMap(): void {
    // Initial moderate snowfall layer: 0.65m - 0.85m powder
    for (let i = 0; i < this.depths.length; i++) {
      this.depths[i] = 0.72 + (Math.sin(i * 0.1) * 0.12);
      this.types[i] = 0; // powder
      this.iceGlaze[i] = 0.0;
      this.isRoad[i] = 0;
      this.cabinTag[i] = -1;
      this.shelter[i] = 0.0;
    }

    // Carve main roads and cabin access routes
    this.markRoadSegment(0, 0, 0, -48, 2.6, 4); // North to Workshop
    this.markRoadSegment(0, 0, 0, 36, 2.6, -1); // South promenade
    this.markRoadSegment(0, 0, 28, -26, 2.6, 0); // East-north to Gingerbread
    this.markRoadSegment(0, 0, -32, -34, 2.6, 1); // West-north to Starlight
    this.markRoadSegment(0, 0, -36, 22, 2.6, 2); // West-south to Peppermint
    this.markRoadSegment(0, 0, 32, 30, 2.6, 3); // East-south to Aurora
    this.markRoadCircle(0, 0, 6.5, -1); // Town center plaza

    // Shelter zones around cabins
    INITIAL_CABINS.forEach((c) => {
      this.markShelterCircle(c.x, c.z, c.radius + 3.0, 0.75);
    });
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

  markShelterCircle(cx: number, cz: number, radius: number, shelterVal: number): void {
    const min = this.worldToGrid(cx - radius, cz - radius);
    const max = this.worldToGrid(cx + radius, cz + radius);
    for (let gz = min.gz; gz <= max.gz; gz++) {
      for (let gx = min.gx; gx <= max.gx; gx++) {
        const { x, z } = this.gridToWorld(gx, gz);
        if (Math.hypot(x - cx, z - cz) <= radius) {
          const idx = this.getIndex(gx, gz);
          this.shelter[idx] = Math.max(this.shelter[idx], shelterVal);
        }
      }
    }
  }

  /**
   * Continuous Dynamic Snow Accumulation & Wind Drift Simulation Step
   */
  simulateWeatherStep(weather: WeatherCondition, dt: number): void {
    const fallRate = weather.snowfallRate * dt;
    const isFreezingRain = weather.type === 'freezing_rain';
    const isHighWind = weather.windSpeed > 30;
    const isThaw = weather.temperature > 0;
    const isRefreeze = weather.temperature < 0 && weather.type === 'thaw_refreeze';

    // Wind drift offsets
    const windDx = Math.cos(weather.windAngle);
    const windDz = Math.sin(weather.windAngle);

    for (let gz = 0; gz < this.size; gz++) {
      for (let gx = 0; gx < this.size; gx++) {
        const idx = this.getIndex(gx, gz);
        const shelterVal = this.shelter[idx];

        // 1. Snowfall accumulation (reduced in sheltered lee sides)
        if (fallRate > 0) {
          const added = fallRate * (1.0 - shelterVal * 0.4);
          this.depths[idx] = Math.min(1.6, this.depths[idx] + added);

          // Type updates based on temperature
          if (weather.temperature < -6) {
            this.types[idx] = 0; // dry powder
          } else if (weather.temperature <= 0) {
            this.types[idx] = 0; // regular powder
          } else {
            this.types[idx] = 2; // wet heavy snow
          }
        }

        // 2. Freezing rain deposits slick ice glaze
        if (isFreezingRain) {
          this.iceGlaze[idx] = Math.min(1.0, this.iceGlaze[idx] + 0.08 * dt);
          if (this.iceGlaze[idx] > 0.4) {
            this.types[idx] = 3; // ice
          }
        }

        // 3. Thaw & Refreeze
        if (isThaw) {
          // Melt top powder into wet snow
          if (this.depths[idx] > 0.05) {
            this.types[idx] = 2; // wet snow
            this.depths[idx] = Math.max(0, this.depths[idx] - 0.002 * dt);
          }
        } else if (isRefreeze) {
          // Wet snow freezes into dense crust / ice glaze
          if (this.types[idx] === 2) {
            this.types[idx] = 3; // ice crust
            this.iceGlaze[idx] = Math.min(1.0, this.iceGlaze[idx] + 0.05 * dt);
          }
        }

        // 4. Wind Drift: blows loose powder toward downwind obstacles and road edges
        if (isHighWind && this.types[idx] === 0 && this.depths[idx] > 0.2) {
          const targetGx = Math.max(0, Math.min(this.size - 1, gx + Math.round(windDx)));
          const targetGz = Math.max(0, Math.min(this.size - 1, gz + Math.round(windDz)));
          const targetIdx = this.getIndex(targetGx, targetGz);

          // If target is sheltered (e.g. against a building), snow deposits into a drift!
          if (this.shelter[targetIdx] > shelterVal || this.isRoad[targetIdx]) {
            const blowAmount = 0.004 * dt * (weather.windSpeed / 30);
            this.depths[idx] = Math.max(0.05, this.depths[idx] - blowAmount);
            this.depths[targetIdx] = Math.min(1.6, this.depths[targetIdx] + blowAmount * 1.2);
          }
        }
      }
    }
  }

  /**
   * Realistic Ploughing with Snowbank Displacement & Salt Treatment
   */
  ploughSnowAt(
    bladeX: number,
    bladeZ: number,
    bladeAngle: number,
    bladeWidth = 3.4,
    bladeUpgrades: VehicleUpgrades = INITIAL_UPGRADES,
    saltActive = false
  ): { displacedVolume: number; pointsEarned: number; newlyClearedCells: number } {
    let displacedVolume = 0;
    let pointsEarned = 0;
    let newlyClearedCells = 0;

    const width = bladeUpgrades.bladeLevel === 3 ? 4.4 : bladeUpgrades.bladeLevel === 2 ? 3.8 : bladeWidth;
    const halfW = width / 2;
    const samples = 9;

    const cosA = Math.cos(bladeAngle + Math.PI / 2);
    const sinA = Math.sin(bladeAngle + Math.PI / 2);

    // Left and right throw vectors for physical snowbanks
    const leftThrowX = bladeX + Math.cos(bladeAngle + Math.PI * 0.75) * (halfW + 1.2);
    const leftThrowZ = bladeZ + Math.sin(bladeAngle + Math.PI * 0.75) * (halfW + 1.2);
    const rightThrowX = bladeX + Math.cos(bladeAngle + Math.PI * 0.25) * (halfW + 1.2);
    const rightThrowZ = bladeZ + Math.sin(bladeAngle + Math.PI * 0.25) * (halfW + 1.2);

    for (let s = 0; s < samples; s++) {
      const offset = -halfW + (s / (samples - 1)) * (halfW * 2);
      const px = bladeX + cosA * offset;
      const pz = bladeZ + sinA * offset;

      const { gx, gz } = this.worldToGrid(px, pz);
      const idx = this.getIndex(gx, gz);

      const oldDepth = this.depths[idx];
      if (oldDepth > 0.03 || this.iceGlaze[idx] > 0.05) {
        // Clearing power: Heated blade melts ice instantly
        const isThermal = bladeUpgrades.bladeLevel === 3;
        const removeRatio = isThermal ? 0.75 : 0.55;
        const removed = Math.min(oldDepth, removeRatio);

        this.depths[idx] = Math.max(0, oldDepth - removed);

        // De-ice
        if (isThermal || saltActive) {
          this.iceGlaze[idx] = 0;
          if (this.types[idx] === 3) this.types[idx] = 0; // thawed
        }

        displacedVolume += removed;

        // Displace snow into roadside snowbanks (not vanishing!)
        const targetSide = s < samples / 2 ? { x: leftThrowX, z: leftThrowZ } : { x: rightThrowX, z: rightThrowZ };
        const sideGrid = this.worldToGrid(targetSide.x, targetSide.z);
        const sideIdx = this.getIndex(sideGrid.gx, sideGrid.gz);
        // Add 65% of displaced snow to side berm
        this.depths[sideIdx] = Math.min(1.5, this.depths[sideIdx] + removed * 0.65);
        this.types[sideIdx] = 1; // compacted berm

        const roadMult = this.isRoad[idx] ? 2.8 : 1.0;
        pointsEarned += Math.round(removed * 12 * roadMult);

        if (oldDepth > 0.25 && this.depths[idx] <= 0.25) {
          newlyClearedCells++;
        }
      }
    }

    return { displacedVolume, pointsEarned, newlyClearedCells };
  }

  /**
   * Salt spreading logic behind vehicle
   */
  applySaltSpread(rearX: number, rearZ: number, radius = 3.5): void {
    const min = this.worldToGrid(rearX - radius, rearZ - radius);
    const max = this.worldToGrid(rearX + radius, rearZ + radius);

    for (let gz = min.gz; gz <= max.gz; gz++) {
      for (let gx = min.gx; gx <= max.gx; gx++) {
        const { x, z } = this.gridToWorld(gx, gz);
        if (Math.hypot(x - rearX, z - rearZ) <= radius) {
          const idx = this.getIndex(gx, gz);
          this.iceGlaze[idx] = Math.max(0, this.iceGlaze[idx] - 0.4);
          if (this.depths[idx] > 0.05) {
            this.depths[idx] = Math.max(0, this.depths[idx] - 0.04);
          }
        }
      }
    }
  }

  /**
   * Tyre track compaction (wheels compact untouched powder into tracks)
   */
  compactTyreTracks(wx: number, wz: number, radius = 0.5): void {
    const { gx, gz } = this.worldToGrid(wx, wz);
    const idx = this.getIndex(gx, gz);
    if (this.depths[idx] > 0.1 && this.types[idx] === 0) {
      this.types[idx] = 1; // compacted
      this.depths[idx] = Math.max(0.04, this.depths[idx] * 0.65); // compressed down
    }
  }

  getClearanceStats(): {
    totalRoadCells: number;
    clearedRoadCells: number;
    roadClearancePct: number;
    totalClearedPct: number;
    cabinRoadStats: number[];
  } {
    let totalRoad = 0;
    let clearedRoad = 0;
    const totalAll = this.depths.length;
    let clearedAll = 0;

    const cabinTotals = [0, 0, 0, 0, 0];
    const cabinCleared = [0, 0, 0, 0, 0];

    for (let i = 0; i < totalAll; i++) {
      const d = this.depths[i];
      const isCleared = d <= 0.24 && this.iceGlaze[i] < 0.3;

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

  getSnowInfoAt(wx: number, wz: number): { depth: number; type: SnowType; ice: number } {
    const { gx, gz } = this.worldToGrid(wx, wz);
    const idx = this.getIndex(gx, gz);
    const typeNum = this.types[idx];
    const typeStr: SnowType =
      typeNum === 3 ? 'ice' : typeNum === 2 ? 'wet' : typeNum === 1 ? 'compacted' : 'powder';

    return {
      depth: this.depths[idx],
      type: typeStr,
      ice: this.iceGlaze[idx],
    };
  }

  /**
   * Save / Load serialization (compact run-length or float array)
   */
  serialize(): { depths: number[]; types: number[]; ice: number[] } {
    return {
      depths: Array.from(this.depths).map((d) => Math.round(d * 100)),
      types: Array.from(this.types),
      ice: Array.from(this.iceGlaze).map((i) => Math.round(i * 100)),
    };
  }

  deserialize(data: { depths: number[]; types: number[]; ice: number[] }): void {
    if (!data.depths || data.depths.length !== this.depths.length) return;
    for (let i = 0; i < this.depths.length; i++) {
      this.depths[i] = data.depths[i] / 100;
      this.types[i] = data.types[i];
      this.iceGlaze[i] = data.ice[i] / 100;
    }
  }
}

/**
 * Advanced Vehicle Physics with Traction, Drag, and Upgrades
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
  snowInfo: { depth: number; type: SnowType; ice: number },
  weatherTraction: number,
  dt: number,
  bounds = 54
): VehiclePhysics {
  const next = { ...vehicle };

  // Calculate surface traction coefficient
  let baseTraction = 1.0;
  if (snowInfo.type === 'ice' || snowInfo.ice > 0.3) {
    baseTraction = 0.32; // slippery ice!
  } else if (snowInfo.type === 'wet') {
    baseTraction = 0.72; // slushy
  } else if (snowInfo.type === 'compacted') {
    baseTraction = 0.88; // firm
  } else {
    baseTraction = 0.94; // fresh powder
  }

  // Tyre chains upgrade (+60% grip on ice/wet)
  if (vehicle.upgrades.tyresLevel >= 2) {
    baseTraction = Math.min(1.0, baseTraction * 1.55);
  }

  const effectiveTraction = baseTraction * weatherTraction;

  // Steering: on ice, vehicle understeers if turning sharply at speed!
  const maxSteer = 0.58;
  const steerRate = 2.8 * effectiveTraction;
  if (inputs.left) {
    next.steerAngle = Math.max(-maxSteer, next.steerAngle - steerRate * dt);
  } else if (inputs.right) {
    next.steerAngle = Math.min(maxSteer, next.steerAngle + steerRate * dt);
  } else {
    const decay = 4.5 * dt;
    if (Math.abs(next.steerAngle) <= decay) next.steerAngle = 0;
    else next.steerAngle -= Math.sign(next.steerAngle) * decay;
  }

  // Snow resistance / drag
  // Engine upgrade cuts deep snow drag by 40%
  const engineMod = vehicle.upgrades.engineLevel >= 2 ? 0.6 : 1.0;
  const bladeDrag = next.bladeLowered ? 1.0 + (snowInfo.depth * 1.5 * engineMod) : 1.0;
  const surfaceDrag = 1.0 + (snowInfo.depth * 0.7 * engineMod);
  const totalDrag = bladeDrag * surfaceDrag;

  const maxFwdSpeed = (inputs.boost ? 14 : 9.5) / Math.sqrt(totalDrag);
  const maxRevSpeed = -4.5 / Math.sqrt(totalDrag);
  const accelRate = 7.5 * effectiveTraction;
  const brakeRate = 14.0 * effectiveTraction;
  const naturalDecel = 3.2 * totalDrag;

  if (inputs.forward) {
    next.speed = Math.min(maxFwdSpeed, next.speed + accelRate * dt);
  } else if (inputs.backward) {
    next.speed = Math.max(maxRevSpeed, next.speed - accelRate * dt);
  } else if (inputs.brake) {
    if (Math.abs(next.speed) <= brakeRate * dt) next.speed = 0;
    else next.speed -= Math.sign(next.speed) * brakeRate * dt;
  } else {
    if (Math.abs(next.speed) <= naturalDecel * dt) next.speed = 0;
    else next.speed -= Math.sign(next.speed) * naturalDecel * dt;
  }

  // Yaw angular turn rate
  const wheelBase = 2.8;
  const angularVelocity = (next.speed / wheelBase) * Math.sin(next.steerAngle);
  next.angle += angularVelocity * dt;

  // Position displacement
  next.x += Math.sin(next.angle) * next.speed * dt;
  next.z += Math.cos(next.angle) * next.speed * dt;

  // Arena bounds clamp
  next.x = Math.max(-bounds, Math.min(bounds, next.x));
  next.z = Math.max(-bounds, Math.min(bounds, next.z));

  return next;
}

/**
 * Dynamic Weather Event Manager Step
 */
export function advanceWeatherSystem(
  current: WeatherCondition,
  forecast: WeatherForecastItem[],
  dt: number
): { weather: WeatherCondition; forecast: WeatherForecastItem[]; eventChanged: boolean } {
  const nextWeather = { ...current };
  let nextForecast = [...forecast];
  let eventChanged = false;

  nextWeather.timeRemaining -= dt;

  // Advance forecast ETAs
  nextForecast = nextForecast.map((item) => ({
    ...item,
    expectedInSeconds: Math.max(0, item.expectedInSeconds - dt),
  }));

  // When current weather expires, transition to the next forecast event
  if (nextWeather.timeRemaining <= 0 && nextForecast.length > 0) {
    const nextEvent = nextForecast.shift()!;
    eventChanged = true;

    // Define next weather properties
    const duration = 120 + Math.random() * 60;
    let snowfallRate = 0.003;
    let visibility = 0.95;
    let tractionMult = 0.9;
    let windSpd = 15;

    switch (nextEvent.type) {
      case 'blizzard':
        snowfallRate = 0.012; // heavy accumulation!
        visibility = 0.35;
        tractionMult = 0.65;
        windSpd = 55;
        break;
      case 'heavy_snow':
        snowfallRate = 0.008;
        visibility = 0.65;
        tractionMult = 0.75;
        windSpd = 30;
        break;
      case 'freezing_rain':
        snowfallRate = 0.001;
        visibility = 0.85;
        tractionMult = 0.35; // black ice!
        windSpd = 20;
        break;
      case 'high_winds':
        snowfallRate = 0.002;
        visibility = 0.7;
        tractionMult = 0.8;
        windSpd = 50;
        break;
      case 'thaw_refreeze':
        snowfallRate = 0;
        visibility = 0.9;
        tractionMult = 0.45;
        windSpd = 18;
        break;
      default:
        snowfallRate = 0.002;
        visibility = 1.0;
        tractionMult = 0.95;
        windSpd = 12;
        break;
    }

    nextWeather.type = nextEvent.type;
    nextWeather.name = nextEvent.name;
    nextWeather.temperature = nextEvent.temperature;
    nextWeather.snowfallRate = snowfallRate;
    nextWeather.visibility = visibility;
    nextWeather.tractionMultiplier = tractionMult;
    nextWeather.windSpeed = windSpd;
    nextWeather.windAngle = Math.random() * Math.PI * 2;
    nextWeather.duration = duration;
    nextWeather.timeRemaining = duration;

    // Generate upcoming replacement event for the forecast queue
    const futureTypes: WeatherEventType[] = ['blizzard', 'heavy_snow', 'freezing_rain', 'high_winds', 'clear'];
    const chosenType = futureTypes[Math.floor(Math.random() * futureTypes.length)];
    const lastExpected = nextForecast.length > 0 ? nextForecast[nextForecast.length - 1].expectedInSeconds : 0;

    nextForecast.push({
      type: chosenType,
      name:
        chosenType === 'blizzard'
          ? 'Blizzard Warning'
          : chosenType === 'freezing_rain'
          ? 'Freezing Rain Alert'
          : chosenType === 'heavy_snow'
          ? 'Heavy Snowfront'
          : 'Clear Winter Horizon',
      expectedInSeconds: lastExpected + 150 + Math.random() * 60,
      temperature: chosenType === 'blizzard' ? -10 : chosenType === 'freezing_rain' ? -1.5 : -5,
      hazardWarning:
        chosenType === 'blizzard'
          ? 'High blizzard drifts expected. Keep cabins connected.'
          : chosenType === 'freezing_rain'
          ? 'Dangerous black ice slick on roads.'
          : undefined,
    });
  }

  return { weather: nextWeather, forecast: nextForecast, eventChanged };
}
