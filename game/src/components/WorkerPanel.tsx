import { useGame, useGameActions } from '../context/GameContext';
import { JOB_CONFIGS } from '../types/game';
import './WorkerPanel.css';

export function WorkerPanel() {
  const { state } = useGame();
  const { unassignWorker, advanceWeek } = useGameActions();

  const assignedCount = state.workerAssignments.length;
  const idleCount = state.workerCount - assignedCount;

  return (
    <div className="worker-panel">
      <div className="worker-header">
        <h3>Workers</h3>
        <div className="worker-count">
          <span className="assigned">{assignedCount} assigned</span>
          <span className="separator">/</span>
          <span className="total">{state.workerCount} total</span>
        </div>
      </div>

      {idleCount > 0 && state.phase === 'assignment' && (
        <div className="idle-workers">
          <span className="idle-icon">&#x263B;</span>
          <span>{idleCount} idle worker{idleCount > 1 ? 's' : ''}</span>
          <small>Click a district and select a job to assign</small>
        </div>
      )}

      {state.workerAssignments.length > 0 && (
        <div className="assignments-list">
          <h4>Current Assignments</h4>
          {state.workerAssignments.map((assignment, index) => {
            const district = state.districts.find(
              (d) => d.id === assignment.districtId
            );
            const jobConfig = JOB_CONFIGS[assignment.job];

            return (
              <div key={index} className="assignment-item">
                <div className="assignment-info">
                  <span className="assignment-job">{jobConfig.name}</span>
                  <span className="assignment-district">
                    in {district?.name || 'Unknown'}
                  </span>
                </div>
                {state.phase === 'assignment' && (
                  <button
                    className="unassign-button"
                    onClick={() => unassignWorker(index)}
                    title="Remove assignment"
                  >
                    &#x2715;
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {state.phase === 'assignment' && (
        <div className="advance-section">
          <button
            className="advance-button"
            onClick={advanceWeek}
          >
            End Week &rarr;
          </button>
          <small>Process all assignments and advance to next week</small>
        </div>
      )}

      {state.phase !== 'assignment' && (
        <div className="phase-info">
          <span>Current Phase: <strong>{state.phase}</strong></span>
          <button className="advance-button small" onClick={advanceWeek}>
            Continue &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
