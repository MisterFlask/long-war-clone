// Hell EIC Game Types

// Core Resources
export interface Resources {
  sovereigns: number; // Money extracted from Hell (starting: 500, max: 99999)
  materiel: number;   // Goods, equipment, supplies (starting: 30, max: 999)
  influence: number;  // Favors, leverage, blackmail (starting: 10, max: 100)
}

// Agent condition states
export type AgentCondition = 'fresh' | 'tired' | 'injured' | 'dead';

// Agent representing a field operative
export interface Agent {
  id: string;
  name: string;
  level: number;       // 1-5
  xp: number;          // XP thresholds: 3, 7, 12, 20
  condition: AgentCondition;
  corruption: number;  // 0-5, accumulated Hell-taint
}

// Worker job types
export type WorkerJob =
  | 'extraction'   // Gain Materiel = district Dominion
  | 'trading'      // Convert Materiel → Sovereigns
  | 'espionage'    // Generate intel, reveal stats
  | 'discretion'   // Reduce Notice by 1
  | 'expansion'    // +1 Dominion (but +1 Notice too)
  | 'idle';        // Not assigned

// Worker assignment to a district
export interface WorkerAssignment {
  districtId: string;
  job: WorkerJob;
}

// District representing a region of Hell
export interface District {
  id: string;
  name: string;
  description: string;
  infernalAuthority: number;  // 0-10, Hell's control level
  companyDominion: number;    // 0-10, your establishment level
  notice: number;             // 0-10, unwanted attention
  revealed: boolean;          // Whether stats are visible (requires espionage)
}

// Mission types
export type MissionType =
  | 'extraction_run'    // +0 difficulty, 5-15 Materiel, +1 Notice
  | 'sabotage'          // +2 difficulty, -2 Authority, +3 Notice
  | 'interdiction'      // +1 difficulty, -1 Authority, +2 Notice
  | 'smuggling'         // +0 difficulty, 50-150 Sovereigns, +1 Notice
  | 'tribute_delivery'; // -2 difficulty, -3 Notice, costs 50 Sovereigns

// Mission status
export type MissionStatus = 'preparing' | 'in_progress' | 'completed' | 'failed';

// Mission representing an operation in progress
export interface Mission {
  id: string;
  type: MissionType;
  districtId: string;
  assignedAgents: string[];  // Agent IDs
  preparationWeeks: number;  // 1-5+ weeks
  weeksRemaining: number;
  status: MissionStatus;
  // From opportunity (if accepted from pool)
  difficultyBonus?: number;  // Additional difficulty modifier from opportunity
  rewardBonus?: number;      // Reward multiplier from opportunity (default 1.0)
}

// Mission opportunity - available missions that appear each week with expiry
export interface MissionOpportunity {
  id: string;
  type: MissionType;
  districtId: string;
  weeksUntilExpiry: number;  // Countdown until this mission disappears
  difficultyBonus: number;   // Additional difficulty modifier (-2 to +3)
  rewardBonus: number;       // Multiplier for rewards (0.8 to 1.5)
  flavorText: string;        // Description of why this opportunity exists
}

// Game phase in the weekly cycle
export type GamePhase =
  | 'assignment'   // Assign workers to activities
  | 'resolution'   // Resolve missions
  | 'advancement'  // Advance timers
  | 'upkeep'       // Pay district upkeep
  | 'notice'       // Check for Notice escalation
  | 'event';       // Random events

// Game over reasons
export type GameOverReason =
  | 'charter_revoked'     // 3 Charter Strain
  | 'prince_attention'    // Too much overall attention
  | 'total_loss'          // All workers/agents lost
  | null;

// Victory conditions check
export interface VictoryStatus {
  achieved: boolean;
  districtsWithHighDominion: number;  // Need 3+ with Dominion >= 7
  allNoticeBelow7: boolean;
  noCharterStrain: boolean;
}

// Random event
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  effect: () => void;
}

// Full game state
export interface GameState {
  // Resources
  resources: Resources;

  // Workers (fungible, just a count + assignments)
  workerCount: number;
  workerAssignments: WorkerAssignment[];

