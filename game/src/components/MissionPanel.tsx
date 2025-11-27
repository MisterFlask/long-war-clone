import { useState } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { MissionType, Agent } from '../types/game';
import { MISSION_CONFIGS } from '../types/game';
import { getAvailableAgents, calculateMissionSuccess } from '../services/gameLogic';
import { Tooltip, TooltipContent } from './Tooltip';
import './MissionPanel.css';

// Detailed mission type descriptions for tooltips
const MISSION_TOOLTIP_DATA: Record<MissionType, { title: string; description: string; details: string[]; warning?: string }> = {
  extraction_run: {
    title: 'Extraction Run',
    description: 'A coordinated operation to extract valuable materials from Hell\'s depths.',
    details: [
      'Difficulty modifier: +0 (standard)',
      'Reward: 5-15 Materiel on success',
      'Notice risk: +1 per district',
      'Requires 1-4 agents'
    ],
  },
  sabotage: {
    title: 'Sabotage',
    description: 'A high-risk operation to undermine Hell\'s authority in the district through destruction and chaos.',
    details: [
      'Difficulty modifier: +2 (challenging)',
      'Effect: -2 Infernal Authority on success',
      'Notice risk: +3 per district',
      'Requires 2-4 agents'
    ],
    warning: 'High risk operation with significant Notice increase!'
  },
  interdiction: {
    title: 'Interdiction',
    description: 'Intercept and disrupt demonic operations in the district.',
    details: [
      'Difficulty modifier: +1 (moderate)',
      'Effect: -1 Infernal Authority on success',
      'Notice risk: +2 per district',
      'Requires 1-3 agents'
    ],
  },
  smuggling: {
    title: 'Smuggling',
    description: 'Run contraband through Hell\'s trade routes for quick profit.',
    details: [
      'Difficulty modifier: +0 (standard)',
      'Reward: 50-150 Sovereigns on success',
      'Notice risk: +1 per district',
      'Requires 1-2 agents'
    ],
  },
  tribute_delivery: {
    title: 'Tribute Delivery',
    description: 'Pay tribute to local powers to reduce attention and smooth over tensions.',
    details: [
      'Difficulty modifier: -2 (easier)',
      'Effect: -3 Notice in target district',
      'Notice risk: +0 (safe operation)',
      'Requires 1-2 agents'
    ],
    warning: 'Costs 50 Sovereigns upfront'
  },
};

interface MissionCreatorProps {
  onClose: () => void;
}

