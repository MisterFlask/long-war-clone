# The Forge-Tyrant Rising: Accessibility-First UX/UI Specification v1.0

## Core Accessibility Philosophy

### Design Principles
- **Accessibility First**: All features must be fully usable via screen reader and keyboard
- **Progressive Enhancement**: Visual design enhances but never replaces accessible structure
- **Clear Information Architecture**: Logical content hierarchy that works without visual cues
- **Predictable Interactions**: Consistent patterns across all game screens
- **Inclusive Design**: Support users with various disabilities and preferences

### WCAG 2.1 AA Compliance
- **Perceivable**: All information available via screen reader
- **Operable**: Full keyboard navigation support
- **Understandable**: Clear language and predictable interface
- **Robust**: Compatible with assistive technologies

## HTML Document Structure

### Semantic HTML Foundation
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Forge-Tyrant Rising - Victorian Steampunk Strategy Game</title>

  <!-- Accessibility meta -->
  <meta name="description" content="A turn-based strategy game set in Victorian steampunk Britain">
  <meta name="color-scheme" content="dark light">

  <!-- Reduced motion support -->
  <meta name="prefers-reduced-motion" content="reduce">
</head>

<body>
  <!-- Skip links for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#game-controls" class="skip-link">Skip to game controls</a>

  <!-- Screen reader announcements -->
  <div id="sr-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  <div id="sr-urgent" aria-live="assertive" aria-atomic="true" class="sr-only"></div>

  <!-- Main game application -->
  <main id="main-content" role="application" aria-label="The Forge-Tyrant Rising Game">
    <!-- Game content here -->
  </main>
</body>
</html>
```

### Heading Hierarchy Structure
```html
<!-- Strategy Layer -->
<h1>The Forge-Tyrant Rising</h1>
  <h2>Game Status</h2>
    <h3>Resources</h3>
    <h3>Date and Time</h3>
  <h2>Your Investigators</h2>
    <h3>Available Investigators</h3>
    <h3>Investigators on Missions</h3>
  <h2>Available Missions</h2>
    <h3>Combat Missions</h3>
    <h3>Non-Combat Missions</h3>
  <h2>Activity Log</h2>

<!-- Combat Layer -->
<h1>Combat: [Mission Name]</h1>
  <h2>Combat Status</h2>
    <h3>Turn Information</h3>
    <h3>Energy and Resources</h3>
  <h2>Your Party</h2>
    <h3>Party Member Status</h3>
  <h2>Enemies</h2>
    <h3>Enemy Status and Intents</h3>
  <h2>Your Hand</h2>
    <h3>Playable Cards</h3>
  <h2>Deck Information</h2>
    <h3>Draw Pile</h3>
    <h3>Discard Pile</h3>
```

## Screen Reader Announcements

### ARIA Live Regions
```html
<!-- Polite announcements (most game events) -->
<div id="game-events"
     aria-live="polite"
     aria-atomic="false"
     aria-relevant="additions"
     class="sr-only">
  <!-- Dynamic content inserted here -->
</div>

<!-- Assertive announcements (critical events) -->
<div id="critical-events"
     aria-live="assertive"
     aria-atomic="true"
     class="sr-only">
  <!-- Critical announcements here -->
</div>

<!-- Status updates (current state) -->
<div id="status-updates"
     aria-live="polite"
     aria-atomic="true"
     class="sr-only">
  <!-- Status summaries here -->
</div>
```

### Announcement Categories

#### Polite Announcements (aria-live="polite")
- Card played successfully
- Mission completion
- Resource changes
- Investigator status changes
- Time progression
- Non-critical combat events

#### Assertive Announcements (aria-live="assertive")
- Investigator death or corruption
- Combat victory/defeat
- Game over conditions
- Critical mission failures
- Emergency pauses

#### Status Announcements (on-demand)
- Game state summaries
- Combat situation reports
- Resource inventories
- Available actions

### Implementation Example
```typescript
class AccessibilityManager {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;
  private statusRegion: HTMLElement;

  announce(message: string, priority: 'polite' | 'assertive' | 'status' = 'polite'): void {
    const region = this.getRegion(priority);

    // Clear and set new content
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50); // Small delay ensures screen reader notices change
  }

  announceGameEvent(event: GameEvent): void {
    const message = this.formatEventMessage(event);
    const priority = this.getEventPriority(event);
    this.announce(message, priority);
  }

  announceGameState(): void {
    const summary = this.generateGameStateSummary();
    this.announce(summary, 'status');
  }

  private formatEventMessage(event: GameEvent): string {
    switch (event.type) {
      case 'CARD_PLAYED':
        return `Played ${event.cardName}. ${event.effectDescription}`;
      case 'DAMAGE_DEALT':
        return `${event.source} dealt ${event.amount} damage to ${event.target}`;
      case 'INVESTIGATOR_DEATH':
        return `Critical: ${event.investigatorName} has died in combat!`;
      // ... more event types
    }
  }
}
```

## Descriptive Button Labels

### Button Labeling Strategy
All interactive elements must have comprehensive, context-aware labels:

```html
<!-- Card play buttons -->
<button type="button"
        aria-describedby="card-123-details"
        onclick="playCard('card-123')">
  Play Lightning Strike - Costs 2 energy, deals 8 damage to target enemy
</button>

<div id="card-123-details" class="sr-only">
  Lightning Strike: Attack card, Common rarity.
  Current modifiers: Enhanced (+2 damage).
  Can target any enemy.
  Contributed by Scholar John Smith.
</div>

<!-- Mission assignment -->
<button type="button"
        aria-describedby="mission-456-details"
        onclick="assignToMission('mission-456')">
  Assign to Docklands Incursion - Difficulty 2, requires 1-3 investigators,
  rewards 500 funding and influence
</button>

<!-- Combat targeting -->
<button type="button"
        aria-describedby="enemy-789-status"
        onclick="targetEnemy('enemy-789')">
  Target Corrupted Dockworker - 45 of 60 health, 3 block,
  intends to attack for 12 damage next turn
</button>

<!-- Time controls -->
<button type="button"
        aria-pressed="false"
        onclick="togglePause()">
  Resume game - Currently paused on Day 15, January 15th 1890
</button>

<button type="button"
        onclick="setSpeed(2)">
  Set to fast speed - 1 day per second, currently normal speed
</button>
```

### Dynamic Label Updates
```typescript
function updateButtonLabel(buttonId: string, newContext: string): void {
  const button = document.getElementById(buttonId);
  if (button) {
    // Update both visible text and aria-label
    const baseAction = button.dataset.baseAction;
    button.textContent = `${baseAction} - ${newContext}`;
    button.setAttribute('aria-label', `${baseAction} - ${newContext}`);
  }
}

// Example: Update card play button when energy changes
function updateCardPlayButton(cardId: string, card: AbstractCard, currentEnergy: number): void {
  const cost = card.getModifiedCost();
  const canPlay = currentEnergy >= cost;
  const status = canPlay ? 'playable' : 'not enough energy';

  updateButtonLabel(
    `play-card-${cardId}`,
    `${card.name} - ${cost} energy, ${card.getModifiedDescription()}, ${status}`
  );
}
```

## Keyboard Navigation System

### Keyboard Shortcuts
```typescript
interface KeyboardShortcuts {
  // Global shortcuts (work anywhere)
  'Space': 'togglePause';           // Pause/resume game
  'Escape': 'pause';                // Always pause
  'F1': 'showHelp';                 // Help screen
  'F2': 'readGameState';            // Read current state
  'F3': 'readAvailableActions';     // List available actions
  'Ctrl+S': 'quickSave';            // Quick save
  'Ctrl+L': 'quickLoad';            // Quick load

  // Strategy layer shortcuts
  '1': 'focusInvestigators';        // Focus investigators panel
  '2': 'focusMissions';             // Focus missions panel
  '3': 'focusLog';                  // Focus activity log
  'R': 'recruit';                   // Recruit investigators
  'T': 'showTimeControls';          // Time control menu

  // Combat shortcuts
  'E': 'endTurn';                   // End current turn
  'H': 'focusHand';                 // Focus on hand
  'P': 'focusParty';                // Focus on party
  'N': 'focusEnemies';              // Focus on enemies
  'D': 'showDrawPile';              // View draw pile
  'G': 'showDiscardPile';           // View discard pile

