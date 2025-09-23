# The Forge-Tyrant Rising: Complete Technical Specification v5

## Core Architecture

### Enums

```typescript
enum InvestigatorStatus {
  Available = 'Available',
  Infiltrating = 'Infiltrating',
  OnMission = 'OnMission',
  Recovering = 'Recovering',
  Corrupted = 'Corrupted',
  Dead = 'Dead'
}

enum MissionType {
  Combat = 'Combat',
  NonCombat = 'NonCombat'
}

enum MissionStatus {
  Available = 'Available',
  Infiltrating = 'Infiltrating',
  Ready = 'Ready',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
  Expired = 'Expired'
}

enum InfiltrationMode {
  Careful = 'Careful',
  Standard = 'Standard',
  Rush = 'Rush'
}

enum ArtifactRarity {
  Common = 'Common',
  Rare = 'Rare',
  Legendary = 'Legendary',
  Default = 'Default' // Fallback when pool exhausted
}

enum LogType {
  MissionComplete = 'MissionComplete',
  MissionFailed = 'MissionFailed',
  MissionExpired = 'MissionExpired',
  InvestigatorRecruited = 'InvestigatorRecruited',
  InvestigatorLost = 'InvestigatorLost',
  ArtifactGained = 'ArtifactGained',
  DoomIncrease = 'DoomIncrease',
  StressBreakdown = 'StressBreakdown',
  CorruptionThreshold = 'CorruptionThreshold'
}

enum LogSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Critical = 'Critical'
}

enum TraumaType {
  ShellShocked = 'ShellShocked',
  Paranoid = 'Paranoid',
  Haunted = 'Haunted',
  Mechanized = 'Mechanized',
  Obsessed = 'Obsessed'
}
```

### Abstract Classes

```typescript
abstract class InvestigatorClass {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly startingHP: number;
  abstract readonly stressModifier: number;
  abstract readonly corruptionResistance: number;
  
  abstract calculateMissionBonus(missionType: MissionType): number;
  abstract getSpecialAbilityDescription(): string;
  abstract modifyCombatCards(baseCards: number): number;
  abstract modifyRecoveryTime(baseDays: number): number;
}

// Concrete implementations (not shown in full):
// - ScholarClass extends InvestigatorClass
// - SoldierClass extends InvestigatorClass  
// - OccultistClass extends InvestigatorClass
// - AlienistClass extends InvestigatorClass
// - EngineerClass extends InvestigatorClass

abstract class ArtifactEffect {
  abstract readonly description: string;
  abstract readonly value: number;
  
  abstract apply(gameState: GameState): void;
  abstract getDisplayText(): string;
  abstract isStackable(): boolean;
}

// Concrete implementations (not shown in full):
// - GlobalDoomReductionEffect extends ArtifactEffect
// - AllInvestigatorHPEffect extends ArtifactEffect
// - StressReductionEffect extends ArtifactEffect
// - InfluenceBonusEffect extends ArtifactEffect
// - FundingMultiplierEffect extends ArtifactEffect
// - InfiltrationSpeedEffect extends ArtifactEffect
// - RecoverySpeedEffect extends ArtifactEffect
// - CorruptionResistanceEffect extends ArtifactEffect
// - CombatCardBonusEffect extends ArtifactEffect
```

### Data Models

