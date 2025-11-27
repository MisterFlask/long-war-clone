import { useGame } from '../context/GameContext';
import type { Agent, AgentCondition } from '../types/game';
import { XP_THRESHOLDS } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import './AgentPanel.css';

function getConditionIcon(condition: AgentCondition): string {
  switch (condition) {
    case 'fresh': return '&#x2713;';
    case 'tired': return '&#x25CB;';
    case 'injured': return '&#x2620;';
    case 'dead': return '&#x2620;';
    default: return '?';
  }
}

function getConditionClass(condition: AgentCondition): string {
  switch (condition) {
    case 'fresh': return 'fresh';
    case 'tired': return 'tired';
    case 'injured': return 'injured';
    case 'dead': return 'dead';
    default: return '';
  }
}

// Condition descriptions for tooltips
const CONDITION_DESCRIPTIONS: Record<AgentCondition, { title: string; description: string; details: string[] }> = {
  fresh: {
    title: 'Fresh',
    description: 'This agent is in peak condition and ready for action.',
    details: [
      'Full effectiveness on missions',
      'No penalties to success rolls',
      'Can be assigned to any mission type'
    ]
  },
  tired: {
    title: 'Tired',
    description: 'This agent is fatigued from recent operations.',
    details: [
      '-1 penalty to mission success rolls',
      'Can still be assigned to missions',
      'Will recover after resting (not assigned to missions)'
    ]
  },
  injured: {
    title: 'Injured',
    description: 'This agent was wounded during a failed mission.',
    details: [
      'Cannot be assigned to missions',
      'Will recover over time',
      'May take several weeks to heal'
    ]
  },
  dead: {
    title: 'Dead',
    description: 'This agent has perished in service to the Company.',
    details: [
      'Permanently lost',
      'Cannot be recovered',
      'Their sacrifice will be remembered'
    ]
  }
};

interface AgentCardProps {
  agent: Agent;
  isAssigned: boolean;
}