  // Card targeting
  '1-9': 'selectTarget';            // Quick target selection
  'Enter': 'confirmAction';         // Confirm current action
  'Backspace': 'cancelAction';      // Cancel current action
}
```

### Keyboard Navigation Implementation
```html
<!-- Roving tabindex for card selection -->
<div role="group" aria-label="Your hand - 7 cards">
  <button tabindex="0"
          onkeydown="handleCardNavigation(event)"
          aria-posinset="1"
          aria-setsize="7">
    Card 1 details...
  </button>
  <button tabindex="-1" aria-posinset="2" aria-setsize="7">Card 2...</button>
  <button tabindex="-1" aria-posinset="3" aria-setsize="7">Card 3...</button>
  <!-- ... more cards -->
</div>

<script>
function handleCardNavigation(event: KeyboardEvent): void {
  const currentCard = event.target as HTMLElement;
  const cardContainer = currentCard.closest('[role="group"]');
  const allCards = Array.from(cardContainer.querySelectorAll('button'));
  const currentIndex = allCards.indexOf(currentCard);

  let nextIndex = currentIndex;

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIndex = Math.max(0, currentIndex - 1);
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      nextIndex = Math.min(allCards.length - 1, currentIndex + 1);
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = allCards.length - 1;
      break;
    case 'Enter':
    case ' ':
      // Play the card
      playCard(currentCard.dataset.cardId);
      return;
    default:
      return; // Don't prevent default for other keys
  }

  if (nextIndex !== currentIndex) {
    // Move focus
    allCards[currentIndex].tabIndex = -1;
    allCards[nextIndex].tabIndex = 0;
    allCards[nextIndex].focus();

    event.preventDefault();
  }
}
</script>
```

## Game State Reading System

### Comprehensive State Reader
```typescript
class GameStateReader {
  readCompleteGameState(): string {
    const parts: string[] = [];

    // Basic game info
    parts.push(this.readBasicInfo());

    // Current screen context
    if (this.isInCombat()) {
      parts.push(this.readCombatState());
    } else {
      parts.push(this.readStrategyState());
    }

    // Available actions
    parts.push(this.readAvailableActions());

    return parts.join('. ');
  }

  private readBasicInfo(): string {
    const gameState = getCurrentGameState();
    return `The Forge-Tyrant Rising, Day ${gameState.currentDay},
            ${formatDate(gameState.currentDate)}.
            Doom level ${gameState.doomCounter} out of 10.
            Resources: ${gameState.resources.funding} pounds funding,
            ${gameState.resources.influence} influence.`;
  }

  private readStrategyState(): string {
    const gameState = getCurrentGameState();
    const investigators = gameState.investigators;
    const missions = gameState.missions;

    const available = investigators.filter(i => i.status === InvestigatorStatus.Available).length;
    const onMission = investigators.filter(i => i.status === InvestigatorStatus.OnMission).length;
    const recovering = investigators.filter(i => i.status === InvestigatorStatus.Recovering).length;

    return `You have ${investigators.length} investigators total:
            ${available} available, ${onMission} on missions, ${recovering} recovering.
            ${missions.length} missions available.`;
  }

  private readCombatState(): string {
    const combatState = getCurrentCombatState();

    const aliveParty = combatState.party.filter(p => p.isAlive);
    const aliveEnemies = combatState.enemies.filter(e => e.isAlive);

    return `Combat turn ${combatState.currentTurn}.
            Your party: ${this.readPartyStatus(aliveParty)}.
            Enemies: ${this.readEnemyStatus(aliveEnemies)}.
            Hand: ${combatState.hand.length} cards.
            Energy: ${combatState.energy} of ${combatState.maxEnergy}.`;
  }

  private readPartyStatus(party: CombatInvestigator[]): string {
    return party.map(investigator =>
      `${investigator.name} has ${investigator.currentHP} of ${investigator.maxHP} health,
       ${investigator.block} block`
    ).join(', ');
  }

  private readEnemyStatus(enemies: CombatEnemy[]): string {
    return enemies.map(enemy => {
      const intent = this.describeIntent(enemy.intent, enemy.nextAction);
      return `${enemy.name} has ${enemy.currentHP} of ${enemy.maxHP} health,
              ${enemy.block} block, ${intent}`;
    }).join(', ');
  }

  private readAvailableActions(): string {
    if (this.isInCombat()) {
      return this.readCombatActions();
    } else {
      return this.readStrategyActions();
    }
  }

  private readCombatActions(): string {
    const combatState = getCurrentCombatState();
    const playableCards = combatState.hand.filter(card =>
      combatState.energy >= card.getModifiedCost()
    );

    if (playableCards.length === 0) {
      return "No cards can be played with current energy. Press E to end turn.";
    }

    return `You can play ${playableCards.length} cards: ${
      playableCards.map(card =>
        `${card.name} for ${card.getModifiedCost()} energy`
      ).join(', ')
    }. Press H to focus on your hand.`;
  }

  private readStrategyActions(): string {
    const actions: string[] = [];

    // Check for available investigators
    const available = getCurrentGameState().investigators
      .filter(i => i.status === InvestigatorStatus.Available);
    if (available.length > 0) {
      actions.push(`${available.length} investigators available for missions`);
    }

    // Check for available missions
    const missions = getCurrentGameState().missions
      .filter(m => m.status === MissionStatus.Available);
    if (missions.length > 0) {
      actions.push(`${missions.length} missions available`);
    }

    // Check for ready missions
    const ready = getCurrentGameState().missions
      .filter(m => m.status === MissionStatus.Ready);
    if (ready.length > 0) {
      actions.push(`${ready.length} missions ready to launch`);
    }

    return actions.length > 0
      ? `Available actions: ${actions.join(', ')}`
      : "No immediate actions available. Use time controls to advance.";
  }
}

// Keyboard shortcut implementation
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'F2') {
    const reader = new GameStateReader();
    const stateDescription = reader.readCompleteGameState();
    announceToScreenReader(stateDescription, 'assertive');
    event.preventDefault();
  }
});
```

## Focus Management

### Focus Return Strategy
```typescript
class FocusManager {
  private focusStack: HTMLElement[] = [];

  pushFocus(element: HTMLElement): void {
    this.focusStack.push(document.activeElement as HTMLElement);
    element.focus();
  }

  popFocus(): void {
    const previousElement = this.focusStack.pop();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }

  handleModalClose(): void {
    this.popFocus();
  }

  handleCardPlay(cardElement: HTMLElement): void {
    // After card is played, focus should return to hand or next logical action
    const hand = document.querySelector('[aria-label*="Your hand"]');
    const nextCard = this.findNextPlayableCard(cardElement);

    if (nextCard) {
      nextCard.focus();
    } else if (hand) {
      (hand as HTMLElement).focus();
    }
  }

  handleMissionAssignment(): void {
    // Return focus to mission list or next available action
    const missionPanel = document.querySelector('[aria-label*="missions"]');
    if (missionPanel) {
      (missionPanel as HTMLElement).focus();
    }
  }

  private findNextPlayableCard(currentCard: HTMLElement): HTMLElement | null {
    const handContainer = currentCard.closest('[role="group"]');
    if (!handContainer) return null;

    const cards = Array.from(handContainer.querySelectorAll('button:not([disabled])'));
    const currentIndex = cards.indexOf(currentCard);

    // Try next card, then previous, then first
    return (cards[currentIndex + 1] || cards[currentIndex - 1] || cards[0]) as HTMLElement;
  }
}
```

### Modal Dialog Focus Trapping
```html
<div role="dialog"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-description"
     aria-modal="true">

  <h2 id="dialog-title">Assign Investigators to Mission</h2>
  <p id="dialog-description">Select which investigators to send on this mission</p>

  <!-- Focus trap container -->
  <div class="focus-trap">
    <!-- First focusable element -->
    <button type="button"
            onkeydown="handleDialogKeydown(event)"
            onclick="closeDialog()">
      Close
    </button>

    <!-- Dialog content -->
    <div class="dialog-content">
      <!-- Mission details and investigator selection -->
    </div>

    <!-- Last focusable element -->
    <button type="button"
            onkeydown="handleDialogKeydown(event)"
            onclick="confirmAssignment()">
      Confirm Assignment
    </button>
  </div>
</div>

<script>
function handleDialogKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeDialog();
    return;
  }

  if (event.key === 'Tab') {
    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      // Shift+Tab on first element - go to last
      lastElement.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      // Tab on last element - go to first
      firstElement.focus();
      event.preventDefault();
    }
  }
}
</script>
```

## Status Display Patterns

### Live Status Regions
```html
<!-- Combat status that updates automatically -->
<section aria-live="polite" aria-atomic="false">
  <h2>Combat Status</h2>

  <div id="turn-status" aria-live="polite">
    Turn 3 - Your turn - 2 energy remaining
  </div>

  <div id="party-status" aria-live="polite" aria-atomic="true">
    <h3>Your Party</h3>
    <ul role="list">
      <li>John Smith: 25 of 30 health, 5 block, no status effects</li>
      <li>Mary Watson: 18 of 25 health, 0 block, poisoned for 3 damage</li>
    </ul>
  </div>

  <div id="enemy-status" aria-live="polite" aria-atomic="true">
    <h3>Enemies</h3>
    <ul role="list">
      <li>Corrupted Dockworker: 45 of 60 health, 3 block, intends to attack for 12 damage</li>
      <li>Steam Automaton: 30 of 40 health, 8 block, intends to defend and gain 8 block</li>
    </ul>
  </div>
