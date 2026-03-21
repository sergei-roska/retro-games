# MATRIX PROTOCOL // TETRIS

## 📟 VISUAL DESIGN: INDUSTRIAL GRAPHITE
- **Grid:** 10x20 coordinate matrix.
- **Palette:** 
  - Pieces: 5 shades of graphite/gray (`#2C2C2E` to `#8E8E93`).
  - Background: Inset terminal surface.
  - Accent: Amber (#D87E4A) for level indicators and "Press Space" prompts.
- **Effects:** 
  - Pieces have a "beveled" look (2D canvas shadows/highlights).
  - Background grain overlay.
  - Side HUD with "Next_Obj" preview and score/lines stats.
  - Level progress segments (10 segments before level up).

## 🎧 AUDIO DESIGN: MECHANICAL CLOCKWORK
- **Ambience:** Silent (as requested).
- **Startup:** `sfx_tetris_start` (Boop-Beep pulse) on SPACE.
- **Game Cycle:** `sfx_tetris_tick_v3` (Dry mechanical double-click of a wristwatch).
  - *Constraint:* Triggered synchronously within the `drop()` function.
  - *Behavior:* Must be stable during piece rotation/move (no timer reset).
- **Mechanics:** 
  - `sfx_tetris_line`: Glassy high-freq chime on clear.
  - `sfx_tetris_gameover`: Muted descending dramatic slide (40% volume).

## 🛠️ CORE MECHANICS
- **Stable Loop:** `setInterval` calling a `dropRef.current` to prevent rhythm skips.
- **Soft Drop Lock:** Pressing "Down" triggers ticks but **locks** once a piece merges. Player must release and press again for the next piece.
- **Leveling:** Speed increases every 10 lines (max level 9).
- **Controls:** Arrow keys for move/drop, Space/ArrowUp for rotation, P/Esc for pause.

## 💻 TECHNICAL STACK
- **React + HTML5 Canvas** (Dual canvas: Main + Next Piece).
- **State:** `useState` for grid/score, `useRef` for engine stability.
- **Audio:** `HTMLAudioElement` refs with volume control.
