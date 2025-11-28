// Hell EIC Game Logic

import type {
  GameState,
  Agent,
  District,
  Mission,
  MissionOpportunity,
  WorkerAssignment,
  MissionType,
  WorkerJob,
  AgentCondition,
  GamePhase,
  Resources,
  TileMap,
  Tile,
  TileType,
} from '../types/game';

import {
  PROFIT_TARGETS,
  XP_THRESHOLDS,
  MISSION_CONFIGS,
  JOB_CONFIGS,
  DISTRICT_NAMES,
  AGENT_FIRST_NAMES,
  AGENT_LAST_NAMES,
  MISSION_FLAVOR_TEXTS,
  TILEMAP_WIDTH,
  TILEMAP_HEIGHT,
} from '../types/game';

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ==================== SEEDED RANDOM NUMBER GENERATOR ====================

// Simple seeded PRNG (Mulberry32)
function createSeededRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ==================== PROCEDURAL TILEMAP GENERATION ====================

// Simple noise function for procedural generation
function noise2D(x: number, y: number, seed: number): number {
  const rand = createSeededRandom(seed + x * 374761393 + y * 668265263);
  return rand();
}

// Smoothed noise using bilinear interpolation
function smoothNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const sx = x - x0;
  const sy = y - y0;

  const n00 = noise2D(x0, y0, seed);
  const n10 = noise2D(x1, y0, seed);
  const n01 = noise2D(x0, y1, seed);
  const n11 = noise2D(x1, y1, seed);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;

  return nx0 * (1 - sy) + nx1 * sy;
}

// Multi-octave noise for terrain
function fractalNoise(x: number, y: number, seed: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency, seed + i * 1000) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

// Generate the River Styx path
function generateRiverPath(width: number, height: number, rand: () => number): boolean[][] {
  const river: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

  // River flows roughly from left to right with vertical meander
  let y = Math.floor(height * 0.4 + rand() * height * 0.2);
  const riverWidth = 2;

  for (let x = 0; x < width; x++) {
    // Meander the river
    const meander = Math.sin(x * 0.15) * 4 + Math.sin(x * 0.08 + 2) * 3;
    const targetY = Math.floor(height * 0.5 + meander);

    // Gradually move toward target
    if (y < targetY) y += rand() < 0.6 ? 1 : 0;
    else if (y > targetY) y -= rand() < 0.6 ? 1 : 0;

    // Mark river tiles
    for (let dy = -riverWidth; dy <= riverWidth; dy++) {
      const ny = clamp(y + dy, 0, height - 1);
      river[ny][x] = true;
    }
  }

  return river;
}

// Generate mountain ranges
function generateMountains(width: number, height: number, seed: number): boolean[][] {
  const mountains: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Mountains in corners and edges
      const edgeDistX = Math.min(x, width - 1 - x) / width;
      const edgeDistY = Math.min(y, height - 1 - y) / height;
      const edgeFactor = Math.min(edgeDistX, edgeDistY) * 4;

      const noiseVal = fractalNoise(x * 0.1, y * 0.1, seed + 5000, 3);

      // More mountains near edges
      if (noiseVal > 0.55 + edgeFactor * 0.3) {
        mountains[y][x] = true;
      }
    }
  }

  return mountains;
}

// Determine terrain type for a tile based on noise and position
function determineTileType(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  riverMap: boolean[][],
  mountainMap: boolean[][]
): TileType {
  // Check for river first
  if (riverMap[y][x]) {
    return 'river';
  }

  // Check for mountains
  if (mountainMap[y][x]) {
    return 'mountain';
  }

  // Edge of map is void
  if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
    return 'void';
  }

  // Use noise layers to determine terrain
  const terrainNoise = fractalNoise(x * 0.08, y * 0.08, seed, 4);
  const regionNoise = fractalNoise(x * 0.04, y * 0.04, seed + 1000, 2);
  const detailNoise = fractalNoise(x * 0.2, y * 0.2, seed + 2000, 2);

  // Determine region type based on noise
  if (regionNoise < 0.3) {
    // Volcanic region
    if (terrainNoise > 0.6) return 'volcanic';
    return 'wasteland';
  } else if (regionNoise < 0.5) {
    // Industrial region
    if (terrainNoise > 0.55) return 'industrial';
    return 'ground';
  } else if (regionNoise < 0.7) {
    // Urban region
    if (terrainNoise > 0.5) return 'urban';
    return 'ground';
  } else {
    // Wasteland/docks region
    // Near river = docks
    let nearRiver = false;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const ny = clamp(y + dy, 0, height - 1);
        const nx = clamp(x + dx, 0, width - 1);
        if (riverMap[ny][nx]) nearRiver = true;
      }
    }
    if (nearRiver && detailNoise > 0.4) return 'docks';
    return 'wasteland';
  }
}

