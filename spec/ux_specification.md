# The Forge-Tyrant Rising: User Experience Specification v1.0

## Screen Layout & Architecture

### Main Game Screen Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Header Bar (60px height)                                           │
│ [Game Title] [Date: Jan 15, 1890] [Day 15] [⏸️ ⏵️ ⏩ ⏭️] [Save] [⚙️] │
├─────────────────────────────────────────────────────────────────────┤
│ Resource Panel (80px height)                                       │
│ 💰 £5,247 | 🎭 Influence: 65/100 | ☠️ Doom: ████▓▓▓▓▓▓ (4/10)      │
├─────────────────────────────────────────────────────────────────────┤
│ Main Content Area (flex, min 600px height)                         │
│ ┌─────────────────┬─────────────────┬─────────────────┐             │
│ │ Investigators   │ Missions        │ Activity Log    │             │
│ │ Panel          │ Panel          │ Panel          │             │
│ │ (300px width)   │ (400px width)   │ (300px width)   │             │
│ │                │                │                │             │
│ └─────────────────┴─────────────────┴─────────────────┘             │
├─────────────────────────────────────────────────────────────────────┤
│ Footer Bar (40px height)                                           │
│ [Artifacts: 3] [Last Autosave: Day 14] [Status: Running]           │
└─────────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Minimum width**: 1200px (below this, show mobile warning)
- **Panel collapse**: Activity Log collapses first, then stacks vertically
- **Maximum width**: 1920px (center content, add margins)

## Color Scheme & Visual Theme

### Primary Colors
```css
--color-primary: #2c1810;        /* Dark Victorian brown */
--color-secondary: #8b4513;      /* Saddle brown */
--color-accent: #cd853f;         /* Peru/brass */
--color-danger: #8b0000;         /* Dark red */
--color-warning: #ff8c00;        /* Dark orange */
--color-success: #228b22;        /* Forest green */
--color-info: #4682b4;          /* Steel blue */
```

### Background & UI
```css
--bg-primary: #1a0f0a;          /* Very dark brown */
--bg-secondary: #2c1810;        /* Dark brown */
--bg-panel: #3d2817;           /* Medium brown */
--text-primary: #f5deb3;        /* Wheat */
--text-secondary: #deb887;      /* Burlywood */
--text-muted: #a0876c;         /* Muted brown */
--border-color: #8b4513;        /* Saddle brown */
```

### Status Colors
```css
--status-available: #228b22;     /* Green */
--status-infiltrating: #ff8c00;  /* Orange */
--status-onmission: #4682b4;    /* Blue */
--status-recovering: #daa520;    /* Goldenrod */
--status-corrupted: #8b0000;    /* Dark red */
--status-dead: #2f2f2f;        /* Dark gray */
```

## Typography

### Font Stack
```css
font-family: 'Cinzel', 'Times New Roman', serif; /* Headers */
font-family: 'Source Sans Pro', 'Arial', sans-serif; /* Body */
font-family: 'Source Code Pro', 'Courier New', monospace; /* Numbers/Stats */
```

### Text Hierarchy
- **H1 (Game Title)**: 24px, Cinzel, bold
- **H2 (Panel Titles)**: 20px, Cinzel, semi-bold
- **H3 (Section Headers)**: 16px, Cinzel, semi-bold
- **Body Text**: 14px, Source Sans Pro, normal
- **Small Text**: 12px, Source Sans Pro, normal
- **Numbers/Stats**: 14px, Source Code Pro, bold

## Icon System

### Status Icons
- **Available**: 🟢 (green circle)
- **Infiltrating**: 🟡 (yellow circle with clock overlay)
- **On Mission**: 🔵 (blue circle with sword overlay)
- **Recovering**: 🟡 (yellow circle with cross overlay)
- **Corrupted**: 🔴 (red circle with gear overlay)
- **Dead**: ⚫ (black circle with X overlay)

### Resource Icons
- **Funding**: 💰 (gold coin)
- **Influence**: 🎭 (theater mask)
- **Doom**: ☠️ (skull)
- **Experience**: ⭐ (star)
- **Stress**: 💢 (anger symbol)
- **Corruption**: ⚙️ (gear)
- **HP**: ❤️ (heart)