function AgentCard({ agent, isAssigned }: AgentCardProps) {
  const xpForNextLevel = agent.level < 5 ? XP_THRESHOLDS[agent.level] : null;
  const xpProgress = xpForNextLevel ? (agent.xp / xpForNextLevel) * 100 : 100;
  const conditionData = CONDITION_DESCRIPTIONS[agent.condition];

  return (
    <Tooltip
      content={
        <TooltipContent
          title={agent.name}
          description={`A level ${agent.level} field operative for the Hellfire East India Company.`}
          details={[
            `Level: ${agent.level} (adds to mission success rolls)`,
            `Condition: ${agent.condition}`,
            `Corruption: ${agent.corruption}/5`,
            isAssigned ? 'Currently assigned to a mission' : 'Available for mission assignment',
            agent.level < 5 ? `XP: ${agent.xp}/${xpForNextLevel} to next level` : 'Maximum level reached'
          ]}
          warning={agent.corruption >= 4 ? 'High corruption - agent may be lost!' : isAssigned ? 'Unavailable until current mission completes' : undefined}
        />
      }
      position="left"
    >
      <div className={`agent-card ${getConditionClass(agent.condition)} ${isAssigned ? 'assigned' : ''}`}>
        <div className="agent-header">
          <Tooltip
            content={
              <TooltipContent
                title={agent.name}
                description="The agent's name. Each agent is a unique individual with their own capabilities."
              />
            }
            position="top"
          >
            <span className="agent-name">{agent.name}</span>
          </Tooltip>
          <Tooltip
            content={
              <TooltipContent
                title={`Level ${agent.level}`}
                description="The agent's experience level. Higher levels provide greater mission success chances."
                details={[
                  `Current level: ${agent.level}/5`,
                  'Each level adds +5-10% to mission success',
                  'Agents gain XP from successful missions',
                  agent.level < 5 ? `${xpForNextLevel! - agent.xp} XP needed for next level` : 'Maximum level achieved!'
                ]}
              />
            }
            position="top"
          >
            <span className="agent-level">Lvl {agent.level}</span>
          </Tooltip>
        </div>

        <div className="agent-stats">
          <Tooltip
            content={
              <TooltipContent
                title={conditionData.title}
                description={conditionData.description}
                details={conditionData.details}
              />
            }
            position="right"
          >
            <div className="agent-stat">
              <span
                className={`condition-badge ${getConditionClass(agent.condition)}`}
                dangerouslySetInnerHTML={{ __html: getConditionIcon(agent.condition) }}
              />
              <span className="condition-text">{agent.condition}</span>
            </div>
          </Tooltip>

          <Tooltip
            content={
              <TooltipContent
                title="Corruption"
                description="The accumulated taint from operating in Hell. High corruption puts the agent at risk."
                details={[
                  `Current corruption: ${agent.corruption}/5`,
                  'Gained from failed missions and certain events',
                  'At 5 corruption, agent may be permanently lost',
                  'Some events can reduce corruption'
                ]}
                warning={agent.corruption >= 4 ? 'CRITICAL: One more corruption may destroy this agent!' : agent.corruption >= 3 ? 'Warning: Corruption is dangerously high' : undefined}
              />
            }
            position="right"
          >
            <div className="agent-stat">
              <span className="stat-label">Corruption</span>
              <div className="corruption-dots">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`corruption-dot ${i < agent.corruption ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>
          </Tooltip>

          {agent.level < 5 && (
            <Tooltip
              content={
                <TooltipContent
                  title="Experience Points"
                  description="Progress toward the next level. Agents gain XP from successful missions."
                  details={[
                    `Current XP: ${agent.xp}/${xpForNextLevel}`,
                    `Progress: ${Math.round(xpProgress)}%`,
                    'Successful missions grant 1-3 XP',
                    'Higher level agents are more effective'
                  ]}
                />
              }
              position="right"
            >
              <div className="agent-stat xp">
                <span className="stat-label">XP</span>
                <div className="xp-bar-container">
                  <div className="xp-bar" style={{ width: `${xpProgress}%` }} />
                </div>
                <span className="xp-text">{agent.xp}/{xpForNextLevel}</span>
              </div>
            </Tooltip>
          )}
        </div>

        {isAssigned && (
          <Tooltip
            content={
              <TooltipContent
                title="On Mission"
                description="This agent is currently assigned to an active mission."
                details={[
                  'Cannot be assigned to other missions',
                  'Will return when mission completes',
                  'Check Missions panel for details'
                ]}
              />
            }
            position="top"
          >
            <div className="assigned-badge">On Mission</div>
          </Tooltip>
        )}
      </div>
    </Tooltip>
  );
}

export function AgentPanel() {
  const { state } = useGame();

  // Get IDs of agents currently assigned to missions
  const assignedAgentIds = new Set(
    state.missions
      .filter((m) => m.status === 'preparing' || m.status === 'in_progress')
      .flatMap((m) => m.assignedAgents)
  );

  const aliveAgents = state.agents.filter((a) => a.condition !== 'dead');
  const deadAgents = state.agents.filter((a) => a.condition === 'dead');

  return (
    <div className="agent-panel">
      <div className="agent-header-section">
        <Tooltip
          content={
            <TooltipContent
              title="Agents"
              description="Your field operatives in Hell. Agents execute missions and provide capabilities beyond your workers."
              details={[
                'Assign agents to missions for powerful effects',
                'Higher level agents have better success rates',
                'Agents can become tired, injured, or corrupted',
                'Dead agents are permanently lost'
              ]}
            />
          }
          position="bottom"
        >
          <h3>Agents</h3>
        </Tooltip>
        <Tooltip
          content={
            <TooltipContent
              title="Agent Roster"
              description={`Your company employs ${state.agents.length} agent${state.agents.length !== 1 ? 's' : ''}, with ${aliveAgents.length} currently active.`}
              details={[
                `${aliveAgents.length} agents are alive and operational`,
                `${assignedAgentIds.size} agents are assigned to missions`,
                `${aliveAgents.length - assignedAgentIds.size} agents are available`,
                deadAgents.length > 0 ? `${deadAgents.length} agent(s) have been lost` : 'No agents lost yet'
              ]}
            />
          }
          position="bottom"
        >
          <span className="agent-count">
            {aliveAgents.length} active / {state.agents.length} total
          </span>
        </Tooltip>
      </div>

      <div className="agents-grid">
        {aliveAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isAssigned={assignedAgentIds.has(agent.id)}
          />
        ))}
      </div>

      {deadAgents.length > 0 && (
        <Tooltip
          content={
            <TooltipContent
              title="Fallen Agents"
              description="These brave operatives gave their lives in service to the Company."
              details={[
                'Agents lost to failed missions or high corruption',
                'Their sacrifice enabled your continued operations',
                'New agents may be recruited through events'
              ]}
            />
          }
          position="top"
        >
          <div className="dead-agents">
            <h4>Fallen Agents</h4>
            <div className="dead-agents-list">
              {deadAgents.map((agent) => (
                <Tooltip
                  key={agent.id}
                  content={
                    <TooltipContent
                      title={agent.name}
                      description={`A fallen level ${agent.level} agent. Lost in the line of duty.`}
                      details={[
                        `Reached level ${agent.level} before death`,
                        `Final corruption: ${agent.corruption}/5`,
                        'May they find peace in the afterlife'
                      ]}
                    />
                  }
                  position="top"
                >
                  <span className="dead-agent-name">
                    {agent.name}
                  </span>
                </Tooltip>
              ))}
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