  // Agents
  agents: Agent[];

  // Districts
  districts: District[];

  // Missions
  missions: Mission[];

  // Available mission opportunities (rotating pool)
  availableMissions: MissionOpportunity[];

  // Time tracking
  currentWeek: number;
  currentQuarter: number;
  phase: GamePhase;

  // Threats
  charterStrain: number;      // 0-3, 3 = game over
  princeAttention: number;    // 0-10, 10 = game over

  // Profit tracking
  quarterStartSovereigns: number;
  profitTarget: number;

  // Game status
  gameOver: boolean;
  gameOverReason: GameOverReason;
  victory: boolean;

  // Current event (if any)
  currentEvent: GameEvent | null;

  // Message log
  messages: string[];

  // Tilemap for world map (procedurally generated)
  tilemap: TileMap;
}

// Mission type configuration
export interface MissionConfig {
  type: MissionType;
  name: string;
  description: string;
  difficultyMod: number;
  noticeRisk: number;
  cost?: { sovereigns?: number; materiel?: number };
  minAgents: number;
  maxAgents: number;
}

// Job configuration
export interface JobConfig {
  job: WorkerJob;
  name: string;
  description: string;
  requiresDominion: number;
  cost?: { materiel?: number };
}

// Quarterly profit targets
export const PROFIT_TARGETS: Record<number, number> = {
  1: 200,
  2: 350,
  3: 500,
  4: 700,
  5: 900,
  6: 1100,
};

// XP thresholds for leveling up
export const XP_THRESHOLDS: Record<number, number> = {
  1: 3,   // Level 1 → 2
  2: 7,   // Level 2 → 3
  3: 12,  // Level 3 → 4
  4: 20,  // Level 4 → 5
};

// Mission configurations
export const MISSION_CONFIGS: Record<MissionType, MissionConfig> = {
  extraction_run: {
    type: 'extraction_run',
    name: 'Extraction Run',
    description: 'Extract materials from the district',
    difficultyMod: 0,
    noticeRisk: 1,
    minAgents: 1,
    maxAgents: 4,
  },
  sabotage: {
    type: 'sabotage',
    name: 'Sabotage',
    description: 'Undermine Hell\'s authority in the district',
    difficultyMod: 2,
    noticeRisk: 3,
    minAgents: 2,
    maxAgents: 4,
  },
  interdiction: {
    type: 'interdiction',
    name: 'Interdiction',
    description: 'Intercept demonic operations',
    difficultyMod: 1,
    noticeRisk: 2,
    minAgents: 1,
    maxAgents: 3,
  },
  smuggling: {
    type: 'smuggling',
    name: 'Smuggling',
    description: 'Run contraband for quick profit',
    difficultyMod: 0,
    noticeRisk: 1,
    minAgents: 1,
    maxAgents: 2,
  },
  tribute_delivery: {
    type: 'tribute_delivery',
    name: 'Tribute Delivery',
    description: 'Pay off local powers to reduce attention',
    difficultyMod: -2,
    noticeRisk: 0,
    cost: { sovereigns: 50 },
    minAgents: 1,
    maxAgents: 2,
  },
};

// Job configurations
export const JOB_CONFIGS: Record<WorkerJob, JobConfig> = {
  extraction: {
    job: 'extraction',
    name: 'Extraction',
    description: 'Gain Materiel equal to district Dominion',
    requiresDominion: 1,
  },
  trading: {
    job: 'trading',
    name: 'Trading',
    description: 'Convert Materiel to Sovereigns',
    requiresDominion: 1,
  },
  espionage: {
    job: 'espionage',
    name: 'Espionage',
    description: 'Reveal district statistics',
    requiresDominion: 0,
  },
  discretion: {
    job: 'discretion',
    name: 'Discretion',
    description: 'Reduce Notice by 1',
    requiresDominion: 0,
  },
  expansion: {
    job: 'expansion',
    name: 'Expansion',
    description: 'Increase Dominion by 1 (costs 5 Materiel, +1 Notice)',
    requiresDominion: 0,
    cost: { materiel: 5 },
  },
  idle: {
    job: 'idle',
    name: 'Idle',
    description: 'Worker is not assigned',
    requiresDominion: 0,
  },
};

