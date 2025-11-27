import { useState, useMemo } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { District, WorkerJob, Mission } from '../types/game';
import { JOB_CONFIGS, getDistrictTemplate, HQ_POSITION } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import './WorldMap.css';

// SVG dimensions (viewBox)
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 700;

// Terrain icons/patterns for different district types
const TERRAIN_COLORS = {
  volcanic: { primary: '#8b0000', secondary: '#ff4500', glow: '#ff6347' },
  industrial: { primary: '#4a4a4a', secondary: '#8b4513', glow: '#cd853f' },
  urban: { primary: '#2d1515', secondary: '#8b4513', glow: '#ffd700' },
  docks: { primary: '#1a3a3a', secondary: '#4682b4', glow: '#5f9ea0' },
  wasteland: { primary: '#3d2b1f', secondary: '#a0522d', glow: '#d2691e' },
};

// Job tooltip data (same as DistrictPanel)
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

interface DistrictNodeProps {
  district: District;
  isSelected: boolean;
  onSelect: () => void;
  workersAssigned: number;
  activeMissions: Mission[];
}

function DistrictNode({ district, isSelected, onSelect, workersAssigned, activeMissions }: DistrictNodeProps) {
  const template = getDistrictTemplate(district.name);
  if (!template) return null;

  const { x, y } = template.mapPosition;
  const terrain = template.terrain;
  const colors = TERRAIN_COLORS[terrain];

  // Convert percentage to actual coordinates
  const cx = (x / 100) * MAP_WIDTH;
  const cy = (y / 100) * MAP_HEIGHT;

  // Node size based on dominion (larger = more control)
  const baseSize = 35;
  const dominionBonus = district.revealed ? district.companyDominion * 2 : 0;
  const nodeSize = baseSize + dominionBonus;

  // Notice affects the pulsing danger indicator
  const isDanger = district.revealed && district.notice >= 7;
  const isWarning = district.revealed && district.notice >= 4 && district.notice < 7;

  // Get mission status indicator
  const hasMission = activeMissions.length > 0;

  return (
    <g className={`district-node ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      {/* Outer glow ring */}
      <circle
        cx={cx}
        cy={cy}
        r={nodeSize + 15}
        className={`node-glow ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}
        fill="none"
        stroke={colors.glow}
        strokeWidth="2"
        opacity={isSelected ? 0.8 : 0.3}
      />

      {/* Danger pulse effect */}
      {isDanger && (
        <circle
          cx={cx}
          cy={cy}
          r={nodeSize + 25}
          className="danger-pulse"
          fill="none"
          stroke="#dc143c"
          strokeWidth="3"
        />
      )}

      {/* Main district circle */}
      <circle
        cx={cx}
        cy={cy}
        r={nodeSize}
        className="node-main"
        fill={`url(#terrain-${terrain})`}
        stroke={isSelected ? '#ffd700' : colors.secondary}
        strokeWidth={isSelected ? 4 : 2}
      />

      {/* Inner detail circle */}
      <circle
        cx={cx}
        cy={cy}
        r={nodeSize * 0.6}
        fill={colors.primary}
        opacity="0.5"
      />

      {/* District name label */}
      <text
        x={cx}
        y={cy + nodeSize + 20}
        className="district-label"
        textAnchor="middle"
        fill={isSelected ? '#ffd700' : '#f0e6d2'}
      >
        {district.name}
      </text>

      {/* Unrevealed indicator */}
      {!district.revealed && (
        <text
          x={cx}
          y={cy + 5}
          className="unrevealed-indicator"
          textAnchor="middle"
          fill="#888"
          fontSize="24"
        >
          ?
        </text>
      )}

      {/* Revealed stats mini-display */}
      {district.revealed && (
        <g className="mini-stats">
          {/* Dominion indicator */}
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            fill="#32cd32"
            fontSize="14"
            fontWeight="bold"
          >
            D:{district.companyDominion}
          </text>
          {/* Notice indicator */}
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fill={isDanger ? '#dc143c' : isWarning ? '#ffa500' : '#ffd700'}
            fontSize="12"
          >
            N:{district.notice}
          </text>
        </g>
      )}

      {/* Workers assigned badge */}
      {workersAssigned > 0 && (
        <g className="worker-badge">
          <circle
            cx={cx + nodeSize - 5}
            cy={cy - nodeSize + 5}
            r="12"
            fill="#228b22"
            stroke="#f0e6d2"
            strokeWidth="2"
          />
          <text
            x={cx + nodeSize - 5}
            y={cy - nodeSize + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
          >
            {workersAssigned}
          </text>
        </g>
      )}

      {/* Mission indicator */}
      {hasMission && (
        <g className="mission-badge">
          <circle
            cx={cx - nodeSize + 5}
            cy={cy - nodeSize + 5}
            r="10"
            fill="#b8860b"
            stroke="#ffd700"
            strokeWidth="2"
            className="mission-pulse"
          />
          <text
            x={cx - nodeSize + 5}
            y={cy - nodeSize + 9}
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontWeight="bold"
          >
            M
          </text>
        </g>
      )}
    </g>
  );
}

// HQ Node component
function HQNode() {
  const cx = (HQ_POSITION.x / 100) * MAP_WIDTH;
  const cy = (HQ_POSITION.y / 100) * MAP_HEIGHT;

  return (
    <g className="hq-node">
      {/* HQ building shape */}
      <polygon
        points={`${cx},${cy - 25} ${cx + 20},${cy + 15} ${cx - 20},${cy + 15}`}
        fill="url(#hq-gradient)"
        stroke="#ffd700"
        strokeWidth="3"
      />
      <rect
        x={cx - 15}
        y={cy - 5}
        width="30"
        height="20"
        fill="#2d1515"
        stroke="#8b4513"
        strokeWidth="2"
      />
      {/* HQ label */}
      <text
        x={cx}
        y={cy + 35}
        textAnchor="middle"
        fill="#ffd700"
        fontSize="12"
        fontWeight="bold"
      >
        Company HQ
      </text>
    </g>
  );
}

// Mission path line from HQ to district
interface MissionPathProps {
  mission: Mission;
  targetDistrict: District;
}

function MissionPath({ mission, targetDistrict }: MissionPathProps) {
  const template = getDistrictTemplate(targetDistrict.name);
  if (!template) return null;

  const startX = (HQ_POSITION.x / 100) * MAP_WIDTH;
  const startY = (HQ_POSITION.y / 100) * MAP_HEIGHT;
  const endX = (template.mapPosition.x / 100) * MAP_WIDTH;
  const endY = (template.mapPosition.y / 100) * MAP_HEIGHT;

  // Create a curved path
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 - 30; // Curve upward

  const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

  // Color based on mission status
  const statusColors = {
    preparing: '#b8860b',
    in_progress: '#32cd32',
    completed: '#228b22',
    failed: '#dc143c',
  };

  return (
    <g className="mission-path">
      {/* Path shadow */}
      <path
        d={pathD}
        fill="none"
        stroke="#000"
        strokeWidth="6"
        opacity="0.3"
      />
      {/* Main path */}
      <path
        d={pathD}
        fill="none"
        stroke={statusColors[mission.status]}
        strokeWidth="3"
        strokeDasharray={mission.status === 'preparing' ? '10,5' : 'none'}
        className={mission.status === 'in_progress' ? 'path-animated' : ''}
      />
      {/* Agent icons on path */}
      {mission.assignedAgents.length > 0 && (
        <circle
          cx={midX}
          cy={midY}
          r="8"
          fill={statusColors[mission.status]}
          stroke="#f0e6d2"
          strokeWidth="2"
          className="agent-marker"
        >
          <title>{mission.assignedAgents.length} agent(s) deployed</title>
        </circle>
      )}
    </g>
  );
}

// Selected district detail panel
interface DistrictDetailPanelProps {
  district: District;
  onClose: () => void;
  onAssignWorker: (job: WorkerJob) => void;
  workersAssigned: number;
}

function DistrictDetailPanel({ district, onClose, onAssignWorker, workersAssigned }: DistrictDetailPanelProps) {
  const { state } = useGame();
  const template = getDistrictTemplate(district.name);

  const availableJobs: WorkerJob[] = ['extraction', 'trading', 'espionage', 'discretion', 'expansion'];
  const canAssignMoreWorkers = state.workerAssignments.length < state.workerCount;

  return (
    <div className="district-detail-panel">
      <div className="detail-header">
        <h3>{district.name}</h3>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>

      <p className="detail-description">{district.description}</p>

      {template && (
        <div className="detail-terrain">
          <span className="terrain-label">Terrain:</span>
          <span className={`terrain-type ${template.terrain}`}>
            {template.terrain.charAt(0).toUpperCase() + template.terrain.slice(1)}
          </span>
        </div>
      )}

      <div className="detail-stats">
        {district.revealed ? (
          <>
            <div className="stat-row">
              <span className="stat-name">Authority</span>
              <div className="stat-bar-bg">
                <div
                  className="stat-bar-fill authority"
                  style={{ width: `${district.infernalAuthority * 10}%` }}
                />
              </div>
              <span className="stat-val">{district.infernalAuthority}/10</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Dominion</span>
              <div className="stat-bar-bg">
                <div
                  className="stat-bar-fill dominion"
                  style={{ width: `${district.companyDominion * 10}%` }}
                />
              </div>
              <span className="stat-val">{district.companyDominion}/10</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Notice</span>
              <div className="stat-bar-bg">
                <div
                  className={`stat-bar-fill notice ${district.notice >= 7 ? 'danger' : district.notice >= 4 ? 'warning' : ''}`}
                  style={{ width: `${district.notice * 10}%` }}
                />
              </div>
              <span className="stat-val">{district.notice}/10</span>
            </div>
          </>
        ) : (
          <div className="unrevealed-notice">
            <span>Intelligence required</span>
            <small>Assign a worker to Espionage</small>
          </div>
        )}
      </div>

      {workersAssigned > 0 && (
        <div className="workers-info">
          {workersAssigned} worker{workersAssigned > 1 ? 's' : ''} assigned
        </div>
      )}

      {state.phase === 'assignment' && (
        <div className="job-actions">
          <h4>Assign Worker</h4>
          <div className="job-grid">
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
                    className={`job-btn ${canAssign ? '' : 'disabled'}`}
                    onClick={() => canAssign && onAssignWorker(job)}
                    disabled={!canAssign}
                  >
                    <span className="job-btn-name">{config.name}</span>
                    {config.cost?.materiel && (
                      <span className="job-btn-cost">-{config.cost.materiel}</span>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Map legend component
function MapLegend() {
  return (
    <div className="map-legend">
      <h4>Legend</h4>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-icon hq-icon" />
          <span>Company HQ</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon district-icon" />
          <span>District</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon worker-icon" />
          <span>Workers Assigned</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon mission-icon" />
          <span>Active Mission</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon danger-icon" />
          <span>High Notice (7+)</span>
        </div>
      </div>
    </div>
  );
}

// Main WorldMap component
export function WorldMap() {
  const { state } = useGame();
  const { assignWorker } = useGameActions();
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  // Count workers per district
  const workersPerDistrict = useMemo(() => {
    return state.districts.reduce((acc, d) => {
      acc[d.id] = state.workerAssignments.filter(a => a.districtId === d.id).length;
      return acc;
    }, {} as Record<string, number>);
  }, [state.districts, state.workerAssignments]);

  // Group missions by district
  const missionsByDistrict = useMemo(() => {
    return state.missions.reduce((acc, m) => {
      if (!acc[m.districtId]) acc[m.districtId] = [];
      acc[m.districtId].push(m);
      return acc;
    }, {} as Record<string, Mission[]>);
  }, [state.missions]);

  const selectedDistrict = state.districts.find(d => d.id === selectedDistrictId);

  // Active missions (not completed/failed)
  const activeMissions = state.missions.filter(m =>
    m.status === 'preparing' || m.status === 'in_progress'
  );

  return (
    <div className="world-map-container">
      <div className="map-header">
        <Tooltip
          content={
            <TooltipContent
              title="World Map - The Infernal Territories"
              description="A bird's eye view of Hell's districts under company operation."
              details={[
                'Click on a district to view details and assign workers',
                'Lines show active missions from HQ to districts',
                'District size reflects your Dominion level',
                'Red pulse indicates dangerously high Notice'
              ]}
            />
          }
          position="bottom"
        >
          <h2>The Infernal Territories</h2>
        </Tooltip>
      </div>

      <div className="map-content">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="world-map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* SVG Definitions for gradients and patterns */}
          <defs>
            {/* Terrain gradients */}
            <radialGradient id="terrain-volcanic" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff4500" />
              <stop offset="100%" stopColor="#8b0000" />
            </radialGradient>
            <radialGradient id="terrain-industrial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b4513" />
              <stop offset="100%" stopColor="#4a4a4a" />
            </radialGradient>
            <radialGradient id="terrain-urban" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b4513" />
              <stop offset="100%" stopColor="#2d1515" />
            </radialGradient>
            <radialGradient id="terrain-docks" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4682b4" />
              <stop offset="100%" stopColor="#1a3a3a" />
            </radialGradient>
            <radialGradient id="terrain-wasteland" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a0522d" />
              <stop offset="100%" stopColor="#3d2b1f" />
            </radialGradient>

            {/* HQ gradient */}
            <linearGradient id="hq-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#8b4513" />
            </linearGradient>

            {/* Background pattern - hellfire */}
            <pattern id="hellfire-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#0d0505" />
              <circle cx="25" cy="25" r="20" fill="#1a0808" opacity="0.5" />
              <circle cx="75" cy="75" r="15" fill="#1a0808" opacity="0.3" />
              <circle cx="50" cy="50" r="10" fill="#2d1010" opacity="0.4" />
            </pattern>

            {/* River Styx pattern */}
            <linearGradient id="styx-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="50%" stopColor="#16213e" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect
            x="0"
            y="0"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            fill="url(#hellfire-pattern)"
          />

          {/* Atmospheric effects - distant flames */}
          <g className="background-flames" opacity="0.3">
            <ellipse cx="150" cy="600" rx="100" ry="50" fill="#8b0000" />
            <ellipse cx="850" cy="150" rx="80" ry="40" fill="#8b0000" />
            <ellipse cx="500" cy="680" rx="120" ry="30" fill="#8b0000" />
          </g>

          {/* River Styx - winding through the map */}
          <path
            d="M 0 400 Q 200 350, 350 450 T 600 400 T 850 500 T 1000 450"
            fill="none"
            stroke="url(#styx-gradient)"
            strokeWidth="40"
            opacity="0.6"
            className="river-styx"
          />
          <path
            d="M 0 400 Q 200 350, 350 450 T 600 400 T 850 500 T 1000 450"
            fill="none"
            stroke="#0a0a1a"
            strokeWidth="30"
            opacity="0.8"
          />

          {/* Mountain ranges */}
          <g className="mountains" opacity="0.4">
            <polygon points="0,100 100,0 200,100" fill="#2d1515" />
            <polygon points="150,100 250,20 350,100" fill="#3d2020" />
            <polygon points="800,150 900,50 1000,150" fill="#2d1515" />
            <polygon points="850,200 950,100 1000,200" fill="#3d2020" />
          </g>

          {/* Mission paths - render behind districts */}
          <g className="mission-paths">
            {activeMissions.map(mission => {
              const targetDistrict = state.districts.find(d => d.id === mission.districtId);
              if (!targetDistrict) return null;
              return (
                <MissionPath
                  key={mission.id}
                  mission={mission}
                  targetDistrict={targetDistrict}
                />
              );
            })}
          </g>

          {/* HQ */}
          <HQNode />

          {/* District nodes */}
          <g className="district-nodes">
            {state.districts.map(district => (
              <DistrictNode
                key={district.id}
                district={district}
                isSelected={district.id === selectedDistrictId}
                onSelect={() => setSelectedDistrictId(
                  district.id === selectedDistrictId ? null : district.id
                )}
                workersAssigned={workersPerDistrict[district.id] || 0}
                activeMissions={missionsByDistrict[district.id] || []}
              />
            ))}
          </g>
        </svg>

        {/* Legend overlay */}
        <MapLegend />

        {/* Selected district detail panel */}
        {selectedDistrict && (
          <DistrictDetailPanel
            district={selectedDistrict}
            onClose={() => setSelectedDistrictId(null)}
            onAssignWorker={(job) => assignWorker(selectedDistrict.id, job)}
            workersAssigned={workersPerDistrict[selectedDistrict.id] || 0}
          />
        )}
      </div>
    </div>
  );
}
