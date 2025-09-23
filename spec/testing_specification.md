# The Forge-Tyrant Rising: Testing Specification v1.0

## Testing Philosophy & Principles

### Test-Driven Development (TDD) Approach
```
Red → Green → Refactor
1. Write failing test that describes desired behavior
2. Write minimal code to make test pass
3. Refactor while keeping tests green
```

### Robustness Principles
- **Test behavior, not implementation**: Focus on what the system does, not how
- **Stable interfaces**: Test public APIs, avoid testing private methods
- **Deterministic outcomes**: Use controlled inputs, avoid flaky tests
- **Independent tests**: Each test should be isolated and order-independent
- **Clear failure messages**: Tests should clearly indicate what went wrong

### Testing Pyramid
```
           E2E Tests (5%)
        Integration Tests (15%)
    Unit Tests (80%)
```

## Testing Stack & Tools

### Core Testing Framework
```typescript
// Primary stack
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **@testing-library/jest-dom**: Extended matchers

// Development tools
- **@faker-js/faker**: Test data generation
- **@testing-library/user-event**: User interaction simulation
- **jest-extended**: Additional Jest matchers
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/stories/**/*'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 10000
};
```

## Unit Testing Standards

### Test Structure & Naming
```typescript
// File naming: ComponentName.test.ts / functionName.test.ts
// Test naming: should [expected behavior] when [condition]

describe('GameState Management', () => {
  describe('createNewGame', () => {
    it('should create game with 5 starting investigators when initialized', () => {
      // Arrange
      const expectedClasses = [ScholarClass, SoldierClass, OccultistClass, AlienistClass, EngineerClass];

      // Act
      const gameState = createNewGame();

      // Assert
      expect(gameState.investigators).toHaveLength(5);
      expect(gameState.investigators.map(i => i.class.constructor.name))
        .toEqual(expect.arrayContaining(expectedClasses.map(c => c.name)));
    });

    it('should start with correct initial resources when game begins', () => {
      const gameState = createNewGame();

      expect(gameState.resources.funding).toBe(GAME_CONSTANTS.STARTING_FUNDING);
      expect(gameState.resources.influence).toBe(GAME_CONSTANTS.STARTING_INFLUENCE);
      expect(gameState.doomCounter).toBe(GAME_CONSTANTS.STARTING_DOOM);
    });
  });
});
```

### Test Data Management
```typescript
// src/test/factories/gameStateFactory.ts
export const GameStateFactory = {
  create: (overrides: Partial<GameState> = {}): GameState => ({
    currentDate: new Date(1890, 0, 1),
    currentDay: 0,
    isPaused: false,
    timeSpeed: 1,
    doomCounter: 0,
    cultistStrength: 10,
    resources: { funding: 5000, influence: 50 },
    artifacts: [],
    investigators: [],
    missions: [],
    completedMissions: [],
    failedMissions: [],
    missionCooldowns: {},
    visibleNonCombatCount: 0,
    log: [],
    lastAutosaveDay: 0,
    lastDoomTickDay: 0,
    finalMissionPhase: 0,
    randomSeed: 12345, // Fixed seed for deterministic tests
    ...overrides
  }),

  withInvestigators: (count: number): GameState => {
    const investigators = Array.from({ length: count }, (_, i) =>
      InvestigatorFactory.create({ id: `inv_${i}` })
    );
    return GameStateFactory.create({ investigators });
  },

  withMissions: (missions: Mission[]): GameState =>
    GameStateFactory.create({ missions })
};

// src/test/factories/investigatorFactory.ts
export const InvestigatorFactory = {
  create: (overrides: Partial<Investigator> = {}): Investigator => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    portrait: "default_portrait",
    class: new ScholarClass(),
    level: 1,
    status: InvestigatorStatus.Available,
    currentHP: 25,
    maxHP: 25,
    baseMaxHP: 25,
    stress: 0,
    lastStressDecayDay: -999,
    corruption: 0,
    corruptionEffects: [],
    experience: 0,
    permanentTraumas: [],
    ...overrides
  }),

  available: (): Investigator =>
    InvestigatorFactory.create({ status: InvestigatorStatus.Available }),

  infiltrating: (missionId: string): Investigator =>
    InvestigatorFactory.create({
      status: InvestigatorStatus.Infiltrating,
      assignedMission: missionId,
      infiltrationCompleteDay: 5
    }),

  highStress: (): Investigator =>
    InvestigatorFactory.create({ stress: 8 }),

  corrupted: (): Investigator =>
    InvestigatorFactory.create({
      corruption: 100,
      status: InvestigatorStatus.Corrupted
    })
};
```