// Map coordinates for districts (percentage-based, 0-100)
export interface MapCoordinates {
  x: number;  // 0-100 percentage from left
  y: number;  // 0-100 percentage from top
}

// District template with name, description, and map position
export interface DistrictTemplate {
  name: string;
  description: string;
  mapPosition: MapCoordinates;
  // Visual properties for the map
  terrain: 'volcanic' | 'industrial' | 'urban' | 'docks' | 'wasteland';
}

// District names pool with map coordinates
// Arranged in a roughly circular pattern representing the circles of Hell
export const DISTRICT_NAMES: DistrictTemplate[] = [
  {
    name: 'Char Market',
    description: 'A bustling bazaar where souls and goods exchange hands under perpetual smoke.',
    mapPosition: { x: 50, y: 20 },
    terrain: 'urban'
  },
  {
    name: 'The Brass Warrens',
    description: 'A labyrinth of copper pipes and industrial forges, home to damned craftsmen.',
    mapPosition: { x: 80, y: 35 },
    terrain: 'industrial'
  },
  {
    name: 'Ashfall Reach',
    description: 'Volcanic plains where the most valuable minerals are harvested.',
    mapPosition: { x: 85, y: 65 },
    terrain: 'volcanic'
  },
  {
    name: 'The Gilded Pit',
    description: 'Where fallen merchants continue their dealings in tarnished luxury.',
    mapPosition: { x: 65, y: 80 },
    terrain: 'urban'
  },
  {
    name: 'Sulphur Downs',
    description: 'Rolling hills of brimstone, rich in alchemical resources.',
    mapPosition: { x: 35, y: 80 },
    terrain: 'wasteland'
  },
  {
    name: 'The Screaming Docks',
    description: 'A port on the River Styx where infernal cargo is loaded and unloaded.',
    mapPosition: { x: 15, y: 65 },
    terrain: 'docks'
  },
  {
    name: 'Cinder Row',
    description: 'Former residential district, now a smoldering ruin of opportunity.',
    mapPosition: { x: 20, y: 35 },
    terrain: 'wasteland'
  },
  {
    name: 'The Iron Chancery',
    description: 'Administrative center where contracts are filed and fates are sealed.',
    mapPosition: { x: 55, y: 55 },
    terrain: 'industrial'
  },
];

// Helper to get district template by name
export function getDistrictTemplate(name: string): DistrictTemplate | undefined {
  return DISTRICT_NAMES.find(d => d.name === name);
}

// Company HQ position (center-left of the map, near the River Styx)
export const HQ_POSITION: MapCoordinates = { x: 45, y: 45 };

// Mission opportunity flavor texts by type
export const MISSION_FLAVOR_TEXTS: Record<MissionType, string[]> = {
  extraction_run: [
    'A cache of materials has been left unguarded in the district.',
    'Infernal shipments are passing through with minimal escort.',
    'Warehouse security has been compromised by internal disputes.',
    'A rival faction has abandoned their storage facility.',
    'Storm damage has exposed valuable stockpiles.',
  ],
  sabotage: [
    'A key infernal installation is vulnerable to attack.',
    'Internal political turmoil has weakened district defenses.',
    'A demon lord\'s lieutenant is away, leaving operations exposed.',
    'Critical infrastructure is undergoing maintenance.',
    'Guard rotations have been disrupted by bureaucratic feuding.',
  ],
  interdiction: [
    'Demonic patrol routes have become predictable.',
    'A supply convoy is scheduled to pass through.',
    'Informants report reduced security presence.',
    'Inter-demon rivalries have created enforcement gaps.',
    'A scheduled inspection has drawn guards elsewhere.',
  ],
  smuggling: [
    'A buyer in the mortal realm is desperate for hellish goods.',
    'Border checkpoints are understaffed this week.',
    'A corrupt official is willing to look the other way.',
    'Trade festivals have created convenient cover.',
    'Competing smugglers have been eliminated, opening routes.',
  ],
  tribute_delivery: [
    'A minor demon is willing to accept tribute for protection.',
    'Local powers are open to negotiation.',
    'A well-placed bribe could smooth over recent incidents.',
    'An intermediary has offered to facilitate peace offerings.',
    'Political shifts have made certain officials receptive to gifts.',
  ],
};