### Mission Type Icons
- **Combat**: ⚔️ (crossed swords)
- **Non-Combat**: 📋 (clipboard)
- **Special**: 💀 (skull)
- **Final**: 👑 (crown)

### Class Icons
- **Scholar**: 📚 (books)
- **Soldier**: 🛡️ (shield)
- **Occultist**: 🔮 (crystal ball)
- **Alienist**: 🧠 (brain)
- **Engineer**: 🔧 (wrench)

## Panel Specifications

### Investigators Panel (300px width)

#### Panel Header (40px height)
```
┌─────────────────────────────────────────────────────┐
│ 📚 INVESTIGATORS (5/12) [+] [Sort ▼]                │
└─────────────────────────────────────────────────────┘
```

#### Investigator Card (80px height)
```
┌─────────────────────────────────────────────────────┐
│ [Portrait] John "Iron" Smith        🟢 Available    │
│ 60x60px    📚 Scholar Lv.3         ❤️ 25/30       │
│            Exp: 450/600            💢 2/10        │
│            [Assign] [Details]      ⚙️ 15/100      │
└─────────────────────────────────────────────────────┘
```

#### Card States
- **Available**: Green border, "Assign" button enabled
- **Infiltrating**: Orange border, "Cancel" button, countdown timer
- **On Mission**: Blue border, "View Mission" button, no actions
- **Recovering**: Yellow border, "Recovery: 3 days" text, no actions
- **Corrupted/Dead**: Red/gray border, "CORRUPTED"/"DECEASED" overlay

#### Sorting Options
- By Name (A-Z)
- By Level (High-Low)
- By Status (Available first)
- By Health (High-Low)
- By Stress (Low-High)

### Missions Panel (400px width)

#### Panel Header with Tabs
```
┌─────────────────────────────────────────────────────┐
│ ⚔️ COMBAT (2) | 📋 NON-COMBAT (1) | 📜 COMPLETED    │
└─────────────────────────────────────────────────────┘
```

#### Combat Mission Card (120px height)
```
┌─────────────────────────────────────────────────────┐
│ ⚔️ Docklands Incursion             ★★☆☆☆ Diff: 2   │
│ 📍 East End Docks                 ⏱️ Expires: 3d   │
│ 👥 1-3 investigators              🎯 Infiltration   │
│ 💰 +£500 🎭 +5 🏺 Artifact        ☠️ +3 Doom       │
│ [📋 Assign] [ℹ️ Details]                            │
└─────────────────────────────────────────────────────┘
```

#### Non-Combat Mission Card (100px height)
```
┌─────────────────────────────────────────────────────┐
│ 📋 Parliament Funding              🎭 Req: 30 Inf   │
│ 📍 Westminster Hall               ⏱️ Duration: 10d  │
│ 👥 Exactly 2 investigators        💰 +£2000        │
│ [📋 Assign] [ℹ️ Details]                            │
└─────────────────────────────────────────────────────┘
```

#### Mission States
- **Available**: White background, assign button enabled
- **Infiltrating**: Orange background, progress bar, "Launch"/"Cancel" buttons
- **Ready**: Green background, "LAUNCH COMBAT" button prominent
- **In Progress**: Blue background, progress bar, no actions
- **Expiring Soon**: Red border, "⚠️ EXPIRES IN 1 DAY" warning

### Activity Log Panel (300px width)

#### Panel Header (40px height)
```
┌─────────────────────────────────────────────────────┐
│ 📜 ACTIVITY LOG [Filter ▼] [Clear]                  │
└─────────────────────────────────────────────────────┘
```

#### Log Entry Format
```
┌─────────────────────────────────────────────────────┐
│ Day 15 - 10:30 AM                    [Severity Icon] │
│ [Type Icon] Mission "Docklands" completed successfully│
│ Rewards: £500, +5 Influence, Blessed Medallion       │
└─────────────────────────────────────────────────────┘
```

#### Log Entry Types & Colors
- **Info**: ℹ️ Blue icon, normal text
- **Warning**: ⚠️ Orange icon, orange text
- **Critical**: 🚨 Red icon, red text
- **Success**: ✅ Green icon, green text

