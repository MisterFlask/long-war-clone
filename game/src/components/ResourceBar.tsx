import { useGame } from '../context/GameContext';
import { Tooltip, TooltipContent } from './Tooltip';
import './ResourceBar.css';

export function ResourceBar() {
  const { state } = useGame();
  const { resources, profitTarget, quarterStartSovereigns, currentQuarter, currentWeek, charterStrain, princeAttention, phase } = state;

  const currentProfit = resources.sovereigns - quarterStartSovereigns;
  const weeksUntilQuarterEnd = 13 - ((currentWeek - 1) % 13);

  return (
    <div className="resource-bar">
      <div className="resource-group">
        <Tooltip
          content={
            <TooltipContent
              title="Sovereigns"
              description="The primary currency of your hellish enterprise. Used to pay upkeep, fund missions, and meet quarterly profit targets."
              details={[
                'Earned by Trading materiel or Smuggling missions',
                'Spent on district upkeep and Tribute Delivery',
                'Must meet profit targets each quarter or face Charter Strain'
              ]}
            />
          }
          position="bottom"
        >
          <div className="resource sovereigns">
            <span className="resource-icon">&#x2660;</span>
            <span className="resource-label">Sovereigns</span>
            <span className="resource-value">{resources.sovereigns.toLocaleString()}</span>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Materiel"
              description="Raw goods, equipment, and supplies extracted from Hell's resources. The lifeblood of your trading operations."
              details={[
                'Gained through Extraction jobs (equals district Dominion)',
                'Convert to Sovereigns via Trading jobs',
                'Required for Expansion (5 Materiel per attempt)',
                'Also gained through Extraction Run missions'
              ]}
            />
          }
          position="bottom"
        >
          <div className="resource materiel">
            <span className="resource-icon">&#x2692;</span>
            <span className="resource-label">Materiel</span>
            <span className="resource-value">{resources.materiel}</span>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Influence"
              description="Political capital, favors owed, and blackmail material. Represents your sway over Hell's various factions."
              details={[
                'Used for advanced negotiations and special actions',
                'Can help reduce Notice or Charter Strain',
                'Gained through successful high-level missions'
              ]}
            />
          }
          position="bottom"
        >
          <div className="resource influence">
            <span className="resource-icon">&#x2620;</span>
            <span className="resource-label">Influence</span>
            <span className="resource-value">{resources.influence}</span>
          </div>
        </Tooltip>
      </div>

      <div className="status-group">
        <Tooltip
          content={
            <TooltipContent
              title="Current Week"
              description="The current week within the quarter. Each quarter consists of 13 weeks."
              details={[
                'Each week has multiple phases: Assignment, Resolution, Advancement, Upkeep, Notice, Event',
                'Missions advance during the Advancement phase',
                `${weeksUntilQuarterEnd} weeks remain until quarter end`
              ]}
            />
          }
          position="bottom"
        >
          <div className="status-item">
            <span className="status-label">Week</span>
            <span className="status-value">{currentWeek}</span>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Current Quarter"
              description="The fiscal quarter of your charter. Each quarter brings higher profit targets and new challenges."
              details={[
                'Quarter 1: 200 Sovereigns profit target',
                'Quarter 2: 350 Sovereigns profit target',
                'Quarter 3+: Escalating targets',
                'Failing to meet targets adds Charter Strain'
              ]}
              warning="Missing profit targets will result in Charter Strain!"
            />
          }
          position="bottom"
        >
          <div className="status-item">
            <span className="status-label">Quarter</span>
            <span className="status-value">{currentQuarter}</span>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title={`Current Phase: ${phase.charAt(0).toUpperCase() + phase.slice(1)}`}
              description={getPhaseDescription(phase)}
              details={getPhaseDetails(phase)}
            />
          }
          position="bottom"
        >
          <div className="status-item">
            <span className="status-label">Phase</span>
            <span className="status-value phase-badge">{phase}</span>
          </div>
        </Tooltip>
      </div>

      <div className="threat-group">
        <Tooltip
          content={
            <TooltipContent
              title="Charter Strain"
              description="Measures how close you are to losing your royal charter to operate in Hell. Accumulated through poor performance."
              details={[
                'Gained by missing quarterly profit targets',
                'Gained by excessive Prince Attention',
                '3 Charter Strain = Game Over',
                'Can sometimes be reduced through Influence'
              ]}
              warning={charterStrain >= 2 ? 'CRITICAL: One more strain and your charter is revoked!' : charterStrain >= 1 ? 'Warning: Your charter is under scrutiny.' : undefined}
            />
          }
          position="bottom"
        >
          <div className={`threat-item ${charterStrain > 0 ? 'warning' : ''}`}>
            <span className="threat-label">Charter Strain</span>
            <span className="threat-value">{charterStrain}/3</span>
          </div>
        </Tooltip>

        <Tooltip
          content={
            <TooltipContent
              title="Prince Attention"
              description="How much notice the local Infernal Prince has taken of your operations. Too much attention invites catastrophe."
              details={[
                'Increases when district Notice reaches high levels',
                'Risky missions and aggressive expansion draw attention',
                '10 Prince Attention = Game Over',
                'Reduce through Discretion jobs and Tribute Delivery'
              ]}
              warning={princeAttention >= 7 ? 'DANGER: The Prince\'s gaze is upon you!' : princeAttention >= 4 ? 'Caution: You are drawing unwanted attention.' : undefined}
            />
          }
          position="bottom"
        >
          <div className={`threat-item ${princeAttention >= 7 ? 'danger' : princeAttention >= 4 ? 'warning' : ''}`}>
            <span className="threat-label">Prince Attention</span>
            <span className="threat-value">{princeAttention}/10</span>
          </div>
        </Tooltip>
      </div>

      <Tooltip
        content={
          <TooltipContent
            title={`Q${currentQuarter} Profit Target`}
            description="Your required profit for this quarter. Profit is calculated as current Sovereigns minus starting Sovereigns for the quarter."
            details={[
              `Current profit: ${currentProfit} Sovereigns`,
              `Target: ${profitTarget} Sovereigns`,
              `${weeksUntilQuarterEnd} weeks remaining`,
              currentProfit >= profitTarget ? 'Target achieved!' : `Need ${profitTarget - currentProfit} more Sovereigns`
            ]}
            warning={currentProfit < profitTarget && weeksUntilQuarterEnd <= 3 ? 'Time is running out to meet your target!' : undefined}
          />
        }
        position="bottom"
      >
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
      </Tooltip>
    </div>
  );
}

