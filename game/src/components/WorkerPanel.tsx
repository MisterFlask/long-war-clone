import { useGame, useGameActions } from '../context/GameContext';
import { JOB_CONFIGS } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import './WorkerPanel.css';

export function WorkerPanel() {
  const { state } = useGame();
  const { unassignWorker, advanceWeek } = useGameActions();

  const assignedCount = state.workerAssignments.length;
  const idleCount = state.workerCount - assignedCount;

  return (
    <div className="worker-panel">
      <div className="worker-header">
        <Tooltip
          content={
            <TooltipContent
              title="Workers"
              description="Your company's workforce in Hell. Workers perform jobs in districts each week."
              details={[
                'Assign workers to districts during the Assignment phase',
                'Each worker can perform one job per week',
                'Jobs include Extraction, Trading, Espionage, Discretion, and Expansion',
                'Unassigned workers produce nothing'
              ]}
            />
          }
          position="bottom"
        >
          <h3>Workers</h3>
        </Tooltip>
        <Tooltip
          content={
            <TooltipContent
              title="Worker Status"
              description={`You have ${state.workerCount} workers total, with ${assignedCount} currently assigned to jobs.`}
              details={[
                `${assignedCount} workers are assigned to jobs`,
                `${idleCount} workers are idle`,
                'Idle workers do not contribute to your operations',
                'Assign all workers for maximum efficiency'
              ]}
              warning={idleCount > 0 && state.phase === 'assignment' ? 'You have idle workers! Assign them before ending the week.' : undefined}
            />
          }
          position="bottom"
        >
          <div className="worker-count">
            <span className="assigned">{assignedCount} assigned</span>
            <span className="separator">/</span>
            <span className="total">{state.workerCount} total</span>
          </div>
        </Tooltip>
      </div>

      {idleCount > 0 && state.phase === 'assignment' && (
        <Tooltip
          content={
            <TooltipContent
              title="Idle Workers"
              description="These workers are not assigned to any job and will not contribute this week."
              details={[
                'Click on a district card to expand it',
                'Select a job to assign a worker',
                'Different jobs require different district conditions',
                'Maximize productivity by assigning all workers'
              ]}
            />
          }
          position="right"
        >
          <div className="idle-workers">
            <span className="idle-icon">&#x263B;</span>
            <span>{idleCount} idle worker{idleCount > 1 ? 's' : ''}</span>
            <small>Click a district and select a job to assign</small>
          </div>
        </Tooltip>
      )}

      {state.workerAssignments.length > 0 && (
        <div className="assignments-list">
          <Tooltip
            content={
              <TooltipContent
                title="Current Assignments"
                description="Workers currently assigned to jobs. These assignments will be executed when you end the week."
                details={[
                  'Workers execute their jobs during the Resolution phase',
                  'You can remove assignments during the Assignment phase',
                  'Effects are applied based on district conditions'
                ]}
              />
            }
            position="right"
          >
            <h4>Current Assignments</h4>
          </Tooltip>
          {state.workerAssignments.map((assignment, index) => {
            const district = state.districts.find(
              (d) => d.id === assignment.districtId
            );
            const jobConfig = JOB_CONFIGS[assignment.job];

            return (
              <div key={index} className="assignment-item">
                <Tooltip
                  content={
                    <TooltipContent
                      title={`${jobConfig.name} Assignment`}
                      description={jobConfig.description}
                      details={[
                        `Location: ${district?.name || 'Unknown'}`,
                        `Job type: ${jobConfig.name}`,
                        'Will execute when week advances'
                      ]}
                    />
                  }
                  position="left"
                >
                  <div className="assignment-info">
                    <span className="assignment-job">{jobConfig.name}</span>
                    <span className="assignment-district">
                      in {district?.name || 'Unknown'}
                    </span>
                  </div>
                </Tooltip>
                {state.phase === 'assignment' && (
                  <Tooltip
                    content={
                      <TooltipContent
                        title="Remove Assignment"
                        description="Click to unassign this worker, making them available for a different job."
                        details={[
                          'Worker will become idle',
                          'Can be reassigned to another job',
                          'Only available during Assignment phase'
                        ]}
                      />
                    }
                    position="left"
                  >
                    <button
                      className="unassign-button"
                      onClick={() => unassignWorker(index)}
                    >
                      &#x2715;
                    </button>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      )}

      {state.phase === 'assignment' && (
        <div className="advance-section">
          <Tooltip
            content={
              <TooltipContent
                title="End Week"
                description="Finalize your assignments and advance to the next week. All assigned jobs will be executed."
                details={[
                  'Executes all worker job assignments',
                  'Advances mission preparation timers',
                  'Resolves any completed missions',
                  'Processes upkeep and Notice checks',
                  'May trigger random events'
                ]}
                warning={idleCount > 0 ? `Warning: ${idleCount} worker(s) will remain idle!` : undefined}
              />
            }
            position="top"
          >
            <button
              className="advance-button"
              onClick={advanceWeek}
            >
              End Week &rarr;
            </button>
          </Tooltip>
          <small>Process all assignments and advance to next week</small>
        </div>
      )}

      {state.phase !== 'assignment' && (
        <div className="phase-info">
          <span>Current Phase: <strong>{state.phase}</strong></span>
          <Tooltip
            content={
              <TooltipContent
                title="Continue"
                description={`Proceed through the ${state.phase} phase to the next step.`}
                details={[
                  'Game processes current phase automatically',
                  'Click to advance to the next phase',
                  'Returns to Assignment phase after all phases complete'
                ]}
              />
            }
            position="top"
          >
            <button className="advance-button small" onClick={advanceWeek}>
              Continue &rarr;
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
