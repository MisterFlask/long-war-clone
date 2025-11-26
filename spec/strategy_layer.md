# Hell EIC: Complete Strategy Layer Specification v1.0

## Overview

You are a regional manager for the **Hellfire East India Company**, a chartered trading company operating in the infernal realms. Your job: extract profit from Hell while avoiding attention from the demonic nobility. Fail to turn a profit? The Company revokes your charter. Draw too much attention? The Barons—or worse, a Prince—crush your operation entirely.

---

## Resources

Three currencies. Track nothing else.

| Resource | Description | Starting Amount | Maximum |
|----------|-------------|-----------------|---------|
| **Sovereigns** | Money. Gold extracted from Hell's vaults, laundered through mortal markets. | 500 | 99,999 |
| **Materiel** | Goods, equipment, infernal supplies. Needed for missions and upkeep. | 30 | 999 |
| **Influence** | Favors, blackmail, leverage. Spent on diplomacy and reducing Notice. | 10 | 100 |

---

## The Map

### Districts

The game uses **4 districts** (can scale to 3-5 for difficulty settings).

Each district tracks three stats:

| Stat | Range | Description |
|------|-------|-------------|
| **Infernal Authority** | 0-10 | How firmly Hell controls this district. Higher = harder missions. |
| **Company Dominion** | 0-10 | Your establishment level. Higher = more income, more Notice. |
| **Notice** | 0-10 | How much attention you're drawing from infernal powers. |

### Starting Setup

**Player's Home District:**
- Dominion: 3
- Authority: 5
- Notice: 2

**Other Districts** (generated randomly within ranges):
- Dominion: 0
- Authority: 6-8 (roll 1d3+5)
- Notice: 0

### District Names

Use evocative Hell-themed names:
- **Char Market** - Trade hub, easier extraction
- **The Brass Warrens** - Dense, industrial, high Authority
- **Ashfall Reach** - Remote, lower Authority but fewer opportunities
- **The Gilded Pit** - Wealthy but heavily watched
- **Sulphur Downs** - Working-class Hell, moderate everything

---

## Time System

### Week Structure

The game runs in **Weeks**. Each week, in order:

1. **Assignment Phase**: Assign workers to jobs, assign squads to missions
2. **Resolution Phase**: Resolve missions that launch this week
3. **Advancement Phase**: Advance all timers (preparation, recovery, mission expiration)
4. **Upkeep Phase**: Pay district upkeep costs
5. **Notice Phase**: Check Notice escalation in each district
6. **Event Phase**: Roll for random events (optional)

### Quarters and Profit

Every **12 weeks = 1 Quarter**. At quarter end:

1. Calculate **Quarterly Profit**:
   ```
   Profit = (Sovereigns earned this quarter) - (Total upkeep paid in Sovereigns)
   ```

2. Compare against **Profit Target**:

| Year | Quarter | Profit Target |
|------|---------|---------------|
| 1 | Q1 | 200 |
| 1 | Q2 | 300 |
| 1 | Q3 | 400 |
| 1 | Q4 | 500 |
| 2 | Q1 | 600 |
| 2 | Q2 | 750 |
| 2 | Q3 | 900 |
| 2 | Q4 | 1100 |
| 3+ | Each | Previous + 200 |

3. **Charter Strain**:
   - If Profit < Target: Gain **1 Charter Strain**
   - If Profit >= Target × 2: Remove **1 Charter Strain** (minimum 0)
   - **3 Charter Strain = Game Over** (Company revokes charter)

---

## Workers

### Starting Workers

Begin with **8 workers**. Maximum roster: **15 workers**.

Workers are fungible—no individual stats. Each worker can be assigned to one job per week.

### Jobs

Each worker assigned to a district performs one job:

| Job | Effect | Requirements |
|-----|--------|--------------|
| **Extraction** | Gain Materiel = your Dominion in that district | Dominion ≥ 1 |
| **Trading** | Convert Materiel → Sovereigns (see rates) | Dominion ≥ 1, requires Materiel |
| **Espionage** | Generate intel; reveal district stats; may discover opportunities | None |
| **Discretion** | Reduce Notice by 1 (minimum 0) | None |
| **Expansion** | +1 Dominion (but +1 Notice too) | Costs 5 Materiel |

### Trading Rates

Materiel-to-Sovereigns conversion depends on your Dominion:

| Dominion | Sovereigns per Materiel |
|----------|------------------------|
| 1-2 | 8 |
| 3-4 | 10 |
| 5-6 | 12 |
| 7-8 | 15 |
| 9-10 | 20 |

Each Trading worker converts up to **3 Materiel** per week.

### Upkeep

**Weekly upkeep per district with Dominion > 0:**
- **1 Materiel** per district
- **If Dominion ≥ 5:** Also costs **5 Sovereigns** per district

**Failure to pay:**
- Can't pay Materiel: Lose 1 Dominion in that district
- Can't pay Sovereigns: Lose 1 Dominion in that district
- Choose which districts suffer if you can only partially pay

### Worker Acquisition

New workers can be hired:
- **Cost:** 50 Sovereigns + 5 Influence per worker
- **Limit:** Maximum 15 workers total
- **Timing:** Can hire at start of any week

---

## Agents (Squad System)

### Starting Agents

Begin with **5 agents**:
- 2 agents at Level 1
- 2 agents at Level 2
- 1 agent at Level 2

Maximum roster: **10 agents**.

### Agent Stats

| Stat | Range | Description |
|------|-------|-------------|
| **Level** | 1-5 | General competence. Affects mission success. |
| **Condition** | Fresh/Tired/Injured/Dead | Current health state. |
| **Corruption** | 0-5 | Accumulated Hell-taint from missions. |

### Conditions

| Condition | Effect | Recovery |
|-----------|--------|----------|
| **Fresh** | Can deploy normally | — |
| **Tired** | -10 to mission rolls if deployed | 1 week rest (auto-recovers) |
| **Injured** | Cannot deploy | 3 weeks rest |
| **Dead** | Permanently removed | — |

**Important:** Tired agents auto-recover to Fresh if not deployed. Injured agents require 3 consecutive weeks without deployment.

### Squad Composition

- **Minimum squad size:** 1 agent
- **Maximum squad size:** 4 agents
- All agents in a squad must be Fresh or Tired (no Injured)
- Agents on a mission cannot be reassigned until mission resolves

### Agent Recruitment

New agents can be recruited:
- **Cost:** 100 Sovereigns + 10 Influence
- **Starting Level:** 1
- **Starting Condition:** Fresh
- **Starting Corruption:** 0
- **Limit:** Maximum 10 agents total

### Agent Leveling

Agents gain **1 XP** per mission completed (success or failure). XP thresholds:

| Level | Total XP Required |
|-------|------------------|
| 1 | 0 |
| 2 | 3 |
| 3 | 7 |
| 4 | 12 |
| 5 | 20 |

---

## Missions

### Mission Opportunities

Missions are generated through **Espionage** and **Random Events**.

**Espionage Generation:**
- Each worker assigned to Espionage has a **40% chance** to discover a mission opportunity
- The mission will be in that district
- First Espionage action in a district also reveals its exact Authority level

**Mission Attributes:**

| Attribute | Description |
|-----------|-------------|
| **Type** | What you're doing (see Mission Types) |
| **District** | Where the mission takes place |
| **Difficulty** | 1-10, usually equals district's Infernal Authority ± type modifier |
| **Timer** | Weeks until opportunity expires (typically 3-6 weeks) |
| **Reward** | What you get on success |
| **Notice Risk** | Base Notice gain on completion |

### Mission Types

