# Specification: Neon Crawler Protocol (Snake)

## 1. Objective
Develop a high-intensity, neon-aesthetic Snake module focusing on fluid movement and escalating rhythmic progression.

## 2. Gameplay
- **Grid Matrix (Navigation Field)**: 
  - Player selects between **20x20 (Standard)** and **30x30 (Expanded)** during calibration.
- **Growth Mechanic**: Consuming `NEON_CORES` (food) increases crawler length and session score.
- **COMBO_SYNC [Logic]**: Consuming two cores within 2 seconds doubles the progression value of the second core.
- **Tactical Start [Logic]**: The crawler remains stationary and the game loop is inhibited until the player initiates the sequence using **SPACE** or **ARROW KEYS**.
- **Session Modes (Pre-Game Selection)**:
  - **CLASSIC_LOOP [Default]**: Termination occurs ONLY upon collision or total grid saturation.
  - **MISSION_PROTOCOL [Toggle]**: Mission ends successfully upon reaching **Level 11**. 
  - **SECURE_LAYER [Toggle]**: Enables **DYNAMIC_FIREWALLS** (Static obstacles) in Phase 02+.
  - **OVERCLOCK [Toggle]**: Enables **DATA_PACKETS** (Special blue cores).
- **DATA_PACKETS (Power-ups)**:
  - *Slow-Mo*: 5-second velocity reduction to 300ms base.
  - *Ghost State*: 5-second collision bypass (except for boundaries).
- **Collision & Termination**: 
  - Terminal failure upon contact with grid boundaries (Internal Walls) or **FIREWALLS**.
  - Terminal failure upon self-intersection.
  - **Session End Flow**: Upon failure/victory, a `Mission End` modal provides options:
    1. **Upload Data**: Sync operator ID and score to the global record.
    2. **View Trace Output**: (onStay) Dismiss modal to inspect the final crawler configuration and console logs.
    3. **New Session**: (onRestart) Re-initialize the grid and crawler.
    4. **Terminate Connection**: (onExit) Return to the main Terminal menu.
- **Controls**: Cardinal direction inputs (UP, DOWN, LEFT, RIGHT) and Space for start/pause.

## 3. Visual Aesthetic (Neon Crawler)
- **Background**: Adaptive obsidian/light-grey theme. Synchronized with system preferences via `themeTick` and `getComputedStyle`.
- **Adaptive Grid**: Contrast-aware pulsing grid (sync with heartbeat).
- **Crawler (Snake)**: 
  - **Head**: Pulsating `active` segment with glow.
  - **Body**: Gradient trail with **globalAlpha** fading logic.
- **NEON_CORES (Food)**: High-frequency flickers (Green/Amber/Red based on Phase).
- **Effects**: 
  - **GLITCH_ON_EAT**: Short duration chromatic jitter and scanline overlay active for 50ms upon consumption.

## 4. Levels & Progression (Rhythm Calibration)
The Terminal scales difficulty across **10 Levels of Velocity** based on core consumption.

| Level | Cores | Velocity | Phase | Palette |
| :--- | :--- | :--- | :--- | :--- |
| **01-05** | 0-20 | 200ms-160ms | PHASE_01 | `--green` |
| **06-09** | 25-40 | 150ms-110ms | PHASE_02 | `--amber` |
| **10** | 45 | 80ms | PHASE_03 | `--red` |

- **Victory Condition**: Reaching Level 11 triggers `CORE_STABILIZED` status.
- **Audio Pulse**: Real-time synthesized sawtooth/square wave pulse synchronized with the crawler's step interval.

## 5. Terminal Records (Leaderboard)
- **Top 5 Ranking**: A dedicated `TOP_5_EXECUTORS` block displayed during pre-session and post-session phases.
- **Data Source**: Fetched via `readRecords()` (server-side persistence).
- **Columns**: `RANK`, `OPERATOR_ID` (Name), `CORE_COUNT` (Score).

## 6. Audio Assets (Protocol Sonics)
Assets to be located in `frontend/public/audio/snake/`.

### Procedural Synthesis (Real-time)
- **Movement Pulse**: Low-frequency sine wave (60Hz-80Hz) generated via `Web Audio API` on every tick.
- **Sync**: Frequency and gain ramped to create a "tactile heartbeat" effect.

### Background Music (Optional/Loops)
- `bgm_ambient.mp3`: Subtle, low-mid range ambient hum (replaces high-intensity techno).
- `bgm_victory.mp3`: Warm, low-frequency success sequence.

### Sound Effects (SFX)
- `sfx_eat.mp3`: Soft organic pop (mid frequency).
- `sfx_powerup.mp3`: Warm capacitor charge sound.
- `sfx_fail.mp3`: CRT-style low frequency power-down.
- `sfx_click.mp3`: Tactile mechanical feedback.

## 7. Technical Requirements
- **Stack**: Next.js, Tailwind CSS, Lucide React (Icons).
- **Audio Logic**: `HTML5 Audio API` for layered playback and volume crossfading between phases.
- **Data Persistence**: `records.json` via universal `readRecords()` / `writeRecords()`.
- **State Management**: `React.useState` for session data; `LocalStorage` for credits/config.
: Standard session cost (1 Credit).