// Place districts on the tilemap
function placeDistricts(
  tiles: Tile[][],
  width: number,
  height: number,
  districts: District[],
  rand: () => number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const occupiedPositions = new Set<string>();

  // Define placement zones for districts (spread around the map)
  const zones = [
    { minX: 0.4, maxX: 0.6, minY: 0.1, maxY: 0.25 },   // Top center
    { minX: 0.7, maxX: 0.85, minY: 0.2, maxY: 0.4 },   // Right upper
    { minX: 0.75, maxX: 0.9, minY: 0.55, maxY: 0.75 }, // Right lower
    { minX: 0.55, maxX: 0.75, minY: 0.7, maxY: 0.85 }, // Bottom right
    { minX: 0.25, maxX: 0.45, minY: 0.7, maxY: 0.85 }, // Bottom left
    { minX: 0.1, maxX: 0.25, minY: 0.55, maxY: 0.75 }, // Left lower
    { minX: 0.1, maxX: 0.3, minY: 0.2, maxY: 0.4 },    // Left upper
    { minX: 0.45, maxX: 0.6, minY: 0.45, maxY: 0.6 },  // Center
  ];

  districts.forEach((district, index) => {
    const zone = zones[index % zones.length];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      const x = Math.floor(zone.minX * width + rand() * (zone.maxX - zone.minX) * width);
      const y = Math.floor(zone.minY * height + rand() * (zone.maxY - zone.minY) * height);

      // Check if position is valid (not river, mountain, or void, and not too close to other districts)
      const tile = tiles[y]?.[x];
      const posKey = `${x},${y}`;

      if (tile &&
          tile.type !== 'river' &&
          tile.type !== 'mountain' &&
          tile.type !== 'void' &&
          !occupiedPositions.has(posKey)) {

        // Check distance from other districts (minimum 5 tiles)
        let tooClose = false;
        for (const pos of positions.values()) {
          const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
          if (dist < 5) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          positions.set(district.id, { x, y });
          occupiedPositions.add(posKey);

          // Mark the tile and surrounding area as the district's terrain type
          const template = DISTRICT_NAMES.find(d => d.name === district.name);
          const districtTerrain = template?.terrain || 'ground';

          // Set center tile
          tiles[y][x].districtId = district.id;
          tiles[y][x].type = districtTerrain as TileType;

          // Set surrounding tiles
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = clamp(y + dy, 0, height - 1);
              const nx = clamp(x + dx, 0, width - 1);
              if (tiles[ny][nx].type !== 'river' && tiles[ny][nx].type !== 'mountain') {
                tiles[ny][nx].type = districtTerrain as TileType;
              }
            }
          }

          placed = true;
        }
      }
      attempts++;
    }

    // Fallback position if placement failed
    if (!placed) {
      const fallbackX = Math.floor(width * 0.3 + index * 4);
      const fallbackY = Math.floor(height * 0.3 + (index % 3) * 4);
      positions.set(district.id, { x: fallbackX, y: fallbackY });
      tiles[fallbackY][fallbackX].districtId = district.id;
    }
  });

  return positions;
}

// Place the HQ on the tilemap
function placeHQ(
  tiles: Tile[][],
  width: number,
  height: number,
  districtPositions: Map<string, { x: number; y: number }>,
  rand: () => number
): { x: number; y: number } {
  // HQ should be near center, away from river
  const centerX = Math.floor(width * 0.45);
  const centerY = Math.floor(height * 0.45);

  for (let radius = 0; radius < 10; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) continue;

        const tile = tiles[y][x];
        if (tile.type !== 'river' && tile.type !== 'mountain' && tile.type !== 'void' && !tile.districtId) {
          tiles[y][x].isHQ = true;
          tiles[y][x].type = 'urban';
          return { x, y };
        }
      }
    }
  }

  // Fallback
  return { x: centerX, y: centerY };
}

// Generate roads between HQ and districts
function generateRoads(
  tiles: Tile[][],
  hqPos: { x: number; y: number },
  districtPositions: Map<string, { x: number; y: number }>
): void {
  for (const districtPos of districtPositions.values()) {
    // Simple line drawing for roads
    let x = hqPos.x;
    let y = hqPos.y;

    while (x !== districtPos.x || y !== districtPos.y) {
      // Move toward district
      if (x < districtPos.x) x++;
      else if (x > districtPos.x) x--;

      if (y < districtPos.y) y++;
      else if (y > districtPos.y) y--;

      // Don't overwrite special tiles
      const tile = tiles[y]?.[x];
      if (tile &&
          tile.type !== 'river' &&
          tile.type !== 'mountain' &&
          !tile.districtId &&
          !tile.isHQ) {
        tiles[y][x].type = 'road';
      }
    }
  }
}

// Main tilemap generation function
export function generateTilemap(districts: District[], seed?: number): TileMap {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000);
  const rand = createSeededRandom(actualSeed);

  const width = TILEMAP_WIDTH;
  const height = TILEMAP_HEIGHT;

  // Generate base terrain features
  const riverMap = generateRiverPath(width, height, rand);
  const mountainMap = generateMountains(width, height, actualSeed);

  // Create tiles array
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      const type = determineTileType(x, y, width, height, actualSeed, riverMap, mountainMap);
      const elevation = fractalNoise(x * 0.1, y * 0.1, actualSeed + 3000, 2);

      tiles[y][x] = {
        type,
        elevation,
        variant: Math.floor(rand() * 4),
      };
    }
  }

  // Place districts
  const districtPositions = placeDistricts(tiles, width, height, districts, rand);

  // Place HQ
  const hqPosition = placeHQ(tiles, width, height, districtPositions, rand);

  // Generate roads
  generateRoads(tiles, hqPosition, districtPositions);

  return {
    tiles,
    width,
    height,
    seed: actualSeed,
    districtPositions,
    hqPosition,
  };
}