</section>

<!-- Strategy status -->
<section aria-live="polite" aria-atomic="false">
  <h2>Game Status</h2>

  <div id="date-status">
    January 15th, 1890 - Day 15 - Game running at normal speed
  </div>

  <div id="resource-status" aria-atomic="true">
    5,247 pounds funding, 65 influence, Doom level 4 of 10
  </div>

  <div id="investigator-summary" aria-atomic="true">
    5 investigators total: 3 available, 1 on mission, 1 recovering
  </div>
</section>
```

### Table Accessibility for Data
```html
<!-- Investigator roster table -->
<table role="table" aria-label="Investigator Roster">
  <caption>Your investigators and their current status</caption>

  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Class</th>
      <th scope="col">Level</th>
      <th scope="col">Health</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <th scope="row">John "Iron" Smith</th>
      <td>Scholar</td>
      <td>Level 3</td>
      <td>25 of 30</td>
      <td>Available</td>
      <td>
        <button type="button"
                aria-describedby="john-smith-details">
          Assign to Mission
        </button>
        <div id="john-smith-details" class="sr-only">
          John Smith: Scholar level 3, 25 of 30 health, 2 stress, 15 corruption.
          Available for assignment.
        </div>
      </td>
    </tr>
    <!-- More investigators... -->
  </tbody>
</table>
```

## Settings and Preferences

### Accessibility Settings Panel
```html
<section aria-labelledby="accessibility-settings">
  <h2 id="accessibility-settings">Accessibility Settings</h2>

  <fieldset>
    <legend>Screen Reader Preferences</legend>

    <label>
      <input type="checkbox" id="verbose-descriptions" checked>
      Verbose card and ability descriptions
    </label>

    <label>
      <input type="checkbox" id="announce-minor-events">
      Announce minor game events (resource changes, time progression)
    </label>

    <label>
      <input type="range" min="0" max="5" value="2"
             aria-label="Announcement frequency">
      Announcement frequency
      <span aria-live="polite" id="frequency-value">Normal</span>
    </label>
  </fieldset>

  <fieldset>
    <legend>Keyboard Navigation</legend>

    <label>
      <input type="checkbox" id="arrow-navigation" checked>
      Use arrow keys for card navigation
    </label>

    <label>
      <input type="checkbox" id="number-shortcuts" checked>
      Use number keys for quick targeting
    </label>

    <button type="button" onclick="customizeKeyboard()">
      Customize keyboard shortcuts
    </button>
  </fieldset>

  <fieldset>
    <legend>Visual Accessibility</legend>

    <label>
      <input type="checkbox" id="high-contrast">
      High contrast mode
    </label>

    <label>
      <input type="checkbox" id="reduced-motion">
      Reduce animations and motion
    </label>

    <label>
      <input type="range" min="0.8" max="2.0" step="0.1" value="1.0"
             aria-label="Text size multiplier">
      Text size
      <span aria-live="polite" id="text-size-value">100%</span>
    </label>
  </fieldset>
</section>
```

### CSS for Screen Reader Support
```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --bg-primary: #000000;
    --text-primary: #ffffff;
    --border-color: #ffffff;
    --color-accent: #ffff00;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus indicators */
:focus {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* Focus within for container highlighting */
.game-panel:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent);
}
```

## Testing and Validation

### Accessibility Testing Checklist
```typescript
interface AccessibilityTest {
  name: string;
  description: string;
  test: () => boolean;
  fix: string;
}

const ACCESSIBILITY_TESTS: AccessibilityTest[] = [
  {
    name: "Heading Hierarchy",
    description: "All headings follow logical h1-h6 structure",
    test: () => validateHeadingStructure(),
    fix: "Ensure no heading levels are skipped (h1→h3 without h2)"
  },
  {
    name: "ARIA Labels",
    description: "All interactive elements have accessible names",
    test: () => validateARIALabels(),
    fix: "Add aria-label or aria-labelledby to unlabeled elements"
  },
  {
    name: "Keyboard Navigation",
    description: "All functionality available via keyboard",
    test: () => validateKeyboardAccess(),
    fix: "Ensure all interactive elements are keyboard focusable"
  },
  {
    name: "Live Regions",
    description: "Important updates announced to screen readers",
    test: () => validateLiveRegions(),
    fix: "Add aria-live regions for dynamic content updates"
  },
  {
    name: "Focus Management",
    description: "Focus moves logically through interface",
    test: () => validateFocusManagement(),
    fix: "Implement proper focus trapping and return strategies"
  }
];

function runAccessibilityTests(): TestResults {
  const results = ACCESSIBILITY_TESTS.map(test => ({
    name: test.name,
    passed: test.test(),
    description: test.description,
    fix: test.fix
  }));

  return {
    totalTests: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed),
    results
  };
}
```

### Screen Reader Testing Script
```typescript
class ScreenReaderTester {
  simulateScreenReaderNavigation(): void {
    // Simulate common screen reader navigation patterns
    this.testHeadingNavigation();
    this.testFormNavigation();
    this.testTableNavigation();
    this.testLiveRegionUpdates();
  }

  private testHeadingNavigation(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log('Screen reader heading navigation:');
    headings.forEach((heading, index) => {
      console.log(`${index + 1}. ${heading.tagName}: ${heading.textContent}`);
    });
  }

  private testLiveRegionUpdates(): void {
    const liveRegions = document.querySelectorAll('[aria-live]');
    console.log('Live region announcements:');
    liveRegions.forEach(region => {
      const level = region.getAttribute('aria-live');
      console.log(`${level} announcement: ${region.textContent}`);
    });
  }

  simulateCardPlay(): void {
    // Test the complete card play flow for screen reader users
    console.log('Simulating card play via screen reader:');
    console.log('1. Focus on hand heading');
    console.log('2. Navigate to first playable card');
    console.log('3. Read card details');
    console.log('4. Activate card play');
    console.log('5. If targeting required, navigate to target');
    console.log('6. Confirm action');
    console.log('7. Hear result announcement');
    console.log('8. Focus returns to logical next element');
  }
}
```

## Core Information Architecture

### Text Representation Standards
Every game element must have a standardized text representation with complete state information:

```typescript
interface TextRepresentation {
  primary: string;      // Essential information always announced
  secondary: string;    // Additional details on request
  state: string;        // Current state/modifiers
  context: string;      // Situational context
}

// Card text representation examples
const CARD_TEXT_PATTERNS = {
  basic: "{name} - {cost} energy - {description}",
  withState: "{name} - {cost} energy - {description} - {state}",
  withBuffs: "{name} - {cost} energy - {description} - {buffs} - {state}",
  detailed: "{name} - {type} - {rarity} - {cost} energy - {description} - {buffs} - {state} - {source}"
};

class ElementReader {
  readCard(card: AbstractCard, verbosity: 'brief' | 'standard' | 'detailed' = 'standard'): string {
    const cost = card.getModifiedCost();
    const costText = cost !== card.cost ? `${cost} energy (was ${card.cost})` : `${cost} energy`;

    let result = `${card.name} - ${costText} - ${card.getModifiedDescription()}`;

    // Add buff information
    if (card.appliedBuffs.length > 0) {
      const buffText = card.appliedBuffs.map(buff => buff.getDisplayText()).join(', ');
      result += ` - ${buffText}`;
    }

    // Add state information
    const states: string[] = [];
    if (card.upgradeLevel > 0) states.push('UPGRADED');
    if (card.timesPlayed > 0) states.push(`PLAYED ${card.timesPlayed} TIMES`);
    if (!this.canPlayCard(card)) states.push('UNPLAYABLE');

    if (states.length > 0) {
      result += ` - ${states.join(', ')}`;
    }

    // Add detailed information if requested
    if (verbosity === 'detailed') {
      result += ` - ${card.type} card, ${card.rarity} rarity`;
      if (card.sourceInvestigatorId) {
        const source = this.getInvestigatorName(card.sourceInvestigatorId);
        result += `, contributed by ${source}`;
      }
    }

    return result;
  }

