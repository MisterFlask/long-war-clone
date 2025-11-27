import { useState } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { District, WorkerJob } from '../types/game';
import { JOB_CONFIGS } from '../types/game';
import './DistrictPanel.css';

interface DistrictCardProps {
  district: District;
  onAssignWorker: (job: WorkerJob) => void;
  workersAssigned: number;
}

function DistrictCard({ district, onAssignWorker, workersAssigned }: DistrictCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { state } = useGame();

  const availableJobs: WorkerJob[] = ['extraction', 'trading', 'espionage', 'discretion', 'expansion'];
  const canAssignMoreWorkers = state.workerAssignments.length < state.workerCount;

  return (
    <div className={`district-card ${district.revealed ? '' : 'unrevealed'}`}>
      <div className="district-header" onClick={() => setExpanded(!expanded)}>
        <h3>{district.name}</h3>
        <span className="expand-icon">{expanded ? '−' : '+'}</span>
      </div>

      <p className="district-description">{district.description}</p>

      <div className="district-stats">
        {district.revealed ? (
          <>
            <div className="stat">
              <span className="stat-label">Authority</span>
              <div className="stat-bar-container">
                <div
                  className="stat-bar authority"
                  style={{ width: `${district.infernalAuthority * 10}%` }}
                />
              </div>
              <span className="stat-value">{district.infernalAuthority}/10</span>
            </div>
            <div className="stat">
              <span className="stat-label">Dominion</span>
              <div className="stat-bar-container">
                <div
                  className="stat-bar dominion"
                  style={{ width: `${district.companyDominion * 10}%` }}
                />
              </div>
              <span className="stat-value">{district.companyDominion}/10</span>
            </div>
            <div className="stat">
              <span className="stat-label">Notice</span>
              <div className="stat-bar-container">
                <div
                  className={`stat-bar notice ${district.notice >= 7 ? 'danger' : district.notice >= 4 ? 'warning' : ''}`}
                  style={{ width: `${district.notice * 10}%` }}
                />
              </div>
              <span className="stat-value">{district.notice}/10</span>
            </div>
          </>
        ) : (
          <div className="unrevealed-message">
            <span>&#x2753; Intelligence required</span>
            <small>Assign a worker to Espionage to reveal district stats</small>
          </div>
        )}
      </div>

      {workersAssigned > 0 && (
        <div className="workers-assigned">
          <span className="workers-icon">&#x263A;</span>
          <span>{workersAssigned} worker{workersAssigned > 1 ? 's' : ''} assigned</span>
        </div>
      )}

      {expanded && state.phase === 'assignment' && (
        <div className="job-buttons">
          {availableJobs.map((job) => {
            const config = JOB_CONFIGS[job];
            const canAssign =
              canAssignMoreWorkers &&
              district.companyDominion >= config.requiresDominion &&
              (job !== 'expansion' || state.resources.materiel >= 5);

            return (
              <button
                key={job}
                className={`job-button ${canAssign ? '' : 'disabled'}`}
                onClick={() => canAssign && onAssignWorker(job)}
                disabled={!canAssign}
                title={config.description}
              >
                <span className="job-name">{config.name}</span>
                {config.cost?.materiel && (
                  <span className="job-cost">-{config.cost.materiel} Mat</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DistrictPanel() {
  const { state } = useGame();
  const { assignWorker } = useGameActions();

  // Count workers assigned to each district
  const workersPerDistrict = state.districts.reduce((acc, d) => {
    acc[d.id] = state.workerAssignments.filter(
      (a) => a.districtId === d.id
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="district-panel">
      <h2>Districts of Hell</h2>
      <div className="districts-grid">
        {state.districts.map((district) => (
          <DistrictCard
            key={district.id}
            district={district}
            onAssignWorker={(job) => assignWorker(district.id, job)}
            workersAssigned={workersPerDistrict[district.id] || 0}
          />
        ))}
      </div>
    </div>
  );
}