// Create a new agent
export function createAgent(level: number = 1): Agent {
  return {
    id: generateId(),
    name: `${randomElement(AGENT_FIRST_NAMES)} ${randomElement(AGENT_LAST_NAMES)}`,
    level: clamp(level, 1, 5),
    xp: 0,
    condition: 'fresh',
    corruption: 0,
  };
}

// Create a new district
export function createDistrict(index: number): District {
  const template = DISTRICT_NAMES[index % DISTRICT_NAMES.length];
  return {
    id: generateId(),
    name: template.name,
    description: template.description,
    infernalAuthority: 5 + Math.floor(Math.random() * 4), // 5-8
    companyDominion: 0,
    notice: 0,
    revealed: false,
  };
}

// Generate a single mission opportunity
export function generateMissionOpportunity(
  districts: District[],
  existingOpportunities: MissionOpportunity[]
): MissionOpportunity | null {
  // Get available mission types
  const missionTypes: MissionType[] = [
    'extraction_run',
    'sabotage',
    'interdiction',
    'smuggling',
    'tribute_delivery',
  ];

  // Pick a random mission type with some weighting
  // More common: extraction, smuggling. Less common: sabotage
  const typeWeights: Record<MissionType, number> = {
    extraction_run: 3,
    smuggling: 3,
    interdiction: 2,
    tribute_delivery: 2,
    sabotage: 1,
  };

  const weightedTypes: MissionType[] = [];
  for (const type of missionTypes) {
    for (let i = 0; i < typeWeights[type]; i++) {
      weightedTypes.push(type);
    }
  }

  const type = randomElement(weightedTypes);

  // Pick a random district
  const district = randomElement(districts);

  // Check if there's already a mission of this type in this district
  const duplicate = existingOpportunities.find(
    (m) => m.type === type && m.districtId === district.id
  );
  if (duplicate) {
    return null; // Don't create duplicate opportunities
  }

  // Generate difficulty and reward modifiers
  // Higher authority districts tend to have harder but more rewarding missions
  const authorityFactor = (district.infernalAuthority - 5) / 5; // -1 to 0.6
  const difficultyBonus = Math.floor(Math.random() * 3) + Math.round(authorityFactor);
  const rewardBonus = 0.8 + Math.random() * 0.7 + authorityFactor * 0.2; // 0.8 to 1.5+

  // Generate expiry (2-5 weeks)
  const weeksUntilExpiry = 2 + Math.floor(Math.random() * 4);

  // Pick flavor text
  const flavorTexts = MISSION_FLAVOR_TEXTS[type];
  const flavorText = randomElement(flavorTexts);

  return {
    id: generateId(),
    type,
    districtId: district.id,
    weeksUntilExpiry,
    difficultyBonus: clamp(difficultyBonus, -2, 3),
    rewardBonus: Math.round(rewardBonus * 100) / 100, // Round to 2 decimals
    flavorText,
  };
}

// Generate multiple mission opportunities for start of game or new week
export function generateMissionOpportunities(
  state: GameState,
  count: number
): MissionOpportunity[] {
  const newOpportunities: MissionOpportunity[] = [...state.availableMissions];
  let attempts = 0;
  const maxAttempts = count * 3; // Prevent infinite loops

  while (newOpportunities.length < state.availableMissions.length + count && attempts < maxAttempts) {
    const opportunity = generateMissionOpportunity(state.districts, newOpportunities);
    if (opportunity) {
      newOpportunities.push(opportunity);
    }
    attempts++;
  }

  return newOpportunities.slice(state.availableMissions.length);
}

// Expire missions and decrement timers
export function processOpportunityExpiry(state: GameState): GameState {
  const updatedOpportunities = state.availableMissions
    .map((m) => ({
      ...m,
      weeksUntilExpiry: m.weeksUntilExpiry - 1,
    }))
    .filter((m) => m.weeksUntilExpiry > 0);

  const expiredCount = state.availableMissions.length - updatedOpportunities.length;

  let newState = { ...state, availableMissions: updatedOpportunities };

  if (expiredCount > 0) {
    newState = addMessage(
      newState,
      `${expiredCount} mission opportunit${expiredCount > 1 ? 'ies have' : 'y has'} expired.`
    );
  }

  return newState;
}