### Core Game Logic Tests

#### Mission System Tests
```typescript
describe('Mission Lifecycle', () => {
  describe('Combat Mission Assignment', () => {
    it('should transition investigators to Infiltrating when assigned to combat mission', () => {
      // Arrange
      const investigators = [InvestigatorFactory.available()];
      const mission = MissionFactory.combat();
      const gameState = GameStateFactory.create({ investigators, missions: [mission] });

      // Act
      const result = assignInvestigatorsToMission(gameState, mission.id, [investigators[0].id]);

      // Assert
      expect(result.success).toBe(true);
      expect(gameState.investigators[0].status).toBe(InvestigatorStatus.Infiltrating);
      expect(gameState.investigators[0].assignedMission).toBe(mission.id);
    });

    it('should reject assignment when investigator is not Available', () => {
      const investigators = [InvestigatorFactory.create({ status: InvestigatorStatus.Recovering })];
      const mission = MissionFactory.combat();
      const gameState = GameStateFactory.create({ investigators, missions: [mission] });

      const result = assignInvestigatorsToMission(gameState, mission.id, [investigators[0].id]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });
  });

  describe('Mission Generation', () => {
    it('should respect maximum visible mission limits', () => {
      const gameState = GameStateFactory.create();
      // Add 3 existing combat missions (at limit)
      gameState.missions = Array.from({ length: 3 }, () => MissionFactory.combat());

      const newMissions = generateDailyMissions(gameState);

      const combatMissions = newMissions.filter(m => m.type === MissionType.Combat);
      expect(combatMissions).toHaveLength(0);
    });

    it('should apply template requirements correctly', () => {
      const gameState = GameStateFactory.create({
        currentDay: 5,
        doomCounter: 1
      });

      // Template requires day 10+ and doom 2+
      const template = MissionTemplateFactory.create({
        requiredDay: 10,
        requiredDoom: 2
      });

      const canSpawn = checkMissionSpawnEligibility(gameState, template);

      expect(canSpawn).toBe(false);
    });
  });
});
```

#### Resource Management Tests
```typescript
describe('Resource Management', () => {
  describe('Funding System', () => {
    it('should apply influence bonus to funding rewards correctly', () => {
      const gameState = GameStateFactory.create({
        resources: { funding: 1000, influence: 60 }
      });
      const baseFunding = 1000;

      const finalReward = calculateFundingReward(gameState, baseFunding);

      // 1000 * (1 + 60 * 0.01) = 1000 * 1.6 = 1600
      expect(finalReward).toBe(1600);
    });

    it('should prevent funding from going below zero', () => {
      const gameState = GameStateFactory.create({
        resources: { funding: 100, influence: 50 }
      });

      const result = spendFunding(gameState, 200);

      expect(result.success).toBe(false);
      expect(gameState.resources.funding).toBe(100);
    });
  });

  describe('Doom Progression', () => {
    it('should increase doom after tick interval', () => {
      const gameState = GameStateFactory.create({
        currentDay: 7,
        lastDoomTickDay: 0,
        doomCounter: 2
      });

      updateDoom(gameState);

      expect(gameState.doomCounter).toBe(3);
      expect(gameState.lastDoomTickDay).toBe(7);
    });

    it('should apply artifact doom reduction effects', () => {
      const doomReductionArtifact = ArtifactFactory.create({
        effects: [new GlobalDoomReductionEffect(-1)]
      });
      const gameState = GameStateFactory.create({
        currentDay: 7,
        lastDoomTickDay: 0,
        doomCounter: 2,
        artifacts: [doomReductionArtifact]
      });

      updateDoom(gameState);

      // 1 (base tick) - 1 (artifact) = 0 increase
      expect(gameState.doomCounter).toBe(2);
    });
  });
});
```

