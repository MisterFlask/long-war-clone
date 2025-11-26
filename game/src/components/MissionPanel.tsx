import { useState } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { MissionType, Agent } from '../types/game';
import { MISSION_CONFIGS } from '../types/game';
import { getAvailableAgents, calculateMissionSuccess } from '../services/gameLogic';
import './MissionPanel.css';

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
          <h3>Plan New Mission</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="creator-section">
          <h4>Mission Type</h4>
          <div className="mission-type-grid">
            {missionTypes.map((config) => (
              <button
                key={config.type}
                className={`mission-type-button ${selectedType === config.type ? 'selected' : ''}`}
                onClick={() => setSelectedType(config.type)}
              >
                <span className="type-name">{config.name}</span>
                <span className="type-desc">{config.description}</span>
                {config.cost?.sovereigns && (
                  <span className="type-cost">-{config.cost.sovereigns} Sov</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="creator-section">
          <h4>Target District</h4>
          <div className="district-select-grid">
            {state.districts.map((district) => (
              <button
                key={district.id}
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
            ))}
          </div>
        </div>

        <div className="creator-section">
          <h4>
            Assign Agents
            {selectedConfig && (
              <span className="agent-range">
                ({selectedConfig.minAgents}-{selectedConfig.maxAgents} required)
              </span>
            )}
          </h4>
          <div className="agent-select-grid">
            {availableAgents.map((agent) => (
              <button
                key={agent.id}
                className={`agent-select-button ${selectedAgents.includes(agent.id) ? 'selected' : ''} ${agent.condition}`}
                onClick={() => toggleAgent(agent.id)}
              >
                <span className="agent-sel-name">{agent.name}</span>
                <span className="agent-sel-info">
                  Lvl {agent.level} | {agent.condition}
                </span>
              </button>
            ))}
            {availableAgents.length === 0 && (
              <div className="no-agents">No agents available</div>
            )}
          </div>
        </div>

        <div className="creator-section">
          <h4>Preparation Time</h4>
          <div className="prep-time-selector">
            {[1, 2, 3, 4, 5].map((weeks) => (
              <button
                key={weeks}
                className={`prep-button ${prepWeeks === weeks ? 'selected' : ''}`}
                onClick={() => setPrepWeeks(weeks)}
              >
                {weeks} week{weeks > 1 ? 's' : ''}
              </button>
            ))}
          </div>
          <small className="prep-hint">
            More preparation = higher success chance (-30% to +25%)
          </small>
        </div>

        {selectedType && selectedDistrict && selectedAgents.length > 0 && (
          <div className="success-preview">
            <span className="preview-label">Estimated Success:</span>
            <span className={`preview-value ${estimatedSuccess >= 70 ? 'high' : estimatedSuccess >= 40 ? 'medium' : 'low'}`}>
              {estimatedSuccess}%
            </span>
            <span className="preview-notice">
              Notice Risk: +{selectedConfig?.noticeRisk || 0}
            </span>
          </div>
        )}

        <div className="creator-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-button"
            disabled={!canCreate}
            onClick={handleCreate}
          >
            Launch Mission
          </button>
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
        <h3>Missions</h3>
        {state.phase === 'assignment' && (
          <button
            className="new-mission-button"
            onClick={() => setShowCreator(true)}
          >
            + Plan Mission
          </button>
        )}
      </div>

      {activeMissions.length === 0 ? (
        <div className="no-missions">
          <span>No active missions</span>
          <small>Plan missions to earn resources and sabotage Hell's authority</small>
        </div>
      ) : (
        <div className="missions-list">
          {activeMissions.map((mission) => {
            const config = MISSION_CONFIGS[mission.type];
            const district = state.districts.find(
              (d) => d.id === mission.districtId
            );
            const successChance = calculateMissionSuccess(state, mission);
            const agents = mission.assignedAgents
              .map((id) => state.agents.find((a) => a.id === id))
              .filter(Boolean) as Agent[];

            return (
              <div key={mission.id} className={`mission-item ${mission.status}`}>
                <div className="mission-info">
                  <span className="mission-name">{config.name}</span>
                  <span className="mission-district">{district?.name}</span>
                </div>
                <div className="mission-details">
                  <div className="mission-agents">
                    {agents.map((a) => (
                      <span key={a.id} className="mission-agent">
                        {a.name.split(' ')[0]}
                      </span>
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
                  <button
                    className="cancel-mission-button"
                    onClick={() => cancelMission(mission.id)}
                    title="Cancel mission"
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreator && <MissionCreator onClose={() => setShowCreator(false)} />}
    </div>
  );
}