#### Auto-scroll & Limits
- Auto-scroll to newest entries
- Maximum 100 entries (oldest removed)
- Entries fade in with animation
- Filter by severity, type, or day range

## Interactive Elements

### Buttons

#### Primary Buttons
```css
background: linear-gradient(135deg, #cd853f, #8b4513);
border: 2px solid #8b4513;
color: #f5deb3;
padding: 8px 16px;
font-size: 14px;
font-weight: bold;
border-radius: 4px;
```

#### Secondary Buttons
```css
background: transparent;
border: 2px solid #8b4513;
color: #cd853f;
padding: 6px 12px;
font-size: 12px;
border-radius: 4px;
```

#### Danger Buttons
```css
background: linear-gradient(135deg, #8b0000, #600000);
border: 2px solid #8b0000;
color: #f5deb3;
```

### Progress Bars

#### Standard Progress Bar
```
┌─────────────────────────────────────┐
│ ████████████▓▓▓▓▓▓▓▓ 60%           │
└─────────────────────────────────────┘
```

#### Doom Counter (Special)
```
☠️ DOOM: ████▓▓▓▓▓▓ (4/10)
```
- Filled sections: Dark red (#8b0000)
- Empty sections: Dark gray (#2f2f2f)
- Pulsing animation when increasing

#### Health Bars
```
❤️ HP: ██████████▓▓ 25/30
```
- High HP (>66%): Green
- Medium HP (33-66%): Yellow
- Low HP (<33%): Red
- Critical HP (<10%): Pulsing red

### Tooltips

#### Tooltip Styling
```css
background: rgba(45, 24, 16, 0.95);
border: 1px solid #8b4513;
color: #f5deb3;
padding: 8px 12px;
border-radius: 4px;
box-shadow: 0 4px 8px rgba(0,0,0,0.3);
max-width: 300px;
font-size: 12px;
```

#### Tooltip Content
- **Investigator**: Name, Class, Level, Full stats, Current mission
- **Mission**: Full description, Requirements, Detailed rewards/penalties
- **Status Effect**: Description, Duration, Mechanical effect
- **Artifact**: Full description, All effects, Rarity

## Dialog Systems

### Modal Dialog Template
```
┌─────────────────────────────────────────────────────┐
│ [X] Dialog Title                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Dialog content area                                 │
│ Can contain forms, lists, detailed information      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                           [Cancel] [Confirm]       │
└─────────────────────────────────────────────────────┘
```

### Mission Assignment Dialog
```
┌─────────────────────────────────────────────────────┐
│ [X] Assign Investigators - Docklands Incursion     │
├─────────────────────────────────────────────────────┤
│ Required: 1-3 investigators                        │
│ Difficulty: ★★☆☆☆                                  │
│                                                     │
│ Available Investigators:                            │
│ ☑️ John "Iron" Smith (Scholar Lv.3) +2 bonus      │
│ ☑️ Mary Watson (Soldier Lv.2) +1 bonus            │
│ ☐ David Burns (Occultist Lv.1) +0 bonus           │
│                                                     │
│ Infiltration Mode:                                  │
│ ○ Careful (+50% time, +2 combat cards)            │
│ ● Standard (normal time, normal cards)             │
│ ○ Rush (-40% time, -1 combat cards)               │
├─────────────────────────────────────────────────────┤
│                           [Cancel] [Start Infiltration] │
└─────────────────────────────────────────────────────┘
```

### Investigator Details Dialog
```
┌─────────────────────────────────────────────────────┐
│ [X] John "Iron" Smith - Scholar                     │
├─────────────────────────────────────────────────────┤
│ [Portrait]  Level 3 Scholar        Status: Available│
│             Experience: 450/600     🟢              │
│             Next Level: 150 XP                      │
│                                                     │
│ Statistics:                                         │
│ ❤️ Health: 25/30    💢 Stress: 2/10               │
│ ⚙️ Corruption: 15/100                              │
│                                                     │
│ Class Abilities:                                    │
│ • Research Bonus: +2 to non-combat missions        │
│ • Fast Learner: +50% experience gain               │
│ • Stress Resistant: -1 stress from missions        │
│                                                     │
│ Permanent Traumas: None                             │
│                                                     │
│ Mission History: 12 completed, 2 failed            │
├─────────────────────────────────────────────────────┤
│                                     [Close]        │
└─────────────────────────────────────────────────────┘
```

## Notification System

### Notification Types

#### Auto-Pause Notifications (Center Screen)
```
┌─────────────────────────────────────────────────────┐
│ ⏸️ GAME PAUSED                                      │
│                                                     │
│ 🚨 Mission "Docklands Incursion" expires in 1 day! │
│                                                     │
│                        [Continue] [View Mission]   │
└─────────────────────────────────────────────────────┘
```

#### Toast Notifications (Top Right)
```
┌─────────────────────────────────────┐
│ ✅ Mission completed successfully!   │
│ Rewards: £500, +5 Influence         │
└─────────────────────────────────────┘
```

#### Critical Alerts (Full Screen Overlay)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🚨 INVESTIGATOR DOWN 🚨                │
│                                                     │
│         John "Iron" Smith has been killed          │
│              during combat operations               │
│                                                     │
│                    [Continue]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Time Controls

### Time Control Bar
```
⏸️ Paused | ⏵️ Normal (1x) | ⏩ Fast (2x) | ⏭️ Fastest (4x)
```

#### Control States
- **Paused**: Gray background, "PAUSED" text
- **Normal**: No special styling
- **Fast**: Orange background, "FAST" text
- **Fastest**: Red background, "FASTEST" text

#### Keyboard Shortcuts
- `Space`: Toggle pause
- `1`: Normal speed
- `2`: Fast speed
- `3`: Fastest speed
- `Escape`: Pause game

### Date Display
```
📅 January 15th, 1890 (Day 15)
```
- Updates in real-time during play
- Different formatting for significant dates
- Special styling for final mission timeline

## Settings & Configuration

### Settings Dialog Tabs
1. **Graphics**: Resolution, fullscreen, UI scale
2. **Audio**: Master volume, SFX volume, music volume
3. **Gameplay**: Auto-pause settings, notification preferences
4. **Controls**: Keybind customization
5. **Save/Load**: Manual save slots, export options

### Auto-Pause Configuration
```
☑️ New mission appears
☑️ Mission expires in 2 days
☑️ Investigator becomes available
☑️ Infiltration completes
☑️ High stress warning (8+)
☑️ Investigator death/corruption
☐ Every 7 days (optional)
☐ Funding below £500 (optional)
```

## Accessibility Features

### Screen Reader Support
- All interactive elements have aria-labels
- Mission status changes announced
- Important notifications read aloud
- Table navigation for investigator roster

### Visual Accessibility
- High contrast mode option
- Colorblind-friendly palette alternative
- Text size scaling (100%, 125%, 150%)
- Motion reduction option (disables animations)

### Keyboard Navigation
- Tab order: Header → Resources → Investigators → Missions → Log
- Arrow keys for list navigation
- Enter/Space for activation
- Escape for cancel/close

## Performance Requirements

### Target Performance
- 60 FPS on 1920x1080 resolution
- <100ms response time for all interactions
- <2 seconds for save/load operations
- <500MB RAM usage
- Smooth animations at all speed settings

### Optimization Guidelines
- Virtual scrolling for long lists (>50 items)
- Debounced search inputs (300ms delay)
- Lazy loading for investigator portraits
- Efficient React re-rendering patterns
- Minimal DOM manipulation during time updates

## Animation & Feedback

### Micro-Animations
- Button hover: 100ms color transition
- Panel expand/collapse: 200ms ease-in-out
- List item selection: 150ms highlight
- Progress bar updates: 300ms smooth fill
- Notification slide-in: 200ms from right

### State Change Animations
- Investigator status change: 500ms color transition
- Mission completion: 800ms celebration effect
- Doom increase: 1000ms ominous pulse
- Critical events: Screen shake (if enabled)

### Loading States
- Mission generation: Spinning compass icon
- Save operation: Progress bar with percentage
- Combat resolution: "COMBAT IN PROGRESS" overlay
- Data loading: Skeleton screens for content

This UX specification provides unambiguous guidance for implementing the visual interface while maintaining the Victorian steampunk aesthetic and ensuring optimal usability.