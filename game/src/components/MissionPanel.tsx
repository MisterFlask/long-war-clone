import { useState } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { MissionOpportunity, Agent } from '../types/game';
import { MISSION_CONFIGS } from '../types/game';
import { getAvailableAgents, calculateOpportunitySuccess, calculateMissionSuccess } from '../services/gameLogic';
import { Tooltip, TooltipContent } from './Tooltip';
import './MissionPanel.css';

// Detailed mission type descriptions for tooltips
const MISSION_TOOLTIP_DATA: Record<string, { title: string; description: string; details: string[]; warning?: string }> = {
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

interface MissionAcceptorProps {
  opportunity: MissionOpportunity;
  onClose: () => void;
}

function MissionAcceptor({ opportunity, onClose }: MissionAcceptorProps) {
  const { state } = useGame();
  const { acceptMission } = useGameActions();

  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [prepWeeks, setPrepWeeks] = useState(2);

  const availableAgents = getAvailableAgents(state);
  const config = MISSION_CONFIGS[opportunity.type];
  const district = state.districts.find((d) => d.id === opportunity.districtId);

  const canAccept =
    selectedAgents.length >= config.minAgents &&
    selectedAgents.length <= config.maxAgents;

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
    } else {
      if (selectedAgents.length < config.maxAgents) {
        setSelectedAgents([...selectedAgents, agentId]);
      }
    }
  };

  const handleAccept = () => {
    if (canAccept) {
      acceptMission(opportunity.id, selectedAgents, prepWeeks);
      onClose();
    }
  };

  // Calculate estimated success
  const estimatedSuccess = selectedAgents.length > 0
    ? calculateOpportunitySuccess(state, opportunity, selectedAgents, prepWeeks)
    : 0;

  // Format difficulty and reward modifiers
  const difficultyLabel = opportunity.difficultyBonus > 0
    ? `+${opportunity.difficultyBonus} (harder)`
    : opportunity.difficultyBonus < 0
    ? `${opportunity.difficultyBonus} (easier)`
    : '±0 (standard)';

  const rewardLabel = opportunity.rewardBonus >= 1.2
    ? `${Math.round(opportunity.rewardBonus * 100)}% (bonus!)`
    : opportunity.rewardBonus <= 0.9
    ? `${Math.round(opportunity.rewardBonus * 100)}% (reduced)`
    : `${Math.round(opportunity.rewardBonus * 100)}%`;

  return (
    <div className="mission-creator-overlay">
      <div className="mission-creator">
        <div className="creator-header">
          <Tooltip
            content={
              <TooltipContent
                title={`Accept: ${config.name}`}
                description={opportunity.flavorText}
                details={[
                  `Target: ${district?.name || 'Unknown'}`,
                  `Expires in: ${opportunity.weeksUntilExpiry} week${opportunity.weeksUntilExpiry > 1 ? 's' : ''}`,
                  `Difficulty modifier: ${difficultyLabel}`,
                  `Reward modifier: ${rewardLabel}`
                ]}
              />
            }
            position="bottom"
          >
            <h3>Accept Mission</h3>
          </Tooltip>
          <Tooltip
            content={
              <TooltipContent
                title="Cancel"
                description="Close this window without accepting the mission."
              />
            }
            position="left"
          >
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </Tooltip>
        </div>

        <div className="opportunity-details">
          <div className="opp-header">
            <span className="opp-type">{config.name}</span>
            <span className="opp-district">in {district?.name}</span>
          </div>
          <p className="opp-flavor">{opportunity.flavorText}</p>
          <div className="opp-modifiers">
            <span className={`opp-difficulty ${opportunity.difficultyBonus > 0 ? 'hard' : opportunity.difficultyBonus < 0 ? 'easy' : ''}`}>
              Difficulty: {difficultyLabel}
            </span>
            <span className={`opp-reward ${opportunity.rewardBonus >= 1.2 ? 'bonus' : opportunity.rewardBonus <= 0.9 ? 'reduced' : ''}`}>
              Rewards: {rewardLabel}
            </span>
            <span className="opp-expiry">
              Expires: {opportunity.weeksUntilExpiry} week{opportunity.weeksUntilExpiry > 1 ? 's' : ''}
            </span>
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
              <span className="agent-range">
                ({config.minAgents}-{config.maxAgents} required)
              </span>
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

        {selectedAgents.length > 0 && (
          <Tooltip
            content={
              <TooltipContent
                title="Mission Preview"
                description="Estimated outcome based on current selections."
                details={[
                  `Success chance: ${estimatedSuccess}%`,
                  `Notice risk: +${config.noticeRisk} to district`,
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
                Notice Risk: +{config.noticeRisk}
              </span>
            </div>
          </Tooltip>
        )}

        <div className="creator-actions">
          <Tooltip
            content={
              <TooltipContent
                title="Cancel"
                description="Close this window without accepting the mission. The opportunity will remain available until it expires."
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
                title="Accept Mission"
                description={canAccept ? "Confirm and begin mission preparation. Assigned agents will be unavailable until the mission completes." : "Select the required number of agents to accept this mission."}
                details={
                  canAccept
                    ? [
                        'Agents will begin preparation immediately',
                        'Mission executes after prep time completes',
                        'This opportunity will be removed from the pool'
                      ]
                    : [
                        `Need ${config.minAgents}-${config.maxAgents} agent(s)`
                      ]
                }
              />
            }
            position="top"
          >
            <button
              className="create-button"
              disabled={!canAccept}
              onClick={handleAccept}
            >
              Accept Mission
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
  const [selectedOpportunity, setSelectedOpportunity] = useState<MissionOpportunity | null>(null);

  const activeMissions = state.missions.filter(
    (m) => m.status === 'preparing' || m.status === 'in_progress'
  );

  const availableOpportunities = state.availableMissions;

  return (
    <div className="mission-panel">
      {/* Available Mission Opportunities Section */}
      <div className="mission-header">
        <Tooltip
          content={
            <TooltipContent
              title="Available Missions"
              description="Mission opportunities that have become available. Each has a limited time before it expires."
              details={[
                'New missions appear each week',
                'Missions expire if not accepted in time',
                'Difficulty and rewards vary by opportunity',
                'Choose wisely - you have limited agents!'
              ]}
            />
          }
          position="bottom"
        >
          <h3>Available Missions ({availableOpportunities.length})</h3>
        </Tooltip>
      </div>

      {availableOpportunities.length === 0 ? (
        <Tooltip
          content={
            <TooltipContent
              title="No Opportunities"
              description="No mission opportunities are currently available. New missions will appear at the start of each week."
              details={[
                'Advance the week to get new opportunities',
                'Mission variety depends on district conditions',
                'Keep agents ready for when opportunities arise'
              ]}
            />
          }
          position="right"
        >
          <div className="no-missions">
            <span>No mission opportunities available</span>
            <small>New missions will appear next week</small>
          </div>
        </Tooltip>
      ) : (
        <div className="opportunities-list">
          {availableOpportunities.map((opportunity) => {
            const config = MISSION_CONFIGS[opportunity.type];
            const district = state.districts.find((d) => d.id === opportunity.districtId);
            const tooltipData = MISSION_TOOLTIP_DATA[opportunity.type];

            const difficultyClass = opportunity.difficultyBonus > 0 ? 'hard' : opportunity.difficultyBonus < 0 ? 'easy' : 'normal';
            const rewardClass = opportunity.rewardBonus >= 1.2 ? 'bonus' : opportunity.rewardBonus <= 0.9 ? 'reduced' : 'normal';
            const expiryClass = opportunity.weeksUntilExpiry <= 1 ? 'urgent' : opportunity.weeksUntilExpiry <= 2 ? 'soon' : 'normal';

            return (
              <Tooltip
                key={opportunity.id}
                content={
                  <TooltipContent
                    title={`${config.name} - ${district?.name}`}
                    description={opportunity.flavorText}
                    details={[
                      ...tooltipData.details,
                      `Difficulty bonus: ${opportunity.difficultyBonus > 0 ? '+' : ''}${opportunity.difficultyBonus}`,
                      `Reward multiplier: ${Math.round(opportunity.rewardBonus * 100)}%`,
                      `Expires in: ${opportunity.weeksUntilExpiry} week(s)`
                    ]}
                    warning={opportunity.weeksUntilExpiry <= 1 ? 'Expires soon - act now!' : tooltipData.warning}
                  />
                }
                position="left"
              >
                <div
                  className={`opportunity-item ${expiryClass}`}
                  onClick={() => state.phase === 'assignment' && setSelectedOpportunity(opportunity)}
                >
                  <div className="opp-info">
                    <span className="opp-name">{config.name}</span>
                    <span className="opp-district">{district?.name}</span>
                  </div>
                  <div className="opp-details">
                    <span className={`opp-difficulty-badge ${difficultyClass}`}>
                      {opportunity.difficultyBonus > 0 ? '+' : ''}{opportunity.difficultyBonus}
                    </span>
                    <span className={`opp-reward-badge ${rewardClass}`}>
                      {Math.round(opportunity.rewardBonus * 100)}%
                    </span>
                    <span className={`opp-expiry-badge ${expiryClass}`}>
                      {opportunity.weeksUntilExpiry}w
                    </span>
                  </div>
                  {state.phase === 'assignment' && (
                    <button className="accept-opp-button">
                      Accept
                    </button>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}

      {/* Active Missions Section */}
      <div className="mission-header active-header">
        <Tooltip
          content={
            <TooltipContent
              title="Active Missions"
              description="Missions currently in preparation or execution. Monitor their progress here."
              details={[
                'Preparing missions count down each week',
                'In-progress missions resolve during the Resolution phase',
                'Agents are unavailable until missions complete'
              ]}
            />
          }
          position="bottom"
        >
          <h3>Active Missions ({activeMissions.length})</h3>
        </Tooltip>
      </div>

      {activeMissions.length === 0 ? (
        <Tooltip
          content={
            <TooltipContent
              title="No Active Missions"
              description="You don't have any missions in progress. Accept available missions to put your agents to work."
              details={[
                'Select from available opportunities above',
                'Missions help reduce Authority and gain resources',
                'Use missions strategically to advance your goals'
              ]}
            />
          }
          position="right"
        >
          <div className="no-missions">
            <span>No active missions</span>
            <small>Accept available missions to deploy your agents</small>
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
                      `Notice risk: +${config.noticeRisk} on completion`,
                      mission.rewardBonus ? `Reward multiplier: ${Math.round(mission.rewardBonus * 100)}%` : ''
                    ].filter(Boolean)}
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

      {selectedOpportunity && (
        <MissionAcceptor
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
}
