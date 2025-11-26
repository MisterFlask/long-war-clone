// Hell EIC Game Logic

import type {
  GameState,
  Agent,
  District,
  Mission,
  WorkerAssignment,
  MissionType,
  WorkerJob,
  AgentCondition,
  GamePhase,
  Resources,
} from '../types/game';

import {
  PROFIT_TARGETS,
  XP_THRESHOLDS,
  MISSION_CONFIGS,
  JOB_CONFIGS,
  DISTRICT_NAMES,
  AGENT_FIRST_NAMES,
  AGENT_LAST_NAMES,
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

  return {
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

// Create a new mission
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

  // Difficulty from district authority + mission type
  const difficulty = district.infernalAuthority + config.difficultyMod;

  const successChance = 50 + agentLevels * 5 + prepMod - difficulty * 8;
  return clamp(successChance, 5, 95);
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

  if (success) {
    switch (mission.type) {
      case 'extraction_run': {
        const materielGain = 5 + Math.floor(Math.random() * 11); // 5-15
        newState = modifyResources(newState, { materiel: materielGain });
        newState = addMessage(
          newState,
          `Extraction Run SUCCESS in ${district.name}: +${materielGain} Materiel`
        );
        break;
      }
      case 'sabotage': {
        newDistricts[districtIndex] = {
          ...district,
          infernalAuthority: Math.max(0, district.infernalAuthority - 2),
        };
        newState = addMessage(
          newState,
          `Sabotage SUCCESS in ${district.name}: Authority reduced by 2`
        );
        break;
      }
      case 'interdiction': {
        newDistricts[districtIndex] = {
          ...district,
          infernalAuthority: Math.max(0, district.infernalAuthority - 1),
        };
        newState = addMessage(
          newState,
          `Interdiction SUCCESS in ${district.name}: Authority reduced by 1`
        );
        break;
      }
      case 'smuggling': {
        const sovereignsGain = 50 + Math.floor(Math.random() * 101); // 50-150
        newState = modifyResources(newState, { sovereigns: sovereignsGain });
        newState = addMessage(
          newState,
          `Smuggling SUCCESS in ${district.name}: +${sovereignsGain} Sovereigns`
        );
        break;
      }
      case 'tribute_delivery': {
        newDistricts[districtIndex] = {
          ...district,
          notice: Math.max(0, district.notice - 3),
        };
        newState = addMessage(
          newState,
          `Tribute Delivery SUCCESS in ${district.name}: Notice reduced by 3`
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
      // For now, just advance the week
      newState = {
        ...newState,
        currentWeek: newState.currentWeek + 1,
      };
      newState = checkQuarterEnd(newState);
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
