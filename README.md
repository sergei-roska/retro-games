# Retro Games

Retro Games is a browser-based arcade collection built as a single Next.js application. The project presents six standalone game modules inside a shared retro-terminal interface with tactile UI styling, local persistence for session data, and a small server-side records API for top scores.

The current build includes:
- Tetris
- Snake
- Poker
- Blackjack
- Sea Battle
- Tic-Tac-Toe

## Project Overview

The application lives in the `frontend` directory and uses the Next.js App Router. Each game has its own route, while the homepage acts as a launcher for the full collection.

Core characteristics:
- Single monolithic frontend application
- Shared retro terminal visual language across all games
- TypeScript-based codebase
- Tailwind CSS v4 styling
- Local score persistence via JSON file fallback logic
- Client-side persistence for credits, settings, and match history where needed

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Local JSON storage for records
- LocalStorage for per-game session state

## Repository Structure

```text
.
├── frontend/              # Next.js application
│   ├── app/               # App Router pages and API routes
│   ├── components/        # Game UIs and shared components
│   ├── data/              # Example records data
│   ├── lib/               # Record helpers and app utilities
│   └── public/audio/      # Audio assets for supported games
└── specs/                 # Design and gameplay specs per game
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

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

### Production Build

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

## Records and Persistence

The project does not require an external database.

- Global score tables are read from `frontend/data/records.json` when present.
- If that file does not exist, the app falls back to `frontend/data/records.json.example`.
- Scores are exposed through `frontend/app/api/records/route.ts`.
- Some games also store session state locally in the browser, including credits and match history.

## Games

### Tetris

Classic 10x20 falling-block gameplay with a canvas renderer and a separate preview HUD for the next piece.

Highlights:
- Progressive speed scaling every 10 cleared lines
- Mechanical audio cues for start, ticks, line clears, and game over
- Stable drop loop designed to avoid rhythm skips
- Pause support and tactile terminal HUD presentation

Route: `/tetris`

### Snake

A faster, more experimental take on Snake with selectable board sizes, mode toggles, rhythm-based progression, and power-up variants.

Highlights:
- 20x20 and 30x30 field options
- Combo scoring when food is consumed in quick succession
- Optional mission mode, obstacles, and special packet power-ups
- Top-5 leaderboard flow with local record submission
- Visual glitch and pulse effects tied to gameplay events

Route: `/snake`

### Poker

A video-poker style implementation using the Jacks or Better ruleset and a persistent local credit bank.

Highlights:
- Five-card deal, hold, and draw flow
- Standard Jacks or Better paytable
- Persistent credits via LocalStorage
- Bankruptcy reset flow
- Skeuomorphic card-table UI with dedicated sound effects

Route: `/poker`

### Blackjack

A terminal-themed Blackjack duel against the dealer with a persistent credit system and optional house-rule variation.

Highlights:
- Dealer logic that hits below 17 and stands on 17+
- Double Down on the opening hand
- Optional 5-card Charlie rule toggle
- Persistent credits via LocalStorage
- Reset flow for empty bankroll states

Route: `/blackjack`

### Sea Battle

A tactical Battleship-inspired module with a radar interface, automated fleet deployment, and an AI opponent built around search and hunt logic.

Highlights:
- 10x10 battlefield with classic fleet composition
- Auto-placement that prevents adjacent ships
- AI using checkerboard search and vector-based follow-up targeting
- Automatic halo marking around destroyed ships
- Unlockable depth-charge attack after sinking the enemy flagship

Route: `/seabattle`

### Tic-Tac-Toe

A polished local or AI-driven Tic-Tac-Toe module with multiple difficulty levels and different opening behaviors.

Highlights:
- Human vs Human and Human vs AI modes
- Three AI levels: random, imperfect tactical, and perfect minimax
- Terminal-first opening when the session starts before the player moves
- Local win/loss history storage

Route: `/tictactoe`

## Shared UX Features

- Unified retro-terminal homepage for launching all games
- Responsive layout adapted for desktop and mobile screens
- Shared tactile UI language with inset and raised surfaces
- Theme-aware visual treatment across the collection
- Palette/design-system page at `/palette`

## Notes

- The repository currently tracks source files and selected static assets.
- Build output such as `.next/` and installed dependencies such as `node_modules/` are intentionally excluded from Git.
- Game behavior details and design intentions are documented further in the `specs/` directory.