  readInvestigator(investigator: CombatInvestigator, verbosity: 'brief' | 'standard' | 'detailed' = 'standard'): string {
    let result = `${investigator.name} - ${investigator.currentHP} of ${investigator.maxHP} health`;

    if (investigator.block > 0) {
      result += `, ${investigator.block} block`;
    }

    // Status effects
    if (investigator.statusEffects.length > 0) {
      const effects = investigator.statusEffects.map(effect =>
        effect.stacks > 1 ? `${effect.name} ${effect.stacks}` : effect.name
      ).join(', ');
      result += `, affected by ${effects}`;
    }

    // State information
    const states: string[] = [];
    if (!investigator.isAlive) states.push('DEAD');
    else if (investigator.currentHP <= investigator.maxHP * 0.25) states.push('CRITICALLY WOUNDED');
    else if (investigator.currentHP <= investigator.maxHP * 0.5) states.push('WOUNDED');

    if (states.length > 0) {
      result += ` - ${states.join(', ')}`;
    }

    if (verbosity === 'detailed') {
      result += ` - ${investigator.class.name} level ${investigator.level}`;
      result += `, position ${investigator.position + 1}`;
    }

    return result;
  }

  readEnemy(enemy: CombatEnemy, verbosity: 'brief' | 'standard' | 'detailed' = 'standard'): string {
    let result = `${enemy.name} - ${enemy.currentHP} of ${enemy.maxHP} health`;

    if (enemy.block > 0) {
      result += `, ${enemy.block} block`;
    }

    // Intent description
    result += `, ${this.describeIntent(enemy.intent, enemy.nextAction)}`;

    // Status effects
    if (enemy.statusEffects.length > 0) {
      const effects = enemy.statusEffects.map(effect =>
        effect.stacks > 1 ? `${effect.name} ${effect.stacks}` : effect.name
      ).join(', ');
      result += `, affected by ${effects}`;
    }

    if (verbosity === 'detailed') {
      result += `, position ${enemy.position + 1}`;
      if (enemy.difficultyModifier !== 1) {
        result += `, difficulty modifier ${enemy.difficultyModifier}`;
      }
    }

    return result;
  }

  private describeIntent(intent: EnemyIntent, action: EnemyAction): string {
    switch (intent) {
      case EnemyIntent.Attack:
        return `intends to attack for ${action.damage} damage`;
      case EnemyIntent.Defend:
        return `intends to gain ${action.blockGain} block`;
      case EnemyIntent.Buff:
        return `intends to strengthen itself`;
      case EnemyIntent.Debuff:
        return `intends to weaken you`;
      case EnemyIntent.Summon:
        return `intends to summon allies`;
      case EnemyIntent.Unknown:
        return `intent unknown`;
      default:
        return `intends to ${action.description}`;
    }
  }
}
```

### Reading Order Specification
Consistent order for game state announcements:

```typescript
enum ReadingOrder {
  // Combat state reading order
  COMBAT_BASIC = [
    'TURN_INFO',           // "Turn 3, your turn"
    'ENERGY_STATUS',       // "2 of 3 energy remaining"
    'YOUR_PARTY',          // Your investigators' status
    'YOUR_HAND',           // Hand summary
    'ENEMIES',             // Enemy status and intents
    'BOARD_EFFECTS',       // Global effects, artifacts
    'AVAILABLE_ACTIONS'    // What you can do now
  ],

  // Strategy state reading order
  STRATEGY_BASIC = [
    'GAME_STATUS',         // Date, doom, resources
    'YOUR_INVESTIGATORS',  // Investigator summary
    'AVAILABLE_MISSIONS',  // Mission opportunities
    'TIME_CONTROLS',       // Pause status, speed
    'AVAILABLE_ACTIONS'    // What you can do now
  ]
}

class GameStateReader {
  readGameStateInOrder(verbosity: 'brief' | 'standard' | 'detailed' = 'standard'): string {
    const sections: string[] = [];
    const order = this.isInCombat() ? ReadingOrder.COMBAT_BASIC : ReadingOrder.STRATEGY_BASIC;

    for (const section of order) {
      const content = this.readSection(section, verbosity);
      if (content) sections.push(content);
    }

    return sections.join('. ');
  }

  private readSection(section: string, verbosity: 'brief' | 'standard' | 'detailed'): string {
    switch (section) {
      case 'YOUR_PARTY':
        return this.readPartyStatus(verbosity);
      case 'YOUR_HAND':
        return this.readHandStatus(verbosity);
      case 'ENEMIES':
        return this.readEnemyStatus(verbosity);
      // ... more sections
    }
  }
}
```

### Primary vs Secondary Information Classification

```typescript
interface InformationPriority {
  primary: string[];    // Always announced
  secondary: string[];  // Available on request (F3, detailed mode)
  contextual: string[]; // Situational relevance
}

const CARD_INFORMATION_PRIORITY: InformationPriority = {
  primary: [
    'name',
    'cost',
    'basic_effect',
    'playability_status'
  ],
  secondary: [
    'card_type',
    'rarity',
    'source_investigator',
    'times_played',
    'upgrade_level',
    'buff_details'
  ],
  contextual: [
    'targeting_options',
    'synergies',
    'combo_potential'
  ]
};

const INVESTIGATOR_INFORMATION_PRIORITY: InformationPriority = {
  primary: [
    'name',
    'health_status',
    'availability_status',
    'critical_conditions'
  ],
  secondary: [
    'class_and_level',
    'experience_progress',
    'stress_level',
    'corruption_level',
    'equipment'
  ],
  contextual: [
    'mission_suitability',
    'recovery_time',
    'trauma_history'
  ]
};
```

## Critical Game Flow Specifications

### Change Detection and Differential Announcements

```typescript
class ChangeDetector {
  private previousGameState: GameState | null = null;
  private previousCombatState: CombatState | null = null;

  announceChanges(newState: GameState | CombatState): void {
    if (this.isGameState(newState)) {
      this.announceGameStateChanges(newState);
    } else {
      this.announceCombatStateChanges(newState);
    }
  }

  private announceGameStateChanges(newState: GameState): void {
    if (!this.previousGameState) {
      this.announceFullState(newState);
      this.previousGameState = newState;
      return;
    }

    const changes = this.detectGameStateChanges(this.previousGameState, newState);
    this.announceSpecificChanges(changes);
    this.previousGameState = newState;
  }

  private detectGameStateChanges(oldState: GameState, newState: GameState): GameChange[] {
    const changes: GameChange[] = [];

    // Resource changes
    if (oldState.resources.funding !== newState.resources.funding) {
      const diff = newState.resources.funding - oldState.resources.funding;
      changes.push({
        type: 'RESOURCE_CHANGE',
        description: `Funding ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)} pounds. Now ${newState.resources.funding} pounds.`,
        priority: 'polite'
      });
    }

    // Investigator status changes
    this.detectInvestigatorChanges(oldState.investigators, newState.investigators, changes);

    // Mission changes
    this.detectMissionChanges(oldState.missions, newState.missions, changes);

    // Doom changes
    if (oldState.doomCounter !== newState.doomCounter) {
      changes.push({
        type: 'DOOM_CHANGE',
        description: `Doom increased to ${newState.doomCounter} of 10!`,
        priority: newState.doomCounter >= 8 ? 'assertive' : 'polite'
      });
    }

    return changes;
  }

  private announceSpecificChanges(changes: GameChange[]): void {
    // Group changes by priority
    const assertiveChanges = changes.filter(c => c.priority === 'assertive');
    const politeChanges = changes.filter(c => c.priority === 'polite');

    // Announce assertive changes immediately
    if (assertiveChanges.length > 0) {
      const message = assertiveChanges.map(c => c.description).join(' ');
      this.announceToScreenReader(message, 'assertive');
    }

    // Batch polite changes
    if (politeChanges.length > 0) {
      const message = politeChanges.map(c => c.description).join(' ');
      this.announceToScreenReader(message, 'polite');
    }
  }
}

interface GameChange {
  type: string;
  description: string;
  priority: 'polite' | 'assertive';
  element?: string; // ID of changed element for focus management
}
```

### Event Classification System

```typescript
enum EventType {
  // Interrupt events (assertive announcements)
  INVESTIGATOR_DEATH = 'INVESTIGATOR_DEATH',
  COMBAT_VICTORY = 'COMBAT_VICTORY',
  COMBAT_DEFEAT = 'COMBAT_DEFEAT',
  GAME_OVER = 'GAME_OVER',
  CRITICAL_ERROR = 'CRITICAL_ERROR',

  // Queue events (polite announcements)
  CARD_PLAYED = 'CARD_PLAYED',
  DAMAGE_DEALT = 'DAMAGE_DEALT',
  STATUS_APPLIED = 'STATUS_APPLIED',
  RESOURCE_GAINED = 'RESOURCE_GAINED',
  MISSION_COMPLETED = 'MISSION_COMPLETED',