// Create initial game state
export function createInitialGameState(): GameState {
  // Create 4 districts
  const districts = Array.from({ length: 4 }, (_, i) => createDistrict(i));
  // Start with Dominion 1 in first district
  districts[0].companyDominion = 1;
  districts[0].revealed = true;

  // Create starting agents: 3 at level 1, 2 at level 2
  const agents: Agent[] = [
    ...Array.from({ length: 3 }, () => createAgent(1)),
    ...Array.from({ length: 2 }, () => createAgent(2)),
  ];

  // Generate procedural tilemap
  const tilemap = generateTilemap(districts);

  // Generate initial mission opportunities (3-4 to start)
  const initialState: GameState = {
    resources: {
      sovereigns: 500,
      materiel: 30,
      influence: 10,
    },
    workerCount: 8,
    workerAssignments: [],
    agents,
    districts,
    missions: [],
    availableMissions: [],
    currentWeek: 1,
    currentQuarter: 1,
    phase: 'assignment',
    charterStrain: 0,
    princeAttention: 0,
    quarterStartSovereigns: 500,
    profitTarget: PROFIT_TARGETS[1],
    gameOver: false,
    gameOverReason: null,
    victory: false,
    currentEvent: null,
    messages: ['Welcome to Hell EIC. The Company expects results. Do not disappoint.'],
    tilemap,
  };

  // Generate 3-4 initial mission opportunities
  const initialMissions = generateMissionOpportunities(initialState, 3 + Math.floor(Math.random() * 2));

  return {
    ...initialState,
    availableMissions: initialMissions,
    messages: [
      ...initialState.messages,
      `${initialMissions.length} mission opportunities are available. Choose wisely.`,
    ],
  };
}

// Add a message to the log
export function addMessage(state: GameState, message: string): GameState {
  return {
    ...state,
    messages: [...state.messages.slice(-49), message], // Keep last 50 messages
  };
}

// Modify resources with clamping
export function modifyResources(
  state: GameState,
  changes: Partial<Resources>
): GameState {
  const newResources = { ...state.resources };

  if (changes.sovereigns !== undefined) {
    newResources.sovereigns = clamp(
      newResources.sovereigns + changes.sovereigns,
      0,
      99999
    );
  }
  if (changes.materiel !== undefined) {
    newResources.materiel = clamp(
      newResources.materiel + changes.materiel,
      0,
      999
    );
  }
  if (changes.influence !== undefined) {
    newResources.influence = clamp(
      newResources.influence + changes.influence,
      0,
      100
    );
  }

  return { ...state, resources: newResources };
}

// Assign a worker to a job in a district
export function assignWorker(
  state: GameState,
  districtId: string,
  job: WorkerJob
): GameState {
  const assignedCount = state.workerAssignments.length;
  if (assignedCount >= state.workerCount) {
    return addMessage(state, 'All workers are already assigned.');
  }

  const district = state.districts.find((d) => d.id === districtId);
  if (!district) return state;

  const jobConfig = JOB_CONFIGS[job];
  if (district.companyDominion < jobConfig.requiresDominion) {
    return addMessage(
      state,
      `Cannot assign ${jobConfig.name}: requires Dominion ${jobConfig.requiresDominion} in ${district.name}.`
    );
  }

  // Check costs
  if (job === 'expansion' && state.resources.materiel < 5) {
    return addMessage(state, 'Expansion requires 5 Materiel.');
  }

  const newAssignment: WorkerAssignment = { districtId, job };
  return {
    ...state,
    workerAssignments: [...state.workerAssignments, newAssignment],
  };
}

// Remove a worker assignment
export function unassignWorker(
  state: GameState,
  index: number
): GameState {
  const newAssignments = [...state.workerAssignments];
  newAssignments.splice(index, 1);
  return { ...state, workerAssignments: newAssignments };
}

// Get available agents for missions (fresh or tired, not injured/dead)
export function getAvailableAgents(state: GameState): Agent[] {
  const assignedAgentIds = new Set(
    state.missions
      .filter((m) => m.status === 'preparing' || m.status === 'in_progress')
      .flatMap((m) => m.assignedAgents)
  );
  return state.agents.filter(
    (a) =>
      (a.condition === 'fresh' || a.condition === 'tired') &&
      !assignedAgentIds.has(a.id)
  );
}

// Accept a mission from available opportunities
export function acceptMission(
  state: GameState,
  opportunityId: string,
  agentIds: string[],
  preparationWeeks: number
): GameState {
  const opportunity = state.availableMissions.find((m) => m.id === opportunityId);
  if (!opportunity) {
    return addMessage(state, 'This mission opportunity is no longer available.');
  }

  const config = MISSION_CONFIGS[opportunity.type];

  if (agentIds.length < config.minAgents || agentIds.length > config.maxAgents) {
    return addMessage(
      state,
      `${config.name} requires ${config.minAgents}-${config.maxAgents} agents.`
    );
  }

  // Check costs
  if (config.cost?.sovereigns && state.resources.sovereigns < config.cost.sovereigns) {
    return addMessage(state, `${config.name} costs ${config.cost.sovereigns} Sovereigns.`);
  }
  if (config.cost?.materiel && state.resources.materiel < config.cost.materiel) {
    return addMessage(state, `${config.name} costs ${config.cost.materiel} Materiel.`);
  }

  // Deduct costs
  let newState = state;
  if (config.cost?.sovereigns) {
    newState = modifyResources(newState, { sovereigns: -config.cost.sovereigns });
  }
  if (config.cost?.materiel) {
    newState = modifyResources(newState, { materiel: -config.cost.materiel });
  }

  const mission: Mission = {
    id: generateId(),
    type: opportunity.type,
    districtId: opportunity.districtId,
    assignedAgents: agentIds,
    preparationWeeks,
    weeksRemaining: preparationWeeks,
    status: 'preparing',
    difficultyBonus: opportunity.difficultyBonus,
    rewardBonus: opportunity.rewardBonus,
  };

  const district = state.districts.find((d) => d.id === opportunity.districtId);
  const difficultyLabel = opportunity.difficultyBonus > 0 ? ' (challenging)' : opportunity.difficultyBonus < 0 ? ' (favorable)' : '';
  newState = addMessage(
    newState,
    `Mission "${config.name}"${difficultyLabel} accepted in ${district?.name || 'unknown district'}. Preparation: ${preparationWeeks} week(s).`
  );

  // Remove the opportunity from available missions
  return {
    ...newState,
    missions: [...newState.missions, mission],
    availableMissions: newState.availableMissions.filter((m) => m.id !== opportunityId),
  };
}

