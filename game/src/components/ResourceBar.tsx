import { useGame } from '../context/GameContext';
import './ResourceBar.css';

export function ResourceBar() {
  const { state } = useGame();
  const { resources, profitTarget, quarterStartSovereigns, currentQuarter, currentWeek, charterStrain, princeAttention } = state;

  const currentProfit = resources.sovereigns - quarterStartSovereigns;
  const weeksUntilQuarterEnd = 13 - ((currentWeek - 1) % 13);

  return (
    <div className="resource-bar">
      <div className="resource-group">
        <div className="resource sovereigns">
          <span className="resource-icon">&#x2660;</span>
          <span className="resource-label">Sovereigns</span>
          <span className="resource-value">{resources.sovereigns.toLocaleString()}</span>
        </div>
        <div className="resource materiel">
          <span className="resource-icon">&#x2692;</span>
          <span className="resource-label">Materiel</span>
          <span className="resource-value">{resources.materiel}</span>
        </div>
        <div className="resource influence">
          <span className="resource-icon">&#x2620;</span>
          <span className="resource-label">Influence</span>
          <span className="resource-value">{resources.influence}</span>
        </div>
      </div>

      <div className="status-group">
        <div className="status-item">
          <span className="status-label">Week</span>
          <span className="status-value">{currentWeek}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Quarter</span>
          <span className="status-value">{currentQuarter}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Phase</span>
          <span className="status-value phase-badge">{state.phase}</span>
        </div>
      </div>

      <div className="threat-group">
        <div className={`threat-item ${charterStrain > 0 ? 'warning' : ''}`}>
          <span className="threat-label">Charter Strain</span>
          <span className="threat-value">{charterStrain}/3</span>
        </div>
        <div className={`threat-item ${princeAttention >= 7 ? 'danger' : princeAttention >= 4 ? 'warning' : ''}`}>
          <span className="threat-label">Prince Attention</span>
          <span className="threat-value">{princeAttention}/10</span>
        </div>
      </div>

      <div className="profit-tracker">
        <div className="profit-header">
          <span>Q{currentQuarter} Profit Target</span>
          <span>{weeksUntilQuarterEnd} weeks left</span>
        </div>
        <div className="profit-bar-container">
          <div
            className={`profit-bar ${currentProfit >= profitTarget ? 'success' : currentProfit >= profitTarget * 0.5 ? 'warning' : ''}`}
            style={{ width: `${Math.min(100, (currentProfit / profitTarget) * 100)}%` }}
          />
        </div>
        <div className="profit-numbers">
          <span className={currentProfit < 0 ? 'negative' : ''}>{currentProfit}</span>
          <span>/</span>
          <span>{profitTarget}</span>
        </div>
      </div>
    </div>
  );
}
