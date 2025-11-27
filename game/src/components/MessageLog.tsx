import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import './MessageLog.css';

export function MessageLog() {
  const { state } = useGame();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  return (
    <div className="message-log">
      <div className="log-header">
        <h3>Company Ledger</h3>
      </div>
      <div className="log-content">
        {state.messages.map((message, index) => {
          let className = 'log-entry';
          if (message.startsWith('GAME OVER')) className += ' game-over';
          else if (message.startsWith('VICTORY')) className += ' victory';
          else if (message.startsWith('CRITICAL')) className += ' critical';
          else if (message.startsWith('WARNING')) className += ' warning';
          else if (message.includes('SUCCESS')) className += ' success';
          else if (message.includes('FAILED')) className += ' failed';
          else if (message.startsWith('---')) className += ' week-marker';
          else if (message.startsWith('QUARTER')) className += ' quarter';

          return (
            <div key={index} className={className}>
              {message}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