```typescript
interface GameState {
  currentDate: Date; // Starting Jan 1, 1890
  currentDay: number; // Days since start (0-indexed)
  isPaused: boolean;
  timeSpeed: number; // 0 = paused, 1-3 = speed levels
  doomCounter: number; // 0-10, game over at 10
  cultistStrength: number; // 0-100, multiplier for enemy health/damage
  
  resources: {
    funding: number; // British pounds, min 0, max 99999
    influence: number; // 0-100, affects recruitment and non-combat missions
  };
  
  artifacts: Artifact[]; // All owned artifacts (global effects)
  investigators: Investigator[];
  missions: Mission[];
  
  completedMissions: string[]; // Mission template IDs
  failedMissions: string[]; // Mission template IDs
  missionCooldowns: Record<string, number>; // Template ID → day available again
  
  // Non-combat mission tracking
  visibleNonCombatCount: number; // How many non-combat missions are visible
  activeNonCombatMissionId?: string; // Only one non-combat can be InProgress
  
  log: LogEntry[];
  lastAutosaveDay: number;
  lastDoomTickDay: number; // Track when doom last increased
  
  // For final mission chain
  finalMissionPhase: number; // 0 = not started, 1-3 = phases
  finalMissionDeadlineDay?: number; // Day by which chain must complete
  
  // For seeded random generation
  randomSeed: number;
}

interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity: ArtifactRarity;
  canHaveDuplicates: boolean; // Whether player can own multiple
  ownedCount: number; // How many owned
  effects: ArtifactEffect[]; // Array of effect class instances
}

interface LogEntry {
  day: number;
  type: LogType;
  message: string;
  severity: LogSeverity;
}

interface Investigator {
  id: string;
  name: string;
  portrait: string; // For now, always "default_portrait"
  class: InvestigatorClass; // Instance of class, not string
  level: number; // 1-5, calculated from experience
  status: InvestigatorStatus;
  
  currentHP: number;
  maxHP: number; // Base + (5 * level) + class bonus - corruption penalties
  baseMaxHP: number; // Without corruption penalties
  
  stress: number; // 0-10, clamped
  lastStressDecayDay: number; // Day of last stress reduction
  
  corruption: number; // 0-100
  corruptionEffects: CorruptionEffect[]; // Applied threshold effects
  
  experience: number; // Level thresholds: 100/300/600/1000
  
  permanentTraumas: Trauma[];
  
  // Status tracking
  assignedMission?: string; // Mission ID
  recoveryCompleteDay?: number; // When recovery finishes
  infiltrationCompleteDay?: number; // When infiltration finishes
}

interface CorruptionEffect {
  threshold: number; // 25, 50, 75, or 100
  name: string;
  description: string;
  applied: boolean;
}

interface Trauma {
  type: TraumaType;
  name: string;
  description: string;
  effect: string; // Description of mechanical effect
}

interface Mission {
  id: string;
  templateId: string; // For cooldown tracking
  name: string;
  type: MissionType;
  description: string;
  location: string;
  
  // Timing
  appearsOnDay: number;
  expiresOnDay: number; // Expires at END of this day
  infiltrationRequired: number; // Days needed (combat only)
  completionTime: number; // Days to complete (non-combat only)
  
  // For tracking ready state
  infiltrationCompleteDay?: number; // When infiltration finished
  readyExpiresDay?: number; // When ready period ends (combat)
  progressStartDay?: number; // When non-combat started
  progressCompleteDay?: number; // When non-combat will finish
  
  // Requirements
  minimumInvestigators: number;
  maximumInvestigators: number;
  requiredInvestigators?: number; // For non-combat, exactly this many
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  influenceRequirement?: number; // For non-combat
  
  rewards: MissionRewards;
  penalties: MissionPenalties;
  
  // Mission state
  status: MissionStatus;
  assignedInvestigators: string[]; // Investigator IDs
  infiltrationMode?: InfiltrationMode;
}

interface MissionRewards {
  funding?: number;
  influence?: number;
  artifactTiers?: ArtifactRarity[]; // Random artifacts of these tiers
  specificArtifacts?: string[]; // Specific artifact IDs
  recruits?: InvestigatorTemplate[];
  doomReduction?: number;
}

interface MissionPenalties {
  doomIncrease?: number;
  cultistStrength?: number;
  corruptionSpread?: number; // All investigators gain this
  influenceLoss?: number;
}

interface InvestigatorTemplate {
  classType: typeof InvestigatorClass; // Class constructor
  startingLevel: number;
}

interface CombatResult {
  missionSuccess: boolean;
  investigatorResults: {
    id: string;
    hpLost: number;
    stressGained: number;
    corruptionGained: number;
    died: boolean;
  }[];
}
```

## Game Constants

