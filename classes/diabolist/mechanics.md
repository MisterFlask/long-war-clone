# Diabolist Mechanics Implementation

## New Buff Definitions

### Binding X
```
Binding | Character | If this character's HP is ${this.stacks} or less at the end of the turn, it dies. When this triggers, the caster gains 1 Essence.
```

### Essence Resource
```
Essence | Character | Accumulated power from successful Bindings. Current: ${this.stacks}. Provides scaling buffs at 3, 6, 10, and 15 Essence.
```

### Essence Threshold Buffs
These are automatically applied based on Essence count:

#### Essence Mastery I (3+ Essence)
```
Essence Mastery I | Character | +1 Lethality from having 3+ Essence.
```

#### Essence Mastery II (6+ Essence)
```
Essence Mastery II | Character | +2 Lethality, +1 Dexterity from having 6+ Essence.
```

#### Essence Mastery III (10+ Essence)
```
Essence Mastery III | Character | +3 Lethality, +2 Dexterity, gain 5 Block at start of turn from having 10+ Essence.
```

#### Essence Mastery IV (15+ Essence)
```
Essence Mastery IV | Character | +4 Lethality, +3 Dexterity, gain 8 Block at start of turn, gain 1 Fearless at start of turn from having 15+ Essence.
```

## Implementation Notes

### Binding Mechanic
- All cards that apply Binding should have both Ethereal and Exhaust properties
- When Binding triggers (enemy dies from the HP threshold), the Diabolist gains 1 Essence
- The Essence gain should be tracked and automatically apply appropriate threshold buffs

### Essence Thresholds
The system should automatically check Essence count and apply/remove appropriate mastery buffs:
- When Essence increases to 3: Apply Essence Mastery I
- When Essence increases to 6: Remove Essence Mastery I, Apply Essence Mastery II
- When Essence increases to 10: Remove Essence Mastery II, Apply Essence Mastery III
- When Essence increases to 15: Remove Essence Mastery III, Apply Essence Mastery IV

### Stress Integration
- Cards can reference current stress level for scaling effects
- Format: "Deal damage equal to 5 + current Stress"
- Some cards may apply stress to self or party as a cost for powerful effects