| Type | Difficulty Mod | Reward | Notice Risk | Notes |
|------|---------------|--------|-------------|-------|
| **Extraction Run** | +0 | 8-15 Materiel | Low (+1) | Bread and butter income |
| **Sabotage** | +2 | -2 Authority in district | High (+3) | Opens up a district |
| **Interdiction** | +1 | -1 Authority in district | Medium (+2) | Smaller-scale sabotage |
| **Smuggling** | +0 | 80-150 Sovereigns | Low (+1) | Pure profit play |
| **Tribute Delivery** | -2 | -3 Notice in district | None (0) | Costs 50 Sovereigns to attempt |

**Reward Scaling:**
- Extraction Run: 5 + (Difficulty) Materiel
- Smuggling: 50 + (Difficulty × 10) Sovereigns

### Preparation Time

When assigning a squad to a mission, choose **Preparation Time** in weeks:

| Preparation | Success Modifier |
|-------------|-----------------|
| 1 week | -30 |
| 2 weeks | -15 |
| 3 weeks | +0 (baseline) |
| 4 weeks | +15 |
| 5+ weeks | +25 |

**Constraints:**
- Mission must launch before its Timer expires
- Preparation time cannot exceed remaining Timer
- You can abort a mission during preparation (agents return Fresh/Tired, mission stays available)

---

## Mission Resolution

### Success Calculation

```
Base = 50
+ (Sum of squad agent Levels × 5)
+ Preparation Modifier
- (Mission Difficulty × 8)
+ Gear Modifier (if any)
= Success %

Minimum: 5%
Maximum: 95%
```

**Example:**
- 2 agents (Level 2, Level 3) = +25
- 3 weeks preparation = +0
- Difficulty 6 = -48
- Base 50 + 25 + 0 - 48 = **27% success chance**

### Resolution Table

Roll d100. Compare to Success %:

| Roll Result | Outcome | Reward | Notice | Agent Effects |
|------------|---------|--------|--------|---------------|
| Beat by 30+ | **Flawless** | Full | +0 | None |
| Beat by 1-29 | **Success** | Full | +Risk | One random agent → Tired |
| Miss by 1-20 | **Pyrrhic** | Half (round down) | +Risk +1 | One random agent → Injured |
| Miss by 21-40 | **Failure** | None | +Risk +2 | 1-2 random agents → Injured |
| Miss by 41+ | **Disaster** | None | +Risk +3 | Death check (see below) |

### Disaster Death Check

On Disaster, roll d6 for **each agent** on the mission:

| Roll | Result |
|------|--------|
| 1-2 | Injured |
| 3-5 | Tired |
| 6 | Dead (or Injured if Level 3+) |

Level 3+ agents survive on a 6, becoming Injured instead.

### Post-Mission Corruption

After **every mission** (regardless of outcome), each participating agent gains **+1 Corruption**.

---

## Corruption System

| Corruption Level | Effects |
|-----------------|---------|
| 0-2 | **Cosmetic only.** Nightmares, pallor, unsettling aura. |
| 3-4 | **Tainted.** -5 to Smuggling/Tribute missions. +5 to Sabotage/Interdiction missions. |
| 5 | **Breaking Point.** Immediate roll required. |

### Breaking Point Resolution

When an agent reaches Corruption 5, immediately roll d6:

| Roll | Result |
|------|--------|
| 1-2 | **Lost.** Agent defects or transforms. Remove from roster. |
| 3-6 | **Stabilized.** Agent remains. Cannot gain more Corruption (capped at 5). Permanent -10 to all mission rolls. |

### Retirement

You may **retire** an agent at any time before they reach Breaking Point:
- Agent is removed from roster
- No negative consequences
- Cannot be undone
- Does not refund recruitment cost

---

## Notice Escalation

Notice is tracked **per district**.

### Weekly Notice Check

At end of each week, check each district's Notice level:

| Notice | Effect |
|--------|--------|
| 0-3 | **Quiet.** No effect. |
| 4-6 | **Attention.** +1 Difficulty to all missions in this district. |
| 7-8 | **Scrutiny.** Roll on Scrutiny Event table. |
| 9 | **Baron's Interest.** Baron demands Tribute (see below). |
| 10 | **Retaliation.** Baron attacks (see below). |