#### Investigator System Tests
```typescript
describe('Investigator Management', () => {
  describe('Stress System', () => {
    it('should trigger breakdown at stress 10', () => {
      const investigator = InvestigatorFactory.create({
        stress: 10,
        currentHP: 30,
        status: InvestigatorStatus.Available
      });
      const gameState = GameStateFactory.create({ investigators: [investigator] });

      processStressBreakdown(gameState, investigator.id);

      expect(investigator.stress).toBe(5);
      expect(investigator.currentHP).toBe(15); // 50% of 30
      expect(investigator.status).toBe(InvestigatorStatus.Recovering);
      expect(investigator.permanentTraumas).toHaveLength(1);
    });

    it('should decay stress for Available investigators', () => {
      const investigator = InvestigatorFactory.create({
        stress: 5,
        lastStressDecayDay: 0,
        status: InvestigatorStatus.Available
      });
      const gameState = GameStateFactory.create({
        investigators: [investigator],
        currentDay: 5 // Exactly at decay interval
      });

      processStressDecay(gameState);

      expect(investigator.stress).toBe(4);
      expect(investigator.lastStressDecayDay).toBe(5);
    });
  });

  describe('Corruption System', () => {
    it('should apply threshold effects when corruption increases', () => {
      const investigator = InvestigatorFactory.create({ corruption: 20 });

      addCorruption(investigator, 10); // Total: 30, crosses 25 threshold

      const minorEffect = investigator.corruptionEffects.find(e => e.threshold === 25);
      expect(minorEffect).toBeDefined();
      expect(minorEffect?.applied).toBe(true);
    });

    it('should set status to Corrupted at 100 corruption', () => {
      const investigator = InvestigatorFactory.create({ corruption: 95 });

      addCorruption(investigator, 10); // Total: 105, clamped to 100

      expect(investigator.corruption).toBe(100);
      expect(investigator.status).toBe(InvestigatorStatus.Corrupted);
    });
  });
});
```

## Component Testing Standards

### React Component Tests
```typescript
// src/components/InvestigatorCard/InvestigatorCard.test.tsx
describe('InvestigatorCard', () => {
  const defaultProps = {
    investigator: InvestigatorFactory.available(),
    onAssign: jest.fn(),
    onViewDetails: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display investigator information correctly', () => {
    const investigator = InvestigatorFactory.create({
      name: 'John Smith',
      level: 3,
      currentHP: 25,
      maxHP: 30,
      stress: 2
    });

    render(<InvestigatorCard {...defaultProps} investigator={investigator} />);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Lv.3')).toBeInTheDocument();
    expect(screen.getByText('25/30')).toBeInTheDocument();
    expect(screen.getByText('2/10')).toBeInTheDocument();
  });

  it('should show assign button when investigator is Available', () => {
    const investigator = InvestigatorFactory.available();

    render(<InvestigatorCard {...defaultProps} investigator={investigator} />);

    const assignButton = screen.getByRole('button', { name: /assign/i });
    expect(assignButton).toBeEnabled();
  });

  it('should disable assign button when investigator is not Available', () => {
    const investigator = InvestigatorFactory.create({
      status: InvestigatorStatus.Recovering
    });

    render(<InvestigatorCard {...defaultProps} investigator={investigator} />);

    const assignButton = screen.queryByRole('button', { name: /assign/i });
    expect(assignButton).toBeNull();
  });

  it('should call onAssign when assign button is clicked', async () => {
    const user = userEvent.setup();
    const investigator = InvestigatorFactory.available();

    render(<InvestigatorCard {...defaultProps} investigator={investigator} />);

    const assignButton = screen.getByRole('button', { name: /assign/i });
    await user.click(assignButton);

    expect(defaultProps.onAssign).toHaveBeenCalledWith(investigator.id);
  });

  describe('Status Display', () => {
    it('should show green indicator for Available status', () => {
      const investigator = InvestigatorFactory.available();

      render(<InvestigatorCard {...defaultProps} investigator={investigator} />);

      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveClass('status-available');
    });

    it('should show countdown for Infiltrating status', () => {
      const investigator = InvestigatorFactory.infiltrating('mission_1');
      investigator.infiltrationCompleteDay = 10;

      render(
        <InvestigatorCard
          {...defaultProps}
          investigator={investigator}
          currentDay={7}
        />
      );

      expect(screen.getByText('3 days')).toBeInTheDocument();
    });
  });
});
```

