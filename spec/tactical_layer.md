# The Forge-Tyrant Rising: Tactical Combat Specification v1.0

## Core Combat Philosophy

### Design Principles
- **Party-based deck building**: Each investigator contributes their personal deck to the combined battle deck
- **Adaptive difficulty**: Combat scales with party size (fewer investigators = harder but more focused)
- **Tactical positioning**: Character placement and targeting matter
- **Resource management**: Energy and card draw are precious commodities
- **Risk/reward decisions**: Players must balance offense, defense, and long-term sustainability

### Victory/Loss Conditions
- **Victory**: All enemies defeated
- **Loss**: All party members dead (0 investigators remaining)
- **Retreat**: Optional retreat mechanism (campaign consequences)

## Combat Architecture

### Core Data Models

```typescript
interface CombatState {
  // Participants
  party: CombatInvestigator[];
  enemies: CombatEnemy[];

  // Deck management
  drawPile: AbstractCard[];
  hand: AbstractCard[];
  discardPile: AbstractCard[];
  exhaustPile: AbstractCard[]; // Cards removed for this combat

  // Turn state
  currentTurn: number;
  turnPhase: TurnPhase;
  energy: number;
  maxEnergy: number;
  cardsDrawnThisTurn: number;

  // Combat state
  isPlayerTurn: boolean;
  combatResult?: CombatResult;

  // Effects and modifiers
  activeEffects: StatusEffect[];
  temporaryModifiers: Modifier[];

  // UI state
  selectedCard?: string; // Card ID
  selectedTarget?: string; // Character ID (investigator or enemy)
  hoveredCard?: string;

  // History for undo/replay
  actionHistory: CombatAction[];

  // Random seed for deterministic combat
  randomSeed: number;
}

enum TurnPhase {
  StartOfTurn = 'StartOfTurn',     // Draw cards, trigger start effects
  MainPhase = 'MainPhase',         // Play cards, target abilities
  EndOfTurn = 'EndOfTurn',         // Discard hand, trigger end effects
  EnemyTurn = 'EnemyTurn'          // Enemy actions resolve
}

interface CombatInvestigator {
  id: string;
  name: string;
  portraitUrl: string;
  class: InvestigatorClass;

  // Health and status
  currentHP: number;
  maxHP: number;
  block: number; // Temporary damage reduction

  // Position and targeting
  position: number; // 0-2, left to right
  isAlive: boolean;

  // Status effects
  statusEffects: StatusEffect[];

  // Cards contributed to deck
  deckCards: AbstractCard[];

  // Combat statistics
  damageDealt: number;
  damageTaken: number;
  cardsPlayed: number;
}

interface CombatEnemy {
  id: string;
  name: string;
  spriteUrl: string;

  // Health and status
  currentHP: number;
  maxHP: number;
  block: number;

  // Position and behavior
  position: number; // 0-4, left to right
  isAlive: boolean;

  // AI behavior
  intent: EnemyIntent;
  nextAction: EnemyAction;

  // Status effects
  statusEffects: StatusEffect[];

  // Scaling
  difficultyModifier: number; // Based on cultist strength
}

enum EnemyIntent {
  Attack = 'Attack',           // 🗡️ Red icon
  Defend = 'Defend',           // 🛡️ Blue icon
  Buff = 'Buff',              // ⬆️ Green icon
  Debuff = 'Debuff',          // ⬇️ Orange icon
  Summon = 'Summon',          // ➕ Purple icon
  Unknown = 'Unknown'         // ❓ Gray icon
}

interface EnemyAction {
  type: EnemyActionType;
  damage?: number;
  blockGain?: number;
  targets: TargetType;
  statusEffects?: StatusEffect[];
  description: string;
}

enum EnemyActionType {
  Attack = 'Attack',
  Defend = 'Defend',
  ApplyStatus = 'ApplyStatus',
  Heal = 'Heal',
  Special = 'Special'
}

enum TargetType {
  RandomInvestigator = 'RandomInvestigator',
  LowestHPInvestigator = 'LowestHPInvestigator',
  HighestHPInvestigator = 'HighestHPInvestigator',
  AllInvestigators = 'AllInvestigators',
  Self = 'Self',
  AllEnemies = 'AllEnemies',
  RandomEnemy = 'RandomEnemy'
}
```

### Card System