function MissionCreator({ onClose }: MissionCreatorProps) {
  const { state } = useGame();
  const { createMission } = useGameActions();

  const [selectedType, setSelectedType] = useState<MissionType | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [prepWeeks, setPrepWeeks] = useState(2);

  const availableAgents = getAvailableAgents(state);
  const missionTypes = Object.values(MISSION_CONFIGS);
  const selectedConfig = selectedType ? MISSION_CONFIGS[selectedType] : null;

  const canCreate =
    selectedType &&
    selectedDistrict &&
    selectedAgents.length >= (selectedConfig?.minAgents || 1) &&
    selectedAgents.length <= (selectedConfig?.maxAgents || 4);

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
    } else {
      const maxAgents = selectedConfig?.maxAgents || 4;
      if (selectedAgents.length < maxAgents) {
        setSelectedAgents([...selectedAgents, agentId]);
      }
    }
  };

  const handleCreate = () => {
    if (selectedType && selectedDistrict && canCreate) {
      createMission(selectedType, selectedDistrict, selectedAgents, prepWeeks);
      onClose();
    }
  };

  // Calculate estimated success if we have all required selections
  let estimatedSuccess = 0;
  if (selectedType && selectedDistrict && selectedAgents.length > 0) {
    const mockMission = {
      id: 'preview',
      type: selectedType,
      districtId: selectedDistrict,
      assignedAgents: selectedAgents,
      preparationWeeks: prepWeeks,
      weeksRemaining: prepWeeks,
      status: 'preparing' as const,
    };
    estimatedSuccess = calculateMissionSuccess(state, mockMission);
  }

  return (
    <div className="mission-creator-overlay">
      <div className="mission-creator">
        <div className="creator-header">
          <Tooltip
            content={
              <TooltipContent
                title="Plan New Mission"
                description="Create a covert operation using your agents. Missions take time to prepare but offer powerful effects."
                details={[
                  'Select mission type, target district, and agents',
                  'More preparation time increases success chance',
                  'Agents are unavailable during missions',
                  'Failed missions may injure or corrupt agents'
                ]}
              />
            }
            position="bottom"
          >
            <h3>Plan New Mission</h3>
          </Tooltip>
          <Tooltip
            content={
              <TooltipContent
                title="Cancel"
                description="Close this window without creating a mission."
              />
            }
            position="left"
          >
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </Tooltip>
        </div>

        <div className="creator-section">
          <Tooltip
            content={
              <TooltipContent
                title="Mission Type"
                description="Choose the type of operation. Each type has different difficulty, rewards, and Notice risk."
                details={[
                  'Extraction Run: Gather materials (low risk)',
                  'Smuggling: Quick profit (low risk)',
                  'Interdiction: Reduce Authority (-1)',
                  'Sabotage: Major Authority reduction (-2, high risk)',
                  'Tribute Delivery: Reduce Notice (costs 50 Sov)'
                ]}
              />
            }
            position="right"
          >
            <h4>Mission Type</h4>
          </Tooltip>
          <div className="mission-type-grid">
            {missionTypes.map((config) => {
              const tooltipData = MISSION_TOOLTIP_DATA[config.type];
              return (
                <Tooltip
                  key={config.type}
                  content={
                    <TooltipContent
                      title={tooltipData.title}
                      description={tooltipData.description}
                      details={tooltipData.details}
                      cost={config.cost?.sovereigns ? `${config.cost.sovereigns} Sovereigns` : undefined}
                      warning={tooltipData.warning}
                    />
                  }
                  position="top"
                >
                  <button
                    className={`mission-type-button ${selectedType === config.type ? 'selected' : ''}`}
                    onClick={() => setSelectedType(config.type)}
                  >
                    <span className="type-name">{config.name}</span>
                    <span className="type-desc">{config.description}</span>
                    {config.cost?.sovereigns && (
                      <span className="type-cost">-{config.cost.sovereigns} Sov</span>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="creator-section">
          <Tooltip
            content={
              <TooltipContent
                title="Target District"
                description="Select where this mission will take place. District conditions affect mission difficulty."
                details={[
                  'Higher Authority = harder missions',
                  'Revealed districts show their stats',
                  'Consider Notice levels before operating',
                  'Some missions affect district stats on success'
                ]}
              />
            }
            position="right"
          >
            <h4>Target District</h4>
          </Tooltip>
          <div className="district-select-grid">
            {state.districts.map((district) => (
              <Tooltip
                key={district.id}
                content={
                  <TooltipContent
                    title={district.name}
                    description={district.description}
                    details={
                      district.revealed
                        ? [
                            `Authority: ${district.infernalAuthority}/10 (affects difficulty)`,
                            `Dominion: ${district.companyDominion}/10`,
                            `Notice: ${district.notice}/10`
                          ]
                        : ['Stats not revealed - use Espionage first']
                    }
                    warning={district.revealed && district.notice >= 7 ? 'High Notice - operations here are risky!' : undefined}
                  />
                }
                position="top"
              >
                <button
                  className={`district-select-button ${selectedDistrict === district.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDistrict(district.id)}
                >
                  <span className="dist-name">{district.name}</span>
                  {district.revealed && (
                    <span className="dist-stats">
                      Auth: {district.infernalAuthority} | Dom: {district.companyDominion}
                    </span>
                  )}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="creator-section">
          <Tooltip
            content={
              <TooltipContent
                title="Assign Agents"
                description="Select agents to execute this mission. More agents and higher levels increase success chance."
                details={[
                  'Each agent adds their level to success roll',
                  'Agent condition affects performance',
                  'Tired agents have reduced effectiveness',
                  'Injured agents cannot be assigned',
                  'Agents may gain corruption from missions'
                ]}
              />
            }
            position="right"
          >
            <h4>
              Assign Agents
              {selectedConfig && (
                <span className="agent-range">
                  ({selectedConfig.minAgents}-{selectedConfig.maxAgents} required)
                </span>
              )}
            </h4>
          </Tooltip>
          <div className="agent-select-grid">
            {availableAgents.map((agent) => (
              <Tooltip
                key={agent.id}
                content={
                  <TooltipContent
                    title={agent.name}
                    description={`Level ${agent.level} agent - ${agent.condition} condition.`}
                    details={[
                      `Level: ${agent.level} (adds to mission roll)`,
                      `Condition: ${agent.condition}`,
                      `Corruption: ${agent.corruption}/5`,
                      agent.condition === 'tired' ? 'Tired agents have -1 to rolls' : 'Fresh agents perform at full capacity'
                    ]}
                    warning={agent.corruption >= 4 ? 'High corruption - agent at risk!' : undefined}
                  />
                }
                position="top"
              >
                <button
                  className={`agent-select-button ${selectedAgents.includes(agent.id) ? 'selected' : ''} ${agent.condition}`}
                  onClick={() => toggleAgent(agent.id)}
                >
                  <span className="agent-sel-name">{agent.name}</span>
                  <span className="agent-sel-info">
                    Lvl {agent.level} | {agent.condition}
                  </span>
                </button>
              </Tooltip>
            ))}
            {availableAgents.length === 0 && (
              <Tooltip
                content={
                  <TooltipContent
                    title="No Agents Available"
                    description="All your agents are currently assigned to other missions or are incapacitated."
                    details={[
                      'Wait for current missions to complete',
                      'Injured agents cannot be assigned',
                      'Dead agents are permanently lost'
                    ]}
                  />
                }
                position="right"
              >
                <div className="no-agents">No agents available</div>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="creator-section">
          <Tooltip
            content={
              <TooltipContent
                title="Preparation Time"
                description="How many weeks agents will spend preparing before executing the mission."
                details={[
                  '1 week: -30% success chance (hasty)',
                  '2 weeks: Base success chance',
                  '3 weeks: +10% success chance',
                  '4 weeks: +20% success chance',
                  '5 weeks: +25% success chance (thorough)'
                ]}
                warning="Longer prep ties up agents but increases success!"
              />
            }
            position="right"
          >
            <h4>Preparation Time</h4>
          </Tooltip>
          <div className="prep-time-selector">
            {[1, 2, 3, 4, 5].map((weeks) => {
              const prepBonus = weeks === 1 ? -30 : weeks === 2 ? 0 : weeks === 3 ? 10 : weeks === 4 ? 20 : 25;
              return (
                <Tooltip
                  key={weeks}
                  content={
                    <TooltipContent
                      title={`${weeks} Week${weeks > 1 ? 's' : ''} Preparation`}
                      description={`Agents will prepare for ${weeks} week${weeks > 1 ? 's' : ''} before executing the mission.`}
                      details={[
                        `Success modifier: ${prepBonus >= 0 ? '+' : ''}${prepBonus}%`,
                        weeks === 1 ? 'Hasty - higher risk of failure' : weeks >= 4 ? 'Thorough - best chance of success' : 'Standard preparation'
                      ]}
                    />
                  }
                  position="top"
                >
                  <button
                    className={`prep-button ${prepWeeks === weeks ? 'selected' : ''}`}
                    onClick={() => setPrepWeeks(weeks)}
                  >
                    {weeks} week{weeks > 1 ? 's' : ''}
                  </button>
                </Tooltip>
              );
            })}
          </div>
          <small className="prep-hint">
            More preparation = higher success chance (-30% to +25%)
          </small>
        </div>

        {selectedType && selectedDistrict && selectedAgents.length > 0 && (
          <Tooltip
            content={
              <TooltipContent
                title="Mission Preview"
                description="Estimated outcome based on current selections."
                details={[
                  `Success chance: ${estimatedSuccess}%`,
                  `Notice risk: +${selectedConfig?.noticeRisk || 0} to district`,
                  'Actual results may vary based on random factors',
                  'Failed missions may injure agents'
                ]}
                warning={estimatedSuccess < 40 ? 'Low success chance - consider more agents or prep time!' : undefined}
              />
            }
            position="top"
          >
            <div className="success-preview">
              <span className="preview-label">Estimated Success:</span>
              <span className={`preview-value ${estimatedSuccess >= 70 ? 'high' : estimatedSuccess >= 40 ? 'medium' : 'low'}`}>
                {estimatedSuccess}%
              </span>
              <span className="preview-notice">
                Notice Risk: +{selectedConfig?.noticeRisk || 0}
              </span>
            </div>
          </Tooltip>
        )}

        <div className="creator-actions">
          <Tooltip
            content={
              <TooltipContent
                title="Cancel"
                description="Close this window without creating a mission. No resources will be spent."
              />
            }
            position="top"
          >
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </Tooltip>
          <Tooltip
            content={
              <TooltipContent
                title="Launch Mission"
                description={canCreate ? "Confirm and begin mission preparation. Assigned agents will be unavailable until the mission completes." : "Complete all selections to launch the mission."}
                details={
                  canCreate
                    ? [
                        'Agents will begin preparation immediately',
                        'Mission executes after prep time completes',
                        'Cannot cancel once started (can only abort during prep)'
                      ]
                    : [
                        !selectedType ? 'Select a mission type' : '',
                        !selectedDistrict ? 'Select a target district' : '',
                        selectedAgents.length < (selectedConfig?.minAgents || 1) ? `Need at least ${selectedConfig?.minAgents || 1} agent(s)` : ''
                      ].filter(Boolean)
                }
              />
            }
            position="top"
          >
            <button
              className="create-button"
              disabled={!canCreate}
              onClick={handleCreate}
            >
              Launch Mission
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export function MissionPanel() {
  const { state } = useGame();
  const { cancelMission } = useGameActions();
  const [showCreator, setShowCreator] = useState(false);

  const activeMissions = state.missions.filter(
    (m) => m.status === 'preparing' || m.status === 'in_progress'
  );

  return (
    <div className="mission-panel">
      <div className="mission-header">
        <Tooltip
          content={
            <TooltipContent
              title="Missions"
              description="Covert operations executed by your agents. Missions offer powerful effects but require agent commitment and carry risk."
              details={[
                'Missions require agent assignment and prep time',
                'Success depends on agent levels and preparation',
                'Failed missions may injure or corrupt agents',
                'Completed missions provide rewards or district effects'
              ]}
            />
          }
          position="bottom"
        >
          <h3>Missions</h3>
        </Tooltip>
        {state.phase === 'assignment' && (
          <Tooltip
            content={
              <TooltipContent
                title="Plan New Mission"
                description="Open the mission planner to create a new covert operation."
                details={[
                  'Select mission type and target district',
                  'Assign available agents',
                  'Choose preparation time',
                  'Only available during Assignment phase'
                ]}
              />
            }
            position="left"
          >
            <button
              className="new-mission-button"
              onClick={() => setShowCreator(true)}
            >
              + Plan Mission
            </button>
          </Tooltip>
        )}
      </div>

      {activeMissions.length === 0 ? (
        <Tooltip
          content={
            <TooltipContent
              title="No Active Missions"
              description="You don't have any missions in progress. Plan new missions to expand your operations."
              details={[
                'Click \"+ Plan Mission\" to create one',
                'Missions offer resources and strategic effects',
                'Use missions to reduce Authority or Notice',
                'Smuggling provides quick income'
              ]}
            />
          }
          position="right"
        >
          <div className="no-missions">
            <span>No active missions</span>
            <small>Plan missions to earn resources and sabotage Hell's authority</small>
          </div>
        </Tooltip>
      ) : (
        <div className="missions-list">
          {activeMissions.map((mission) => {
            const config = MISSION_CONFIGS[mission.type];
            const tooltipData = MISSION_TOOLTIP_DATA[mission.type];
            const district = state.districts.find(
              (d) => d.id === mission.districtId
            );
            const successChance = calculateMissionSuccess(state, mission);
            const agents = mission.assignedAgents
              .map((id) => state.agents.find((a) => a.id === id))
              .filter(Boolean) as Agent[];

            return (
              <Tooltip
                key={mission.id}
                content={
                  <TooltipContent
                    title={`${config.name} - ${district?.name}`}
                    description={tooltipData.description}
                    details={[
                      `Status: ${mission.status === 'preparing' ? `Preparing (${mission.weeksRemaining} week${mission.weeksRemaining > 1 ? 's' : ''} left)` : 'In Progress'}`,
                      `Success chance: ${successChance}%`,
                      `Agents: ${agents.map(a => a.name.split(' ')[0]).join(', ')}`,
                      `Notice risk: +${config.noticeRisk} on completion`
                    ]}
                  />
                }
                position="left"
              >
                <div className={`mission-item ${mission.status}`}>
                  <div className="mission-info">
                    <span className="mission-name">{config.name}</span>
                    <span className="mission-district">{district?.name}</span>
                  </div>
                  <div className="mission-details">
                    <div className="mission-agents">
                      {agents.map((a) => (
                        <Tooltip
                          key={a.id}
                          content={
                            <TooltipContent
                              title={a.name}
                              description={`Level ${a.level} agent assigned to this mission.`}
                              details={[
                                `Condition: ${a.condition}`,
                                `Corruption: ${a.corruption}/5`,
                                'Will be unavailable until mission completes'
                              ]}
                            />
                          }
                          position="top"
                        >
                          <span className="mission-agent">
                            {a.name.split(' ')[0]}
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                    <div className="mission-stats">
                      <span className="mission-status">
                        {mission.status === 'preparing'
                          ? `${mission.weeksRemaining} week${mission.weeksRemaining > 1 ? 's' : ''} prep`
                          : 'In Progress'}
                      </span>
                      <span className={`mission-chance ${successChance >= 70 ? 'high' : successChance >= 40 ? 'medium' : 'low'}`}>
                        {successChance}% success
                      </span>
                    </div>
                  </div>
                  {mission.status === 'preparing' && state.phase === 'assignment' && (
                    <Tooltip
                      content={
                        <TooltipContent
                          title="Cancel Mission"
                          description="Abort this mission and free up the assigned agents."
                          details={[
                            'Agents return to available pool',
                            'Any upfront costs are not refunded',
                            'Only possible during preparation phase'
                          ]}
                        />
                      }
                      position="left"
                    >
                      <button
                        className="cancel-mission-button"
                        onClick={() => cancelMission(mission.id)}
                      >
                        &times;
                      </button>
                    </Tooltip>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}

      {showCreator && <MissionCreator onClose={() => setShowCreator(false)} />}
    </div>
  );
}
