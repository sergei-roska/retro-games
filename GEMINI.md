# Vintage Terminal - Development Notes

## Future Tasks & Scaling

### 1. Production Hosting (Vercel)
If you decide to host this project on Vercel, the local `records.json` storage will **reset** every time the server restarts (ephemeral file system). 

**Solution for Permanent Records:**
- Transition from local file storage to **Vercel KV (Redis)**.
- **Complexity:** Low (10-15 mins of work).
- **Benefit:** Global shared leaderboards that never reset.

### 2. Series 002 Roadmap
- **Logic Duel Protocol (Tic-Tac-Toe)**: Local PvP and PvE with Minimax AI.
- **Sonar Radar Protocol (Sea Battle)**: 10x10 tactical simulation with hunting AI.
- **Neon Crawler Protocol (Snake)**: High-speed rhythmic movement with escalating difficulty.

## Current Architecture
- **Monolith**: Single Next.js app (no separate backend).
- **Data**: 
  - Records: `frontend/data/records.json` (Server-side).
  - Credits: `LocalStorage` (Client-side).
- **Theme**: Adaptive Light/Dark based on system preferences.

---
*Last update: March 15, 2026 // Operator Status: Active*