  // Silent events (no automatic announcement)
  MOUSE_HOVER = 'MOUSE_HOVER',
  FOCUS_CHANGE = 'FOCUS_CHANGE',
  ANIMATION_COMPLETE = 'ANIMATION_COMPLETE'
}

class EventAnnouncer {
  private eventQueue: AnnouncementEvent[] = [];
  private isProcessingQueue = false;

  handleEvent(event: GameEvent): void {
    const announcementEvent = this.createAnnouncementEvent(event);

    if (announcementEvent.type === 'interrupt') {
      this.announceImmediately(announcementEvent);
    } else if (announcementEvent.type === 'queue') {
      this.addToQueue(announcementEvent);
    }
    // Silent events are not announced
  }

  private createAnnouncementEvent(event: GameEvent): AnnouncementEvent {
    switch (event.type) {
      case EventType.INVESTIGATOR_DEATH:
        return {
          type: 'interrupt',
          message: `Critical: ${event.investigatorName} has died!`,
          priority: 'assertive'
        };

      case EventType.CARD_PLAYED:
        return {
          type: 'queue',
          message: `Played ${event.cardName}. ${event.effectDescription}`,
          priority: 'polite',
          delay: 500 // Brief delay to allow for batching
        };

      case EventType.DAMAGE_DEALT:
        return {
          type: 'queue',
          message: `${event.source} dealt ${event.amount} damage to ${event.target}`,
          priority: 'polite',
          delay: 300
        };

      default:
        return {
          type: 'silent',
          message: '',
          priority: 'polite'
        };
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.eventQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;

      if (event.delay) {
        await this.delay(event.delay);
      }

      this.announceToScreenReader(event.message, event.priority);
    }

    this.isProcessingQueue = false;
  }
}

interface AnnouncementEvent {
  type: 'interrupt' | 'queue' | 'silent';
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}
```

### Focus Behavior Specifications

```typescript
class FocusFlowManager {
  // Focus behavior after card play
  handleCardPlayFocus(playedCard: HTMLElement, combatState: CombatState): void {
    const hand = document.querySelector('[aria-label*="Your hand"]') as HTMLElement;

    if (combatState.hand.length === 0) {
      // No cards left - focus on end turn button
      const endTurnButton = document.getElementById('end-turn-button');
      if (endTurnButton) {
        endTurnButton.focus();
        this.announceToScreenReader("Hand is empty. Focus moved to End Turn button.", 'polite');
      }
    } else {
      // Focus on next playable card or first card if none playable
      const nextCard = this.findNextPlayableCard(playedCard, combatState);
      if (nextCard) {
        nextCard.focus();
      } else {
        hand.focus();
        this.announceToScreenReader("No more playable cards this turn.", 'polite');
      }
    }
  }

  // Focus behavior after ending turn
  handleEndTurnFocus(combatState: CombatState): void {
    // During enemy turn, focus on combat status
    const combatStatus = document.getElementById('combat-status');
    if (combatStatus) {
      combatStatus.focus();
      this.announceToScreenReader("Enemy turn beginning. Focus on combat status.", 'polite');
    }
  }

  // Focus behavior when turn starts
  handleTurnStartFocus(combatState: CombatState): void {
    // Focus on first playable card or hand summary
    const firstPlayableCard = this.findFirstPlayableCard(combatState);
    if (firstPlayableCard) {
      firstPlayableCard.focus();
      this.announceToScreenReader(`Your turn. ${combatState.hand.length} cards in hand, ${combatState.energy} energy available.`, 'polite');
    } else {
      const hand = document.querySelector('[aria-label*="Your hand"]') as HTMLElement;
      hand?.focus();
      this.announceToScreenReader("Your turn, but no cards are playable.", 'polite');
    }
  }

  // Focus behavior after mission assignment
  handleMissionAssignmentFocus(): void {
    // Return to mission list
    const missionPanel = document.querySelector('[aria-label*="missions"]') as HTMLElement;
    missionPanel?.focus();
    this.announceToScreenReader("Mission assigned. Returned to mission list.", 'polite');
  }

  // Focus behavior after combat ends
  handleCombatEndFocus(victory: boolean): void {
    // Focus on results dialog or return to strategy layer
    const resultsDialog = document.getElementById('combat-results');
    if (resultsDialog) {
      resultsDialog.focus();
      this.announceToScreenReader(
        victory ? "Combat won! Viewing results." : "Combat lost. Viewing results.",
        'assertive'
      );
    }
  }

  private findNextPlayableCard(currentCard: HTMLElement, combatState: CombatState): HTMLElement | null {
    const handContainer = currentCard.closest('[role="group"]');
    if (!handContainer) return null;

    const allCards = Array.from(handContainer.querySelectorAll('button:not([disabled])'));
    const currentIndex = allCards.indexOf(currentCard);

    // Look for next playable card
    for (let i = currentIndex + 1; i < allCards.length; i++) {
      const cardElement = allCards[i] as HTMLElement;
      const cardId = cardElement.dataset.cardId;
      if (cardId && this.isCardPlayable(cardId, combatState)) {
        return cardElement;
      }
    }

    // Look from beginning
    for (let i = 0; i < currentIndex; i++) {
      const cardElement = allCards[i] as HTMLElement;
      const cardId = cardElement.dataset.cardId;
      if (cardId && this.isCardPlayable(cardId, combatState)) {
        return cardElement;
      }
    }

    return null;
  }
}
```

## Deckbuilder-Specific Accessibility

### Card Comparison System

```typescript
class CardComparator {
  compareCards(cardA: AbstractCard, cardB: AbstractCard): string {
    const differences: string[] = [];

    // Cost comparison
    const costA = cardA.getModifiedCost();
    const costB = cardB.getModifiedCost();
    if (costA !== costB) {
      const diff = costA - costB;
      differences.push(`costs ${Math.abs(diff)} ${diff > 0 ? 'more' : 'less'} energy`);
    }

    // Damage comparison (for attack cards)
    if (cardA.type === CardType.Attack && cardB.type === CardType.Attack) {
      const damageA = this.extractDamageValue(cardA);
      const damageB = this.extractDamageValue(cardB);
      if (damageA !== damageB && damageA !== null && damageB !== null) {
        const diff = damageA - damageB;
        differences.push(`deals ${Math.abs(diff)} ${diff > 0 ? 'more' : 'less'} damage`);
      }
    }

    // Block comparison (for skill cards)
    if (this.providesBlock(cardA) || this.providesBlock(cardB)) {
      const blockA = this.extractBlockValue(cardA) || 0;
      const blockB = this.extractBlockValue(cardB) || 0;
      if (blockA !== blockB) {
        const diff = blockA - blockB;
        differences.push(`provides ${Math.abs(diff)} ${diff > 0 ? 'more' : 'less'} block`);
      }
    }

    // Rarity comparison
    if (cardA.rarity !== cardB.rarity) {
      const rarityOrder = [CardRarity.Basic, CardRarity.Common, CardRarity.Uncommon, CardRarity.Rare, CardRarity.Legendary];
      const rarityA = rarityOrder.indexOf(cardA.rarity);
      const rarityB = rarityOrder.indexOf(cardB.rarity);
      if (rarityA > rarityB) {
        differences.push(`is ${cardA.rarity} instead of ${cardB.rarity}`);
      }
    }

    if (differences.length === 0) {
      return `${cardA.name} is equivalent to ${cardB.name}`;
    }

    return `${cardA.name} compared to ${cardB.name}: ${differences.join(', ')}`;
  }

  compareToExisting(newCard: AbstractCard, existingDeck: AbstractCard[]): string {
    // Find most similar card in existing deck
    const similarCards = existingDeck.filter(card =>
      card.type === newCard.type ||
      card.name.includes(newCard.name.split(' ')[0]) ||
      this.hasSimilarEffects(card, newCard)
    );

    if (similarCards.length === 0) {
      return `${newCard.name} is a new type of card not currently in your deck`;
    }

    const mostSimilar = similarCards[0]; // Could implement better similarity matching
    return this.compareCards(newCard, mostSimilar);
  }

  private extractDamageValue(card: AbstractCard): number | null {
    // Parse damage from card description
    const description = card.getModifiedDescription();
    const damageMatch = description.match(/deal (\d+) damage/i);
    return damageMatch ? parseInt(damageMatch[1]) : null;
  }