```typescript
const GAME_CONSTANTS = {
  // Starting resources
  STARTING_FUNDING: 5000,
  STARTING_INFLUENCE: 50,
  STARTING_DOOM: 0,
  STARTING_CULTIST_STRENGTH: 10,
  
  // Investigator limits
  MAX_ROSTER_SIZE: 12,
  STARTING_INVESTIGATORS: 5, // One of each class
  BASE_HP: 20,
  HP_PER_LEVEL: 5,
  
  // Recovery formulas
  BASE_RECOVERY_DAYS: 5,
  RECOVERY_PER_10_HP_LOST: 2,
  RECOVERY_PER_TRAUMA: 3,
  STRESS_DECAY_RATE: 1, // Points lost
  STRESS_DECAY_INTERVAL: 5, // Days between decay
  
  // Mission generation
  MISSION_SPAWN_CHANCE: 0.1, // 10% per day per eligible template
  MAX_VISIBLE_COMBAT_MISSIONS: 3,
  MAX_VISIBLE_NONCOMBAT_MISSIONS: 2,
  MISSION_BASE_DURATION: 14, // Days available
  MISSION_READY_DURATION: 7, // Days after infiltration
  NONCOMBAT_REQUIRED_INVESTIGATORS: 2, // Exactly 2 for all non-combat
  
  // Infiltration modifiers
  INFILTRATION_CAREFUL_MODIFIER: 1.5,
  INFILTRATION_RUSH_MODIFIER: 0.6,
  INFILTRATION_CAREFUL_BONUS: 2, // Extra combat cards
  INFILTRATION_RUSH_PENALTY: -1, // Fewer combat cards
  
  // Resource limits
  MAX_FUNDING: 99999,
  MAX_INFLUENCE: 100,
  MIN_STRESS: 0,
  MAX_STRESS: 10,
  
  // Doom progression (10-point scale)
  DOOM_TICK_RATE: 1, // Per interval
  DOOM_TICK_DAYS: 7,
  FINAL_MISSION_DAY: 50, // When final mission chain spawns
  GAME_OVER_DOOM: 10,
  
  // Experience and leveling
  EXPERIENCE_PER_DIFFICULTY: 10,
  EXPERIENCE_SUCCESS_MULTIPLIER: 2,
  EXPERIENCE_FAILURE_MULTIPLIER: 1,
  LEVEL_THRESHOLDS: [0, 100, 300, 600, 1000],
  
  // Influence effects
  INFLUENCE_FUNDING_MODIFIER: 0.01, // Per point
  INFLUENCE_RECRUITMENT_THRESHOLD: 40,
  INFLUENCE_RARE_ARTIFACT_THRESHOLD: 60,
  
  // Corruption thresholds and effects
  CORRUPTION_MINOR: 25,
  CORRUPTION_MAJOR: 50,
  CORRUPTION_SEVERE: 75,
  CORRUPTION_TOTAL: 100,
  
  // Autosave
  AUTOSAVE_INTERVAL: 7,
  
  // Final mission
  FINAL_MISSION_TIME_LIMIT: 30, // Days to complete chain
  FINAL_MISSION_FAILURE_DOOM: 3, // Penalty for failing any part
  
  // Rounding
  ROUNDING_MODE: 'floor', // Always round down for currency/resources
};
```

## Artifact Pool

```typescript
const ARTIFACT_TEMPLATES: Artifact[] = [
  // Default Artifact (always available)
  {
    id: "circlet_of_default",
    name: "Circlet of Default",
    description: "A mysterious circlet that appears when destiny has no other gifts",
    rarity: ArtifactRarity.Default,
    canHaveDuplicates: true,
    ownedCount: 0,
    effects: [new InfluenceBonusEffect(1)]
  },
  
  // Common Artifacts
  {
    id: "blessed_medallion",
    name: "Blessed Medallion",
    description: "A silver medallion blessed by the Archbishop of Canterbury",
    rarity: ArtifactRarity.Common,
    canHaveDuplicates: false,
    ownedCount: 0,
    effects: [new CorruptionResistanceEffect(-1)]
  },
  {
    id: "military_rations",
    name: "Military Field Rations",
    description: "Enhanced rations from the War Office",
    rarity: ArtifactRarity.Common,
    canHaveDuplicates: false,
    ownedCount: 0,
    effects: [new RecoverySpeedEffect(0.8)]
  },
  
  // Rare Artifacts
  {
    id: "thule_codex",
    name: "Thule Society Codex",
    description: "Forbidden knowledge from German occultists",
    rarity: ArtifactRarity.Rare,
    canHaveDuplicates: false,
    ownedCount: 0,
    effects: [
      new InfiltrationSpeedEffect(0.75),
      new StressReductionEffect(-1)
    ]
  },
  {
    id: "prototype_armor",
    name: "Babbage's Prototype Armor",
    description: "Mechanical armor plating designed by Charles Babbage's estate",
    rarity: ArtifactRarity.Rare,
    canHaveDuplicates: false,
    ownedCount: 0,
    effects: [new AllInvestigatorHPEffect(10)]
  },
  
  // Legendary Artifacts
  {
    id: "queens_seal",
    name: "The Queen's Seal",
    description: "Personal seal of Queen Victoria granting extraordinary authority",
    rarity: ArtifactRarity.Legendary,
    canHaveDuplicates: false,
    ownedCount: 0,
    effects: [
      new InfluenceBonusEffect(15),
      new FundingMultiplierEffect(1.5)
    ]
  },
  {
    id: "forge_fragment",
    name: "Fragment of the First Forge",
    description: "A shard of metal from the Forge-Tyrant's origin",
    rarity: ArtifactRarity.Legendary,
    canHaveDuplicates: false,
    ownedCount: 0,
    effects: [
      new GlobalDoomReductionEffect(-1), // Negates weekly tick
      new CombatCardBonusEffect(3)
    ]
  }
];
```