### Custom Hook Tests
```typescript
// src/hooks/useGameState.test.ts
describe('useGameState', () => {
  it('should initialize with new game state', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.currentDay).toBe(0);
    expect(result.current.gameState.investigators).toHaveLength(5);
    expect(result.current.gameState.isPaused).toBe(false);
  });

  it('should advance time when not paused', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setTimeSpeed(1);
    });

    act(() => {
      jest.advanceTimersByTime(2000); // 2 seconds = 1 day at speed 1
    });

    expect(result.current.gameState.currentDay).toBe(1);

    jest.useRealTimers();
  });

  it('should pause when auto-pause condition is met', () => {
    const { result } = renderHook(() => useGameState());

    // Add a mission that expires in 2 days
    const mission = MissionFactory.create({
      expiresOnDay: result.current.gameState.currentDay + 2
    });

    act(() => {
      result.current.addMission(mission);
    });

    act(() => {
      // Advance to 1 day before expiration
      result.current.advanceToDay(mission.expiresOnDay - 1);
    });

    expect(result.current.gameState.isPaused).toBe(true);
  });
});
```

## Integration Testing

### Game Flow Integration Tests
```typescript
describe('Game Flow Integration', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createNewGame();
  });

  it('should complete full mission cycle successfully', async () => {
    // Arrange: Generate a combat mission
    const mission = MissionFactory.combat({
      infiltrationRequired: 3,
      difficultyRating: 2
    });
    gameState.missions.push(mission);

    const availableInvestigators = gameState.investigators
      .filter(i => i.status === InvestigatorStatus.Available)
      .slice(0, 2);

    // Act: Assign investigators
    const assignResult = assignInvestigatorsToMission(
      gameState,
      mission.id,
      availableInvestigators.map(i => i.id)
    );

    expect(assignResult.success).toBe(true);

    // Advance time to complete infiltration
    advanceGameTime(gameState, 3);

    expect(mission.status).toBe(MissionStatus.Ready);

    // Launch combat
    const combatResult: CombatResult = {
      missionSuccess: true,
      investigatorResults: availableInvestigators.map(inv => ({
        id: inv.id,
        hpLost: 5,
        stressGained: 2,
        corruptionGained: 1,
        died: false
      }))
    };

    const missionResult = resolveCombatMission(gameState, mission.id, combatResult);

    // Assert: Mission completed, rewards applied, investigators updated
    expect(missionResult.success).toBe(true);
    expect(mission.status).toBe(MissionStatus.Completed);
    expect(gameState.resources.funding).toBeGreaterThan(GAME_CONSTANTS.STARTING_FUNDING);

    availableInvestigators.forEach(inv => {
      expect(inv.currentHP).toBe(inv.maxHP - 5);
      expect(inv.stress).toBe(2);
      expect(inv.corruption).toBe(1);
      expect(inv.status).toBe(InvestigatorStatus.Available); // Low stress, no recovery needed
    });
  });

  it('should handle mission failure correctly', async () => {
    const mission = MissionFactory.combat();
    gameState.missions.push(mission);
    const investigators = gameState.investigators.slice(0, 1);

    assignInvestigatorsToMission(gameState, mission.id, [investigators[0].id]);
    advanceGameTime(gameState, mission.infiltrationRequired);

    const combatResult: CombatResult = {
      missionSuccess: false,
      investigatorResults: [{
        id: investigators[0].id,
        hpLost: 15,
        stressGained: 5,
        corruptionGained: 3,
        died: false
      }]
    };

    resolveCombatMission(gameState, mission.id, combatResult);

    expect(mission.status).toBe(MissionStatus.Failed);
    expect(gameState.doomCounter).toBeGreaterThan(0); // Penalty applied
    expect(investigators[0].status).toBe(InvestigatorStatus.Recovering); // High damage
  });
});
```