```typescript
// Abstract base class for all cards
abstract class AbstractCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly artUrl: string;
  readonly cost: number;
  readonly type: CardType;
  readonly rarity: CardRarity;
  readonly targetType: CardTargetType;

  // Runtime state
  sourceInvestigatorId?: string; // Who contributed this card
  appliedBuffs: AbstractBuff[];
  timesPlayed: number;
  upgradeLevel: number; // 0 = base, 1+ = upgraded

  constructor(cardData: CardConstructorData) {
    this.id = cardData.id;
    this.name = cardData.name;
    this.description = cardData.description;
    this.artUrl = cardData.artUrl;
    this.cost = cardData.cost;
    this.type = cardData.type;
    this.rarity = cardData.rarity;
    this.targetType = cardData.targetType;
    this.appliedBuffs = [];
    this.timesPlayed = 0;
    this.upgradeLevel = 0;
  }

  // Main method called when card is played
  abstract InvokeCardEffect(
    combatState: CombatState,
    targetId?: string
  ): Promise<CardEffectResult>;

  // Helper methods
  getModifiedCost(): number {
    let modifiedCost = this.cost;
    for (const buff of this.appliedBuffs) {
      modifiedCost = buff.modifyCost(modifiedCost);
    }
    return Math.max(0, modifiedCost);
  }

  getModifiedDescription(): string {
    let description = this.description;
    for (const buff of this.appliedBuffs) {
      description = buff.modifyDescription(description);
    }
    return description;
  }

  canBeTargeted(targetId: string, combatState: CombatState): boolean {
    // Default targeting logic, can be overridden
    const target = combatState.party.find(p => p.id === targetId) ||
                  combatState.enemies.find(e => e.id === targetId);
    return target?.isAlive ?? false;
  }

  getValidTargets(combatState: CombatState): string[] {
    switch (this.targetType) {
      case CardTargetType.SingleEnemy:
        return combatState.enemies.filter(e => e.isAlive).map(e => e.id);
      case CardTargetType.SingleAlly:
        return combatState.party.filter(p => p.isAlive).map(p => p.id);
      case CardTargetType.AnyTarget:
        return [
          ...combatState.enemies.filter(e => e.isAlive).map(e => e.id),
          ...combatState.party.filter(p => p.isAlive).map(p => p.id)
        ];
      case CardTargetType.NoTarget:
      case CardTargetType.AllEnemies:
      case CardTargetType.AllAllies:
      case CardTargetType.Self:
      default:
        return [];
    }
  }

  // Buff management
  addBuff(buff: AbstractBuff): void {
    const existingBuff = this.appliedBuffs.find(b => b.constructor === buff.constructor);
    if (existingBuff && existingBuff.canStack()) {
      existingBuff.addStacks(buff.stacks);
    } else if (!existingBuff) {
      this.appliedBuffs.push(buff);
    }
    // If buff exists and can't stack, do nothing
  }

  removeBuff(buffType: new (...args: any[]) => AbstractBuff): void {
    this.appliedBuffs = this.appliedBuffs.filter(b => !(b instanceof buffType));
  }

  hasBuff(buffType: new (...args: any[]) => AbstractBuff): boolean {
    return this.appliedBuffs.some(b => b instanceof buffType);
  }

  clone(): AbstractCard {
    // Create a new instance of the same card type
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    cloned.id = generateUniqueId();
    cloned.appliedBuffs = this.appliedBuffs.map(buff => buff.clone());
    return cloned;
  }
}

// Abstract base class for card buffs
abstract class AbstractBuff {
  readonly name: string;
  readonly description: string;
  readonly iconUrl: string;
  stacks: number;

  constructor(name: string, description: string, iconUrl: string, stacks: number = 1) {
    this.name = name;
    this.description = description;
    this.iconUrl = iconUrl;
    this.stacks = stacks;
  }

  // Core buff functionality
  abstract canStack(): boolean;
  abstract modifyCost(baseCost: number): number;
  abstract modifyDescription(baseDescription: string): string;

  // Stack management
  addStacks(amount: number): void {
    if (this.canStack()) {
      this.stacks += amount;
    }
  }

  removeStacks(amount: number): void {
    this.stacks = Math.max(0, this.stacks - amount);
  }

  // Utility methods
  getDisplayText(): string {
    return this.canStack() && this.stacks > 1 ? `${this.name} (${this.stacks})` : this.name;
  }

  clone(): AbstractBuff {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    return cloned;
  }
}

interface CardConstructorData {
  id: string;
  name: string;
  description: string;
  artUrl: string;
  cost: number;
  type: CardType;
  rarity: CardRarity;
  targetType: CardTargetType;
}

interface CardEffectResult {
  success: boolean;
  damageDealt?: number;
  healingDone?: number;
  statusEffectsApplied?: string[];
  cardsDrawn?: number;
  energyChanged?: number;
  error?: string;
}

enum CardType {
  Attack = 'Attack',       // Red border - deals damage
  Skill = 'Skill',        // Green border - utility effects
  Power = 'Power',        // Blue border - persistent effects
  Curse = 'Curse',        // Purple border - negative effects
  Status = 'Status'       // Gray border - temporary effects
}

enum CardRarity {
  Basic = 'Basic',        // Gray gem - starting cards
  Common = 'Common',      // White gem - frequently found
  Uncommon = 'Uncommon',  // Blue gem - moderately rare
  Rare = 'Rare',         // Gold gem - powerful cards
  Legendary = 'Legendary' // Rainbow gem - unique effects
}

enum CardTargetType {
  NoTarget = 'NoTarget',                    // Self-targeting or global
  SingleEnemy = 'SingleEnemy',              // Click to target one enemy
  AllEnemies = 'AllEnemies',               // Hits all enemies
  SingleAlly = 'SingleAlly',               // Click to target one investigator
  AllAllies = 'AllAllies',                 // Affects all investigators
  Self = 'Self',                           // Only affects card player
  AnyTarget = 'AnyTarget'                  // Can target anyone
}

interface CardEffect {
  type: EffectType;
  value: number;
  target: EffectTarget;
  condition?: EffectCondition;
  description: string;
}

enum EffectType {
  // Damage and healing
  Damage = 'Damage',
  Heal = 'Heal',
  Block = 'Block',

  // Status effects
  ApplyStatus = 'ApplyStatus',
  RemoveStatus = 'RemoveStatus',

  // Card manipulation
  DrawCards = 'DrawCards',
  DiscardCards = 'DiscardCards',
  ExhaustCards = 'ExhaustCards',
  ReturnToHand = 'ReturnToHand',

  // Energy and resources
  GainEnergy = 'GainEnergy',
  LoseEnergy = 'LoseEnergy',

  // Special mechanics
  Corrupt = 'Corrupt',     // Add corruption to investigator
  Inspire = 'Inspire',     // Reduce stress
  Transform = 'Transform'  // Change card into another
}

enum EffectTarget {
  Target = 'Target',           // The selected target
  Self = 'Self',              // The card player
  AllAllies = 'AllAllies',    // All investigators
  AllEnemies = 'AllEnemies',  // All enemies
  Random = 'Random'           // Random valid target
}

interface StatusEffect {
  id: string;
  name: string;
  description: string;
  iconUrl: string;

  type: StatusEffectType;
  duration: number; // -1 = permanent, 0 = expires this turn
  stacks: number;   // How many stacks of this effect

  effects: EffectModifier[];

  // Timing
  triggersOn: TriggerType[];
  isDebuff: boolean;
}

enum StatusEffectType {
  // Damage modifiers
  Strength = 'Strength',         // +damage dealt
  Vulnerable = 'Vulnerable',     // +damage taken
  Weak = 'Weak',                // -damage dealt

  // Defense modifiers
  Dexterity = 'Dexterity',      // +block gained
  Frail = 'Frail',              // -block gained

  // Damage over time
  Poison = 'Poison',            // Damage at turn start
  Regeneration = 'Regeneration', // Healing at turn start

  // Special effects
  Corrupted = 'Corrupted',      // Various negative effects
  Inspired = 'Inspired',       // Various positive effects
  Stunned = 'Stunned',         // Skip next turn

  // Mechanical effects
  Ritual = 'Ritual',           // Gain strength each turn
  Metallurgy = 'Metallurgy',   // Gain block when playing cards

  // Investigator class specific
  Focused = 'Focused',         // Scholar: +card draw
  Disciplined = 'Disciplined', // Soldier: +block from cards
  Channeling = 'Channeling',   // Occultist: powers cost 1 less
  Analyzing = 'Analyzing',     // Alienist: see enemy intent
  Overclocked = 'Overclocked'  // Engineer: +energy next turn
}

enum TriggerType {
  TurnStart = 'TurnStart',
  TurnEnd = 'TurnEnd',
  OnDamaged = 'OnDamaged',
  OnHealed = 'OnHealed',
  OnCardPlayed = 'OnCardPlayed',
  OnEnemyDeath = 'OnEnemyDeath',
  OnAllyDeath = 'OnAllyDeath'
}
```