## Mission Templates

```typescript
interface MissionTemplate {
  id: string;
  name: string;
  type: MissionType;
  isSpecial: boolean; // True for missions with custom spawn logic
  requiredDay: number; // Minimum day
  requiredDoom?: number; // Minimum doom
  maxDoom?: number; // Maximum doom
  cooldown: number; // Days before can reappear
  baseInfiltration: number; // Combat only
  completionDays: number; // Non-combat only
  baseDifficulty: 1 | 2 | 3 | 4 | 5;
  influenceRequirement?: number;
  rewards: MissionRewards;
  penalties: MissionPenalties;
  
  // Location pool for variety
  possibleLocations: string[];
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  // Combat Missions
  {
    id: "docklands_incursion",
    name: "Docklands Incursion",
    type: MissionType.Combat,
    isSpecial: false,
    requiredDay: 1,
    maxDoom: 4,
    cooldown: 10,
    baseInfiltration: 3,
    completionDays: 0,
    baseDifficulty: 1,
    possibleLocations: ["East End Docks", "Rotherhithe Wharf", "Shadwell Basin"],
    rewards: {
      funding: 500,
      influence: 5,
      artifactTiers: [ArtifactRarity.Common]
    },
    penalties: {
      doomIncrease: 3, // 30% of doom bar - harsh!
      cultistStrength: 2
    }
  },
  {
    id: "factory_corruption",
    name: "Factory Corruption",
    type: MissionType.Combat,
    isSpecial: false,
    requiredDay: 10,
    cooldown: 14,
    baseInfiltration: 5,
    completionDays: 0,
    baseDifficulty: 2,
    possibleLocations: ["Birmingham Steel Works", "Manchester Mills", "Sheffield Foundry"],
    rewards: {
      funding: 800,
      influence: 8,
      doomReduction: 2
    },
    penalties: {
      doomIncrease: 5, // Half your doom bar!
      corruptionSpread: 3
    }
  },
  {
    id: "society_infiltration",
    name: "High Society Infiltration",
    type: MissionType.Combat,
    isSpecial: false,
    requiredDay: 20,
    requiredDoom: 1.5,
    cooldown: 21,
    baseInfiltration: 7,
    completionDays: 0,
    baseDifficulty: 3,
    possibleLocations: ["Grosvenor Square", "Belgravia Manor", "Mayfair Club"],
    rewards: {
      funding: 1500,
      influence: 15,
      artifactTiers: [ArtifactRarity.Rare]
    },
    penalties: {
      doomIncrease: 4,
      influenceLoss: 10
    }
  },
  
  // Non-Combat Missions
  {
    id: "parliament_funding",
    name: "Parliament Funding Committee",
    type: MissionType.NonCombat,
    isSpecial: false,
    requiredDay: 1,
    cooldown: 20,
    baseInfiltration: 0,
    completionDays: 10,
    baseDifficulty: 1,
    influenceRequirement: 30,
    possibleLocations: ["Westminster Hall"],
    rewards: {
      funding: 2000, // Modified by influence
    },
    penalties: {} // No penalty for ignoring
  },
  {
    id: "scotland_yard_recruitment",
    name: "Scotland Yard Recruitment",
    type: MissionType.NonCombat,
    isSpecial: false,
    requiredDay: 5,
    cooldown: 25,
    baseInfiltration: 0,
    completionDays: 15,
    baseDifficulty: 1,
    influenceRequirement: 40,
    possibleLocations: ["Scotland Yard"],
    rewards: {
      recruits: [{
        classType: SoldierClass,
        startingLevel: 1
      }]
    },
    penalties: {}
  },
  
  // Special Missions
  {
    id: "desperate_measures",
    name: "Desperate Measures",
    type: MissionType.Combat,
    isSpecial: true, // Spawns only when funding < 1000 and no other combat missions available
    requiredDay: 1,
    cooldown: 999999, // Once per campaign
    baseInfiltration: 1,
    completionDays: 0,
    baseDifficulty: 2,
    possibleLocations: ["Underground Vault"],
    rewards: {
      funding: 1000
    },
    penalties: {
      corruptionSpread: 10 // High cost
    }
  },
  
  // Final Mission Chain (3 parts)
  {
    id: "final_mission_1",
    name: "The Birmingham Foundry",
    type: MissionType.Combat,
    isSpecial: true,
    requiredDay: 50, // Spawns on day 50
    cooldown: 999999,
    baseInfiltration: 10,
    completionDays: 0,
    baseDifficulty: 4,
    possibleLocations: ["Birmingham Foundry"],
    rewards: {
      influence: 20,
      specificArtifacts: ["forge_fragment"]
    },
    penalties: {
      doomIncrease: 3 // Failing costs 30% of doom bar
    }
  },
  {
    id: "final_mission_2",
    name: "The Iron Cathedral",
    type: MissionType.Combat,
    isSpecial: true,
    requiredDay: 1,
    cooldown: 999999,
    baseInfiltration: 8,
    completionDays: 0,
    baseDifficulty: 5,
    possibleLocations: ["Iron Cathedral"],
    rewards: {
      doomReduction: 1
    },
    penalties: {
      doomIncrease: 3
    }
  },
  {
    id: "final_mission_3",
    name: "The Forge-Tyrant's Throne",
    type: MissionType.Combat,
    isSpecial: true,
    requiredDay: 1,
    cooldown: 999999,
    baseInfiltration: 5,
    completionDays: 0,
    baseDifficulty: 5,
    possibleLocations: ["The Throne Room"],
    rewards: {
      // Victory!
    },
    penalties: {
      // Game Over
    }
  }
];
```

