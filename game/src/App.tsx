import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { ResourceBar } from './components/ResourceBar';
import { DistrictPanel } from './components/DistrictPanel';
import { WorldMap } from './components/WorldMap';
import { WorkerPanel } from './components/WorkerPanel';
import { AgentPanel } from './components/AgentPanel';
import { MissionPanel } from './components/MissionPanel';
import { MessageLog } from './components/MessageLog';
import { GameOverScreen } from './components/GameOverScreen';
import './App.css';

type ViewMode = 'list' | 'map';

function GameContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-title">
          <h1>Hell EIC</h1>
          <span className="subtitle">Hellfire East India Company</span>
        </div>
        <div className="header-controls">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              title="World Map View"
            >
              <span className="view-icon">&#x1F5FA;</span>
              <span className="view-label">Map</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <span className="view-icon">&#x2630;</span>
              <span className="view-label">List</span>
            </button>
          </div>
        </div>
        <div className="header-motto">
          <em>"The paperwork is damning"</em>
        </div>
      </header>

      <ResourceBar />

      <main className="game-main">
        <div className="main-left">
          {viewMode === 'map' ? <WorldMap /> : <DistrictPanel />}
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