// ==================== TILEMAP TYPES ====================

// Tile types for the procedural world map
export type TileType =
  | 'void'           // Empty/impassable space
  | 'ground'         // Basic traversable terrain
  | 'volcanic'       // Lava/fire terrain
  | 'industrial'     // Factories and forges
  | 'urban'          // City/settlement areas
  | 'docks'          // Water/port areas
  | 'wasteland'      // Barren/desolate areas
  | 'river'          // River Styx
  | 'mountain'       // Mountain/rocky terrain
  | 'road';          // Paths between districts

// A single tile in the tilemap
export interface Tile {
  type: TileType;
  elevation: number;    // 0-1, used for visual effects
  variant: number;      // 0-3, for tile visual variety
  districtId?: string;  // If this tile is the center of a district
  isHQ?: boolean;       // If this is the company HQ location
}

// Tilemap dimensions
export const TILEMAP_WIDTH = 40;
export const TILEMAP_HEIGHT = 28;
export const TILE_SIZE = 25; // pixels per tile in rendering

// Tilemap structure
export interface TileMap {
  tiles: Tile[][];      // 2D array [y][x]
  width: number;
  height: number;
  seed: number;         // Seed used for generation
  districtPositions: Map<string, { x: number; y: number }>; // Grid positions of districts
  hqPosition: { x: number; y: number };
}

// Tile visual configuration
export const TILE_CONFIGS: Record<TileType, {
  colors: string[];
  symbol?: string;
  passable: boolean;
}> = {
  void: {
    colors: ['#0a0505', '#050202', '#080404', '#030101'],
    passable: false
  },
  ground: {
    colors: ['#1a0a0a', '#1d0c0c', '#180808', '#1f0e0e'],
    passable: true
  },
  volcanic: {
    colors: ['#4a1515', '#5c1a1a', '#3d1010', '#6b2020'],
    symbol: '~',
    passable: true
  },
  industrial: {
    colors: ['#2a2520', '#322d28', '#252018', '#3a352f'],
    symbol: '#',
    passable: true
  },
  urban: {
    colors: ['#201818', '#281e1e', '#1a1212', '#302424'],
    symbol: '+',
    passable: true
  },
  docks: {
    colors: ['#101820', '#142028', '#0c1218', '#182838'],
    symbol: '=',
    passable: true
  },
  wasteland: {
    colors: ['#251a12', '#2d1f16', '#1f150d', '#352518'],
    symbol: '.',
    passable: true
  },
  river: {
    colors: ['#0a1020', '#0c1428', '#081018', '#0e1830'],
    symbol: '≈',
    passable: false
  },
  mountain: {
    colors: ['#1a1515', '#221c1c', '#151010', '#2a2222'],
    symbol: '^',
    passable: false
  },
  road: {
    colors: ['#252015', '#2d2518', '#201a10', '#352d1d'],
    symbol: '·',
    passable: true
  },
};

// Agent name pools
export const AGENT_FIRST_NAMES = [
  'Archibald', 'Bartholomew', 'Cornelius', 'Edmund', 'Frederick',
  'Gertrude', 'Helena', 'Isadora', 'Josephine', 'Katherine',
  'Leopold', 'Margaret', 'Nathaniel', 'Ophelia', 'Percival',
  'Quentin', 'Rosalind', 'Sebastian', 'Theodora', 'Victor',
];

export const AGENT_LAST_NAMES = [
  'Ashworth', 'Blackwood', 'Crowley', 'Darkholme', 'Evernight',
  'Fairfax', 'Grimshaw', 'Holloway', 'Ironside', 'Jessop',
  'Kincaid', 'Lockwood', 'Moriarty', 'Nightingale', 'Osgood',
  'Pemberton', 'Quicksilver', 'Ravencroft', 'Stonebridge', 'Thornton',
];