## Game Flow Specifications

### Initial Game State Creation
```typescript
function createNewGame(): GameState {
  const startingInvestigators = [];
  const classes = [ScholarClass, SoldierClass, OccultistClass, AlienistClass, EngineerClass];
  
  for (const ClassConstructor of classes) {
    const classInstance = new ClassConstructor();
    startingInvestigators.push({
      id: generateId(),
      name: generateInvestigatorName(),
      portrait: "default_portrait",
      class: classInstance,
      level: 1,
      status: InvestigatorStatus.Available,
      currentHP: 20 + 5 + classInstance.startingHP, // base + level + class bonus
      maxHP: 20 + 5 + classInstance.startingHP,
      baseMaxHP: 20 + 5 + classInstance.startingHP,
      stress: 0,
      lastStressDecayDay: -999, // Will trigger decay check immediately
      corruption: 0,
      corruptionEffects: [],
      experience: 0,
      permanentTraumas: []
    });
  }
  
  return {
    currentDate: new Date(1890, 0, 1),
    currentDay: 0,
    isPaused: false,
    timeSpeed: 1,
    doomCounter: 0,
    cultistStrength: 10,
    resources: {
      funding: 5000,
      influence: 50
    },
    artifacts: [],
    investigators: startingInvestigators,
    missions: [],
    completedMissions: [],
    failedMissions: [],
    missionCooldowns: {},
    visibleNonCombatCount: 0,
    log: [],
    lastAutosaveDay: 0,
    lastDoomTickDay: 0,
    finalMissionPhase: 0,
    randomSeed: Date.now()
  };
}
```