// Legacy createMission for backwards compatibility (now deprecated)
export function createMission(
  state: GameState,
  type: MissionType,
  districtId: string,
  agentIds: string[],
  preparationWeeks: number
): GameState {
  const config = MISSION_CONFIGS[type];

  if (agentIds.length < config.minAgents || agentIds.length > config.maxAgents) {
    return addMessage(
      state,
      `${config.name} requires ${config.minAgents}-${config.maxAgents} agents.`
    );
  }

  // Check costs
  if (config.cost?.sovereigns && state.resources.sovereigns < config.cost.sovereigns) {
    return addMessage(state, `${config.name} costs ${config.cost.sovereigns} Sovereigns.`);
  }
  if (config.cost?.materiel && state.resources.materiel < config.cost.materiel) {
    return addMessage(state, `${config.name} costs ${config.cost.materiel} Materiel.`);
  }

  // Deduct costs
  let newState = state;
  if (config.cost?.sovereigns) {
    newState = modifyResources(newState, { sovereigns: -config.cost.sovereigns });
  }
  if (config.cost?.materiel) {
    newState = modifyResources(newState, { materiel: -config.cost.materiel });
  }

  const mission: Mission = {
    id: generateId(),
    type,
    districtId,
    assignedAgents: agentIds,
    preparationWeeks,
    weeksRemaining: preparationWeeks,
    status: 'preparing',
  };

  const district = state.districts.find((d) => d.id === districtId);
  newState = addMessage(
    newState,
    `Mission "${config.name}" planned in ${district?.name || 'unknown district'}. Preparation: ${preparationWeeks} week(s).`
  );

  return {
    ...newState,
    missions: [...newState.missions, mission],
  };
}

// Cancel a mission
export function cancelMission(state: GameState, missionId: string): GameState {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission || mission.status !== 'preparing') {
    return addMessage(state, 'Cannot cancel this mission.');
  }

  return {
    ...state,
    missions: state.missions.filter((m) => m.id !== missionId),
  };
}

// Calculate mission success chance
export function calculateMissionSuccess(
  state: GameState,
  mission: Mission
): number {
  const config = MISSION_CONFIGS[mission.type];
  const district = state.districts.find((d) => d.id === mission.districtId);
  if (!district) return 0;

  // Base 50% + agent levels
  const agentLevels = mission.assignedAgents.reduce((sum, id) => {
    const agent = state.agents.find((a) => a.id === id);
    return sum + (agent?.level || 0);
  }, 0);

  // Preparation modifier: -30 (1 week) to +25 (5+ weeks)
  const prepMod = [-30, -15, 0, 10, 25][Math.min(mission.preparationWeeks - 1, 4)];

  // Difficulty from district authority + mission type + opportunity bonus
  const opportunityDifficulty = mission.difficultyBonus || 0;
  const difficulty = district.infernalAuthority + config.difficultyMod + opportunityDifficulty;

  const successChance = 50 + agentLevels * 5 + prepMod - difficulty * 8;
  return clamp(successChance, 5, 95);
}

// Calculate mission success for an opportunity (before it's accepted)
export function calculateOpportunitySuccess(
  state: GameState,
  opportunity: MissionOpportunity,
  agentIds: string[],
  preparationWeeks: number
): number {
  // Create a mock mission to calculate success
  const mockMission: Mission = {
    id: 'preview',
    type: opportunity.type,
    districtId: opportunity.districtId,
    assignedAgents: agentIds,
    preparationWeeks,
    weeksRemaining: preparationWeeks,
    status: 'preparing',
    difficultyBonus: opportunity.difficultyBonus,
    rewardBonus: opportunity.rewardBonus,
  };
  return calculateMissionSuccess(state, mockMission);
}