### Save/Load Integration Tests
```typescript
describe('Save/Load System Integration', () => {
  it('should preserve game state through save/load cycle', () => {
    // Arrange: Create complex game state
    const originalState = GameStateFactory.create({
      currentDay: 50,
      doomCounter: 3,
      resources: { funding: 12000, influence: 75 }
    });

    // Add some missions and investigators with various states
    originalState.investigators.push(
      InvestigatorFactory.infiltrating('mission_1'),
      InvestigatorFactory.create({
        corruption: 35,
        permanentTraumas: [{ type: TraumaType.Paranoid, name: 'Paranoid', description: 'Test', effect: 'Test' }]
      })
    );

    originalState.missions.push(
      MissionFactory.create({ status: MissionStatus.Ready }),
      MissionFactory.create({ status: MissionStatus.InProgress })
    );

    // Act: Save and load
    const saveData = saveGameState(originalState);
    const loadedState = loadGameState(saveData);

    // Assert: States are equivalent
    expect(loadedState.currentDay).toBe(originalState.currentDay);
    expect(loadedState.doomCounter).toBe(originalState.doomCounter);
    expect(loadedState.resources).toEqual(originalState.resources);
    expect(loadedState.investigators).toHaveLength(originalState.investigators.length);
    expect(loadedState.missions).toHaveLength(originalState.missions.length);

    // Verify complex objects are preserved
    const loadedCorruptedInv = loadedState.investigators.find(i => i.corruption === 35);
    expect(loadedCorruptedInv?.permanentTraumas).toHaveLength(1);
  });
});
```

## End-to-End Testing

### E2E Test Setup
```typescript
// e2e/setup.ts
import { test as base, expect } from '@playwright/test';

interface GameFixtures {
  gamePage: GamePage;
}

export const test = base.extend<GameFixtures>({
  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await use(gamePage);
  }
});

export { expect };
```

### Game Page Object
```typescript
// e2e/pages/GamePage.ts
export class GamePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForSelector('[data-testid="game-loaded"]');
  }

  async pauseGame() {
    await this.page.click('[data-testid="pause-button"]');
  }

  async assignInvestigatorToMission(investigatorName: string, missionName: string) {
    // Click investigator
    await this.page.click(`[data-testid="investigator-${investigatorName}"] [data-testid="assign-button"]`);

    // Select mission in dialog
    await this.page.click(`[data-testid="mission-option-${missionName}"]`);

    // Confirm assignment
    await this.page.click('[data-testid="confirm-assignment"]');

    // Wait for UI update
    await this.page.waitForSelector(`[data-testid="investigator-${investigatorName}"] .status-infiltrating`);
  }

  async waitForMissionCompletion(missionName: string) {
    await this.page.waitForSelector(`[data-testid="mission-${missionName}"] .status-completed`, {
      timeout: 30000
    });
  }

  async getDoomCounter(): Promise<number> {
    const doomText = await this.page.textContent('[data-testid="doom-counter"]');
    return parseInt(doomText?.match(/(\d+)\/10/)?.[1] || '0');
  }

  async getFunding(): Promise<number> {
    const fundingText = await this.page.textContent('[data-testid="funding-display"]');
    return parseInt(fundingText?.replace(/[£,]/g, '') || '0');
  }
}
```

