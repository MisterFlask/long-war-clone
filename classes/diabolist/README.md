# The Diabolist - Complete Class Implementation

## Overview
The Diabolist is a high-risk, high-reward character class that specializes in dark pacts, binding magic, and stress manipulation. This class features unique resource management through Essence accumulation and dangerous but powerful Bloodprice mechanics.

## Core Mechanics Summary

### 1. Bloodprice (Already Implemented)
- Cards can be paid with health when energy is insufficient
- Mechanic exists in current buff system: `BloodPrice | Character | If you lack sufficient energy, pay ${this.getStacksDisplayText()} health per unpaid energy to play this card.`

### 2. Binding X (New Implementation Required)
- New buff: `Binding | Character | If this character's HP is ${this.stacks} or less at the end of the turn, it dies. When this triggers, the caster gains 1 Essence.`
- All Binding attacks have Ethereal and Exhaust properties
- Success triggers grant 1 Essence to the Diabolist

### 3. Essence Resource System (New Implementation Required)
- New resource: `Essence | Character | Accumulated power from successful Bindings. Current: ${this.stacks}.`
- Automatic threshold buffs at 3, 6, 10, and 15 Essence
- Provides scaling Lethality, Dexterity, Block, and eventually Fearless

### 4. Weakness Debuff (Already Implemented)
- Existing buff: `Weak | Character | Reduces damage dealt by 33% for ${this.getStacksDisplayText()} turn[s].`
- Core control mechanic for the class

### 5. Stress Scaling (Integration with Existing System)
- Uses existing Stress system
- Multiple cards scale with current stress level
- Creates risk/reward gameplay

## File Structure
```
classes/diabolist/
├── README.md                 # This file - complete overview
├── class_definition.md       # Core class concept and mechanics
├── mechanics.md              # Technical implementation details
├── cards.md                  # Complete card pool (30+ cards)
└── stress_mechanics.md       # Stress interaction details
```

## Implementation Requirements

### New Buffs Needed
1. **Binding** - Execute enemies at HP threshold, grant Essence
2. **Essence** - Resource tracking
3. **Essence Mastery I-IV** - Automatic threshold buffs

### Existing Systems Used
- BloodPrice (already implemented)
- Weak (already implemented)
- Stress (already implemented)
- Standard energy/health/block systems

## Card Categories

### Basic Attacks (2 cards)
- Eldritch Strike: Basic 6 damage
- Blood Pact Strike: 8 damage with BloodPrice

### Binding Attacks (3 cards)
- Soul Shackle: Binding (8), Ethereal/Exhaust
- Infernal Chains: Binding (12), Ethereal/Exhaust
- Pact of Ending: Binding (20), Ethereal/Exhaust, BloodPrice

### Control/Weakness (3 cards)
- Enfeebling Curse: Apply Weak to single target
- Mass Enfeeblement: Apply Weak to all enemies, gain Stress
- Self-Inflicted Weakness: Weak self for energy

### Stress-Scaling (3 cards)
- Desperate Strike: 4 + Stress damage
- Anguished Blast: 6 + (2×Stress) damage, gain Stress
- Tormented Defense: 5 + Stress block, gain Stress

### Powers (4 cards)
- Blood for Power: Permanent BloodPrice and Lethality
- Sanguine Pact: BloodPrice with Blood generation
- Crimson Covenant: Major BloodPrice upgrade
- Diabolical Mastery: Reduce Essence thresholds

### Utility/Advanced (8 cards)
- Various stress manipulation, defensive options, and advanced mechanics

## Playstyle Characteristics

### Strengths
- Excellent at finishing weakened enemies via Binding
- Scales well into late game through Essence accumulation
- Flexible resource management (energy/health/stress)
- Strong control through Weakness application
- High damage potential with stress scaling

### Weaknesses
- Resource-hungry (multiple systems to manage)
- Self-damaging mechanics require careful HP management
- Many key cards are Ethereal/Exhaust (limited uses)
- Stress mechanics bring risk of Curse accumulation
- Binding requires setup and enemy cooperation

### Risk/Reward Profile
- High skill ceiling with multiple resource systems
- Rewards aggressive play and risk-taking
- Punishes poor resource management severely
- Scales power significantly with successful execution

## Balance Considerations

### Power Gates
- Essence accumulation is slow and requires successful setups
- Bloodprice cards risk death if overused
- Stress scaling encourages dangerous play
- Many powerful effects are Exhaust (one-time use)

### Counterplay
- High HP enemies resist Binding thresholds
- Healing can counter Binding setups
- Stress manipulation can be turned against the player
- Resource depletion effects are particularly effective

This complete implementation provides a unique, mechanically complex class that rewards skilled play while maintaining clear weaknesses and counterplay options.