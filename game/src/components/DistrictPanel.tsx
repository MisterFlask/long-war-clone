import { useState } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { District, WorkerJob } from '../types/game';
import { JOB_CONFIGS } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import './DistrictPanel.css';

// Detailed job descriptions for tooltips
const JOB_TOOLTIP_DATA: Record<WorkerJob, { title: string; description: string; details: string[]; warning?: string }> = {
  extraction: {
    title: 'Extraction',
    description: 'Put workers to gathering raw materials from Hell\'s abundant resources.',
    details: [
      'Gain Materiel equal to district Dominion level',
      'Higher Dominion = more efficient extraction',
      'Safe operation with no Notice increase',
      'Requires at least 1 Dominion in the district'
    ],
  },
  trading: {
    title: 'Trading',
    description: 'Convert extracted Materiel into Sovereigns through infernal commerce.',
    details: [
      'Exchange rate: ~10 Sovereigns per Materiel',
      'Essential for meeting profit targets',
      'Requires Materiel stockpile to be effective',
      'Requires at least 1 Dominion in the district'
    ],
  },
  espionage: {
    title: 'Espionage',
    description: 'Gather intelligence about this district, revealing hidden statistics.',
    details: [
      'Reveals Authority, Dominion, and Notice levels',
      'Essential before planning operations',
      'Can be performed in any district',
      'Information persists until the district changes'
    ],
  },
  discretion: {
    title: 'Discretion',
    description: 'Keep a low profile and work to reduce unwanted attention in this district.',
    details: [
      'Reduces district Notice by 1',
      'Helps prevent Prince Attention escalation',
      'Critical when Notice is approaching dangerous levels',
      'Proactive notice management is key to survival'
    ],
    warning: 'Districts with 7+ Notice can trigger Prince Attention!'
  },
  expansion: {
    title: 'Expansion',
    description: 'Invest resources to expand your company\'s presence and control in this district.',
    details: [
      'Increases Dominion by 1',
      'Higher Dominion = better Extraction yields',
      'Victory requires 7+ Dominion in 3 districts',
      'Expansion operations draw attention'
    ],
    warning: 'Costs 5 Materiel and increases Notice by 1'
  },
  idle: {
    title: 'Idle',
    description: 'Worker is not assigned to any task.',
    details: ['Assign workers to districts to put them to work'],
  },
};

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
      <Tooltip
        content={
          <TooltipContent
            title={district.name}
            description={district.description}
            details={[
              'Click to expand and assign workers',
              district.revealed ? `Authority: ${district.infernalAuthority}/10 (Hell\'s control)` : 'Intelligence not gathered yet',
              district.revealed ? `Dominion: ${district.companyDominion}/10 (Your control)` : 'Use Espionage to reveal stats',
              workersAssigned > 0 ? `${workersAssigned} worker(s) currently assigned` : 'No workers assigned'
            ]}
          />
        }
        position="right"
      >
        <div className="district-header" onClick={() => setExpanded(!expanded)}>
          <h3>{district.name}</h3>
          <span className="expand-icon">{expanded ? '−' : '+'}</span>
        </div>
      </Tooltip>

      <p className="district-description">{district.description}</p>

      <div className="district-stats">
        {district.revealed ? (
          <>
            <Tooltip
              content={
                <TooltipContent
                  title="Infernal Authority"
                  description="Hell's established control over this district. Higher authority makes missions more difficult."
                  details={[
                    `Current level: ${district.infernalAuthority}/10`,
                    'Increases mission difficulty',
                    'Can be reduced via Sabotage and Interdiction missions',
                    'High authority districts are more dangerous'
                  ]}
                  warning={district.infernalAuthority >= 7 ? 'High authority makes operations very risky!' : undefined}
                />
              }
              position="right"
            >
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
            </Tooltip>

            <Tooltip
              content={
                <TooltipContent
                  title="Company Dominion"
                  description="Your company's established presence and control in this district. Higher dominion improves resource extraction."
                  details={[
                    `Current level: ${district.companyDominion}/10`,
                    'Determines Materiel gained from Extraction',
                    'Requires 1+ to perform Trading and Extraction',
                    'Victory condition: 7+ Dominion in 3 districts'
                  ]}
                  reward={district.companyDominion >= 7 ? 'This district counts toward victory!' : `Need ${7 - district.companyDominion} more for victory threshold`}
                />
              }
              position="right"
            >
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
            </Tooltip>

            <Tooltip
              content={
                <TooltipContent
                  title="District Notice"
                  description="How much attention your activities have drawn from Hell's authorities in this district."
                  details={[
                    `Current level: ${district.notice}/10`,
                    'Increases from Expansion and risky missions',
                    'Reduce with Discretion jobs or Tribute Delivery',
                    'Notice 7+ can increase Prince Attention'
                  ]}
                  warning={district.notice >= 7 ? 'DANGER: Notice is critically high!' : district.notice >= 4 ? 'Warning: Notice is building up' : undefined}
                />
              }
              position="right"
            >
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
            </Tooltip>
          </>
        ) : (
          <Tooltip
            content={
              <TooltipContent
                title="Intelligence Required"
                description="District statistics are hidden until you gather intelligence."
                details={[
                  'Assign a worker to Espionage in this district',
                  'Reveals Authority, Dominion, and Notice levels',
                  'Essential for planning effective operations'
                ]}
              />
            }
            position="right"
          >
            <div className="unrevealed-message">
              <span>&#x2753; Intelligence required</span>
              <small>Assign a worker to Espionage to reveal district stats</small>
            </div>
          </Tooltip>
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
            const tooltipData = JOB_TOOLTIP_DATA[job];
            const canAssign =
              canAssignMoreWorkers &&
              district.companyDominion >= config.requiresDominion &&
              (job !== 'expansion' || state.resources.materiel >= 5);

            const disabledReason = !canAssignMoreWorkers
              ? 'No idle workers available'
              : district.companyDominion < config.requiresDominion
                ? `Requires ${config.requiresDominion}+ Dominion`
                : job === 'expansion' && state.resources.materiel < 5
                  ? 'Requires 5 Materiel'
                  : null;

            return (
              <Tooltip
                key={job}
                content={
                  <TooltipContent
                    title={tooltipData.title}
                    description={tooltipData.description}
                    details={[
                      ...tooltipData.details,
                      ...(disabledReason ? [`Currently unavailable: ${disabledReason}`] : [])
                    ]}
                    cost={config.cost?.materiel ? `${config.cost.materiel} Materiel` : undefined}
                    warning={tooltipData.warning}
                  />
                }
                position="top"
              >
                <button
                  className={`job-button ${canAssign ? '' : 'disabled'}`}
                  onClick={() => canAssign && onAssignWorker(job)}
                  disabled={!canAssign}
                >
                  <span className="job-name">{config.name}</span>
                  {config.cost?.materiel && (
                    <span className="job-cost">-{config.cost.materiel} Mat</span>
                  )}
                </button>
              </Tooltip>
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
      <Tooltip
        content={
          <TooltipContent
            title="Districts of Hell"
            description="The infernal regions where your company operates. Each district has unique opportunities and dangers."
            details={[
              'Click a district to expand and assign workers',
              'Balance resource extraction with managing Notice',
              'Victory: Achieve 7+ Dominion in 3 districts',
              'Keep Notice low across all districts'
            ]}
          />
        }
        position="bottom"
      >
        <h2>Districts of Hell</h2>
      </Tooltip>
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