  private extractBlockValue(card: AbstractCard): number | null {
    const description = card.getModifiedDescription();
    const blockMatch = description.match(/gain (\d+) block/i);
    return blockMatch ? parseInt(blockMatch[1]) : null;
  }
}
```

### Deck Browsing with Keyboard Navigation

```typescript
class AccessibleDeckBrowser {
  private currentFilters: DeckFilter = {};
  private currentSort: SortOption = SortOption.Name;

  setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.isDeckBrowserActive()) return;

      switch (event.key) {
        case 'f':
          this.openFilterMenu();
          event.preventDefault();
          break;
        case 's':
          this.cycleSortOptions();
          event.preventDefault();
          break;
        case 'c':
          this.compareSelectedCard();
          event.preventDefault();
          break;
        case '/':
          this.openSearch();
          event.preventDefault();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          this.filterByRarity(parseInt(event.key));
          event.preventDefault();
          break;
      }
    });
  }

  filterByRarity(rarityIndex: number): void {
    const rarities = [CardRarity.Basic, CardRarity.Common, CardRarity.Uncommon, CardRarity.Rare, CardRarity.Legendary];
    const rarity = rarities[rarityIndex - 1];

    if (rarity) {
      this.currentFilters.rarity = rarity;
      this.applyFilters();
      this.announceToScreenReader(`Filtered to show only ${rarity} cards. ${this.getFilteredCount()} cards shown.`, 'polite');
    }
  }

  cycleSortOptions(): void {
    const sortOptions = [SortOption.Name, SortOption.Cost, SortOption.Type, SortOption.Rarity];
    const currentIndex = sortOptions.indexOf(this.currentSort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;

    this.currentSort = sortOptions[nextIndex];
    this.applySorting();
    this.announceToScreenReader(`Sorted by ${this.currentSort}`, 'polite');
  }

  readCardInContext(card: AbstractCard): string {
    const position = this.getCardPosition(card);
    const total = this.getFilteredCount();
    const contextInfo = `Card ${position} of ${total}`;

    let description = this.elementReader.readCard(card, 'detailed');
    description += ` - ${contextInfo}`;

    // Add comparison to currently selected card if any
    const selectedCard = this.getSelectedCard();
    if (selectedCard && selectedCard.id !== card.id) {
      const comparison = this.cardComparator.compareCards(card, selectedCard);
      description += ` - Comparison: ${comparison}`;
    }

    return description;
  }
}

interface DeckFilter {
  rarity?: CardRarity;
  type?: CardType;
  cost?: number;
  investigatorClass?: string;
  searchText?: string;
}

enum SortOption {
  Name = 'Name',
  Cost = 'Cost',
  Type = 'Type',
  Rarity = 'Rarity',
  Source = 'Source'
}
```

### Enemy Intent Clarity

```typescript
class EnemyIntentReader {
  readAllEnemyIntents(): string {
    const combatState = getCurrentCombatState();
    const aliveEnemies = combatState.enemies.filter(e => e.isAlive);

    if (aliveEnemies.length === 0) {
      return "No enemies remaining";
    }

    const intentDescriptions = aliveEnemies.map((enemy, index) => {
      const position = `Enemy ${index + 1}`;
      const intent = this.describeDetailedIntent(enemy);
      return `${position}: ${enemy.name} - ${intent}`;
    });

    return `Enemy intents: ${intentDescriptions.join('. ')}`;
  }

  private describeDetailedIntent(enemy: CombatEnemy): string {
    const action = enemy.nextAction;
    let description = '';

    switch (enemy.intent) {
      case EnemyIntent.Attack:
        description = `attacking for ${action.damage} damage`;
        if (action.targets === TargetType.AllInvestigators) {
          description += ' to all party members';
        } else if (action.targets === TargetType.LowestHPInvestigator) {
          description += ' targeting lowest health investigator';
        }
        break;

      case EnemyIntent.Defend:
        description = `gaining ${action.blockGain} block`;
        break;

      case EnemyIntent.Buff:
        description = 'strengthening itself';
        if (action.statusEffects) {
          const effects = action.statusEffects.map(e => e.name).join(', ');
          description += ` by applying ${effects}`;
        }
        break;

      case EnemyIntent.Debuff:
        description = 'attempting to weaken you';
        if (action.statusEffects) {
          const effects = action.statusEffects.map(e => e.name).join(', ');
          description += ` by applying ${effects}`;
        }
        break;

      case EnemyIntent.Summon:
        description = 'summoning additional enemies';
        break;

      case EnemyIntent.Unknown:
        description = 'preparing unknown action';
        break;

      default:
        description = action.description || 'taking special action';
    }

    return description;
  }

  readTargetingImplications(): string {
    const combatState = getCurrentCombatState();
    const threats: string[] = [];

    combatState.enemies.forEach((enemy, index) => {
      if (!enemy.isAlive) return;

      const action = enemy.nextAction;
      if (enemy.intent === EnemyIntent.Attack) {
        let threat = `Enemy ${index + 1} (${enemy.name})`;

        switch (action.targets) {
          case TargetType.AllInvestigators:
            threat += ` will damage all party members for ${action.damage} each`;
            break;
          case TargetType.LowestHPInvestigator:
            const lowestHP = this.findLowestHPInvestigator(combatState.party);
            threat += ` will target ${lowestHP?.name || 'lowest health party member'} for ${action.damage} damage`;
            break;
          case TargetType.HighestHPInvestigator:
            const highestHP = this.findHighestHPInvestigator(combatState.party);
            threat += ` will target ${highestHP?.name || 'highest health party member'} for ${action.damage} damage`;
            break;
          default:
            threat += ` will attack for ${action.damage} damage`;
        }

        threats.push(threat);
      }
    });

    return threats.length > 0
      ? `Incoming threats: ${threats.join('. ')}`
      : "No immediate attack threats";
  }
}
```

### Artifact Synergy Descriptions

```typescript
class ArtifactSynergyReader {
  readArtifactEffects(artifact: Artifact, gameState: GameState): string {
    let description = `${artifact.name}: ${artifact.description}`;

    // Add explicit trigger descriptions
    const triggers = this.getArtifactTriggers(artifact);
    if (triggers.length > 0) {
      description += ` Triggers when: ${triggers.join(', ')}`;
    }

    // Add synergy information
    const synergies = this.findActiveSynergies(artifact, gameState);
    if (synergies.length > 0) {
      description += ` Active synergies: ${synergies.join(', ')}`;
    }

    // Add current effect values
    const currentValues = this.getCurrentEffectValues(artifact, gameState);
    if (currentValues) {
      description += ` Current effect: ${currentValues}`;
    }

    return description;
  }

  private getArtifactTriggers(artifact: Artifact): string[] {
    const triggers: string[] = [];

    for (const effect of artifact.effects) {
      switch (effect.constructor.name) {
        case 'GlobalDoomReductionEffect':
          triggers.push('every doom tick (weekly)');
          break;
        case 'AllInvestigatorHPEffect':
          triggers.push('permanently increases all investigator health');
          break;
        case 'StressReductionEffect':
          triggers.push('after each mission');
          break;
        case 'InfiltrationSpeedEffect':
          triggers.push('when starting infiltration');
          break;
        case 'RecoverySpeedEffect':
          triggers.push('when investigators are recovering');
          break;
        case 'CombatCardBonusEffect':
          triggers.push('at start of each combat');
          break;
        case 'FundingMultiplierEffect':
          triggers.push('when receiving funding rewards');
          break;
      }
    }

    return triggers;
  }

  private findActiveSynergies(artifact: Artifact, gameState: GameState): string[] {
    const synergies: string[] = [];

    // Check for artifact combinations
    const otherArtifacts = gameState.artifacts.filter(a => a.id !== artifact.id);

    for (const other of otherArtifacts) {
      const synergy = this.checkArtifactSynergy(artifact, other);
      if (synergy) {
        synergies.push(`combines with ${other.name} to ${synergy}`);
      }
    }

    // Check for investigator class synergies
    for (const investigator of gameState.investigators) {
      const classSynergy = this.checkClassSynergy(artifact, investigator.class);
      if (classSynergy) {
        synergies.push(`enhanced by ${investigator.class.name} investigators: ${classSynergy}`);
      }
    }

    return synergies;
  }

  private checkArtifactSynergy(artifactA: Artifact, artifactB: Artifact): string | null {
    // Define known synergies
    const synergyMap = new Map([
      ['thule_codex,prototype_armor', 'reduce infiltration time while maintaining protection'],
      ['queens_seal,military_rations', 'maximize both funding and recovery efficiency'],
      ['forge_fragment,blessed_medallion', 'counter doom while resisting corruption']
    ]);

    const key1 = `${artifactA.id},${artifactB.id}`;
    const key2 = `${artifactB.id},${artifactA.id}`;

    return synergyMap.get(key1) || synergyMap.get(key2) || null;
  }