## Screen Layout & UI Specification

### Combat Screen Layout (1920x1080)
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ TOP UI BAR (80px height)                                                             │
│ [⚔️ Turn 3] [⚡ Energy: 2/3] [📚 Draw: 12] [🗑️ Discard: 8] [⏸️] [⚙️] [🏃 Retreat] │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ BATTLEFIELD (600px height)                                                           │
│                                                                                     │
│ ENEMIES (Left Side - 600px width)        ALLIES (Right Side - 600px width)         │
│ ┌─────────────┬─────────────┬─────────────┐ ┌─────────────┬─────────────┬───────────┐  │
│ │   Enemy 1   │   Enemy 2   │   Enemy 3   │ │  Invest. 1  │  Invest. 2  │ Invest. 3 │  │
│ │ 🗡️ Intent:12 │ 🛡️ Intent:+8 │     💀      │ │ HP: 25/30   │ HP: 18/25   │ HP: 22/25 │  │
│ │ HP: 45/60   │ HP: 30/40   │             │ │ Block: 5    │ Block: 0    │ Block: 3  │  │
│ │ [Debuffs]   │ [Buffs]     │             │ │ [Effects]   │ [Effects]   │ [Effects] │  │
│ └─────────────┴─────────────┴─────────────┘ └─────────────┴─────────────┴───────────┘  │
│                                                                                     │
│ [Target Lines and Visual Effects Area]                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ HAND AREA (300px height)                                                             │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐                       │
│ │Card1│Card2│Card3│Card4│Card5│Card6│Card7│Card8│Card9│Card │                       │
│ │ ⚡2 │ ⚡1 │ ⚡0 │ ⚡1 │ ⚡3 │ ⚡2 │ ⚡1 │ ⚡0 │ ⚡2 │ 10  │                       │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘                       │
│                                                                                     │
│ [Card descriptions and targeting arrows shown here]                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Card Display Format (150px width x 200px height)
```
┌─────────────────┐
│ [Art - 60px h]  │
│ [🔥+2][💰-1]     │ ← Buff icons (Enhanced, Cheapened)
├─────────────────┤
│ ⚡1 Card Name    │ ← Modified cost (was 2, now 1)
│ Type: Attack    │
│ ────────────────│
│ Deal 10 damage. │ ← Modified description (+2 from Enhanced)
│ Gain 4 Block.   │
│ Cheapened.      │
│ ────────────────│
│ [Class Icon] R  │ ← R = Rarity indicator
└─────────────────┘
```

### Card Buff Display
- **Buff Icons**: Small icons in top-right corner of card art
- **Stacking**: Show stack count as small number on buff icon
- **Tooltips**: Hover over buff icons shows detailed description
- **Description Updates**: Card text automatically updates to reflect buff effects
- **Cost Changes**: Energy cost visually updated (crossed out old cost if changed)

### Enemy Display (180px width x 200px height)
```
┌─────────────────┐
│ [Enemy Art]     │
│                 │
├─────────────────┤
│ Enemy Name      │
│ 🗡️ Attack: 12   │  ← Intent display
│ ────────────────│
│ ❤️ HP: 45/60    │
│ 🛡️ Block: 0     │
│ ────────────────│
│ [Status Icons]  │
└─────────────────┘
```

### Investigator Display (180px width x 200px height)
```
┌─────────────────┐
│ [Portrait]      │
│                 │
├─────────────────┤
│ Investigator    │
│ 📚 Scholar      │
│ ────────────────│
│ ❤️ HP: 25/30    │
│ 🛡️ Block: 5     │
│ ────────────────│
│ [Status Icons]  │
└─────────────────┘
```

## Deck Construction & Card Distribution

