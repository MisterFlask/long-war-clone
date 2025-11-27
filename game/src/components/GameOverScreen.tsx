import { useGame, useGameActions } from '../context/GameContext';
import './GameOverScreen.css';

export function GameOverScreen() {
  const { state } = useGame();
  const { newGame } = useGameActions();

  if (!state.gameOver && !state.victory) return null;

  const isVictory = state.victory;

  return (
    <div className="game-over-overlay">
      <div className={`game-over-modal ${isVictory ? 'victory' : 'defeat'}`}>
        <div className="game-over-header">
          <h1>{isVictory ? 'VICTORY' : 'GAME OVER'}</h1>
          <div className="game-over-icon">
            {isVictory ? '&#x2606;' : '&#x2620;'}
          </div>
        </div>

        <div className="game-over-content">
          {isVictory ? (
            <>
              <p className="game-over-message">
                Against all odds, you have established dominion over the infernal realms.
                The Company is most pleased with your quarterly reports.
              </p>
              <p className="game-over-flavor">
                Your name shall be whispered in the halls of commerce and damnation alike.
                A corner office awaits you in the mortal realm.
              </p>
            </>
          ) : (
            <>
              <p className="game-over-message">
                {state.gameOverReason === 'charter_revoked'
                  ? 'The Hellfire East India Company has revoked your charter. Your operation is seized and your assets liquidated.'
                  : state.gameOverReason === 'prince_attention'
                  ? 'A Prince of Hell has taken personal interest in your affairs. There is no court of appeal in the infernal realms.'
                  : 'Your venture has come to an unfortunate end.'}
              </p>
              <p className="game-over-flavor">
                {state.gameOverReason === 'charter_revoked'
                  ? 'Perhaps you should have met those profit targets. The board does not tolerate failure.'
                  : state.gameOverReason === 'prince_attention'
                  ? 'Discretion is the better part of commerce in Hell. You drew too much attention.'
                  : 'Better luck in your next incarnation.'}
              </p>
            </>
          )}

          <div className="game-over-stats">
            <div className="stat-row">
              <span className="stat-label">Weeks Survived</span>
              <span className="stat-value">{state.currentWeek}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Quarters Completed</span>
              <span className="stat-value">{state.currentQuarter - 1}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Final Sovereigns</span>
              <span className="stat-value">{state.resources.sovereigns.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Districts Dominated</span>
              <span className="stat-value">
                {state.districts.filter((d) => d.companyDominion >= 7).length}/4
              </span>
            </div>
          </div>
        </div>

        <button className="new-game-button" onClick={newGame}>
          Begin New Venture
        </button>
      </div>
    </div>
  );
}
