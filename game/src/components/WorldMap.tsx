import { useState, useMemo } from 'react';
import { useGame, useGameActions } from '../context/GameContext';
import type { District, WorkerJob, Mission, Tile } from '../types/game';
import { JOB_CONFIGS, TILE_CONFIGS, TILE_SIZE, getDistrictTemplate } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import './WorldMap.css';

// Terrain colors for district nodes
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

// Single tile rendering component
interface TileRendererProps {
  tile: Tile;
  x: number;
  y: number;
  isDistrictTile: boolean;
  isHQTile: boolean;
}

function TileRenderer({ tile, x, y, isDistrictTile, isHQTile }: TileRendererProps) {
  const config = TILE_CONFIGS[tile.type];
  const color = config.colors[tile.variant % config.colors.length];

  // Add slight brightness variation based on elevation
  const brightness = 0.9 + tile.elevation * 0.2;

  return (
    <div
      className={`tile tile-${tile.type} ${isDistrictTile ? 'tile-district' : ''} ${isHQTile ? 'tile-hq' : ''}`}
      style={{
        left: x * TILE_SIZE,
        top: y * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: color,
        filter: `brightness(${brightness})`,
      }}
    >
      {config.symbol && !isDistrictTile && !isHQTile && (
        <span className="tile-symbol">{config.symbol}</span>
      )}
    </div>
  );
}

interface DistrictNodeProps {
  district: District;
  isSelected: boolean;
  onSelect: () => void;
  workersAssigned: number;
  activeMissions: Mission[];
  position: { x: number; y: number };
}