### Master Deck Composition
Each investigator has a simple list of cards that they contribute to the combined battle deck:

```typescript
interface CombatInvestigator {
  // ... other properties
  deckCards: AbstractCard[]; // Simple list of cards
}

// Example concrete card implementations
class ResearchStrike extends AbstractCard {
  constructor() {
    super({
      id: generateUniqueId(),
      name: "Research Strike",
      description: "Deal 6 damage.",
      artUrl: "/cards/research_strike.png",
      cost: 1,
      type: CardType.Attack,
      rarity: CardRarity.Basic,
      targetType: CardTargetType.SingleEnemy
    });
  }

  async InvokeCardEffect(combatState: CombatState, targetId?: string): Promise<CardEffectResult> {
    if (!targetId) {
      return { success: false, error: "Target required" };
    }

    const target = combatState.enemies.find(e => e.id === targetId);
    if (!target || !target.isAlive) {
      return { success: false, error: "Invalid target" };
    }

    let damage = 6;

    // Apply buffs that might modify damage
    for (const buff of this.appliedBuffs) {
      damage = buff.modifyDamage ? buff.modifyDamage(damage) : damage;
    }

    // Deal damage
    const actualDamage = dealDamage(target, damage);

    return {
      success: true,
      damageDealt: actualDamage
    };
  }
}

class DefensiveStudy extends AbstractCard {
  constructor() {
    super({
      id: generateUniqueId(),
      name: "Defensive Study",
      description: "Gain 5 Block.",
      artUrl: "/cards/defensive_study.png",
      cost: 1,
      type: CardType.Skill,
      rarity: CardRarity.Basic,
      targetType: CardTargetType.Self
    });
  }

  async InvokeCardEffect(combatState: CombatState, targetId?: string): Promise<CardEffectResult> {
    // Find the investigator who played this card
    const source = combatState.party.find(p => p.id === this.sourceInvestigatorId);
    if (!source) {
      return { success: false, error: "Source investigator not found" };
    }

    let blockAmount = 5;

    // Apply buffs that might modify block
    for (const buff of this.appliedBuffs) {
      blockAmount = buff.modifyBlock ? buff.modifyBlock(blockAmount) : blockAmount;
    }

    source.block += blockAmount;

    return {
      success: true
    };
  }
}

class QuickNotes extends AbstractCard {
  constructor() {
    super({
      id: generateUniqueId(),
      name: "Quick Notes",
      description: "Draw 1 card.",
      artUrl: "/cards/quick_notes.png",
      cost: 0,
      type: CardType.Skill,
      rarity: CardRarity.Basic,
      targetType: CardTargetType.NoTarget
    });
  }

  async InvokeCardEffect(combatState: CombatState, targetId?: string): Promise<CardEffectResult> {
    let cardsToDraw = 1;

    // Apply buffs that might modify card draw
    for (const buff of this.appliedBuffs) {
      cardsToDraw = buff.modifyCardDraw ? buff.modifyCardDraw(cardsToDraw) : cardsToDraw;
    }

    const cardsDrawn = drawCards(combatState, cardsToDraw);

    return {
      success: true,
      cardsDrawn: cardsDrawn
    };
  }
}

// Example buff implementations
class EnhancedBuff extends AbstractBuff {
  constructor(stacks: number = 1) {
    super(
      "Enhanced",
      "This card deals +2 damage per stack.",
      "/icons/enhanced.png",
      stacks
    );
  }

  canStack(): boolean {
    return true;
  }

  modifyCost(baseCost: number): number {
    return baseCost; // No cost modification
  }

  modifyDescription(baseDescription: string): string {
    return `${baseDescription} Enhanced (+${this.stacks * 2} damage).`;
  }

  modifyDamage(baseDamage: number): number {
    return baseDamage + (this.stacks * 2);
  }
}

class CheapenedBuff extends AbstractBuff {
  constructor() {
    super(
      "Cheapened",
      "This card costs 1 less energy to play (minimum 0).",
      "/icons/cheapened.png",
      1
    );
  }

  canStack(): boolean {
    return false; // Can't stack cost reduction
  }

  modifyCost(baseCost: number): number {
    return Math.max(0, baseCost - 1);
  }

  modifyDescription(baseDescription: string): string {
    return `${baseDescription} Cheapened (costs 1 less).`;
  }
}

class EtherealBuff extends AbstractBuff {
  constructor() {
    super(
      "Ethereal",
      "This card is exhausted when played.",
      "/icons/ethereal.png",
      1
    );
  }

  canStack(): boolean {
    return false;
  }

  modifyCost(baseCost: number): number {
    return baseCost;
  }

  modifyDescription(baseDescription: string): string {
    return `${baseDescription} Ethereal (exhaust when played).`;
  }

  // This buff would be checked during card play resolution
  shouldExhaustOnPlay(): boolean {
    return true;
  }
}

// Additional common buff examples
class RetainBuff extends AbstractBuff {
  constructor() {
    super(
      \"Retain\",
      \"This card is not discarded at end of turn.\",
      \"/icons/retain.png\",
      1
    );
  }

  canStack(): boolean {
    return false;
  }

  modifyCost(baseCost: number): number {
    return baseCost;
  }

  modifyDescription(baseDescription: string): string {
    return `${baseDescription} Retain.`;
  }

  shouldRetain(): boolean {
    return true;
  }
}

class InnateBuff extends AbstractBuff {
  constructor() {
    super(
      \"Innate\",
      \"This card is always drawn in your starting hand.\",
      \"/icons/innate.png\",
      1
    );
  }

  canStack(): boolean {
    return false;
  }

  modifyCost(baseCost: number): number {
    return baseCost;
  }

  modifyDescription(baseDescription: string): string {
    return `${baseDescription} Innate.`;
  }

  isInnate(): boolean {
    return true;
  }
}

class UpgradedBuff extends AbstractBuff {
  constructor() {
    super(
      \"Upgraded\",
      \"This card has been improved.\",
      \"/icons/upgraded.png\",
      1
    );
  }

  canStack(): boolean {
    return false;
  }

  modifyCost(baseCost: number): number {
    return baseCost;
  }

  modifyDescription(baseDescription: string): string {
    return `${baseDescription}+`; // Standard \"+\" suffix for upgraded cards
  }
}

// Utility functions for buff management
function applyBuffToCard(card: AbstractCard, buffType: new (...args: any[]) => AbstractBuff, ...args: any[]): void {
  const buff = new buffType(...args);
  card.addBuff(buff);
}

function removeAllBuffsFromCard(card: AbstractCard): void {
  card.appliedBuffs = [];
}

function getBuffsByType<T extends AbstractBuff>(card: AbstractCard, buffType: new (...args: any[]) => T): T[] {
  return card.appliedBuffs.filter(buff => buff instanceof buffType) as T[];
}

function hasAnyBuff(card: AbstractCard): boolean {
  return card.appliedBuffs.length > 0;
}
```