### Time Progression System
- Base speed: 1 day per 2 seconds
- Fast speed: 1 day per 1 second
- Fastest speed: 1 day per 0.5 seconds
- Auto-pause triggers:
  - New mission appears
  - Mission expires in 2 days
  - Investigator becomes available
  - Infiltration complete
  - Non-combat mission complete
  - Investigator stress reaches 8+
  - Doom increases by 3+ in one event
  - Funding drops below £500
  - Investigator death or corruption
  - Day 50 reached (final mission appears)

### Mission Lifecycle

#### Combat Missions
1. **Generation**: Each eligible non-special template has 10% spawn chance per day
2. **Spawn Validation**: 
   - Max 3 combat missions visible
   - Check template requirements (day, doom)
   - Cooldown checked after completion only
3. **Assignment**: 
   - Validate investigators are Available
   - Set investigators to Infiltrating
   - Calculate infiltration time based on mode
4. **Infiltration Cancellation** (optional):
   - Return investigators to Available
   - Mission remains Available
   - Must restart infiltration from beginning
5. **Infiltration Complete**: 
   - Mission status → Ready
   - Set readyExpiresDay (currentDay + 7)
   - Investigators remain Infiltrating (awaiting launch)
6. **Combat Launch**: 
   - Pass data to combat system
   - Investigators → OnMission
7. **Resolution**: 
   - Apply CombatResult
   - Update investigator states
   - Apply rewards/penalties
   - Set cooldown: `missionCooldowns[templateId] = currentDay + template.cooldown`

#### Non-Combat Missions
1. **Generation**: 
   - Each eligible non-special template has 10% spawn chance per day
   - Max 2 visible at once
   - Only one can be InProgress at a time
   - Update visibleNonCombatCount when spawned
2. **Initiation**: 
   - Check influence requirement
   - Requires exactly 2 Available investigators
   - Investigators → OnMission
   - Mission → InProgress
   - Set progressCompleteDay
   - Set activeNonCombatMissionId
3. **Completion**: 
   - Auto-complete at end of progressCompleteDay
   - Funding reward: `Math.floor(baseFunding * (1 + influence * 0.01))`
   - Apply all rewards
   - Investigators → Available (or Recovering if stressed)
   - Clear activeNonCombatMissionId
   - Update visibleNonCombatCount
   - Set cooldown

#### Special Mission Logic
- **"desperate_measures"**: Spawns when funding < 1000 AND no combat missions available AND not on cooldown
- **Final Mission Chain**: 
  - Spawns on day 50 automatically
  - Completing phase 1 immediately spawns phase 2
  - Completing phase 2 immediately spawns phase 3
  - 30-day deadline applies to entire chain
  - Failing any phase adds 3 doom

### Mission Instance Generation
```typescript
function generateMissionInstance(template: MissionTemplate, currentDay: number): Mission {
  const location = template.possibleLocations[
    Math.floor(seededRandom() * template.possibleLocations.length)
  ];
  
  return {
    id: generateId(),
    templateId: template.id,
    name: template.name,
    type: template.type,
    description: generateDescription(template, location),
    location: location,
    appearsOnDay: currentDay,
    expiresOnDay: currentDay + GAME_CONSTANTS.MISSION_BASE_DURATION,
    infiltrationRequired: template.baseInfiltration,
    completionTime: template.completionDays,
    minimumInvestigators: template.type === MissionType.Combat ? 1 : 2,
    maximumInvestigators: template.type === MissionType.Combat ? 3 : 2,
    requiredInvestigators: template.type === MissionType.NonCombat ? 2 : undefined,
    difficultyRating: template.baseDifficulty,
    influenceRequirement: template.influenceRequirement,
    rewards: template.rewards,
    penalties: template.penalties,
    status: MissionStatus.Available,
    assignedInvestigators: []
  };
}
```

### Investigator Management

#### Status Transitions
- **Available → Infiltrating**: Assigned to combat mission infiltration
- **Infiltrating → Available**: Infiltration cancelled
- **Infiltrating → OnMission**: Combat launched from Ready state
- **Available → OnMission**: Non-combat started or combat launched immediately
- **OnMission → Recovering**: Mission complete with damage or high stress
- **OnMission → Available**: Mission complete, minimal damage, stress < 5
- **OnMission → Dead**: HP reaches 0
- **OnMission → Corrupted**: Corruption reaches 100
- **Recovering → Available**: Recovery period complete

