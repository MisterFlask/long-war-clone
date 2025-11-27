import { useGame } from '../context/GameContext';
import type { Agent, AgentCondition } from '../types/game';
import { XP_THRESHOLDS } from '../types/game';
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

interface AgentCardProps {
  agent: Agent;
  isAssigned: boolean;
}

function AgentCard({ agent, isAssigned }: AgentCardProps) {
  const xpForNextLevel = agent.level < 5 ? XP_THRESHOLDS[agent.level] : null;
  const xpProgress = xpForNextLevel ? (agent.xp / xpForNextLevel) * 100 : 100;

  return (
    <div className={`agent-card ${getConditionClass(agent.condition)} ${isAssigned ? 'assigned' : ''}`}>
      <div className="agent-header">
        <span className="agent-name">{agent.name}</span>
        <span className="agent-level">Lvl {agent.level}</span>
      </div>

      <div className="agent-stats">
        <div className="agent-stat">
          <span
            className={`condition-badge ${getConditionClass(agent.condition)}`}
            dangerouslySetInnerHTML={{ __html: getConditionIcon(agent.condition) }}
          />
          <span className="condition-text">{agent.condition}</span>
        </div>

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

        {agent.level < 5 && (
          <div className="agent-stat xp">
            <span className="stat-label">XP</span>
            <div className="xp-bar-container">
              <div className="xp-bar" style={{ width: `${xpProgress}%` }} />
            </div>
            <span className="xp-text">{agent.xp}/{xpForNextLevel}</span>
          </div>
        )}
      </div>

      {isAssigned && (
        <div className="assigned-badge">On Mission</div>
      )}
    </div>
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
        <h3>Agents</h3>
        <span className="agent-count">
          {aliveAgents.length} active / {state.agents.length} total
        </span>
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
        <div className="dead-agents">
          <h4>Fallen Agents</h4>
          <div className="dead-agents-list">
            {deadAgents.map((agent) => (
              <span key={agent.id} className="dead-agent-name">
                {agent.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