### Scrutiny Events (Notice 7-8)

Roll d6:

| Roll | Event |
|------|-------|
| 1-2 | **Patrol:** +1 Notice |
| 3-4 | **Shakedown:** Pay 30 Sovereigns or +2 Notice |
| 5-6 | **Inspection:** Lose 2 Materiel or +1 Authority in district |

### Baron's Interest (Notice 9)

The Baron demands tribute:
- **Cost:** Dominion × 10 Sovereigns
- **Deadline:** End of next week
- **If paid:** Notice drops to 6
- **If refused:** Immediately triggers Retaliation

### Retaliation (Notice 10)

The Baron sends forces:
1. Lose **2 Dominion** in that district (minimum 0)
2. All workers in that district must flee: Cannot assign workers there for 2 weeks
3. Any ongoing missions in that district: Automatically Fail
4. Notice resets to **6** (not 0—they're still watching)

---

## Prince Notice (Global Threat)

Track **total Notice across all districts**.

### Prince Attention Triggers

A Prince takes notice if:
- Total Notice across all districts exceeds **25**, OR
- Any single district hits Notice 10 **twice in one year**

### First Warning

When a Prince first notices you:
- Emissary delivers warning
- **All districts:** +2 Authority
- You have been seen

### Second Trigger = Game Over

If Prince attention is triggered a second time:
- Charter immediately revoked
- Game Over

---

## Influence System

Influence is spent on special actions:

| Action | Influence Cost | Effect |
|--------|---------------|--------|
| **Bribe Officials** | 5 | -1 Notice in one district |
| **Secure Tip** | 3 | Reveal one mission opportunity (random type, your choice of district) |
| **Call in Favor** | 8 | One agent recovers from Injured to Fresh immediately |
| **Grease Palms** | 10 | Reduce Baron's Tribute demand by 50% (one time) |
| **False Trail** | 15 | Reset one district's Notice to 3 (if currently 6 or below) |
| **Hire Worker** | 5 | (Plus 50 Sovereigns) |
| **Recruit Agent** | 10 | (Plus 100 Sovereigns) |

### Gaining Influence

- **Successful Smuggling missions:** +2 Influence
- **Paying Baron's Tribute:** +1 Influence (they appreciate compliance)
- **Completing Sabotage/Interdiction:** +1 Influence (demonstrates capability)
- **Purchase:** 30 Sovereigns = 1 Influence (maximum 3 per quarter)

---

## Events System

At the end of each week, roll d20:

| Roll | Event |
|------|-------|
| 1-10 | **Nothing.** Quiet week. |
| 11-12 | **Market Fluctuation:** Trading rates +3 or -3 (flip coin) for this week's trades only. |
| 13-14 | **Infernal Storm:** No missions can launch this week. |
| 15-16 | **Opportunity:** Free mission opportunity revealed in random district. |
| 17 | **Crackdown:** +1 Notice in district with highest Dominion. |
| 18 | **Windfall:** Gain 20 Sovereigns. |
| 19 | **Agent Rumor:** Learn one piece of intel about a random district (Authority level or current missions). |
| 20 | **Company Bonus:** If profitable last quarter, gain 50 Sovereigns and 1 worker. |

Events can be disabled for a more deterministic experience.

---

## Gear System (Simplified)

Agents can be equipped with gear that provides mission bonuses.

### Available Gear

| Item | Cost | Effect | Notes |
|------|------|--------|-------|
| **Standard Kit** | Free | +0 | Default equipment |
| **Quality Tools** | 30 Sov + 3 Mat | +5 to mission rolls | One per agent |
| **Infernal Compass** | 50 Sov + 5 Mat | +10 to Extraction/Smuggling | One per agent |
| **Brimstone Charges** | 40 Sov + 8 Mat | +10 to Sabotage/Interdiction | Consumed on use |
| **Hellsteel Armor** | 100 Sov + 10 Mat | Death check: 6 = Injured (not Dead) for Levels 1-2 | One per agent |

### Gear Rules

- Each agent can have **one permanent gear item** (Quality Tools, Infernal Compass, or Hellsteel Armor)
- Brimstone Charges are **consumable**: used up whether mission succeeds or fails
- Gear is lost if agent dies or is Lost to corruption
- Gear transfers if agent retires (salvage: recover 50% Sovereigns cost)

---

## Victory and Loss Conditions

### Loss Conditions

1. **Charter Strain reaches 3:** Company revokes charter
2. **Prince attention triggered twice:** Operation erased
3. **All agents dead:** Cannot continue missions
4. **All Dominion lost:** No economic base

### Victory Conditions

**Standard Victory:**
Achieve **all three** simultaneously:
- Dominion 7+ in **3 different districts**
- All districts at Notice **6 or below**
- Charter Strain at **0**

This represents carving out a sustainable, profitable, quiet corner of Hell.

**Hard Victory (Optional):**
- Reduce one Baron's home district to **Authority 0**
- Complete special "Coup" mission (appears when Authority hits 0)
- Risk: Other Barons become very interested (+3 Authority in all other districts)
- Reward: Control the district completely (no Authority mechanic, +5 Dominion cap)

---

## Starting Game State

```typescript
interface GameState {
  // Time
  currentWeek: number;           // Starts at 1
  currentQuarter: number;        // Starts at 1
  currentYear: number;           // Starts at 1

  // Resources
  sovereigns: number;            // Starts at 500
  materiel: number;              // Starts at 30
  influence: number;             // Starts at 10

  // Tracking
  charterStrain: number;         // Starts at 0
  quarterlyEarnings: number;     // Tracks Sovereigns earned this quarter
  quarterlyUpkeep: number;       // Tracks upkeep paid this quarter
  princeWarnings: number;        // Starts at 0, game over at 2

  // Units
  workers: number;               // Starts at 8
  agents: Agent[];               // Starts with 5 (see above)

  // Map
  districts: District[];         // 4 districts

  // Missions
  availableMissions: Mission[];  // Discovered opportunities
  activeMissions: ActiveMission[]; // Missions with assigned squads

  // Events
  eventsEnabled: boolean;        // Toggle for random events
}

interface District {
  id: string;
  name: string;
  authority: number;             // 0-10
  dominion: number;              // 0-10
  notice: number;                // 0-10
  isHomeDistrict: boolean;
  baronTributeDue: boolean;      // Is Baron demanding payment?
  tributeDeadline: number;       // Week number
  workersAssigned: WorkerAssignment[];
  retaliationCooldown: number;   // Weeks until workers can return
}

interface Agent {
  id: string;
  name: string;
  level: number;                 // 1-5
  xp: number;                    // Current XP
  condition: 'Fresh' | 'Tired' | 'Injured' | 'Dead';
  corruption: number;            // 0-5
  isStabilized: boolean;         // True if survived Breaking Point
  recoveryWeeksRemaining: number;// Countdown for Injured
  gear: GearItem | null;
}

interface Mission {
  id: string;
  type: MissionType;
  district: string;              // District ID
  difficulty: number;            // 1-10
  expiresWeek: number;           // Week number when it expires
  reward: MissionReward;
  noticeRisk: number;            // Base Notice gain
  tributeCost?: number;          // For Tribute Delivery missions
}

interface ActiveMission {
  mission: Mission;
  assignedAgents: string[];      // Agent IDs
  preparationWeeks: number;      // Total prep time chosen
  preparationRemaining: number;  // Weeks left
  launchWeek: number;            // When it will resolve
}

type MissionType = 'extraction' | 'sabotage' | 'interdiction' | 'smuggling' | 'tribute';

interface MissionReward {
  materiel?: number;
  sovereigns?: number;
  authorityReduction?: number;
  noticeReduction?: number;
  influenceGain?: number;
}

type GearItem = 'quality_tools' | 'infernal_compass' | 'hellsteel_armor';

interface WorkerAssignment {
  job: 'extraction' | 'trading' | 'espionage' | 'discretion' | 'expansion';
  count: number;
}
```

---

## Game Constants

```typescript
const CONSTANTS = {
  // Starting values
  STARTING_SOVEREIGNS: 500,
  STARTING_MATERIEL: 30,
  STARTING_INFLUENCE: 10,
  STARTING_WORKERS: 8,
  STARTING_AGENTS: 5,

  // Limits
  MAX_WORKERS: 15,
  MAX_AGENTS: 10,
  MAX_SOVEREIGNS: 99999,
  MAX_MATERIEL: 999,
  MAX_INFLUENCE: 100,
  MAX_DOMINION: 10,
  MAX_AUTHORITY: 10,
  MAX_NOTICE: 10,

  // Mission success formula
  MISSION_BASE_SUCCESS: 50,
  LEVEL_SUCCESS_BONUS: 5,        // Per agent level
  DIFFICULTY_PENALTY: 8,         // Per difficulty point
  MIN_SUCCESS_CHANCE: 5,
  MAX_SUCCESS_CHANCE: 95,

  // Preparation modifiers
  PREP_1_WEEK: -30,
  PREP_2_WEEKS: -15,
  PREP_3_WEEKS: 0,
  PREP_4_WEEKS: 15,
  PREP_5_PLUS_WEEKS: 25,

  // Trading rates by Dominion
  TRADE_RATE: {
    1: 8, 2: 8,
    3: 10, 4: 10,
    5: 12, 6: 12,
    7: 15, 8: 15,
    9: 20, 10: 20
  },
  TRADE_MATERIEL_PER_WORKER: 3,

  // Costs
  WORKER_HIRE_SOVEREIGNS: 50,
  WORKER_HIRE_INFLUENCE: 5,
  AGENT_RECRUIT_SOVEREIGNS: 100,
  AGENT_RECRUIT_INFLUENCE: 10,
  EXPANSION_MATERIEL_COST: 5,

  // Upkeep
  DOMINION_MATERIEL_UPKEEP: 1,   // Per district with Dominion > 0
  HIGH_DOMINION_SOVEREIGN_UPKEEP: 5, // Per district with Dominion >= 5
  HIGH_DOMINION_THRESHOLD: 5,

  // Recovery times
  TIRED_RECOVERY_WEEKS: 1,
  INJURED_RECOVERY_WEEKS: 3,

  // Notice thresholds
  NOTICE_ATTENTION_THRESHOLD: 4,
  NOTICE_SCRUTINY_THRESHOLD: 7,
  NOTICE_BARON_THRESHOLD: 9,
  NOTICE_RETALIATION_THRESHOLD: 10,

  // Retaliation effects
  RETALIATION_DOMINION_LOSS: 2,
  RETALIATION_COOLDOWN_WEEKS: 2,
  RETALIATION_NOTICE_RESET: 6,

  // Prince attention
  PRINCE_NOTICE_TOTAL_THRESHOLD: 25,
  PRINCE_WARNINGS_GAME_OVER: 2,
  PRINCE_WARNING_AUTHORITY_INCREASE: 2,

  // Charter
  CHARTER_STRAIN_GAME_OVER: 3,
  WEEKS_PER_QUARTER: 12,

  // Espionage
  ESPIONAGE_DISCOVERY_CHANCE: 40, // Percent

  // Corruption
  CORRUPTION_TAINTED_THRESHOLD: 3,
  CORRUPTION_BREAKING_THRESHOLD: 5,
  TAINTED_PENALTY: -5,
  TAINTED_BONUS: 5,
  STABILIZED_PENALTY: -10,

  // XP thresholds
  XP_LEVEL_2: 3,
  XP_LEVEL_3: 7,
  XP_LEVEL_4: 12,
  XP_LEVEL_5: 20,

  // Victory conditions
  VICTORY_DOMINION_REQUIRED: 7,
  VICTORY_DISTRICTS_REQUIRED: 3,
  VICTORY_MAX_NOTICE: 6,

  // Mission defaults
  DEFAULT_MISSION_TIMER: 4,      // Weeks until expiration
  TRIBUTE_MISSION_COST: 50,
};
```

---

## Week Resolution Order

Detailed step-by-step for each week:

### 1. Assignment Phase

```
1.1. Player assigns workers to districts and jobs
     - Validate: workers <= total available
     - Validate: district not under retaliation cooldown
     - Validate: Expansion requires 5 Materiel

1.2. Player assigns agents to missions
     - Validate: agents are Fresh or Tired
     - Validate: agents not already on active mission
     - Validate: squad size 1-4
     - Set preparation time (must not exceed mission timer)
```

### 2. Resolution Phase

```
2.1. For each active mission where preparationRemaining == 0:
     a. Calculate success chance
     b. Roll d100
     c. Determine outcome
     d. Apply rewards (if any)
     e. Apply Notice gain
     f. Apply agent effects (Tired, Injured, Death check)
     g. Apply Corruption (+1 per agent)
     h. Return agents to roster (with new condition)
     i. Grant XP (+1 per agent)
     j. Check for level-ups
```

### 3. Advancement Phase

```
3.1. For each active mission:
     - preparationRemaining -= 1

3.2. For each agent:
     - If Tired and not deployed: condition = Fresh
     - If Injured: recoveryWeeksRemaining -= 1
       - If recoveryWeeksRemaining == 0: condition = Fresh

3.3. For each mission opportunity:
     - Check if currentWeek >= expiresWeek
     - If expired: remove from available missions

3.4. For each district:
     - If retaliationCooldown > 0: retaliationCooldown -= 1
```

### 4. Upkeep Phase

```
4.1. Calculate total Materiel upkeep:
     - 1 Materiel per district with Dominion > 0

4.2. Calculate total Sovereign upkeep:
     - 5 Sovereigns per district with Dominion >= 5

4.3. Deduct upkeep:
     - If can't pay Materiel: player chooses which district loses 1 Dominion
     - If can't pay Sovereigns: player chooses which district loses 1 Dominion

4.4. Track quarterly expenses:
     - quarterlyUpkeep += Sovereigns spent on upkeep
```

### 5. Notice Phase

```
5.1. For each district:
     a. If Notice 7-8: Roll Scrutiny Event
     b. If Notice 9 and baronTributeDue == false:
        - Set baronTributeDue = true
        - Set tributeDeadline = currentWeek + 1
     c. If baronTributeDue and currentWeek > tributeDeadline:
        - Trigger Retaliation
     d. If Notice 10:
        - Trigger Retaliation immediately

5.2. Calculate total Notice across all districts
     - If total > 25: Trigger Prince attention

5.3. Check if any district hit Notice 10 twice this year
     - If yes: Trigger Prince attention
```

### 6. Event Phase (if enabled)

```
6.1. Roll d20
6.2. Apply event effect
```

### 7. Job Effects Phase

```
7.1. Extraction:
     - For each worker: gain Materiel = district Dominion

7.2. Trading:
     - For each worker: convert up to 3 Materiel to Sovereigns
     - Use Dominion-based rate
     - Track as quarterly earnings

7.3. Espionage:
     - For each worker: 40% chance to discover mission
     - First espionage reveals district Authority

7.4. Discretion:
     - For each worker: district Notice -= 1 (min 0)

7.5. Expansion:
     - For each worker: district Dominion += 1, Notice += 1
     - Already deducted 5 Materiel in Assignment phase
```

### 8. End of Week

```
8.1. currentWeek += 1

8.2. If currentWeek % 12 == 0 (end of quarter):
     a. Calculate profit = quarterlyEarnings - quarterlyUpkeep
     b. Get profit target for this quarter
     c. If profit < target: charterStrain += 1
     d. If profit >= target * 2 and charterStrain > 0: charterStrain -= 1
     e. Reset quarterlyEarnings and quarterlyUpkeep to 0
     f. Advance quarter (and year if Q4)

8.3. Check win/loss conditions
```

---

## Example Turn

**Week 5, Year 1**

Starting state:
- Sovereigns: 420
- Materiel: 25
- Workers: 8
- Home district "Char Market": Dominion 4, Authority 5, Notice 3

**Assignment:**
- 3 workers → Extraction in Char Market (will gain 12 Materiel)
- 2 workers → Trading in Char Market (will convert 6 Materiel → 60 Sovereigns)
- 1 worker → Discretion in Char Market (will reduce Notice by 1)
- 1 worker → Espionage in Brass Warrens (scouting new territory)
- 1 worker → Expansion in Char Market (costs 5 Materiel, gains 1 Dominion, 1 Notice)

**Mission:**
- 2 agents (Level 2, Level 2) assigned to Smuggling mission
- Difficulty 5, chosen 3 weeks prep (baseline)
- Success: 50 + (4×5) + 0 - (5×8) = 50 + 20 - 40 = 30%

**Resolution:**
(No missions launch this week—prep just started)

**Upkeep:**
- 1 Materiel (Char Market has Dominion > 0)
- No Sovereign upkeep (Dominion < 5, but Expansion will push it to 5 next week)

**End State:**
- Sovereigns: 480 (420 + 60 from trading)
- Materiel: 31 (25 + 12 extraction - 6 trading - 1 upkeep + 5 expansion cost was already paid)
- Actually: 25 - 5 (expansion) = 20, then +12 (extraction) = 32, then -6 (trading) = 26, then -1 (upkeep) = 25
- Char Market: Dominion 5, Notice 3 (3 - 1 discretion + 1 expansion = 3)

---

## Balance Notes

### Economy Target

A stable operation should generate roughly:
- **Income:** 150-200 Sovereigns/week from 2 trading workers in a Dominion 5+ district
- **Expenses:** 5-10 Sovereigns/week upkeep, 50-100 Sovereigns on missions
- **Net:** 50-100 Sovereigns/week profit

This puts quarterly profit at 600-1200, meeting Year 1 targets with some buffer.

### Difficulty Scaling

To adjust difficulty:
- **Easier:** Start with 600 Sovereigns, lower profit targets by 20%
- **Harder:** Start with 400 Sovereigns, raise profit targets by 20%
- **Longer game:** Add 5th district, victory requires 4 districts at Dominion 7+

### Key Tensions

The design creates these decision points:
1. **Push for profit vs. manage Notice** - More Dominion = more income but more attention
2. **Rush missions vs. prepare** - Speed vs. safety tradeoff
3. **Risk best agents vs. protect them** - Higher levels = better odds but more to lose
4. **Expand vs. consolidate** - New districts vs. strengthening existing
5. **Pay tribute vs. resist** - Short-term cost vs. long-term consequence

---

## Future Expansion Hooks

These systems are intentionally stubbed for future development:

1. **Agent Classes:** Different agent types with unique abilities
2. **Baron Politics:** Named Barons with personalities and inter-Baron conflicts
3. **Contracts:** Special missions from Company HQ with bonus rewards
4. **Tactical Combat:** Card-based resolution for critical missions
5. **Equipment Crafting:** Convert Materiel into specialized gear
6. **Events Expansion:** More events, event chains, narrative flavor
7. **Multiple Companies:** Rival companies competing in same Hell region

---

## Implementation Priority

For MVP, implement in this order:

1. **Core loop:** Week advancement, basic UI
2. **Resources:** Three currencies, tracking
3. **Districts:** 4 districts with three stats each
4. **Workers:** Assignment to jobs, job effects
5. **Basic missions:** Extraction and Smuggling only
6. **Agents:** Conditions, simple deployment
7. **Mission resolution:** Dice roll, outcomes
8. **Notice:** Basic escalation, Retaliation
9. **Quarter/Profit:** Charter Strain mechanic
10. **Victory check:** Win condition

Add in subsequent passes:
- All mission types
- Preparation system
- Corruption
- Influence actions
- Events
- Gear
- Baron tribute
- Prince attention