### Deck Size Calculation
```typescript
function buildCombatDeck(investigators: CombatInvestigator[]): AbstractCard[] {
  let masterDeck: AbstractCard[] = [];

  for (const investigator of investigators) {
    // Clone cards to avoid modifying original deck
    const contributedCards = investigator.deckCards.map(card => {
      const clonedCard = card.clone();
      clonedCard.sourceInvestigatorId = investigator.id;
      return clonedCard;
    });

    masterDeck = masterDeck.concat(contributedCards);
  }

  // Add universal curse/status cards if applicable
  masterDeck = masterDeck.concat(getApplicableCurses(investigators));

  // Shuffle deck deterministically
  return shuffleDeck(masterDeck, combatState.randomSeed);
}

// Typical deck sizes:
// 1 investigator: ~15 cards
// 2 investigators: ~25 cards
// 3 investigators: ~35 cards

// Helper function to create investigator deck based on level
function createInvestigatorDeck(investigatorClass: InvestigatorClass, level: number): AbstractCard[] {
  const deck: AbstractCard[] = [];

  // Add basic cards (always included)
  deck.push(...getBasicCardsForClass(investigatorClass));

  // Add cards based on level
  if (level >= 1) {
    deck.push(...getCommonCardsForClass(investigatorClass));
  }
  if (level >= 2) {
    deck.push(...getUncommonCardsForClass(investigatorClass));
  }
  if (level >= 3) {
    deck.push(...getRareCardsForClass(investigatorClass));
  }
  if (level >= 5) {
    deck.push(...getLegendaryCardsForClass(investigatorClass));
  }

  return deck;
}
```

## Turn Structure & Mechanics

### Turn Flow
```typescript
async function processTurn(combatState: CombatState): Promise<void> {
  // 1. Start of Turn Phase
  combatState.turnPhase = TurnPhase.StartOfTurn;
  await processStartOfTurnEffects(combatState);

  // 2. Draw Phase
  const cardsToDraw = calculateCardDraw(combatState);
  drawCards(combatState, cardsToDraw);

  // 3. Main Phase
  combatState.turnPhase = TurnPhase.MainPhase;
  combatState.energy = combatState.maxEnergy;

  // Wait for player actions...
  await waitForPlayerActions(combatState);

  // 4. End of Turn Phase
  combatState.turnPhase = TurnPhase.EndOfTurn;
  discardHand(combatState);
  await processEndOfTurnEffects(combatState);

  // 5. Enemy Turn
  combatState.turnPhase = TurnPhase.EnemyTurn;
  await processEnemyActions(combatState);

  // 6. Cleanup and next turn
  combatState.currentTurn++;
  combatState.turnPhase = TurnPhase.StartOfTurn;
}

function calculateCardDraw(combatState: CombatState): number {
  const baseCardDraw = 2;
  const partyBonus = combatState.party.filter(i => i.isAlive).length;
  const statusBonus = calculateStatusCardDrawBonus(combatState);

  return baseCardDraw + partyBonus + statusBonus;
}
```

### Energy System
```typescript
const ENERGY_CONSTANTS = {
  BASE_ENERGY_PER_TURN: 3,
  MAX_ENERGY_CAP: 10,
  ENERGY_OVERFLOW_LOSS: true // Unused energy doesn't carry over
};

function calculateMaxEnergy(combatState: CombatState): number {
  let maxEnergy = ENERGY_CONSTANTS.BASE_ENERGY_PER_TURN;

  // Apply status effect modifiers
  for (const investigator of combatState.party) {
    for (const effect of investigator.statusEffects) {
      if (effect.type === StatusEffectType.Overclocked) {
        maxEnergy += effect.stacks;
      }
    }
  }

  return Math.min(maxEnergy, ENERGY_CONSTANTS.MAX_ENERGY_CAP);
}
```

## Card Targeting & Interaction

