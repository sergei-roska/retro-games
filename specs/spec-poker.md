# DATA DUEL PROTOCOL // POKER

## 📟 VISUAL DESIGN: SKEUOMORPHIC TERMINAL
- **UI Language:** Skeuomorphic surfaces (`raised` for buttons/cards, `inset` for displays).
- **HUD Displays:** Monochrome Amber (#D87E4A).
- **Components:** 
  - Rounded cards with minimalist rank/suit icons.
  - LCD Display area with fractal noise overlay (grain).
  - CRT-style status messages (e.g., "PROTOCOL RE-INITIALIZED").
- **Theme:** Adaptive Light/Dark based on system preferences.

## 🎧 AUDIO DESIGN: ORGANIC MATERIALS
- **Assets:** Located in `/audio/poker/`.
- **SFX:** 
  - `sfx_card_deal`: Quick "flick" pulse.
  - `sfx_chips`: Bone/Wood resonant clack.
  - `sfx_win`: Muted mechanical bell.
  - `sfx_fold`: Low freq muffled thump.
- **Constraint:** Silent background (BGM disabled).

## 🛠️ CORE MECHANICS (POKER)
- **Rules:** Jacks or Better variant.
- **Draw Logic:** 
  - Phase 1: Deal 5 cards.
  - Phase 2: Select cards to "HOLD".
  - Phase 3: "DRAW" to replace non-held cards.
- **Paytable:** 
  - Royal Flush: 250x
  - Straight Flush: 50x
  - Four of a Kind: 25x
  - Full House: 9x
  - Flush: 6x
  - Straight: 4x
  - Three of a Kind: 3x
  - Two Pair: 2x
  - Jacks or Better: 1x

## 💻 DATA ARCHITECTURE
- **Credits Persistence:** `LocalStorage` (`poker_credits`).
- **Initial Bank:** 1000 credits.
- **Re-Inject:** Manual credit reset on bankruptcy.
- **Stack:** Next.js, React, Tailwind CSS.
