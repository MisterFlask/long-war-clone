import { GameProvider } from './context/GameContext';
import { ResourceBar } from './components/ResourceBar';
import { DistrictPanel } from './components/DistrictPanel';
import { WorkerPanel } from './components/WorkerPanel';
import { AgentPanel } from './components/AgentPanel';
import { MissionPanel } from './components/MissionPanel';
import { MessageLog } from './components/MessageLog';
import { GameOverScreen } from './components/GameOverScreen';
import './App.css';

function GameContent() {
  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-title">
          <h1>Hell EIC</h1>
          <span className="subtitle">Hellfire East India Company</span>
        </div>
        <div className="header-motto">
          <em>"The paperwork is damning"</em>
        </div>
      </header>

      <ResourceBar />

      <main className="game-main">
        <div className="main-left">
          <DistrictPanel />
        </div>

        <div className="main-right">
          <div className="sidebar-section">
            <WorkerPanel />
          </div>
          <div className="sidebar-section">
            <AgentPanel />
          </div>
          <div className="sidebar-section">
            <MissionPanel />
          </div>
          <div className="sidebar-section log-section">
            <MessageLog />
          </div>
        </div>
      </main>

      <GameOverScreen />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
