# DATA DUEL PROTOCOL // BLACKJACK

## 📟 VISUAL DESIGN: SKEUOMORPHIC TERMINAL
- **UI Language:** Skeuomorphic surfaces (`raised` for buttons/cards, `inset` for displays).
- **HUD Displays:** Monochrome Green (#00FF41).
- **Components:** 
  - Rounded cards with minimalist rank/suit icons.
  - LCD Display area with fractal noise overlay (grain).
  - CRT-style status messages (e.g., "PROTOCOL RE-INITIALIZED").
- **Theme:** Adaptive Light/Dark based on system preferences.

## 🎧 AUDIO DESIGN: ORGANIC MATERIALS
- **Assets:** Located in `/audio/poker/`.
- **SFX:** 
  - `sfx_card_deal`: Quick "flick" pulse (simulating cardboard friction).
  - `sfx_chips`: Bone/Wood resonant clack with micro-bounce.
  - `sfx_win`: Muted mechanical bell.
  - `sfx_fold`: Low freq muffled thump.
- **Constraint:** Silent background (BGM disabled).

## 🛠️ CORE MECHANICS
- **Charlie Protocol:** Special rule - 5-card hand automatically wins. Can be toggled in settings.
- **Double Down:** Add 10 credits to bet for exactly 1 more card (only available on initial 2 cards).
- **AI Dealer:** Stands on 17+, hits on <17.
- **Rules:** Dealer's first card is visible, second is hidden until dealer's turn.
- **Victory:** Blackjack (21 on deal) pays immediately or results in standard win if dealer doesn't match.

## 💻 DATA ARCHITECTURE
- **Credits Persistence:** `LocalStorage` (`bj_credits`).
- **Initial Bank:** 1000 credits.
- **Re-Inject:** Manual credit reset (Re-Inject) on bankruptcy.
- **Stack:** Next.js, React, Tailwind CSS.