### Critical Path E2E Tests
```typescript
// e2e/critical-paths.spec.ts
test.describe('Critical Game Paths', () => {
  test('should complete new game setup and first mission', async ({ gamePage }) => {
    // Verify initial state
    await expect(gamePage.page.locator('[data-testid="day-counter"]')).toContainText('Day 0');
    await expect(gamePage.page.locator('[data-testid="investigator-list"]')).toContainText('5 investigators');

    // Wait for first mission to appear
    await gamePage.page.waitForSelector('[data-testid^="mission-"]');

    // Assign investigators to first available mission
    const firstMission = await gamePage.page.locator('[data-testid^="mission-"]').first();
    const missionName = await firstMission.getAttribute('data-mission-name');

    await gamePage.assignInvestigatorToMission('John Smith', missionName!);

    // Fast forward time to complete mission
    await gamePage.page.click('[data-testid="fast-speed-button"]');

    // Wait for mission completion
    await gamePage.waitForMissionCompletion(missionName!);

    // Verify rewards received
    const finalFunding = await gamePage.getFunding();
    expect(finalFunding).toBeGreaterThan(5000); // Started with 5000
  });

  test('should handle game over condition correctly', async ({ gamePage }) => {
    // Set up game state near doom limit
    await gamePage.page.evaluate(() => {
      // Inject test state
      window.__TEST_GAME_STATE__ = {
        doomCounter: 9,
        // ... other state
      };
    });

    await gamePage.goto(); // Reload with test state

    // Trigger doom increase
    await gamePage.page.click('[data-testid="fast-speed-button"]');

    // Wait for game over screen
    await gamePage.page.waitForSelector('[data-testid="game-over-screen"]');

    await expect(gamePage.page.locator('[data-testid="game-over-reason"]'))
      .toContainText('Doom has consumed the Empire');
  });
});
```

## Performance Testing

### Performance Test Setup
```typescript
// src/test/performance/performanceUtils.ts
export class PerformanceMonitor {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();

  start() {
    this.startTime = performance.now();
  }

  mark(label: string) {
    this.marks.set(label, performance.now() - this.startTime);
  }

  getDuration(label: string): number {
    return this.marks.get(label) || 0;
  }

  expectUnder(label: string, maxMs: number) {
    const duration = this.getDuration(label);
    expect(duration).toBeLessThan(maxMs);
  }
}
```

### Performance Tests
```typescript
describe('Performance Requirements', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should process daily tick under 50ms', () => {
    const gameState = GameStateFactory.withInvestigators(12);
    gameState.missions = Array.from({ length: 5 }, () => MissionFactory.create());

    monitor.start();
    processDailyTick(gameState);
    monitor.mark('daily-tick');

    monitor.expectUnder('daily-tick', 50);
  });

  it('should generate missions under 100ms', () => {
    const gameState = GameStateFactory.create();

    monitor.start();
    const missions = generateDailyMissions(gameState);
    monitor.mark('mission-generation');

    monitor.expectUnder('mission-generation', 100);
    expect(missions.length).toBeLessThanOrEqual(5); // Sanity check
  });

  it('should save game state under 200ms', () => {
    const gameState = GameStateFactory.withInvestigators(12);
    gameState.log = Array.from({ length: 100 }, (_, i) => ({
      day: i,
      type: LogType.MissionComplete,
      message: 'Test message',
      severity: LogSeverity.Info
    }));

    monitor.start();
    const saveData = saveGameState(gameState);
    monitor.mark('save-operation');

    monitor.expectUnder('save-operation', 200);
    expect(saveData.checksum).toBeDefined();
  });
});
```

