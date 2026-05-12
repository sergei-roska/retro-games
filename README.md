# Retro Games

Retro Games is a retro-terminal game hub built as a single Next.js application. It bundles six playable browser games under one visual system, with shared navigation, tactile UI styling, local persistence for session data, and a small records API for leaderboard-style score storage.

The project currently includes:
- Tetris
- Snake
- Poker
- Blackjack
- Sea Battle
- Tic-Tac-Toe

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Local JSON storage for records
- LocalStorage for game-specific runtime state

## Repository Layout

```text
.
├── frontend/
│   ├── app/                # Routes, pages, and API handlers
│   ├── components/         # Game components and shared UI
│   ├── data/               # Example leaderboard data
│   ├── lib/                # Data helpers and client/server utilities
│   ├── public/audio/       # Audio assets
│   └── package.json
└── specs/                  # Gameplay and visual specs for each game
```

## Run Locally

### Requirements

- Node.js 18+
- npm

### Install

```bash
cd frontend
npm install
```

### Development

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

### Production

```bash
cd frontend
npm run build
npm run start
```

### Lint

```bash
cd frontend
npm run lint
```

## Main Routes

- `/` - hub page with links to all games
- `/tetris`
- `/snake`
- `/poker`
- `/blackjack`
- `/seabattle`
- `/tictactoe`
- `/palette` - visual palette / design-system page
- `/api/records` - leaderboard API endpoint

## Data and Persistence

The app does not depend on an external database.

Implemented persistence:
- Global records are served through `frontend/app/api/records/route.ts`.
- Server-side record storage uses `frontend/data/records.json` when present.
- If `frontend/data/records.json` is missing, the app falls back to `frontend/data/records.json.example`.
- Snake submits scores under the `snake` key and stores the last operator name in `localStorage`.
- Tetris reads and submits scores through the shared records API.
- Poker stores credits in `localStorage` under `poker_credits`.
- Blackjack stores credits in `localStorage` under `bj_credits`.
- Tic-Tac-Toe stores win/loss/draw history in `localStorage` under `ttt_stats`.

## Games

### 1. Tetris

Route: `/tetris`

Tetris is implemented as the central “terminal core” game and uses a dedicated canvas-based playfield with a side HUD and leaderboard integration.

Implemented features:
- Classic falling-block gameplay on a 10x20 board
- Next-piece preview
- Score and line tracking
- Level / velocity progression during play
- Game-over modal with score submission
- Server-backed leaderboard read/write flow through `/api/records`
- Desktop and tablet oriented layout

Notes:
- The page reads initial leaderboard data server-side before rendering.
- On small screens the UI explicitly shows a restricted-access fallback instead of the full game canvas.

### 2. Snake

Route: `/snake`

Snake is implemented as a configurable session-based module with calibration options before launch and a score-submission flow after defeat.

Implemented features:
- Two board sizes: `20x20` and `30x30`
- Two modes: `CLASSIC` and `MISSION`
- Optional `Secure Layer` toggle for firewall obstacles
- Optional `Overclock` toggle for special data packets
- Level progression, velocity tracking, score tracking, and session message log
- Top-score list loaded from records storage
- Score upload after game over
- Local persistence of the last entered operator name
- Audio loading for ambient, victory, eat, fail, and click effects

Notes:
- The page loads leaderboard data for the `snake` game key.
- The game exposes separate “stay”, restart, and exit flows after a run ends.

### 3. Poker

Route: `/poker`

Poker is a video-poker style module built around a single-player Jacks or Better flow with local credit persistence.

Implemented features:
- Standard 52-card deck creation and shuffle
- Five-card deal
- Per-card hold toggles
- Draw phase replacing only non-held cards
- Jacks or Better hand evaluation
- Built-in paytable
- Fixed bet of 10 credits
- Persistent local credit bank
- Bankruptcy flow with credit reset
- Dedicated card, chip, win, and fold sound effects

Implemented hand results:
- Royal Flush
- Straight Flush
- Four of a Kind
- Full House
- Flush
- Straight
- Three of a Kind
- Two Pair
- Jacks or Better

### 4. Blackjack

Route: `/blackjack`

Blackjack is a dealer-vs-player card game with a persistent bank, a fixed starting bet, and an optional special-rule toggle.

Implemented features:
- Standard shuffled 52-card deck
- Dealer hand with one hidden card during player turn
- Fixed initial bet of 10 credits
- Player actions: `Hit`, `Stand`, `Double`
- Dealer draws until reaching 17 or more
- Automatic handling of bust, draw, win, and loss states
- Persistent local bankroll
- Bankruptcy reset flow
- Optional `Charlie Protocol` toggle

Charlie Protocol:
- When enabled, reaching five player cards without busting triggers an automatic win.

### 5. Sea Battle

Route: `/seabattle`

Sea Battle is a Battleship-style tactical module with radar presentation, auto-deployed fleets, combat logs, and special-ability logic.

Implemented features:
- 10x10 own grid and enemy grid
- Automatic fleet placement
- Classic ship set using segment IDs in a grid matrix
- Turn-based player vs AI combat
- Tactical log with severity levels
- Fleet integrity and progress indicators
- Enemy ship analysis and own-fleet analysis tracking
- AI hunting stack for follow-up targeting after hits
- Depth Charge ability for both player and AI
- Full-screen bomb alert overlay when Depth Charge is used
- Two gameplay modes: `CASUAL` and `HARDCORE`

Mode behavior:
- `CASUAL` marks surrounding water around sunk ships.
- `HARDCORE` keeps the “ghost protocol” behavior without that assist.

Depth Charge behavior:
- Player and AI start with the ability locked.
- The ability unlocks after the opposing flagship condition is met.
- Once active, it switches targeting to an area-of-effect strike.

### 6. Tic-Tac-Toe

Route: `/tictactoe`

Tic-Tac-Toe is a local duel module that supports both human-vs-human play and AI play with three difficulty tiers.

Implemented features:
- `PvE` and `PvP` modes
- AI difficulties: `INFANT`, `ADULT`, `MERCILESS`
- `MERCILESS` uses minimax search
- Turn-state tracking
- Win, loss, and draw history persistence
- Winning-line highlight
- Separate start actions for player-first and terminal-first sessions in PvE
- Resettable local history panel

AI behavior:
- `INFANT` chooses random valid moves
- `ADULT` plays near-optimally but can intentionally choose weaker moves
- `MERCILESS` uses best-move evaluation and is intended to be unbeatable

## Shared UI Characteristics

Across the project, the games share a common visual language:
- Retro terminal framing
- Raised and inset tactile surfaces
- Heavy uppercase UI typography
- Audio feedback in selected modules
- Animated status labels, HUD blocks, and control panels
- Dedicated back/exit flow from each game to the main hub

## Records API

`/api/records` supports:
- `GET` - returns records for the default game source
- `POST` - writes a new score entry for the provided game and returns the top entries

The write path stores only the top 5 scores per game key.

## Git Notes

The repository is meant to track source files and selected static assets. The following categories are intentionally excluded from Git:
- Installed dependencies such as `node_modules/`
- Next.js build output such as `.next/`
- Local environment files such as `.env*`
- Local generated data such as `frontend/data/records.json`
- Debug logs and temporary build artifacts

This means a clean install on another machine should be restored with `npm install`, while runtime build output and local-only data will be recreated as needed.

## Specs

Game-specific design notes are also present in:
- `specs/spec-tetris.md`
- `specs/spec-snake.md`
- `specs/spec-poker.md`
- `specs/spec-blackjack.md`
- `specs/spec-sea-battle.md`
- `specs/spec-tic-tac-toe.md`
