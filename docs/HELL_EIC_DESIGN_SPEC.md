# Hell EIC: Complete Minimum Viable Ruleset

## Overview

Hell EIC is a turn-based strategic management game where you run a branch of the East Infernal Company—a chartered trading operation in Hell. You must balance profit extraction against the attention of demonic authorities, managing workers, agents, and territory while meeting quarterly profit targets.

**Core Loop:** Assign workers → Assign squads to missions → Resolve missions → Advance time → Handle events → Repeat

---

## 1. Resources

Three currencies govern all operations:

| Resource | Symbol | Purpose | Starting Amount |
|----------|--------|---------|-----------------|
| **Sovereigns** | § | Money. Pays for hiring, tribute, and purchases. | 100 |
| **Materiel** | ⚙ | Goods, equipment, supplies. Required for missions and upkeep. | 30 |
| **Influence** | ◈ | Favors and leverage. Spent on diplomacy and Notice reduction. | 10 |

### Resource Interactions

- **Materiel → Sovereigns:** Trading job converts at rate based on Dominion
- **Sovereigns → Materiel:** Can purchase Materiel at 3§ per 1⚙ (represents black market markup)
- **Sovereigns → Influence:** Can purchase Influence at 10§ per 1◈ (expensive!)
- **Influence → Notice Reduction:** 2◈ reduces Notice by 1 in any district (instant action, no worker needed)

---

## 2. The Map

### Districts

The game uses **4 Districts** (scalable to 3-5 for difficulty):

| District | Flavor | Starting Authority | Special Trait |
|----------|--------|-------------------|---------------|
| **The Sulfur Docks** | Trade hub, imports/exports | 5 | Trading jobs yield +1§ |
| **Char Market** | Black market bazaar | 6 | Smuggling missions +10% success |
| **The Ashfields** | Industrial extraction zone | 7 | Extraction jobs yield +1⚙ |
| **Brimstone Heights** | Administrative district | 8 | Espionage reveals +1 mission option |

### District Stats

Each district tracks three values:

| Stat | Range | Effect |
|------|-------|--------|
| **Infernal Authority** | 0-10 | Hell's control. Affects mission difficulty. At 0, Baron is vulnerable. |
| **Company Dominion** | 0-10 | Your presence. Affects income and available jobs. |
| **Notice** | 0-10 | Attention on you. Triggers escalating consequences. |

### Starting Setup

1. Player chooses **one starting district**
2. That district: Dominion 3, Notice 2
3. All districts keep their starting Authority
4. Other districts: Dominion 0, Notice 0

### District Relationships

```
Dominion Benefits:
- Dominion 1-2: Can assign workers (basic jobs only)
- Dominion 3-4: Unlock Trading job, +1 max workers assignable
- Dominion 5-6: Unlock Espionage job, missions generate +1 intel
- Dominion 7-8: Can run 2 missions simultaneously in district
- Dominion 9-10: Reduced Notice gain from all sources (-1)

Authority Effects:
- Authority 8-10: +2 difficulty to all missions
- Authority 5-7: Normal difficulty
- Authority 3-4: -1 difficulty to all missions
- Authority 1-2: -2 difficulty, Baron visibly weakened
- Authority 0: Baron vulnerable to Coup mission
```

---

## 3. Time System

### The Week (One Turn)

Each week follows this **strict phase order:**

```
PHASE 1: UPKEEP
  - Pay 1⚙ per district with Dominion > 0
  - If cannot pay: lose 1 Dominion in unpaid district(s)
  - Advance agent recovery timers
  - Reduce all mission opportunity timers by 1
  - Remove expired mission opportunities

PHASE 2: ASSIGNMENT
  - Assign workers to district jobs (each worker → one job)
  - Assign squads to missions (or continue existing preparations)
  - Set preparation time for new missions

PHASE 3: RESOLUTION
  - Resolve all jobs (generate resources, intel, etc.)
  - Resolve any missions that complete this week
  - Apply mission outcomes (rewards, injuries, Notice)

PHASE 4: NOTICE CHECK
  - Check each district's Notice level
  - Trigger any Notice events (see Notice Escalation)

PHASE 5: EVENTS (Optional)
  - Roll d10. On 1-2, draw random event (see Events table)
  - Events add narrative chaos and opportunity

PHASE 6: ADVANCE
  - Week counter +1
  - If Week 12, trigger Quarter End
```

### The Quarter (12 Weeks)

At the end of each quarter:

```
1. PROFIT CALCULATION
   Total Sovereigns earned this quarter
   - Total Sovereigns spent this quarter
   - (Total upkeep paid × 2) as "operating costs"
   = Quarterly Profit

2. TARGET CHECK
   Year 1: Target = 50§ per quarter
   Year 2: Target = 75§ per quarter
   Year 3: Target = 100§ per quarter
   Year 4+: Target = 125§ per quarter

3. CHARTER STRAIN
   If Profit < Target: gain 1 Charter Strain
   If Profit < 0: gain 2 Charter Strain
   If Profit ≥ Target × 2: remove 1 Charter Strain (minimum 0)

4. GAME OVER CHECK
   Charter Strain ≥ 3 = Game Over (charter revoked)
```

---

## 4. Workers

### Worker Pool

- **Starting Workers:** 8
- **Maximum Workers:** 20
- **Hiring Cost:** 15§ + 5⚙ per new worker
- **Weekly Worker Upkeep:** None (they're paid from job revenue)

### Jobs

Workers are assigned to districts. Available jobs depend on Dominion level:

| Job | Requires | Effect | Notes |
|-----|----------|--------|-------|
| **Extraction** | Dominion 1+ | Gain ⚙ = Dominion level | Core income |
| **Trading** | Dominion 3+ | Convert ⚙ to § at rate (Dominion ÷ 2, round up) | e.g., Dom 5 = 3§ per ⚙ |
| **Espionage** | Dominion 5+ | Generate 1 Mission Opportunity; reveal district stats | See Mission Generation |
| **Discretion** | Dominion 1+ | Reduce Notice by 1 | Minimum Notice = 0 |
| **Expansion** | Dominion 1+ | +1 Dominion, +1 Notice | Cannot exceed Dominion 10 |

### Job Limits Per District

| Dominion | Max Workers Assignable |
|----------|----------------------|
| 1-2 | 2 workers |
| 3-4 | 3 workers |
| 5-6 | 4 workers |
| 7-8 | 5 workers |
| 9-10 | 6 workers |

### Trading Conversion Table

| Dominion | § per ⚙ converted |
|----------|-------------------|
| 3-4 | 2§ |
| 5-6 | 3§ |
| 7-8 | 4§ |
| 9-10 | 5§ |

---

## 5. Agents & Squads

### Agents

Agents are your mission specialists—distinct from workers.

| Attribute | Range | Meaning |
|-----------|-------|---------|
| **Level** | 1-5 | General competence. Adds to mission success. |
| **Condition** | Fresh/Tired/Injured/Dead | Deployment status |
| **Corruption** | 0-5 | Accumulated Hell-taint |
| **Name** | Generated | For identification/flavor |

### Starting Roster

Begin with **5 agents:**
- 2 agents at Level 2
- 3 agents at Level 1
- All start Fresh, Corruption 0

### Hiring New Agents

| Level | Hiring Cost | Availability |
|-------|-------------|--------------|
| Level 1 | 20§ + 5⚙ | Always available |
| Level 2 | 40§ + 10⚙ | 50% chance per week |
| Level 3 | 80§ + 20⚙ | 25% chance per week |
| Level 4+ | Cannot hire | Must train up |

### Agent Advancement

Agents gain **XP** from missions:
- Flawless: 3 XP
- Success: 2 XP
- Pyrrhic: 1 XP
- Failure/Disaster: 0 XP

| Current Level | XP to Next Level |
|---------------|------------------|
| 1 → 2 | 5 XP |
| 2 → 3 | 10 XP |
| 3 → 4 | 20 XP |
| 4 → 5 | 40 XP |

### Squads

A **Squad** is 1-4 agents assigned to a single mission.

```
Squad Level Sum = sum of all agent levels in squad
Example: Level 2 + Level 3 + Level 1 = Squad Level Sum 6
```

**Squad Composition Rules:**
- Minimum 1 agent, maximum 4 agents
- All agents must be "Fresh" to deploy
- Tired agents CAN deploy but impose -10 penalty to roll
- Injured agents CANNOT deploy

---

## 6. Missions

### Mission Opportunities

Espionage jobs generate Mission Opportunities. Each opportunity has:

| Attribute | Description |
|-----------|-------------|
| **Type** | Category of mission |
| **District** | Where it takes place |
| **Difficulty** | Base 1-10, usually = Authority + modifiers |
| **Timer** | Weeks until opportunity expires (typically 3-6) |
| **Reward** | What success grants |
| **Notice Risk** | Notice added on non-Flawless success |

### Mission Types (Core Set)

| Type | Base Difficulty Mod | Reward | Notice Risk | Description |
|------|---------------------|--------|-------------|-------------|
| **Extraction Run** | +0 | 8-15⚙ | +1 | Raid a supply cache |
| **Sabotage** | +2 | Authority -2 | +3 | Destroy infrastructure |
| **Interdiction** | +1 | Authority -1 | +2 | Disrupt operations |
| **Smuggling** | +0 | 20-40§ | +1 | Move contraband |
| **Tribute Delivery** | -2 | Notice -3 | +0 | Pay off officials |
| **Intelligence Theft** | +1 | Reveal all district stats + 2 opportunities | +2 | Steal documents |

### Mission Generation (Espionage Results)

When Espionage job completes, roll d6:

| Roll | Result |
|------|--------|
| 1-2 | Extraction Run opportunity (Timer: 4 weeks) |
| 3 | Smuggling opportunity (Timer: 3 weeks) |
| 4 | Interdiction opportunity (Timer: 5 weeks) |
| 5 | Intelligence Theft opportunity (Timer: 4 weeks) |
| 6 | Player's choice: Sabotage OR Tribute Delivery (Timer: 6 weeks) |

**Reward Calculation:**
```
Extraction Run: ⚙ = 5 + (District Authority) + d6
Smuggling: § = 15 + (District Authority × 2) + d10
Sabotage/Interdiction: Fixed Authority reduction
Intelligence/Tribute: Fixed effects
```

### Mission Difficulty Calculation

```
Final Difficulty = District Authority
                 + Mission Type Modifier
                 + Notice Modifier (+1 if Notice 4-6, +2 if Notice 7+)

Capped at minimum 1, maximum 12
```

---

## 7. Preparation & Resolution

### Preparation Time

When assigning a squad to a mission, choose Preparation Time:

| Prep Weeks | Roll Modifier | Strategic Use |
|------------|---------------|---------------|
| 1 week | -30 | Desperate rush, expiring missions |
| 2 weeks | -15 | Risky but sometimes necessary |
| 3 weeks | +0 | Baseline, balanced approach |
| 4 weeks | +15 | Cautious, for harder missions |
| 5+ weeks | +25 | Maximum safety, if time allows |

**Preparation Tracking:**
- Squad is "committed" once assigned
- Cannot reassign agents during prep
- Can abort mission (agents return Fresh, opportunity lost)

### Mission Resolution

**Calculate Success Chance:**

```
Base:                           50
+ Squad Level Sum × 5:          (e.g., sum 6 = +30)
+ Preparation Modifier:         (see above)
- Difficulty × 8:               (e.g., diff 7 = -56)
+ Tired Agent Penalty:          (-10 per Tired agent)
+ Corruption Bonus (combat):    (+5 per agent with Corruption 3+)
= Success Target %

CAPPED: Minimum 5%, Maximum 95%
```

**Example Calculation:**
```
Squad: Level 2, Level 3, Level 2 (sum = 7)
Prep: 3 weeks (+0)
Difficulty: 6
One agent Tired

50 + 35 + 0 - 48 - 10 = 27% success chance
```

### Outcome Table

Roll d100 against Success Target:

| Roll vs Target | Outcome | Reward | Notice | Agent Effects |
|----------------|---------|--------|--------|---------------|
| Beat by 30+ | **FLAWLESS** | 100% | +0 | All stay Fresh |
| Beat by 1-29 | **SUCCESS** | 100% | +Risk | 1 random → Tired |
| Miss by 1-20 | **PYRRHIC** | 50% | +Risk+1 | 1 random → Injured |
| Miss by 21-40 | **FAILURE** | 0% | +Risk+2 | 1-2 random → Injured |
| Miss by 41+ | **DISASTER** | 0% | +Risk+3 | Death roll for each agent |

### Disaster Death Roll

On DISASTER, roll d6 for **each agent** on the mission:

| Roll | Agent Level 1-2 | Agent Level 3+ |
|------|-----------------|----------------|
| 1 | **DEAD** | Injured |
| 2 | Injured | Injured |
| 3-5 | Tired | Tired |
| 6 | Fresh (lucky!) | Fresh |

---

## 8. Agent Conditions

### Condition States

| Condition | Can Deploy? | Roll Modifier | Recovery |
|-----------|-------------|---------------|----------|
| **Fresh** | Yes | None | — |
| **Tired** | Yes (risky) | -10 to mission | 1 week rest |
| **Injured** | No | N/A | 3 weeks rest |
| **Dead** | No | N/A | Permanent |

### Recovery Rules

- Agents recover automatically if **not deployed**
- Recovery timer decreases by 1 each week during Upkeep phase
- Tired → Fresh after 1 week of rest
- Injured → Fresh after 3 weeks of rest
- Deploying a Tired agent resets their rest timer

### Medical Intervention (Optional Spending)

- Pay 10§ + 5⚙: Reduce an Injured agent's recovery by 1 week
- Pay 20§: Cure Tired status immediately
- Cannot resurrect Dead agents

---

## 9. Corruption

### Corruption Accumulation

After **each mission** (regardless of outcome), every participating agent gains **+1 Corruption**.

### Corruption Effects

| Corruption | Effects |
|------------|---------|
| 0 | Normal |
| 1-2 | Cosmetic only (nightmares, pallor, unsettling aura) |
| 3-4 | -5 to Smuggling/Tribute missions; +5 to Sabotage/Interdiction |
| 5 | **Breaking Point** — immediate roll required |

### Breaking Point Resolution

When an agent reaches Corruption 5, immediately roll d6:

| Roll | Result |
|------|--------|
| 1 | **Transformed** — Agent becomes a demon, attacks party. Lost + 1 other random agent Injured. |
| 2 | **Defects** — Agent disappears. Lost. +2 Notice in their last mission's district. |
| 3-4 | **Stabilizes (Scarred)** — Agent remains but: cannot gain more Corruption, permanently Corruption 5, -1 Level (min 1) |
| 5-6 | **Stabilizes (Hardened)** — Agent remains at Corruption 5, cannot gain more, no other penalty |

### Corruption Management

**Retirement:** Before Breaking Point, you can voluntarily retire an agent:
- Agent is removed from roster
- No negative consequences
- You receive: 5§ × their Level (severance/selling their contracts)

**Purification (Expensive):**
- Cost: 20◈ (Influence)
- Effect: Reduce one agent's Corruption by 2
- Limit: Once per agent per quarter

---

## 10. Notice Escalation

### Per-District Notice

| Notice | Status | Effect |
|--------|--------|--------|
| 0-3 | **Unnoticed** | Business as usual |
| 4-6 | **Attention** | +1 Difficulty to all missions in district |
| 7-8 | **Scrutiny** | Roll on Scrutiny Event table each week |
| 9 | **Baron's Interest** | Tribute demand (see below) |
| 10 | **Retaliation** | Immediate punishment (see below) |

### Scrutiny Events (Notice 7-8)

Roll d6 at end of each week while Notice is 7-8:

| Roll | Event | Effect |
|------|-------|--------|
| 1-2 | **Patrol** | Next mission in district: +2 Difficulty |
| 3-4 | **Shakedown** | Pay 10§ or lose 1 Dominion |
| 5 | **Inspection** | Lose 5⚙ (confiscated goods) |
| 6 | **Informant** | Choose: -1 Dominion OR +1 Notice |

### Baron's Interest (Notice 9)

When Notice reaches 9:
- Baron demands **Tribute** = Your Dominion × 10§
- You have **2 weeks** to pay
- If paid: Notice reduced to 6
- If not paid: Notice immediately becomes 10 (Retaliation)

### Retaliation (Notice 10)

Immediate effects:
1. Lose 2 Dominion in the district
2. All workers in district must flee (unusable for 2 weeks) OR roll d6 per worker: 1-2 = worker killed
3. One random agent in district (if any) becomes Injured
4. Notice resets to 6

### Prince Notice (Global Threat)

Track **Total Notice** = sum of Notice across all districts.

| Trigger | Consequence |
|---------|-------------|
| Total Notice ≥ 25 | **Prince Warning** (first time only) |
| Any district hits 10 twice in same year | **Prince Warning** |
| Second Prince Warning | **GAME OVER** |

**Prince Warning Effects:**
- All districts: +2 Authority (Hell tightens grip)
- All districts: +1 Notice
- Narrative: Emissary delivers formal warning
- One-time only. Second trigger = game ends.

---

## 11. Victory Conditions

### Standard Victory: "The Quiet Empire"

Achieve ALL of the following simultaneously:
- **Dominion 7+** in at least **3 districts**
- **Notice ≤ 6** in ALL districts
- **Charter Strain = 0**
- Must maintain for **4 consecutive weeks** to confirm victory

This represents establishing a profitable, sustainable, low-profile operation.

### Alternative Victory: "The Coup"

Depose a Baron and take their place:

**Prerequisites:**
- Target district Authority = 0
- Your Dominion in target district = 8+
- At least one agent at Level 4+
- Total Notice across all districts < 20

**The Coup Mission:**
- Difficulty: 10 (fixed)
- Required squad: 3-4 agents, minimum total Level 10
- Preparation: Minimum 4 weeks
- Reward: Victory (but see consequences)
- Notice Risk: +5 to target district, +2 to all others

**Coup Outcomes:**
- Flawless/Success: You win. Baron deposed. You control the district openly.
- Pyrrhic: Baron deposed but you're exposed. Victory, but Prince immediately aware. Narrative ending varies.
- Failure: Baron survives. All agents on mission killed. +10 Authority in district.
- Disaster: Baron counter-attacks. Lose ALL Dominion in district. 2 random agents killed. Game continues but crippled.

---

## 12. Random Events (Optional Chaos)

During Phase 5, roll d10. On 1-2, draw from Event Table:

### Event Table (d20)

| Roll | Event | Effect |
|------|-------|--------|
| 1 | **Market Boom** | Trading yields double § this week |
| 2 | **Supply Shortage** | Materiel purchases cost double for 2 weeks |
| 3 | **Demonic Festival** | All Notice naturally decreases by 1 |
| 4 | **Crackdown** | Random district: +2 Authority |
| 5 | **Rival Company** | Random district: -1 Dominion (minimum 0) |
| 6 | **Bribable Official** | Pay 15◈ for -2 Notice in any district |
| 7 | **Skilled Recruit** | Level 2 agent available for hire at Level 1 price |
| 8 | **Equipment Cache** | Gain 10⚙ |
| 9 | **Informant Network** | Next Espionage generates 2 opportunities |
| 10 | **Hell Quake** | Random district: -1 Authority, +1 Notice |
| 11 | **Soul Shipment** | Immediate Smuggling opportunity (Timer: 2 weeks, Reward: 50§) |
| 12 | **Plague of Whispers** | All agents gain +1 Corruption |
| 13 | **Investment Opportunity** | Pay 50§ now, receive 80§ in 4 weeks |
| 14 | **Baron Distracted** | One district: -2 Difficulty for 2 weeks |
| 15 | **Inspector General** | Highest Notice district: +2 Notice |
| 16 | **Trade Delegation** | Gain 15◈ |
| 17 | **Saboteur Caught** | Pay 20§ or +3 Notice in random district |
| 18 | **Hellfire Accident** | Random district: -1 Authority, workers there cannot work for 1 week |
| 19 | **Double Agent** | Next mission: auto-success OR auto-failure (your choice, decided before roll) |
| 20 | **The Collector Calls** | Must pay 30§ as "Company dues" or gain 1 Charter Strain |

---

## 13. UI/Implementation Specifications

### Main Game View

```
┌─────────────────────────────────────────────────────────────────┐
│  WEEK 7 / Q1                          [§ 145] [⚙ 28] [◈ 8]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ SULFUR DOCKS│ │ CHAR MARKET │ │ ASHFIELDS   │ │ BRIMSTONE │ │
│  │ Auth: 5     │ │ Auth: 6     │ │ Auth: 7     │ │ Auth: 8   │ │
│  │ Dom:  3     │ │ Dom:  0     │ │ Dom:  0     │ │ Dom:  0   │ │
│  │ Notice: 2   │ │ Notice: 0   │ │ Notice: 0   │ │ Notice: 0 │ │
│  │ [████░░░░░░]│ │ [░░░░░░░░░░]│ │ [░░░░░░░░░░]│ │ [░░░░░░░░]│ │
│  │ Workers: 3  │ │ Workers: 0  │ │ Workers: 0  │ │ Workers: 0│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  AGENTS                           │  MISSIONS                   │
│  ┌────────────────────────────┐   │  ┌────────────────────────┐ │
│  │ Marcus (Lv2) [Fresh] C:0   │   │  │ Extraction Run         │ │
│  │ Vera (Lv2) [Fresh] C:1     │   │  │ Sulfur Docks | Diff: 5 │ │
│  │ Korr (Lv1) [Tired:1w] C:0  │   │  │ Timer: 3 weeks         │ │
│  │ Ashlyn (Lv1) [Fresh] C:0   │   │  │ Reward: 12⚙ | Risk: +1 │ │
│  │ Dren (Lv1) [Fresh] C:0     │   │  │ [ASSIGN SQUAD]         │ │
│  └────────────────────────────┘   │  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  [END WEEK] [VIEW FINANCES] [HIRE] [SETTINGS]                   │
│  Charter Strain: 0/3   |   Next Quarter: Week 12                │
└─────────────────────────────────────────────────────────────────┘
```

### Required Screens

1. **Map View** — District overview with stats
2. **Worker Assignment** — Drag workers to jobs
3. **Agent Roster** — View/manage agents
4. **Mission Board** — Available opportunities
5. **Mission Assignment** — Select squad + prep time
6. **Mission Resolution** — Animated roll + outcome
7. **Quarter Report** — Financial summary
8. **Event Popup** — Random event display
9. **Game Over** — Victory/defeat screen

### Data Structures (Conceptual)

```typescript
interface GameState {
  week: number;
  quarter: number;
  year: number;

  resources: {
    sovereigns: number;
    materiel: number;
    influence: number;
  };

  charterStrain: number;
  princeWarnings: number;

  districts: District[];
  workers: Worker[];
  agents: Agent[];
  missions: MissionOpportunity[];
  activeMissions: ActiveMission[];
}

interface District {
  id: string;
  name: string;
  authority: number;      // 0-10
  dominion: number;       // 0-10
  notice: number;         // 0-10
  specialTrait: string;
  baronTributeTimer?: number;  // weeks until tribute due
  workerLockout?: number;      // weeks until workers can return
}

interface Worker {
  id: string;
  assignment?: {
    districtId: string;
    job: JobType;
  };
}

interface Agent {
  id: string;
  name: string;
  level: number;          // 1-5
  xp: number;
  condition: 'fresh' | 'tired' | 'injured' | 'dead';
  recoveryWeeks: number;  // weeks until fresh
  corruption: number;     // 0-5
}

interface MissionOpportunity {
  id: string;
  type: MissionType;
  districtId: string;
  difficulty: number;
  timer: number;          // weeks until expires
  reward: Reward;
  noticeRisk: number;
}

interface ActiveMission {
  opportunityId: string;
  squadAgentIds: string[];
  prepWeeks: number;      // total prep time chosen
  prepRemaining: number;  // weeks until mission launches
}

type JobType = 'extraction' | 'trading' | 'espionage' | 'discretion' | 'expansion';
type MissionType = 'extraction_run' | 'sabotage' | 'interdiction' | 'smuggling' | 'tribute' | 'intelligence' | 'coup';
```

---

## 14. Balance Levers

For tuning difficulty:

| Parameter | Easy | Normal | Hard |
|-----------|------|--------|------|
| Starting Sovereigns | 150 | 100 | 75 |
| Starting Workers | 10 | 8 | 6 |
| Starting Agents | 6 | 5 | 4 |
| Q1 Profit Target | 30 | 50 | 75 |
| Notice Escalation Thresholds | 5/8/10 | 4/7/9 | 3/6/8 |
| Prince Notice Threshold | 30 | 25 | 20 |
| Mission Base Success | 55 | 50 | 45 |
| Agent Hiring Availability | +25% | base | -25% |

---

## 15. Future Expansion Hooks

These systems are **not in MVP** but the design accommodates them:

1. **Equipment/Gear:** Agents can carry items that modify rolls
2. **Agent Specializations:** Classes like Assassin, Diplomat, Saboteur
3. **Baron Politics:** Relationships between Barons, playing them against each other
4. **Contracts System:** Long-term deals with factions for steady income
5. **Detailed Tactical Layer:** Resolve missions as turn-based combat
6. **Narrative Events:** Branching storylines, character arcs
7. **Multiple Company Branches:** Compete or cooperate with other player-controlled branches
8. **The Deckbuilder Layer:** When ready, missions resolve using card-based combat

---

## Appendix A: Quick Reference Card

### Turn Order
1. Upkeep (pay ⚙, advance timers)
2. Assignment (workers, squads)
3. Resolution (jobs, missions)
4. Notice Check
5. Events (d10: 1-2 triggers event)
6. Advance week

### Key Formulas

**Success Chance:**
`50 + (LevelSum × 5) + PrepMod - (Diff × 8) - (TiredCount × 10)`

**Trading Income:**
`⚙ converted × (Dominion ÷ 2, round up) = §`

**Extraction Income:**
`Workers on Extraction × Dominion = ⚙`

### Notice Thresholds
- 4+: +1 mission difficulty
- 7+: Weekly scrutiny events
- 9: Baron demands tribute
- 10: Retaliation

### Victory
- Standard: Dom 7+ in 3 districts, all Notice ≤6, Strain 0
- Coup: Authority 0, Dom 8+, complete Coup mission