// Resolve a single mission
function resolveMission(state: GameState, mission: Mission): GameState {
  const config = MISSION_CONFIGS[mission.type];
  const district = state.districts.find((d) => d.id === mission.districtId);
  if (!district) return state;

  const successChance = calculateMissionSuccess(state, mission);
  const roll = Math.random() * 100;
  const success = roll < successChance;

  let newState = state;
  const districtIndex = state.districts.findIndex((d) => d.id === mission.districtId);

  // Update agent conditions
  const newAgents = state.agents.map((agent) => {
    if (!mission.assignedAgents.includes(agent.id)) return agent;

    let newCondition: AgentCondition = agent.condition;
    let newCorruption = agent.corruption;
    let newXp = agent.xp;

    // XP gain on completion
    newXp += 1;

    // Condition changes
    if (!success) {
      // Failed mission: agents might get injured
      if (Math.random() < 0.4) {
        newCondition = agent.condition === 'fresh' ? 'tired' : 'injured';
      }
    }

    // Corruption gain
    if (Math.random() < 0.2) {
      newCorruption = Math.min(5, newCorruption + 1);
    }

    // Check for level up
    let newLevel = agent.level;
    if (newLevel < 5) {
      const threshold = XP_THRESHOLDS[newLevel];
      if (newXp >= threshold) {
        newLevel += 1;
        newXp = 0;
        newState = addMessage(
          newState,
          `${agent.name} has advanced to Level ${newLevel}!`
        );
      }
    }

    return {
      ...agent,
      condition: newCondition,
      corruption: newCorruption,
      xp: newXp,
      level: newLevel,
    };
  });

  newState = { ...newState, agents: newAgents };

  // Apply mission results
  const newDistricts = [...newState.districts];
  const rewardMultiplier = mission.rewardBonus || 1.0;

  if (success) {
    switch (mission.type) {
      case 'extraction_run': {
        const baseMateriel = 5 + Math.floor(Math.random() * 11); // 5-15
        const materielGain = Math.floor(baseMateriel * rewardMultiplier);
        newState = modifyResources(newState, { materiel: materielGain });
        newState = addMessage(
          newState,
          `Extraction Run SUCCESS in ${district.name}: +${materielGain} Materiel`
        );
        break;
      }
      case 'sabotage': {
        const authorityReduction = Math.floor(2 * rewardMultiplier);
        newDistricts[districtIndex] = {
          ...district,
          infernalAuthority: Math.max(0, district.infernalAuthority - authorityReduction),
        };
        newState = addMessage(
          newState,
          `Sabotage SUCCESS in ${district.name}: Authority reduced by ${authorityReduction}`
        );
        break;
      }
      case 'interdiction': {
        const authorityReduction = Math.max(1, Math.floor(1 * rewardMultiplier));
        newDistricts[districtIndex] = {
          ...district,
          infernalAuthority: Math.max(0, district.infernalAuthority - authorityReduction),
        };
        newState = addMessage(
          newState,
          `Interdiction SUCCESS in ${district.name}: Authority reduced by ${authorityReduction}`
        );
        break;
      }
      case 'smuggling': {
        const baseSovereigns = 50 + Math.floor(Math.random() * 101); // 50-150
        const sovereignsGain = Math.floor(baseSovereigns * rewardMultiplier);
        newState = modifyResources(newState, { sovereigns: sovereignsGain });
        newState = addMessage(
          newState,
          `Smuggling SUCCESS in ${district.name}: +${sovereignsGain} Sovereigns`
        );
        break;
      }
      case 'tribute_delivery': {
        const noticeReduction = Math.floor(3 * rewardMultiplier);
        newDistricts[districtIndex] = {
          ...district,
          notice: Math.max(0, district.notice - noticeReduction),
        };
        newState = addMessage(
          newState,
          `Tribute Delivery SUCCESS in ${district.name}: Notice reduced by ${noticeReduction}`
        );
        break;
      }
    }
  } else {
    newState = addMessage(
      newState,
      `${config.name} FAILED in ${district.name}. Agents have returned.`
    );
  }

  // Apply notice risk
  const noticeGain = success ? config.noticeRisk : Math.ceil(config.noticeRisk / 2);
  newDistricts[districtIndex] = {
    ...newDistricts[districtIndex],
    notice: Math.min(10, newDistricts[districtIndex].notice + noticeGain),
  };

  // Update mission status
  const newMissions = newState.missions.map((m) =>
    m.id === mission.id ? { ...m, status: success ? 'completed' as const : 'failed' as const } : m
  );

  return { ...newState, districts: newDistricts, missions: newMissions };
}