## Test Organization & Structure

### Directory Structure
```
src/
├── test/
│   ├── setup.ts                    # Global test setup
│   ├── factories/                  # Test data factories
│   │   ├── gameStateFactory.ts
│   │   ├── investigatorFactory.ts
│   │   ├── missionFactory.ts
│   │   └── artifactFactory.ts
│   ├── mocks/                      # Mock implementations
│   │   ├── combatSystem.ts
│   │   └── localStorage.ts
│   ├── performance/                # Performance testing utilities
│   └── utils/                      # Test helper functions
├── components/
│   └── **/*.test.tsx               # Component tests
├── hooks/
│   └── **/*.test.ts                # Hook tests
├── services/
│   └── **/*.test.ts                # Service/logic tests
└── e2e/
    ├── pages/                      # Page object models
    ├── fixtures/                   # E2E test data
    └── **/*.spec.ts               # E2E test scenarios
```

### Test Categories & Tagging
```typescript
// Use describe blocks and tags for organization
describe('Unit: GameState', () => { /* ... */ });
describe('Integration: MissionFlow', () => { /* ... */ });
describe('E2E: CriticalPaths', () => { /* ... */ });

// Use test.each for parameterized tests
describe('Investigator Status Transitions', () => {
  test.each([
    [InvestigatorStatus.Available, InvestigatorStatus.Infiltrating, 'mission assignment'],
    [InvestigatorStatus.Infiltrating, InvestigatorStatus.OnMission, 'combat launch'],
    [InvestigatorStatus.OnMission, InvestigatorStatus.Recovering, 'mission completion with damage']
  ])('should transition from %s to %s on %s', (from, to, action) => {
    // Test implementation
  });
});
```

## Continuous Integration

### CI Test Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - run: npm run test:e2e:headless

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Quality Gates
- **Unit Tests**: Must pass with 80%+ coverage
- **Integration Tests**: Must pass all critical flows
- **E2E Tests**: Must pass core user journeys
- **Performance**: Must meet response time requirements
- **No Flaky Tests**: Tests must be deterministic and stable

## Testing Best Practices

### Do's
- ✅ Test business logic thoroughly
- ✅ Use descriptive test names
- ✅ Keep tests independent and isolated
- ✅ Mock external dependencies
- ✅ Test error conditions and edge cases
- ✅ Use factories for test data
- ✅ Follow AAA pattern (Arrange, Act, Assert)

### Don'ts
- ❌ Test implementation details
- ❌ Create tests that depend on specific timing
- ❌ Use hard-coded values instead of constants
- ❌ Skip cleanup in test teardown
- ❌ Write overly complex test setups
- ❌ Test multiple behaviors in one test
- ❌ Ignore flaky tests

### TDD Workflow Example
```typescript
// 1. Red: Write failing test
describe('MissionReward', () => {
  it('should apply influence bonus to funding rewards', () => {
    const gameState = GameStateFactory.create({
      resources: { funding: 1000, influence: 50 }
    });

    const reward = calculateFundingReward(gameState, 1000);

    expect(reward).toBe(1500); // 1000 * (1 + 50 * 0.01)
  });
});

// 2. Green: Implement minimal code
function calculateFundingReward(gameState: GameState, baseFunding: number): number {
  return Math.floor(baseFunding * (1 + gameState.resources.influence * 0.01));
}

// 3. Refactor: Improve implementation while keeping tests green
function calculateFundingReward(gameState: GameState, baseFunding: number): number {
  const influenceMultiplier = 1 + (gameState.resources.influence * GAME_CONSTANTS.INFLUENCE_FUNDING_MODIFIER);
  return Math.floor(baseFunding * influenceMultiplier);
}
```

This testing specification ensures robust, maintainable tests that support confident refactoring and new feature development while maintaining high code quality and preventing regressions.