  readAllActiveSynergies(gameState: GameState): string {
    const allSynergies: string[] = [];

    for (const artifact of gameState.artifacts) {
      const synergies = this.findActiveSynergies(artifact, gameState);
      allSynergies.push(...synergies);
    }

    return allSynergies.length > 0
      ? `Active artifact synergies: ${allSynergies.join('. ')}`
      : "No active artifact synergies";
  }
}
```

## Navigation Modes

### Quick Navigation System

```typescript
class QuickNavigationManager {
  setupQuickNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Quick navigation shortcuts
      if (event.altKey) {
        switch (event.key) {
          case 'h':
            this.jumpToHand();
            event.preventDefault();
            break;
          case 'e':
            this.jumpToEnemies();
            event.preventDefault();
            break;
          case 'p':
            this.jumpToParty();
            event.preventDefault();
            break;
          case 'r':
            this.jumpToResources();
            event.preventDefault();
            break;
          case 'l':
            this.jumpToLog();
            event.preventDefault();
            break;
          case 'm':
            this.jumpToMissions();
            event.preventDefault();
            break;
        }
      }
    });
  }

  jumpToHand(): void {
    const handSection = document.querySelector('[aria-label*="hand"]') as HTMLElement;
    if (handSection) {
      handSection.focus();
      const cardCount = this.getHandCardCount();
      this.announceToScreenReader(`Jumped to hand. ${cardCount} cards available.`, 'polite');
    }
  }

  jumpToEnemies(): void {
    const enemySection = document.querySelector('[aria-label*="enemies"]') as HTMLElement;
    if (enemySection) {
      enemySection.focus();
      const enemyIntents = this.enemyIntentReader.readAllEnemyIntents();
      this.announceToScreenReader(`Jumped to enemies. ${enemyIntents}`, 'polite');
    }
  }

  jumpToParty(): void {
    const partySection = document.querySelector('[aria-label*="party"]') as HTMLElement;
    if (partySection) {
      partySection.focus();
      const partyStatus = this.readPartyStatus();
      this.announceToScreenReader(`Jumped to party. ${partyStatus}`, 'polite');
    }
  }

  jumpToMissions(): void {
    const missionSection = document.querySelector('[aria-label*="missions"]') as HTMLElement;
    if (missionSection) {
      missionSection.focus();
      const missionSummary = this.readMissionSummary();
      this.announceToScreenReader(`Jumped to missions. ${missionSummary}`, 'polite');
    }
  }
}
```

### Detailed Inspection Mode

```typescript
class DetailedInspectionMode {
  private isDetailedMode = false;
  private verbosityLevel: 'brief' | 'standard' | 'detailed' = 'standard';

  toggleDetailedMode(): void {
    this.isDetailedMode = !this.isDetailedMode;
    this.verbosityLevel = this.isDetailedMode ? 'detailed' : 'standard';

    this.announceToScreenReader(
      `Detailed inspection mode ${this.isDetailedMode ? 'enabled' : 'disabled'}. ${
        this.isDetailedMode ? 'All elements will provide comprehensive information.' : 'Returned to standard verbosity.'
      }`,
      'polite'
    );

    this.updateAllElementDescriptions();
  }

  setVerbosityLevel(level: 'brief' | 'standard' | 'detailed'): void {
    this.verbosityLevel = level;
    this.announceToScreenReader(`Verbosity set to ${level}`, 'polite');
    this.updateAllElementDescriptions();
  }

  readElementInDetail(element: HTMLElement): void {
    const elementType = this.getElementType(element);
    let description = '';

    switch (elementType) {
      case 'card':
        const cardId = element.dataset.cardId;
        if (cardId) {
          const card = this.getCardById(cardId);
          description = this.elementReader.readCard(card, 'detailed');
        }
        break;

      case 'investigator':
        const investigatorId = element.dataset.investigatorId;
        if (investigatorId) {
          const investigator = this.getInvestigatorById(investigatorId);
          description = this.elementReader.readInvestigator(investigator, 'detailed');
        }
        break;

      case 'enemy':
        const enemyId = element.dataset.enemyId;
        if (enemyId) {
          const enemy = this.getEnemyById(enemyId);
          description = this.elementReader.readEnemy(enemy, 'detailed');
        }
        break;

      case 'mission':
        const missionId = element.dataset.missionId;
        if (missionId) {
          const mission = this.getMissionById(missionId);
          description = this.readMissionDetails(mission);
        }
        break;
    }

    if (description) {
      this.announceToScreenReader(description, 'polite');
    }
  }

  private readMissionDetails(mission: Mission): string {
    let details = `${mission.name} - ${mission.type} mission - Difficulty ${mission.difficultyRating} of 5`;

    details += ` - Location: ${mission.location}`;
    details += ` - Requires ${mission.minimumInvestigators} to ${mission.maximumInvestigators} investigators`;
    details += ` - Expires in ${mission.expiresOnDay - getCurrentDay()} days`;

    if (mission.type === MissionType.Combat) {
      details += ` - Infiltration time: ${mission.infiltrationRequired} days`;
    } else {
      details += ` - Completion time: ${mission.completionTime} days`;
      if (mission.influenceRequirement) {
        details += ` - Requires ${mission.influenceRequirement} influence`;
      }
    }

    // Rewards
    const rewards: string[] = [];
    if (mission.rewards.funding) rewards.push(`${mission.rewards.funding} pounds`);
    if (mission.rewards.influence) rewards.push(`${mission.rewards.influence} influence`);
    if (mission.rewards.artifactTiers) rewards.push(`${mission.rewards.artifactTiers.length} artifacts`);
    if (mission.rewards.doomReduction) rewards.push(`reduces doom by ${mission.rewards.doomReduction}`);

    if (rewards.length > 0) {
      details += ` - Rewards: ${rewards.join(', ')}`;
    }

    // Penalties
    const penalties: string[] = [];
    if (mission.penalties.doomIncrease) penalties.push(`${mission.penalties.doomIncrease} doom on failure`);
    if (mission.penalties.cultistStrength) penalties.push(`${mission.penalties.cultistStrength} cultist strength increase`);

    if (penalties.length > 0) {
      details += ` - Failure penalties: ${penalties.join(', ')}`;
    }

    return details;
  }
}
```

### Combat Log with Adjustable Verbosity

```typescript
class AccessibleCombatLog {
  private logEntries: CombatLogEntry[] = [];
  private verbosity: 'minimal' | 'standard' | 'verbose' = 'standard';
  private maxEntries = 50;

  setVerbosity(level: 'minimal' | 'standard' | 'verbose'): void {
    this.verbosity = level;
    this.announceToScreenReader(`Combat log verbosity set to ${level}`, 'polite');
  }

  addLogEntry(event: CombatEvent): void {
    const entry = this.createLogEntry(event);
    this.logEntries.unshift(entry); // Add to beginning

    if (this.logEntries.length > this.maxEntries) {
      this.logEntries = this.logEntries.slice(0, this.maxEntries);
    }

    this.updateLogDisplay();
  }

  private createLogEntry(event: CombatEvent): CombatLogEntry {
    const turn = getCurrentCombatState().currentTurn;
    let message = '';

    switch (this.verbosity) {
      case 'minimal':
        message = this.createMinimalMessage(event);
        break;
      case 'standard':
        message = this.createStandardMessage(event);
        break;
      case 'verbose':
        message = this.createVerboseMessage(event);
        break;
    }

    return {
      turn,
      timestamp: Date.now(),
      event,
      message,
      verbosity: this.verbosity
    };
  }

  private createMinimalMessage(event: CombatEvent): string {
    switch (event.type) {
      case 'CARD_PLAYED':
        return `${event.cardName} played`;
      case 'DAMAGE_DEALT':
        return `${event.amount} damage to ${event.target}`;
      case 'HEALING_RECEIVED':
        return `${event.target} healed ${event.amount}`;
      case 'STATUS_APPLIED':
        return `${event.statusName} applied`;
      default:
        return event.type.toLowerCase().replace('_', ' ');
    }
  }

  private createStandardMessage(event: CombatEvent): string {
    switch (event.type) {
      case 'CARD_PLAYED':
        return `${event.source} played ${event.cardName}: ${event.effectDescription}`;
      case 'DAMAGE_DEALT':
        const blockText = event.blocked ? ` (${event.blocked} blocked)` : '';
        return `${event.source} dealt ${event.amount} damage to ${event.target}${blockText}`;
      case 'HEALING_RECEIVED':
        return `${event.target} healed for ${event.amount} health`;
      case 'STATUS_APPLIED':
        return `${event.target} gained ${event.statusName}${event.stacks > 1 ? ` (${event.stacks} stacks)` : ''}`;
      default:
        return `${event.type}: ${event.description || 'Unknown event'}`;
    }
  }

