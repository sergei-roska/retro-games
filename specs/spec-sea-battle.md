# SONAR RADAR PROTOCOL // SEA BATTLE

## 📟 VISUAL CONCEPT: ATOMIC RADAR
**Theme:** High-stakes tactical simulation on a retro-futuristic nuclear submarine terminal.
- **Palette:** Monochrome "Radioactive Green" (#00FF41) on deep black backgrounds.
- **Effects:** 
  - CRT scanlines, grain, and slight screen flicker.
  - "Ghosting" effect when moving the cursor.
- **Reactor Core Status (Victory Progress):**
  - Segmented progress bar. 0% at start, 100% when all enemy ships are sunk.
- **Tactical Scales (Vertical):**
  - **Integrity (Left):** Player's remaining fleet health. Decreases on enemy hits.
  - **Advantage (Right):** Player's attack progress. Increases on successful hits.
- **Target Analysis:** Real-time health of enemy vessels with dynamic segment dimming.

## 🕹️ OPERATIONAL MANUAL (INSTRUCTIONS)
1.  **INITIALIZE SCAN:** Resets tactical grids, clears logs, and automatically deploys your fleet to random coordinates.
2.  **DEPTH CHARGE (AoE Strike):** 
    - **Unlock:** Automatically unlocks after sinking the enemy Flagship (Battleship).
    - **Requirement:** Your own Flagship must still be afloat.
    - **Mechanic:** Massive Area-of-Effect (AoE) attack covering a 3x3 grid sector. Destroys all ship segments and marks water as misses within the blast radius.
    - **Cinematic Alert:** Triggers a full-screen pulsing radiation warning (`☢`) (Amber for Player, Red for AI).
    - **AI Usage:** Opponent AI obeys the same rules and can deploy Depth Charges against you.
3.  **PHASES:** 
    - **PLACEMENT:** Fleet is being positioned.
    - **ACTIVE HUNT:** Player clicks on the Enemy Radar to scan sectors.
    - **EVASIVE ACTION:** System waits for the enemy counter-strike.

## 🧠 TACTICAL AI (THE "SEA WOLF")
- **Checkerboard Search:** AI initially fires in a checkerboard pattern to mathematically guarantee finding ships in the fewest moves.
- **Vector Tracking (Hunting Mode):**
  - Upon first hit, AI checks adjacent cells (cross pattern).
  - Upon second hit on the same ship, AI determines the orientation (horizontal/vertical) and fires strictly along that vector until the ship sinks or the edge is reached.
  - State stack resets immediately upon sinking the target.

## 🛠️ CORE MECHANICS (TRUE CLASSIC)
- **Fleet:** 1x4 (Flagship), 2x3, 3x2, 4x1 (10 vessels total).
- **Auto-Deployment:** Algorithmic placement ensuring ships don't touch (even diagonally).
- **Perfect Halo Effect:** When a ship is sunk, all empty surrounding cells (including diagonals) are automatically marked as misses (water) to save tactical time.
- **Color-Coded Logging:** 
  - `GREEN (SUCCESS)`: Player hits, kills, system ready.
  - `GRAY (INFO)`: Misses, evasions.
  - `AMBER (WARN)`: Hull breaches (enemy hits player).
  - `RED (CRIT)`: Player ships sunk, AI Depth Charge, Game Over.

## 💻 TECHNICAL STACK
- **Engine:** React + Canvas.
- **Grid State Data Structure:** 2D arrays [10][10]. 
  - `0`: Empty water.
  - `>=10`: Intact ship segment (ID represents class and instance, e.g., 41 = Flagship).
  - `<0`: Destroyed ship segment (Negative ID retains original ship identity for Halo calculations).
  - `2`: Miss.
- **Audio:** Custom stochastic Geiger counter using Poisson process + Sonar SFX.
