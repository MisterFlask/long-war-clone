import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  GameState,
  WorkerJob,
  MissionType,
} from '../types/game';
import {
  createInitialGameState,
  assignWorker,
  unassignWorker,
  createMission,
  acceptMission,
  cancelMission,
  advancePhase,
  advanceWeek,
  addMessage,
} from '../services/gameLogic';

// Action types
type GameAction =
  | { type: 'ASSIGN_WORKER'; districtId: string; job: WorkerJob }
  | { type: 'UNASSIGN_WORKER'; index: number }
  | { type: 'CREATE_MISSION'; missionType: MissionType; districtId: string; agentIds: string[]; preparationWeeks: number }
  | { type: 'ACCEPT_MISSION'; opportunityId: string; agentIds: string[]; preparationWeeks: number }
  | { type: 'CANCEL_MISSION'; missionId: string }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'NEW_GAME' }
  | { type: 'DISMISS_EVENT' }
  | { type: 'ADD_MESSAGE'; message: string };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ASSIGN_WORKER':
      return assignWorker(state, action.districtId, action.job);
    case 'UNASSIGN_WORKER':
      return unassignWorker(state, action.index);
    case 'CREATE_MISSION':
      return createMission(
        state,
        action.missionType,
        action.districtId,
        action.agentIds,
        action.preparationWeeks
      );
    case 'ACCEPT_MISSION':
      return acceptMission(
        state,
        action.opportunityId,
        action.agentIds,
        action.preparationWeeks
      );
    case 'CANCEL_MISSION':
      return cancelMission(state, action.missionId);
    case 'ADVANCE_PHASE':
      return advancePhase(state);
    case 'ADVANCE_WEEK':
      return advanceWeek(state);
    case 'NEW_GAME':
      return createInitialGameState();
    case 'DISMISS_EVENT':
      return { ...state, currentEvent: null };
    case 'ADD_MESSAGE':
      return addMessage(state, action.message);
    default:
      return state;
  }
}

// Context type
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialGameState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Convenience hooks for common actions
export function useGameActions() {
  const { dispatch } = useGame();

  return {
    assignWorker: (districtId: string, job: WorkerJob) =>
      dispatch({ type: 'ASSIGN_WORKER', districtId, job }),
    unassignWorker: (index: number) =>
      dispatch({ type: 'UNASSIGN_WORKER', index }),
    createMission: (
      missionType: MissionType,
      districtId: string,
      agentIds: string[],
      preparationWeeks: number
    ) =>
      dispatch({
        type: 'CREATE_MISSION',
        missionType,
        districtId,
        agentIds,
        preparationWeeks,
      }),
    acceptMission: (
      opportunityId: string,
      agentIds: string[],
      preparationWeeks: number
    ) =>
      dispatch({
        type: 'ACCEPT_MISSION',
        opportunityId,
        agentIds,
        preparationWeeks,
      }),
    cancelMission: (missionId: string) =>
      dispatch({ type: 'CANCEL_MISSION', missionId }),
    advancePhase: () => dispatch({ type: 'ADVANCE_PHASE' }),
    advanceWeek: () => dispatch({ type: 'ADVANCE_WEEK' }),
    newGame: () => dispatch({ type: 'NEW_GAME' }),
    dismissEvent: () => dispatch({ type: 'DISMISS_EVENT' }),
    addMessage: (message: string) => dispatch({ type: 'ADD_MESSAGE', message }),
  };
}