function DistrictNode({ district, isSelected, onSelect, workersAssigned, activeMissions, position }: DistrictNodeProps) {
  const template = getDistrictTemplate(district.name);
  if (!template) return null;

  const terrain = template.terrain;
  const colors = TERRAIN_COLORS[terrain];

  // Position in pixels (centered on the tile)
  const cx = position.x * TILE_SIZE + TILE_SIZE / 2;
  const cy = position.y * TILE_SIZE + TILE_SIZE / 2;

  // Node size based on dominion (larger = more control)
  const baseSize = 28;
  const dominionBonus = district.revealed ? district.companyDominion * 1.5 : 0;
  const nodeSize = baseSize + dominionBonus;

  // Notice affects the pulsing danger indicator
  const isDanger = district.revealed && district.notice >= 7;
  const isWarning = district.revealed && district.notice >= 4 && district.notice < 7;

  // Get mission status indicator
  const hasMission = activeMissions.length > 0;

  return (
    <div
      className={`district-node-container ${isSelected ? 'selected' : ''} ${isDanger ? 'danger' : ''} ${isWarning ? 'warning' : ''}`}
      style={{
        left: cx,
        top: cy,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onSelect}
    >
      {/* Outer glow ring */}
      <div
        className="node-glow"
        style={{
          width: nodeSize + 20,
          height: nodeSize + 20,
          borderColor: isDanger ? '#dc143c' : isWarning ? '#ffa500' : colors.glow,
        }}
      />

      {/* Danger pulse effect */}
      {isDanger && <div className="danger-pulse" style={{ width: nodeSize + 30, height: nodeSize + 30 }} />}

      {/* Main district circle */}
      <div
        className="node-main"
        style={{
          width: nodeSize,
          height: nodeSize,
          background: `radial-gradient(circle, ${colors.secondary}, ${colors.primary})`,
          borderColor: isSelected ? '#ffd700' : colors.secondary,
          borderWidth: isSelected ? 3 : 2,
        }}
      >
        {/* Unrevealed indicator */}
        {!district.revealed && <span className="unrevealed-indicator">?</span>}

        {/* Revealed stats mini-display */}
        {district.revealed && (
          <div className="mini-stats">
            <span className="stat-dominion">D:{district.companyDominion}</span>
            <span className={`stat-notice ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
              N:{district.notice}
            </span>
          </div>
        )}
      </div>

      {/* District name label */}
      <div className="district-label">{district.name}</div>

      {/* Workers assigned badge */}
      {workersAssigned > 0 && (
        <div className="worker-badge">
          {workersAssigned}
        </div>
      )}

      {/* Mission indicator */}
      {hasMission && (
        <div className="mission-badge">M</div>
      )}
    </div>
  );
}

// HQ Node component
function HQNode({ position }: { position: { x: number; y: number } }) {
  const cx = position.x * TILE_SIZE + TILE_SIZE / 2;
  const cy = position.y * TILE_SIZE + TILE_SIZE / 2;

  return (
    <div
      className="hq-node-container"
      style={{
        left: cx,
        top: cy,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="hq-building" />
      <div className="hq-label">Company HQ</div>
    </div>
  );
}

// Mission path line from HQ to district
interface MissionPathProps {
  mission: Mission;
  hqPosition: { x: number; y: number };
  districtPosition: { x: number; y: number };
}

function MissionPath({ mission, hqPosition, districtPosition }: MissionPathProps) {
  const startX = hqPosition.x * TILE_SIZE + TILE_SIZE / 2;
  const startY = hqPosition.y * TILE_SIZE + TILE_SIZE / 2;
  const endX = districtPosition.x * TILE_SIZE + TILE_SIZE / 2;
  const endY = districtPosition.y * TILE_SIZE + TILE_SIZE / 2;

  // Color based on mission status
  const statusColors = {
    preparing: '#b8860b',
    in_progress: '#32cd32',
    completed: '#228b22',
    failed: '#dc143c',
  };

  const color = statusColors[mission.status];
  const isDashed = mission.status === 'preparing';
  const isAnimated = mission.status === 'in_progress';

  // Calculate line length and angle
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className={`mission-path ${isDashed ? 'dashed' : ''} ${isAnimated ? 'animated' : ''}`}
      style={{
        left: startX,
        top: startY,
        width: length,
        backgroundColor: color,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
      }}
    >
      {/* Agent marker at midpoint */}
      {mission.assignedAgents.length > 0 && (
        <div
          className="agent-marker"
          style={{ backgroundColor: color }}
          title={`${mission.assignedAgents.length} agent(s) deployed`}
        />
      )}
    </div>
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
      <div className="legend-terrain">
        <h5>Terrain</h5>
        <div className="terrain-items">
          <div className="terrain-item"><span className="terrain-color river"></span>River Styx</div>
          <div className="terrain-item"><span className="terrain-color mountain"></span>Mountains</div>
          <div className="terrain-item"><span className="terrain-color volcanic"></span>Volcanic</div>
          <div className="terrain-item"><span className="terrain-color industrial"></span>Industrial</div>
          <div className="terrain-item"><span className="terrain-color urban"></span>Urban</div>
          <div className="terrain-item"><span className="terrain-color docks"></span>Docks</div>
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

  const { tilemap } = state;

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

  // Calculate map dimensions
  const mapWidth = tilemap.width * TILE_SIZE;
  const mapHeight = tilemap.height * TILE_SIZE;

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
        <div
          className="tilemap-container"
          style={{
            width: mapWidth,
            height: mapHeight,
          }}
        >
          {/* Render all tiles */}
          <div className="tilemap-layer tiles-layer">
            {tilemap.tiles.map((row, y) =>
              row.map((tile, x) => (
                <TileRenderer
                  key={`${x}-${y}`}
                  tile={tile}
                  x={x}
                  y={y}
                  isDistrictTile={!!tile.districtId}
                  isHQTile={!!tile.isHQ}
                />
              ))
            )}
          </div>

          {/* Mission paths layer */}
          <div className="tilemap-layer paths-layer">
            {activeMissions.map(mission => {
              const districtPosition = tilemap.districtPositions.get(mission.districtId);
              if (!districtPosition) return null;
              return (
                <MissionPath
                  key={mission.id}
                  mission={mission}
                  hqPosition={tilemap.hqPosition}
                  districtPosition={districtPosition}
                />
              );
            })}
          </div>

          {/* HQ layer */}
          <div className="tilemap-layer entities-layer">
            <HQNode position={tilemap.hqPosition} />
          </div>

          {/* Districts layer */}
          <div className="tilemap-layer districts-layer">
            {state.districts.map(district => {
              const position = tilemap.districtPositions.get(district.id);
              if (!position) return null;
              return (
                <DistrictNode
                  key={district.id}
                  district={district}
                  isSelected={district.id === selectedDistrictId}
                  onSelect={() => setSelectedDistrictId(
                    district.id === selectedDistrictId ? null : district.id
                  )}
                  workersAssigned={workersPerDistrict[district.id] || 0}
                  activeMissions={missionsByDistrict[district.id] || []}
                  position={position}
                />
              );
            })}
          </div>
        </div>

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