#### Recovery Time Calculation
```typescript
function calculateRecoveryDays(investigator: Investigator): number {
  const hpLost = investigator.baseMaxHP - investigator.currentHP;
  const hpDays = Math.floor(hpLost / 10) * 2;
  const traumaDays = investigator.permanentTraumas.length * 3;
  const baseDays = 5;
  
  let totalDays = baseDays + hpDays + traumaDays;
  
  // Apply class modifier
  totalDays = investigator.class.modifyRecoveryTime(totalDays);
  
  // Apply artifact modifiers
  for (const artifact of gameState.artifacts) {
    for (const effect of artifact.effects) {
      if (effect instanceof RecoverySpeedEffect) {
        totalDays = Math.ceil(totalDays * effect.value);
      }
    }
  }
  
  return totalDays;
}
```

#### Stress System
- Base gain: `Math.max(1, difficultyRating - level + 1)` per mission
- Modified by class stressModifier and traumas
- Clamped to [0, 10]
- Decay: 
  ```typescript
  if (investigator.status === InvestigatorStatus.Available &&
      currentDay >= investigator.lastStressDecayDay + STRESS_DECAY_INTERVAL) {
    investigator.stress = Math.max(0, investigator.stress - 1);
    investigator.lastStressDecayDay = currentDay;
  }
  ```
- Breakdown at 10:
  - Lose 50% current HP
  - Gain random Trauma (randomly selected from TraumaType enum)
  - Reset stress to 5
  - Status → Recovering

#### Corruption System
- Permanent, never decreases
- Modified by class corruptionResistance
- Threshold effects tracked in `corruptionEffects[]`:
  - 25: "Minor Grafts" - Stress gain +1
  - 50: "Major Augmentation" - Max HP -5, add Mechanized trauma
  - 75: "Barely Human" - Max HP -10 total (cumulative), combat cards bonus handled by class
  - 100: "Lost to the Forge" - Status → Corrupted (removed from roster)

### Artifact Reward System
```typescript
function grantArtifactReward(tier: ArtifactRarity): Artifact {
  const eligible = ARTIFACT_TEMPLATES.filter(a => 
    a.rarity === tier && (a.canHaveDuplicates || a.ownedCount === 0)
  );
  
  if (eligible.length === 0) {
    // Fall back to default artifact
    const defaultArtifact = ARTIFACT_TEMPLATES.find(a => a.id === "circlet_of_default");
    defaultArtifact.ownedCount++;
    return defaultArtifact;
  }
  
  const selected = eligible[Math.floor(seededRandom() * eligible.length)];
  selected.ownedCount++;
  return selected;
}
```

### Resource Management

#### Funding
- Cannot go below 0
- All monetary values round down: `Math.floor(value)`
- Non-combat rewards: `Math.floor(baseFunding * (1 + influence * 0.01))`
- Funding multiplier artifacts apply after influence

#### Influence
- Clamped to [0, 100]
- Affects non-combat availability and rewards
- Permanent bonuses from artifacts

#### Doom Progression
```typescript
function updateDoom(gameState: GameState): void {
  const daysSinceTick = gameState.currentDay - gameState.lastDoomTickDay;
  if (daysSinceTick >= DOOM_TICK_DAYS) {
    let doomIncrease = DOOM_TICK_RATE;
    
    // Apply artifact reduction (GlobalDoomReductionEffect)
    for (const artifact of gameState.artifacts) {
      for (const effect of artifact.effects) {
        if (effect instanceof GlobalDoomReductionEffect) {
          doomIncrease = Math.max(0, doomIncrease + effect.value);
        }
      }
    }
    
    gameState.doomCounter = Math.min(10, gameState.doomCounter + doomIncrease);
    gameState.lastDoomTickDay = gameState.currentDay;
    
    if (gameState.doomCounter >= 10) {
      triggerGameOver("Doom has consumed the Empire");
    }
  }
}
```