function getPhaseDescription(phase: string): string {
  switch (phase) {
    case 'assignment':
      return 'Assign your workers to jobs and plan new missions. This is your main decision-making phase.';
    case 'resolution':
      return 'Missions that have finished preparation are now executed. Success or failure is determined.';
    case 'advancement':
      return 'Time passes. Mission preparation timers advance, bringing missions closer to execution.';
    case 'upkeep':
      return 'Pay upkeep costs for your districts based on Dominion levels. Failure to pay reduces Dominion.';
    case 'notice':
      return 'Notice levels in districts are checked. High Notice can escalate to Prince Attention.';
    case 'event':
      return 'Random events may occur, presenting opportunities or challenges to your operations.';
    default:
      return 'Processing game state...';
  }
}

function getPhaseDetails(phase: string): string[] {
  switch (phase) {
    case 'assignment':
      return [
        'Click districts to assign workers to jobs',
        'Plan new missions with available agents',
        'Click "End Week" when ready to proceed'
      ];
    case 'resolution':
      return [
        'Prepared missions are executed',
        'Agents gain XP from successful missions',
        'Failed missions may injure agents'
      ];
    case 'advancement':
      return [
        'Mission prep timers count down',
        'Agents on missions remain unavailable'
      ];
    case 'upkeep':
      return [
        'Pay 2 Sovereigns per Dominion level',
        'Unpaid upkeep reduces Dominion'
      ];
    case 'notice':
      return [
        'Districts with Notice 7+ may alert the Prince',
        'Prince Attention increases from high Notice'
      ];
    case 'event':
      return [
        'Random events may trigger',
        'Some events offer choices with trade-offs'
      ];
    default:
      return [];
  }
}