// Process worker job effects
function processWorkerJobs(state: GameState): GameState {
  let newState = state;
  const districtUpdates: Map<string, Partial<District>> = new Map();

  for (const assignment of state.workerAssignments) {
    const district = state.districts.find((d) => d.id === assignment.districtId);
    if (!district) continue;

    switch (assignment.job) {
      case 'extraction': {
        const materielGain = district.companyDominion;
        newState = modifyResources(newState, { materiel: materielGain });
        newState = addMessage(
          newState,
          `Extraction in ${district.name}: +${materielGain} Materiel`
        );
        break;
      }
      case 'trading': {
        const rate = 8 + Math.floor(district.companyDominion * 1.2); // 8-20 per Materiel
        const materielToTrade = Math.min(5, newState.resources.materiel);
        if (materielToTrade > 0) {
          const sovereignsGain = materielToTrade * rate;
          newState = modifyResources(newState, {
            materiel: -materielToTrade,
            sovereigns: sovereignsGain,
          });
          newState = addMessage(
            newState,
            `Trading in ${district.name}: ${materielToTrade} Materiel → ${sovereignsGain} Sovereigns`
          );
        }
        break;
      }
      case 'espionage': {
        const updates = districtUpdates.get(district.id) || {};
        updates.revealed = true;
        districtUpdates.set(district.id, updates);
        newState = addMessage(
          newState,
          `Espionage in ${district.name}: District intelligence gathered.`
        );
        break;
      }
      case 'discretion': {
        const currentUpdates = districtUpdates.get(district.id) || {};
        const currentNotice = currentUpdates.notice ?? district.notice;
        currentUpdates.notice = Math.max(0, currentNotice - 1);
        districtUpdates.set(district.id, currentUpdates);
        newState = addMessage(
          newState,
          `Discretion in ${district.name}: Notice reduced by 1.`
        );
        break;
      }
      case 'expansion': {
        if (newState.resources.materiel >= 5) {
          newState = modifyResources(newState, { materiel: -5 });
          const currentUpdates = districtUpdates.get(district.id) || {};
          const currentDominion = currentUpdates.companyDominion ?? district.companyDominion;
          const currentNotice = currentUpdates.notice ?? district.notice;
          currentUpdates.companyDominion = Math.min(10, currentDominion + 1);
          currentUpdates.notice = Math.min(10, currentNotice + 1);
          districtUpdates.set(district.id, currentUpdates);
          newState = addMessage(
            newState,
            `Expansion in ${district.name}: Dominion increased! (+1 Notice)`
          );
        }
        break;
      }
    }
  }

  // Apply district updates
  const newDistricts = newState.districts.map((d) => {
    const updates = districtUpdates.get(d.id);
    return updates ? { ...d, ...updates } : d;
  });

  return { ...newState, districts: newDistricts, workerAssignments: [] };
}

// Calculate upkeep costs
function calculateUpkeep(state: GameState): { materiel: number; sovereigns: number } {
  let materiel = 0;
  let sovereigns = 0;

  for (const district of state.districts) {
    if (district.companyDominion > 0) {
      materiel += 1;
      if (district.companyDominion >= 5) {
        sovereigns += 5;
      }
    }
  }

  return { materiel, sovereigns };
}

// Process upkeep phase
function processUpkeep(state: GameState): GameState {
  const upkeep = calculateUpkeep(state);
  let newState = state;

  if (upkeep.materiel > 0 || upkeep.sovereigns > 0) {
    newState = modifyResources(newState, {
      materiel: -upkeep.materiel,
      sovereigns: -upkeep.sovereigns,
    });
    newState = addMessage(
      newState,
      `Upkeep paid: ${upkeep.materiel} Materiel, ${upkeep.sovereigns} Sovereigns`
    );
  }

  return newState;
}

// Process notice escalation
function processNotice(state: GameState): GameState {
  let newState = state;
  let princeAttentionGain = 0;

  for (const district of state.districts) {
    if (district.notice >= 7) {
      // High notice triggers events
      newState = addMessage(
        newState,
        `WARNING: High Notice in ${district.name}! Demonic forces are investigating.`
      );
      princeAttentionGain += 1;
    }
    if (district.notice >= 10) {
      // Maximum notice causes major problems
      newState = addMessage(
        newState,
        `CRITICAL: ${district.name} is under full demonic scrutiny!`
      );
      princeAttentionGain += 2;
    }
  }

  if (princeAttentionGain > 0) {
    newState = {
      ...newState,
      princeAttention: Math.min(10, newState.princeAttention + princeAttentionGain),
    };
    newState = addMessage(
      newState,
      `Prince Attention increased to ${newState.princeAttention}.`
    );
  }

  return newState;
}

// Check end of quarter
function checkQuarterEnd(state: GameState): GameState {
  if (state.currentWeek % 13 !== 0) return state;

  const profit = state.resources.sovereigns - state.quarterStartSovereigns;
  let newState = state;

  if (profit >= state.profitTarget) {
    newState = addMessage(
      newState,
      `QUARTER ${state.currentQuarter} COMPLETE: Profit target met! (${profit}/${state.profitTarget} Sovereigns)`
    );
  } else {
    newState = {
      ...newState,
      charterStrain: newState.charterStrain + 1,
    };
    newState = addMessage(
      newState,
      `QUARTER ${state.currentQuarter} FAILED: Profit target missed! (${profit}/${state.profitTarget} Sovereigns) Charter Strain: ${newState.charterStrain}/3`
    );
  }

  // Advance quarter
  const newQuarter = state.currentQuarter + 1;
  const newTarget = PROFIT_TARGETS[newQuarter] || PROFIT_TARGETS[6];

  newState = {
    ...newState,
    currentQuarter: newQuarter,
    quarterStartSovereigns: newState.resources.sovereigns,
    profitTarget: newTarget,
  };

  newState = addMessage(
    newState,
    `QUARTER ${newQuarter} begins. New profit target: ${newTarget} Sovereigns`
  );

  return newState;
}