### Targeting System
```typescript
interface TargetingInfo {
  cardId: string;
  validTargets: TargetableEntity[];
  requiresTarget: boolean;
  targetingMode: TargetingMode;
}

interface TargetableEntity {
  id: string;
  name: string;
  type: 'investigator' | 'enemy';
  position: number;
  isValid: boolean;
  reason?: string; // Why target might be invalid
}

enum TargetingMode {
  None = 'None',           // No targeting required
  Single = 'Single',       // Click one target
  Multiple = 'Multiple',   // Click multiple targets
  Area = 'Area',          // Affects area around target
  All = 'All'             // Affects all valid targets
}

function getValidTargets(card: AbstractCard, combatState: CombatState): TargetableEntity[] {
  const targets: TargetableEntity[] = [];

  switch (card.targetType) {
    case CardTargetType.SingleEnemy:
      combatState.enemies
        .filter(e => e.isAlive)
        .forEach(enemy => {
          targets.push({
            id: enemy.id,
            name: enemy.name,
            type: 'enemy',
            position: enemy.position,
            isValid: true
          });
        });
      break;

    case CardTargetType.SingleAlly:
      combatState.party
        .filter(i => i.isAlive)
        .forEach(investigator => {
          targets.push({
            id: investigator.id,
            name: investigator.name,
            type: 'investigator',
            position: investigator.position,
            isValid: true
          });
        });
      break;

    case CardTargetType.AnyTarget:
      // Combine both enemy and ally targets
      targets.push(...getValidTargets(
        { ...card, targetType: CardTargetType.SingleEnemy },
        combatState
      ));
      targets.push(...getValidTargets(
        { ...card, targetType: CardTargetType.SingleAlly },
        combatState
      ));
      break;
  }

  return targets;
}
```

### Card Play Resolution
```typescript
async function playCard(
  combatState: CombatState,
  cardId: string,
  targetId?: string
): Promise<PlayCardResult> {
  const card = combatState.hand.find(c => c.id === cardId);
  if (!card) {
    return { success: false, error: "Card not found in hand" };
  }

  // Check energy cost (use modified cost from buffs)
  const actualCost = card.getModifiedCost();
  if (combatState.energy < actualCost) {
    return { success: false, error: "Insufficient energy" };
  }

  // Validate targeting
  const validTargets = card.getValidTargets(combatState);
  if (card.targetType !== CardTargetType.NoTarget &&
      card.targetType !== CardTargetType.AllEnemies &&
      card.targetType !== CardTargetType.AllAllies &&
      card.targetType !== CardTargetType.Self) {
    if (!targetId || !validTargets.includes(targetId)) {
      return { success: false, error: "Invalid or missing target" };
    }
  }

  // Pay energy cost
  combatState.energy -= actualCost;

  // Remove card from hand
  removeFromHand(combatState, cardId);

  // Invoke the card's main effect
  const effectResult = await card.InvokeCardEffect(combatState, targetId);

  if (!effectResult.success) {
    // If card effect failed, refund energy and return card to hand
    combatState.energy += actualCost;
    combatState.hand.push(card);
    return { success: false, error: effectResult.error };
  }

  // Update card statistics
  card.timesPlayed++;

  // Handle card destination based on buffs
  const shouldExhaust = card.appliedBuffs.some(buff =>
    buff instanceof EtherealBuff ||
    (buff as any).shouldExhaustOnPlay?.() === true
  );

  if (shouldExhaust) {
    combatState.exhaustPile.push(card);
  } else {
    combatState.discardPile.push(card);
  }

  // Trigger on-card-played effects
  await triggerOnCardPlayedEffects(combatState, card);

  // Check for combat end conditions
  checkCombatEndConditions(combatState);

  return {
    success: true,
    effectResult,
    newCombatState: combatState
  };
}

interface PlayCardResult {
  success: boolean;
  effectResult?: CardEffectResult;
  newCombatState?: CombatState;
  error?: string;
}
```

## Enemy AI & Intent System

### Intent Display
```typescript
interface EnemyIntentDisplay {
  icon: string;           // Visual icon (🗡️, 🛡️, etc.)
  color: string;          // Background color
  primaryValue?: number;   // Main number (damage, block, etc.)
  secondaryValue?: number; // Additional info
  description: string;     // Tooltip text
  certainty: IntentCertainty;
}

enum IntentCertainty {
  Known = 'Known',       // Player can see exact details
  Partial = 'Partial',   // Player sees type but not values
  Unknown = 'Unknown'    // Player sees only ❓
}

// Intent examples:
const INTENT_EXAMPLES = {
  attack: {
    icon: "🗡️",
    color: "#8b0000", // Dark red
    primaryValue: 12,
    description: "Intends to attack for 12 damage"
  },
  defend: {
    icon: "🛡️",
    color: "#4682b4", // Steel blue
    primaryValue: 8,
    description: "Intends to gain 8 Block"
  },
  buff: {
    icon: "⬆️",
    color: "#228b22", // Forest green
    description: "Intends to strengthen itself"
  },
  multiAttack: {
    icon: "🗡️",
    color: "#8b0000",
    primaryValue: 5,
    secondaryValue: 3,
    description: "Intends to attack 3 times for 5 damage each"
  }
};
```

### Enemy Action Resolution
```typescript
async function resolveEnemyTurn(combatState: CombatState): Promise<void> {
  const aliveEnemies = combatState.enemies.filter(e => e.isAlive);

  for (const enemy of aliveEnemies) {
    // Apply start-of-turn status effects
    await applyStatusEffects(enemy, TriggerType.TurnStart);

    // Execute intended action
    await executeEnemyAction(enemy, combatState);

    // Generate next turn's intent
    enemy.intent = generateNextIntent(enemy, combatState);

    // Apply end-of-turn status effects
    await applyStatusEffects(enemy, TriggerType.TurnEnd);
  }
}

function generateNextIntent(enemy: CombatEnemy, combatState: CombatState): EnemyIntent {
  const enemyTemplate = getEnemyTemplate(enemy.name);
  const possibleActions = enemyTemplate.actionPool;

  // Filter actions based on current state
  const validActions = possibleActions.filter(action =>
    isActionValid(action, enemy, combatState)
  );

  // Use weighted random selection based on enemy AI pattern
  const selectedAction = selectWeightedAction(validActions, enemy.aiPattern);

  return convertActionToIntent(selectedAction);
}
```