### Final Mission Chain
```typescript
function checkFinalMissionChain(gameState: GameState): void {
  if (gameState.currentDay === 50 && gameState.finalMissionPhase === 0) {
    // Spawn final_mission_1
    gameState.finalMissionPhase = 1;
    gameState.finalMissionDeadlineDay = gameState.currentDay + 30;
    const mission = generateMissionInstance(
      MISSION_TEMPLATES.find(t => t.id === 'final_mission_1'),
      gameState.currentDay
    );
    gameState.missions.push(mission);
    gameState.isPaused = true; // Auto-pause
    addLog(LogType.MissionExpired, 
      "The final assault on the Forge-Tyrant begins! You have 30 days.", 
      LogSeverity.Critical);
  }
  
  // After completing phase 1, spawn phase 2, etc.
  // If deadline expires, game over
}
```

## Combat Interface Contract

```typescript
interface CombatInitData {
  mission: Mission;
  investigators: Investigator[];
  cultistStrength: number;
  difficultyRating: number;
  infiltrationBonus: number; // Careful: +2, Standard: 0, Rush: -1
  // Combat system reads gameState.artifacts directly for effects
}

// Campaign calls:
// launchCombat(initData: CombatInitData): Promise<CombatResult>
// Combat module returns result, campaign applies all effects
```

## Victory/Loss Conditions

### Loss Conditions
- Doom reaches 10
- All investigators dead/corrupted
- January 1, 1893 reached without victory (3 years)
- Final mission chain deadline expired (if started)

### Victory Condition
- Complete all 3 final mission phases

### Score Calculation
- Base: 1000 points
- -100 per doom point
- +50 per surviving investigator
- +25 per legendary artifact
- +100 if completed before 1892
- +200 if no investigators corrupted

## Save System

```typescript
interface SaveGame {
  version: string; // "1.0.0"
  timestamp: Date;
  gameState: GameState;
  checksum: string; // Simple hash of gameState JSON
}

// Autosave triggers:
// - Every 7 in-game days
// - Before launching combat
// - After major events
// - Manual save

// Save slots:
// - 3 manual slots
// - 1 autosave (rotating)
// - 1 checkpoint (before combat)
```

## State Update Order (per day tick)
1. Advance day counter
2. Check/apply doom tick (uses lastDoomTickDay)
3. Update investigator statuses (recovery, infiltration)
4. Check stress decay for each Available investigator
5. Process mission expirations (apply penalties if failed/expired)
6. Complete non-combat missions at end of progressCompleteDay
7. Check special mission spawn conditions (desperate_measures)
8. Check final mission spawn (day 50)
9. Check mission generation (10% per eligible template)
10. Apply artifact effects (via their apply() methods)
11. Check auto-pause conditions
12. Check victory/loss conditions
13. Update UI
14. Check autosave

## Technical Implementation Notes

### Required Utility Functions
```typescript
let rngState = gameState.randomSeed;

function seededRandom(): number {
  // Linear congruential generator
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
}

function generateId(): string {
  return `id_${Date.now()}_${Math.floor(seededRandom() * 10000)}`;
}

function generateDescription(template: MissionTemplate, location: string): string {
  // Generate flavor text based on template and location
}

function triggerGameOver(reason: string): void {
  // Handle game over state
}

function addLog(type: LogType, message: string, severity: LogSeverity): void {
  gameState.log.push({
    day: gameState.currentDay,
    type,
    message,
    severity
  });
}
```

### Validation Requirements
- All percentage modifiers stack multiplicatively
- All date calculations use day numbers, not Date objects
- All random selections use seeded RNG for save compatibility
- All investigator assignments validate status === Available
- All influence requirements check before allowing action
- Mission expirations happen at END of expiresOnDay
- Stress values clamped to [0, 10]
- Corruption values clamped to [0, 100]
- Influence values clamped to [0, 100]

### Name Generation
```typescript
class NameGenerator {
  private firstNames: string[]; // Pool of ~50 Victorian first names
  private lastNames: string[];  // Pool of ~50 Victorian surnames
  private nicknames: string[];  // Pool of ~30 nicknames
  
  generateName(): string {
    const first = this.firstNames[Math.floor(seededRandom() * this.firstNames.length)];
    const last = this.lastNames[Math.floor(seededRandom() * this.lastNames.length)];
    const useNickname = seededRandom() < 0.3; // 30% chance
    
    if (useNickname) {
      const nick = this.nicknames[Math.floor(seededRandom() * this.nicknames.length)];
      return `${first} "${nick}" ${last}`;
    }
    return `${first} ${last}`;
  }
}
```