// Check victory conditions
export function checkVictory(state: GameState): boolean {
  const highDominionDistricts = state.districts.filter(
    (d) => d.companyDominion >= 7
  ).length;
  const allNoticeLow = state.districts.every((d) => d.notice < 7);

  return (
    highDominionDistricts >= 3 &&
    allNoticeLow &&
    state.charterStrain === 0
  );
}

// Check game over conditions
function checkGameOver(state: GameState): GameState {
  let newState = state;

  if (state.charterStrain >= 3) {
    return {
      ...newState,
      gameOver: true,
      gameOverReason: 'charter_revoked',
      messages: [
        ...newState.messages,
        'GAME OVER: The Company has revoked your charter. Your operation is shut down.',
      ],
    };
  }

  if (state.princeAttention >= 10) {
    return {
      ...newState,
      gameOver: true,
      gameOverReason: 'prince_attention',
      messages: [
        ...newState.messages,
        'GAME OVER: A Prince of Hell has taken notice. There is no escape.',
      ],
    };
  }

  if (checkVictory(state)) {
    return {
      ...newState,
      victory: true,
      messages: [
        ...newState.messages,
        'VICTORY! You have established dominant control over Hell. The Company is pleased.',
      ],
    };
  }

  return newState;
}

// Heal agents during advancement phase
function healAgents(state: GameState): GameState {
  const newAgents = state.agents.map((agent) => {
    if (agent.condition === 'dead') return agent;

    // Tired → Fresh, Injured has 50% chance to become Tired
    let newCondition = agent.condition;
    if (agent.condition === 'tired') {
      newCondition = 'fresh';
    } else if (agent.condition === 'injured') {
      if (Math.random() < 0.5) {
        newCondition = 'tired';
      }
    }

    return { ...agent, condition: newCondition };
  });

  return { ...state, agents: newAgents };
}

// Advance to next phase
export function advancePhase(state: GameState): GameState {
  if (state.gameOver || state.victory) return state;

  let newState = { ...state };
  const phases: GamePhase[] = [
    'assignment',
    'resolution',
    'advancement',
    'upkeep',
    'notice',
    'event',
  ];
  const currentIndex = phases.indexOf(state.phase);
  const nextIndex = (currentIndex + 1) % phases.length;
  const nextPhase = phases[nextIndex];

  // Process current phase completion
  switch (state.phase) {
    case 'assignment':
      // Workers have been assigned, move to resolution
      newState = processWorkerJobs(newState);
      break;
    case 'resolution':
      // Resolve any missions that are ready
      for (const mission of newState.missions) {
        if (mission.status === 'in_progress' && mission.weeksRemaining <= 0) {
          newState = resolveMission(newState, mission);
        }
      }
      // Clean up completed/failed missions
      newState = {
        ...newState,
        missions: newState.missions.filter(
          (m) => m.status === 'preparing' || m.status === 'in_progress'
        ),
      };
      break;
    case 'advancement':
      // Advance mission timers
      newState = {
        ...newState,
        missions: newState.missions.map((m) => {
          if (m.status === 'preparing') {
            const newWeeks = m.weeksRemaining - 1;
            return {
              ...m,
              weeksRemaining: newWeeks,
              status: newWeeks <= 0 ? 'in_progress' as const : 'preparing' as const,
            };
          }
          return m;
        }),
      };
      // Heal agents
      newState = healAgents(newState);
      break;
    case 'upkeep':
      newState = processUpkeep(newState);
      break;
    case 'notice':
      newState = processNotice(newState);
      break;
    case 'event':
      // Random events could go here
      // Advance the week
      newState = {
        ...newState,
        currentWeek: newState.currentWeek + 1,
      };
      newState = checkQuarterEnd(newState);

      // Process mission opportunity expiry (decrement timers, remove expired)
      newState = processOpportunityExpiry(newState);

      // Generate new mission opportunities (1-3 per week, capped at 6 total)
      const maxOpportunities = 6;
      const currentCount = newState.availableMissions.length;
      if (currentCount < maxOpportunities) {
        const newMissionCount = Math.min(
          1 + Math.floor(Math.random() * 3), // 1-3 new missions
          maxOpportunities - currentCount
        );
        const newOpportunities = generateMissionOpportunities(newState, newMissionCount);
        if (newOpportunities.length > 0) {
          newState = {
            ...newState,
            availableMissions: [...newState.availableMissions, ...newOpportunities],
          };
          newState = addMessage(
            newState,
            `${newOpportunities.length} new mission opportunit${newOpportunities.length > 1 ? 'ies have' : 'y has'} become available.`
          );
        }
      }

      newState = addMessage(
        newState,
        `--- Week ${newState.currentWeek}, Quarter ${newState.currentQuarter} ---`
      );
      break;
  }

  // Check win/lose conditions
  newState = checkGameOver(newState);

  return { ...newState, phase: nextPhase };
}

// Quick advance through all phases to next assignment
export function advanceWeek(state: GameState): GameState {
  if (state.gameOver || state.victory) return state;

  let newState = state;

  do {
    newState = advancePhase(newState);
  } while (newState.phase !== 'assignment' && !newState.gameOver && !newState.victory);

  return newState;
}