## Status Effects & Modifiers

### Status Effect System
```typescript
class StatusEffectManager {
  static applyEffect(
    target: CombatInvestigator | CombatEnemy,
    effect: StatusEffect,
    stacks: number
  ): void {
    const existingEffect = target.statusEffects.find(e => e.name === effect.name);

    if (existingEffect) {
      if (effect.type === StatusEffectType.Poison || effect.type === StatusEffectType.Strength) {
        // Stackable effects
        existingEffect.stacks += stacks;
      } else {
        // Non-stackable: refresh duration
        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      }
    } else {
      // New effect
      target.statusEffects.push({
        ...effect,
        stacks: stacks,
        id: generateStatusEffectId()
      });
    }
  }

  static processStatusEffects(
    target: CombatInvestigator | CombatEnemy,
    trigger: TriggerType,
    combatState: CombatState
  ): StatusEffectResult[] {
    const results: StatusEffectResult[] = [];

    for (const effect of target.statusEffects) {
      if (effect.triggersOn.includes(trigger)) {
        const result = this.executeStatusEffect(effect, target, combatState);
        results.push(result);

        // Reduce duration if applicable
        if (effect.duration > 0) {
          effect.duration--;
        }
      }
    }

    // Remove expired effects
    target.statusEffects = target.statusEffects.filter(e => e.duration !== 0);

    return results;
  }
}

// Common status effects
const STATUS_EFFECT_LIBRARY = {
  strength: {
    name: "Strength",
    description: "Increase damage dealt by {stacks}",
    iconUrl: "/icons/strength.png",
    type: StatusEffectType.Strength,
    duration: -1, // Permanent until removed
    triggersOn: [TriggerType.OnCardPlayed],
    isDebuff: false
  },

  poison: {
    name: "Poison",
    description: "Take {stacks} damage at the start of each turn",
    iconUrl: "/icons/poison.png",
    type: StatusEffectType.Poison,
    duration: 3,
    triggersOn: [TriggerType.TurnStart],
    isDebuff: true
  },

  vulnerable: {
    name: "Vulnerable",
    description: "Take 50% more damage from attacks",
    iconUrl: "/icons/vulnerable.png",
    type: StatusEffectType.Vulnerable,
    duration: 2,
    triggersOn: [TriggerType.OnDamaged],
    isDebuff: true
  }
};
```

## UI Interaction Specifications

### Hand Management
```typescript
interface HandUIState {
  cards: AbstractCard[];
  selectedCardId?: string;
  hoveredCardId?: string;
  draggedCardId?: string;
  maxHandSize: number;

  // Visual positioning
  cardPositions: CardPosition[];
  handWidth: number;
  cardSpacing: number;
}

interface CardPosition {
  cardId: string;
  x: number;
  y: number;
  rotation: number; // Slight fan effect
  zIndex: number;
  isPlayable: boolean;
}

function calculateHandLayout(handState: HandUIState): CardPosition[] {
  const cardCount = handState.cards.length;
  const maxWidth = handState.handWidth;
  const cardWidth = 150;

  // Calculate spacing to fit all cards
  let spacing = Math.min(
    handState.cardSpacing,
    (maxWidth - cardWidth) / Math.max(1, cardCount - 1)
  );

  const totalWidth = cardWidth + (spacing * (cardCount - 1));
  const startX = (maxWidth - totalWidth) / 2;

  return handState.cards.map((card, index) => ({
    cardId: card.id,
    x: startX + (spacing * index),
    y: 0,
    rotation: (index - (cardCount - 1) / 2) * 2, // Fan effect: ±2° per card
    zIndex: handState.selectedCardId === card.id ? 100 : index,
    isPlayable: canPlayCard(card)
  }));
}
```

### Pile Viewers
```typescript
interface PileViewerState {
  isOpen: boolean;
  pileType: PileType;
  cards: AbstractCard[];
  sortMode: PileSortMode;
  filterMode: PileFilterMode;
}

enum PileType {
  DrawPile = 'DrawPile',
  DiscardPile = 'DiscardPile',
  ExhaustPile = 'ExhaustPile'
}

enum PileSortMode {
  PlayOrder = 'PlayOrder',     // Order cards were added
  Cost = 'Cost',              // Sort by energy cost
  Type = 'Type',              // Group by card type
  Source = 'Source'           // Group by contributing investigator
}

enum PileFilterMode {
  All = 'All',
  AttackCards = 'AttackCards',
  SkillCards = 'SkillCards',
  PowerCards = 'PowerCards',
  ByInvestigator = 'ByInvestigator'
}

// Pile viewer component
function PileViewer({ pileState, onClose }: PileViewerProps) {
  const sortedCards = useMemo(() => {
    return sortCardsByMode(pileState.cards, pileState.sortMode);
  }, [pileState.cards, pileState.sortMode]);

  const filteredCards = useMemo(() => {
    return filterCardsByMode(sortedCards, pileState.filterMode);
  }, [sortedCards, pileState.filterMode]);

  return (
    <Modal isOpen={pileState.isOpen} onClose={onClose}>
      <PileHeader pileType={pileState.pileType} cardCount={pileState.cards.length} />
      <PileControls
        sortMode={pileState.sortMode}
        filterMode={pileState.filterMode}
        onSortChange={setSortMode}
        onFilterChange={setFilterMode}
      />
      <CardGrid cards={filteredCards} isViewOnly={true} />
    </Modal>
  );
}
```