  private createVerboseMessage(event: CombatEvent): string {
    const standardMessage = this.createStandardMessage(event);
    let verboseAdditions = '';

    switch (event.type) {
      case 'DAMAGE_DEALT':
        if (event.target) {
          const target = this.getTargetById(event.target);
          if (target) {
            verboseAdditions = ` ${target.name} now has ${target.currentHP} of ${target.maxHP} health`;
          }
        }
        break;
      case 'STATUS_APPLIED':
        if (event.statusDescription) {
          verboseAdditions = ` Effect: ${event.statusDescription}`;
        }
        break;
      case 'CARD_PLAYED':
        if (event.energyCost) {
          verboseAdditions = ` Cost: ${event.energyCost} energy`;
        }
        break;
    }

    return standardMessage + verboseAdditions;
  }

  readRecentHistory(count: number = 5): string {
    const recentEntries = this.logEntries.slice(0, count);
    if (recentEntries.length === 0) {
      return "No recent combat events";
    }

    const messages = recentEntries.reverse().map((entry, index) =>
      `${index + 1}: ${entry.message}`
    );

    return `Recent combat events: ${messages.join('. ')}`;
  }

  searchLog(query: string): string {
    const matchingEntries = this.logEntries.filter(entry =>
      entry.message.toLowerCase().includes(query.toLowerCase()) ||
      entry.event.type.toLowerCase().includes(query.toLowerCase())
    );

    if (matchingEntries.length === 0) {
      return `No combat log entries found for "${query}"`;
    }

    const messages = matchingEntries.slice(0, 5).map(entry => entry.message);
    return `Found ${matchingEntries.length} matches for "${query}": ${messages.join('. ')}`;
  }
}

interface CombatLogEntry {
  turn: number;
  timestamp: number;
  event: CombatEvent;
  message: string;
  verbosity: 'minimal' | 'standard' | 'verbose';
}
```

### "What Can I Do?" Command System

```typescript
class ActionAnalyzer {
  analyzeAvailableActions(): string {
    if (this.isInCombat()) {
      return this.analyzeCombatActions();
    } else {
      return this.analyzeStrategyActions();
    }
  }

  private analyzeCombatActions(): string {
    const combatState = getCurrentCombatState();
    const actions: string[] = [];

    // Card playing options
    const playableCards = combatState.hand.filter(card =>
      combatState.energy >= card.getModifiedCost()
    );

    if (playableCards.length > 0) {
      const cardActions = playableCards.map(card => {
        const cost = card.getModifiedCost();
        const targets = card.getValidTargets(combatState);
        let action = `play ${card.name} for ${cost} energy`;

        if (targets.length > 0) {
          action += ` (${targets.length} valid targets)`;
        }

        return action;
      });

      actions.push(`Card options: ${cardActions.join(', ')}`);
    } else {
      actions.push("No cards can be played with current energy");
    }

    // Turn management
    if (combatState.isPlayerTurn) {
      actions.push("End turn to let enemies act");
    }

    // Special actions
    if (this.canRetreat(combatState)) {
      actions.push("Retreat from combat (will have campaign consequences)");
    }

    // Information gathering
    actions.push("Press F2 to read full combat state");
    actions.push("Press Alt+E to read enemy intents");
    actions.push("Press Alt+P to read party status");

    return `Available actions: ${actions.join('. ')}`;
  }

  private analyzeStrategyActions(): string {
    const gameState = getCurrentGameState();
    const actions: string[] = [];

    // Investigator actions
    const availableInvestigators = gameState.investigators.filter(i =>
      i.status === InvestigatorStatus.Available
    );

    if (availableInvestigators.length > 0) {
      actions.push(`${availableInvestigators.length} investigators available for missions`);
    }

    // Mission actions
    const availableMissions = gameState.missions.filter(m =>
      m.status === MissionStatus.Available
    );
    const readyMissions = gameState.missions.filter(m =>
      m.status === MissionStatus.Ready
    );

    if (readyMissions.length > 0) {
      actions.push(`${readyMissions.length} missions ready to launch immediately`);
    }

    if (availableMissions.length > 0) {
      actions.push(`${availableMissions.length} missions available for assignment`);
    }

    // Time management
    if (gameState.isPaused) {
      actions.push("Resume time to progress the game");
    } else {
      actions.push("Pause time to plan actions");
      actions.push(`Change time speed (currently ${this.getSpeedDescription(gameState.timeSpeed)})`);
    }

    // Management actions
    if (gameState.resources.influence >= GAME_CONSTANTS.INFLUENCE_RECRUITMENT_THRESHOLD) {
      actions.push("Recruit new investigators");
    }

    // Information gathering
    actions.push("Press F2 to read full game state");
    actions.push("Press Alt+M to read mission details");
    actions.push("Press Alt+R to read resource status");

    return actions.length > 0
      ? `Available actions: ${actions.join('. ')}`
      : "No immediate actions available. Use time controls to advance the game.";
  }

  analyzeActionConstraints(): string {
    const constraints: string[] = [];

    if (this.isInCombat()) {
      const combatState = getCurrentCombatState();

      if (combatState.energy === 0) {
        constraints.push("No energy remaining - must end turn");
      }

      if (combatState.hand.length === 0) {
        constraints.push("No cards in hand");
      }

      const unplayableCards = combatState.hand.filter(card =>
        combatState.energy < card.getModifiedCost()
      );

      if (unplayableCards.length > 0) {
        constraints.push(`${unplayableCards.length} cards require more energy`);
      }
    } else {
      const gameState = getCurrentGameState();

      if (gameState.investigators.filter(i => i.status === InvestigatorStatus.Available).length === 0) {
        constraints.push("No investigators available for new missions");
      }

      if (gameState.resources.funding < 500) {
        constraints.push("Low funding may limit mission options");
      }

      if (gameState.doomCounter >= 8) {
        constraints.push("High doom level - urgent action required");
      }
    }

    return constraints.length > 0
      ? `Current constraints: ${constraints.join('. ')}`
      : "No major constraints on available actions";
  }

  provideTacticalAdvice(): string {
    if (this.isInCombat()) {
      return this.provideCombatAdvice();
    } else {
      return this.provideStrategyAdvice();
    }
  }

  private provideCombatAdvice(): string {
    const combatState = getCurrentCombatState();
    const advice: string[] = [];

    // Health warnings
    const lowHealthParty = combatState.party.filter(p =>
      p.isAlive && p.currentHP <= p.maxHP * 0.3
    );

    if (lowHealthParty.length > 0) {
      advice.push(`${lowHealthParty.length} party members critically wounded - consider healing`);
    }

    // Threat assessment
    const incomingDamage = this.calculateIncomingDamage(combatState);
    if (incomingDamage > 0) {
      advice.push(`Incoming damage: ${incomingDamage} total - consider defensive actions`);
    }

    // Card suggestions
    const healingCards = combatState.hand.filter(card =>
      this.isHealingCard(card) && combatState.energy >= card.getModifiedCost()
    );

    if (healingCards.length > 0 && lowHealthParty.length > 0) {
      advice.push(`Consider playing healing cards: ${healingCards.map(c => c.name).join(', ')}`);
    }

    return advice.length > 0
      ? `Tactical advice: ${advice.join('. ')}`
      : "No specific tactical advice at this time";
  }

  private provideStrategyAdvice(): string {
    const gameState = getCurrentGameState();
    const advice: string[] = [];

    // Doom warnings
    if (gameState.doomCounter >= 7) {
      advice.push("Doom level critical - prioritize doom reduction missions");
    }

    // Resource management
    if (gameState.resources.funding > 10000) {
      advice.push("High funding - consider investing in recruitment or equipment");
    }

    if (gameState.resources.influence < 30) {
      advice.push("Low influence - complete non-combat missions to improve standing");
    }

    // Investigator management
    const stressedInvestigators = gameState.investigators.filter(i =>
      i.stress >= 7
    );

    if (stressedInvestigators.length > 0) {
      advice.push(`${stressedInvestigators.length} investigators highly stressed - allow recovery time`);
    }

    return advice.length > 0
      ? `Strategic advice: ${advice.join('. ')}`
      : "Current strategy appears sound - continue as planned";
  }
}
```

This comprehensive accessibility specification ensures that The Forge-Tyrant Rising provides full functionality to screen reader users and keyboard-only players, with detailed information architecture, consistent navigation patterns, and thoughtful game flow design that makes complex strategic gameplay fully accessible.