### Visual Feedback Systems
```typescript
interface VisualEffect {
  id: string;
  type: EffectType;
  sourcePosition: Point;
  targetPosition: Point;
  duration: number;
  delay: number;
}

enum VisualEffectType {
  // Damage and healing
  DamageNumbers = 'DamageNumbers',     // Floating damage text
  HealingNumbers = 'HealingNumbers',   // Floating heal text
  BlockNumbers = 'BlockNumbers',       // Floating block text

  // Projectiles and beams
  ProjectileAttack = 'ProjectileAttack', // Card → Target
  BeamAttack = 'BeamAttack',            // Sustained beam effect
  HealingLight = 'HealingLight',        // Healing visual

  // Status effects
  StatusApplication = 'StatusApplication', // Visual for applying status
  StatusExpiration = 'StatusExpiration',   // Visual for removing status

  // Card effects
  CardGlow = 'CardGlow',               // Highlight playable cards
  TargetHighlight = 'TargetHighlight', // Show valid targets
  EnergyFlow = 'EnergyFlow',          // Energy cost visualization

  // Environmental
  ScreenShake = 'ScreenShake',         // Impact effects
  FlashEffect = 'FlashEffect',        // Bright flash for big hits
  ParticleEffect = 'ParticleEffect'   // Various particle systems
}

class EffectManager {
  private activeEffects: Map<string, VisualEffect> = new Map();

  playCardEffect(card: AbstractCard, source: Point, target?: Point): void {
    const effects = this.generateCardEffects(card, source, target);

    effects.forEach(effect => {
      this.activeEffects.set(effect.id, effect);
      this.scheduleEffectCleanup(effect);
    });
  }

  playDamageEffect(damage: number, targetPosition: Point): void {
    const effect: VisualEffect = {
      id: generateId(),
      type: VisualEffectType.DamageNumbers,
      sourcePosition: targetPosition,
      targetPosition: {
        x: targetPosition.x,
        y: targetPosition.y - 50
      }, // Float upward
      duration: 1000,
      delay: 0
    };

    this.activeEffects.set(effect.id, effect);
    this.scheduleEffectCleanup(effect);
  }
}
```

## Audio Integration

### Combat Audio Events
```typescript
interface CombatAudioEvent {
  event: AudioEventType;
  source?: string; // Card ID, character ID, etc.
  volume: number;
  priority: AudioPriority;
}

enum AudioEventType {
  // Card interactions
  CardPlay = 'CardPlay',
  CardDraw = 'CardDraw',
  CardDiscard = 'CardDiscard',
  CardShuffle = 'CardShuffle',

  // Combat actions
  AttackHit = 'AttackHit',
  AttackMiss = 'AttackMiss',
  BlockGain = 'BlockGain',
  HealingReceived = 'HealingReceived',

  // Status effects
  StatusApplied = 'StatusApplied',
  StatusExpired = 'StatusExpired',
  PoisonDamage = 'PoisonDamage',

  // Turn events
  TurnStart = 'TurnStart',
  TurnEnd = 'TurnEnd',
  EnergyGain = 'EnergyGain',

  // Victory/defeat
  EnemyDefeated = 'EnemyDefeated',
  AllyDefeated = 'AllyDefeated',
  CombatVictory = 'CombatVictory',
  CombatDefeat = 'CombatDefeat'
}

enum AudioPriority {
  Low = 1,      // Background sounds, card shuffling
  Medium = 2,   // Most gameplay sounds
  High = 3,     // Important events, damage
  Critical = 4  // Death, victory, major events
}
```

## Performance Requirements

### Optimization Targets
- **60 FPS** during all animations and interactions
- **<100ms** response time for card play
- **<50ms** response time for hover effects
- **<200ms** for pile viewer open/close
- **<16ms** per frame during combat animations

### Memory Management
```typescript
interface PerformanceConfig {
  maxVisualEffects: number;        // Limit simultaneous effects
  effectPoolSize: number;          // Pre-allocate effect objects
  cardTextureCache: number;        // Max cached card images
  audioClipCache: number;          // Max cached audio clips

  // Rendering optimizations
  useCardBatching: boolean;        // Batch similar card renders
  enableCulling: boolean;          // Cull off-screen elements
  maxParticles: number;           // Limit particle count

  // Animation settings
  reduceMotion: boolean;          // Accessibility option
  enableScreenShake: boolean;     // Can be disabled for comfort
  particleQuality: 'low' | 'medium' | 'high';
}
```

## Combat Integration Points

### Strategy Layer Interface
```typescript
// Called from strategy layer to initiate combat
async function launchTacticalCombat(initData: CombatInitData): Promise<CombatResult> {
  // 1. Initialize combat state
  const combatState = createCombatState(initData);

  // 2. Build master deck from party
  combatState.drawPile = buildCombatDeck(initData.investigators);

  // 3. Place enemies based on mission
  combatState.enemies = generateEnemies(initData.mission, initData.cultistStrength);

  // 4. Apply infiltration bonuses
  applyInfiltrationBonuses(combatState, initData.infiltrationBonus);

  // 5. Enter combat loop
  await runCombatLoop(combatState);

  // 6. Calculate results
  return generateCombatResult(combatState);
}

interface CombatResult {
  missionSuccess: boolean;
  investigatorResults: {
    id: string;
    hpLost: number;
    stressGained: number;
    corruptionGained: number;
    died: boolean;
  }[];

  // Additional combat metrics
  turnsElapsed: number;
  cardsPlayed: number;
  damageDealt: number;
  damageTaken: number;

  // Rewards from combat performance
  experienceBonus?: number;
  artifactRewards?: string[];
}
```

This tactical combat specification provides a complete framework for implementing the Slay the Spire-inspired combat system with party-based mechanics, ensuring it integrates seamlessly with the strategy layer while providing engaging tactical gameplay.