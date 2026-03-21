'use client';

import React, { useState, useEffect, useRef } from 'react';
import SeaBattleCanvas from './SeaBattleCanvas';

type GameState = 'IDLE' | 'PLAYER_TURN' | 'AI_TURN' | 'VICTORY' | 'DEFEAT' | 'PLAYER_AOE_SELECT';
type GameMode = 'CASUAL' | 'HARDCORE';
type AbilityState = 'LOCKED' | 'READY' | 'USED';
type LogType = 'INFO' | 'SUCCESS' | 'WARN' | 'CRIT';

interface LogEntry {
  msg: string;
  time: string;
  type: LogType;
}

export default function SeaBattleGame() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [gameMode, setGameMode] = useState<GameMode>('HARDCORE');
  const [statusLog, setMessages] = useState<LogEntry[]>([]);
  const [ownGrid, setOwnGrid] = useState<number[][]>(() => Array(10).fill(0).map(() => Array(10).fill(0)));
  const [enemyGrid, setEnemyGrid] = useState<number[][]>(() => Array(10).fill(0).map(() => Array(10).fill(0)));
  const [destroyedSegments, setDestroyedSegments] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [playerDC, setPlayerDC] = useState<AbilityState>('LOCKED');
  const [aiDC, setAiDC] = useState<AbilityState>('LOCKED');
  const [aiHuntingStack, setAiHuntingStack] = useState<{x: number, y: number}[]>([]);
  const [showBombAlert, setShowBombAlert] = useState<'NONE' | 'PLAYER' | 'ENEMY'>('NONE');
  const totalSegments = 20;

  const [enemyAnalysis, setEnemyAnalysis] = useState({ Battleship: 4, Cruiser: 6, Destroyer: 6, Submarine: 4 });
  const [ownAnalysis, setOwnAnalysis] = useState({ Battleship: 4, Cruiser: 6, Destroyer: 6, Submarine: 4 });

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  useEffect(() => {
    const geiger = new Audio('/audio/seabattle/sfx_geiger_v3.mp3');
    geiger.volume = 0.12;
    audioRefs.current['geiger'] = geiger;
    let timeoutId: NodeJS.Timeout;
    const tick = () => {
      const g = audioRefs.current['geiger'];
      if (g) {
        const clone = g.cloneNode() as HTMLAudioElement;
        clone.volume = 0.06 + Math.random() * 0.06;
        clone.play().catch(() => {});
      }
      timeoutId = setTimeout(tick, -Math.log(Math.random()) * 700);
    };
    timeoutId = setTimeout(tick, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    setMessages([
      { msg: '[OK] RADIATION_SENSOR_NOMINAL', time, type: 'INFO' },
      { msg: '[OK] SONAR_ARRAY_INITIALIZED', time, type: 'INFO' }
    ]);
  }, []);

  const addMessage = (msg: string, type: LogType = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    setMessages(prev => [{ msg, time, type }, ...prev].slice(0, 15));
  };

  const autoPlace = (grid: number[][]) => {
    const newGrid = grid.map(row => [...row]);
    const ships = [
      { id: 41, size: 4 }, { id: 31, size: 3 }, { id: 32, size: 3 }, 
      { id: 21, size: 2 }, { id: 22, size: 2 }, { id: 23, size: 2 }, 
      { id: 11, size: 1 }, { id: 12, size: 1 }, { id: 13, size: 1 }, { id: 14, size: 1 }
    ];
    const canPlace = (x: number, y: number, size: number, horiz: boolean) => {
      for (let i = -1; i <= size; i++) {
        for (let j = -1; j <= 1; j++) {
          const cx = horiz ? x + i : x + j, cy = horiz ? y + j : y + i;
          if (cx >= 0 && cx < 10 && cy >= 0 && cy < 10 && newGrid[cy][cx] !== 0) return false;
        }
      }
      if ((horiz && x + size > 10) || (!horiz && y + size > 10)) return false;
      return true;
    };
    ships.forEach(ship => {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * 10), y = Math.floor(Math.random() * 10), horiz = Math.random() > 0.5;
        if (canPlace(x, y, ship.size, horiz)) {
          for (let i = 0; i < ship.size; i++) { if (horiz) newGrid[y][x + i] = ship.id; else newGrid[y + i][x] = ship.id; }
          placed = true;
        }
      }
    });
    return newGrid;
  };

  const initializeGame = () => {
    const time = new Date().toLocaleTimeString();
    setMessages([
      { msg: `[OK] FLEET_DEPLOYED // ${gameMode === 'HARDCORE' ? 'GHOST_PROTOCOL' : 'READY'}`, time, type: 'SUCCESS' }, 
      { msg: '[OK] SONAR_INITIALIZED', time, type: 'INFO' }
    ]);
    setOwnGrid(autoPlace(Array(10).fill(0).map(() => Array(10).fill(0))));
    setEnemyGrid(autoPlace(Array(10).fill(0).map(() => Array(10).fill(0))));
    setDestroyedSegments(0); setPlayerHits(0); setAiHuntingStack([]);
    setEnemyAnalysis({ Battleship: 4, Cruiser: 6, Destroyer: 6, Submarine: 4 });
    setOwnAnalysis({ Battleship: 4, Cruiser: 6, Destroyer: 6, Submarine: 4 });
    setPlayerDC('LOCKED'); setAiDC('LOCKED'); setGameState('PLAYER_TURN');
  };

  const getShipName = (id: number) => {
    if (id >= 40) return 'Flagship';
    if (id >= 30) return 'Cruiser';
    if (id >= 20) return 'Destroyer';
    return 'Submarine';
  };

  const processHit = (grid: number[][], x: number, y: number, isAI: boolean) => {
    const cellValue = grid[y][x];
    const newGrid = grid.map(row => [...row]);
    let hitSomething = false;
    let sunk = false;
    
    if (cellValue >= 10) {
      newGrid[y][x] = -cellValue; 
      hitSomething = true;
      const updateFn = (prev: any) => {
        const next = { ...prev };
        if (cellValue >= 40) next.Battleship--; else if (cellValue >= 30) next.Cruiser--;
        else if (cellValue >= 20) next.Destroyer--; else if (cellValue >= 10) next.Submarine--;
        return next;
      };
      if (isAI) { setPlayerHits(p => p + 1); setOwnAnalysis(updateFn); }
      else { setDestroyedSegments(p => p + 1); setEnemyAnalysis(updateFn); }

      if (newGrid.flat().filter(c => c === cellValue).length === 0) {
        sunk = true;
        if (gameMode === 'CASUAL') {
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              if (newGrid[r][c] === -cellValue) {
                for (let i = -1; i <= 1; i++) {
                  for (let j = -1; j <= 1; j++) {
                    const nr = r + i, nc = c + j;
                    if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && newGrid[nr][nc] === 0) {
                      newGrid[nr][nc] = 2;
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else if (cellValue === 0) { 
      newGrid[y][x] = 2; 
    }
    
    return { newGrid, hitSomething, sunk, shipId: cellValue };
  };

  const handlePlayerShoot = (x: number, y: number) => {
    const isAOE = gameState === 'PLAYER_AOE_SELECT';
    
    // Fix: Allow click on anything if AOE, but only empty/ship if normal
    if (!gameState.includes('PLAYER')) return;
    if (!isAOE && (enemyGrid[y][x] === 2 || enemyGrid[y][x] < 0)) return;

    const tempGrid = enemyGrid.map(row => [...row]);
    
    if (isAOE) {
      setShowBombAlert('PLAYER');
      setTimeout(() => setShowBombAlert('NONE'), 1500);
      addMessage(`[URGENT] DEPTH_CHARGE: ${'ABCDEFGHIJ'[x]}-${y + 1}`, 'SUCCESS');
      setPlayerDC('USED');
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const cx = x + i, cy = y + j;
          if (cx >= 0 && cx < 10 && cy >= 0 && cy < 10 && (tempGrid[cy][cx] === 0 || tempGrid[cy][cx] >= 10)) {
            const { newGrid, sunk, shipId } = processHit(tempGrid, cx, cy, false);
            newGrid.forEach((row, ry) => tempGrid[ry] = [...row]);
            if (sunk) addMessage(`[DESTR] TARGET_SUNK: ${getShipName(shipId)}`, 'SUCCESS');
          }
        }
      }
      setEnemyGrid(tempGrid);
    } else {
      const { newGrid, hitSomething, sunk, shipId } = processHit(tempGrid, x, y, false);
      setEnemyGrid(newGrid);
      const coord = `${'ABCDEFGHIJ'[x]}-${y + 1}`;
      if (hitSomething) {
        addMessage(`[CRIT] IMPACT: ${coord} // HIT`, 'SUCCESS');
        if (sunk) addMessage(`[DESTR] TARGET_SUNK: ${getShipName(shipId)}`, 'SUCCESS');
      } else addMessage(`[OK] SCAN: ${coord} // MISS`, 'INFO');
    }

    const currentDestroyed = tempGrid.flat().filter(c => c < 0).length;
    if (currentDestroyed >= totalSegments) {
      setTimeout(() => { setGameState('VICTORY'); addMessage('[OK] MISSION_COMPLETE', 'SUCCESS'); }, 600); return;
    }

    const battleshipRem = tempGrid.flat().filter(c => c >= 40 && c < 50).length;
    if (playerDC === 'LOCKED' && battleshipRem === 0) {
      setPlayerDC('READY'); addMessage('[ALERT] DEPTH_CHARGE_UNLOCKED', 'SUCCESS');
    }
    setGameState('AI_TURN'); setTimeout(handleAIShoot, 1200);
  };

  const handleAIShoot = () => {
    const tempGrid = ownGrid.map(row => [...row]);
    const aiActualFlagshipHealth = enemyGrid.flat().filter(c => c >= 40 && c < 50).length;
    const isReady = aiDC === 'READY' && aiActualFlagshipHealth > 0;
    const useAOE = isReady && (aiActualFlagshipHealth <= 2 || Math.random() > 0.6);
    
    if (useAOE) {
      setShowBombAlert('ENEMY');
      setTimeout(() => setShowBombAlert('NONE'), 1500);
      addMessage(`[DANGER] ENEMY_DEPTH_CHARGE`, 'CRIT');
      setAiDC('USED');
      let rx = Math.floor(Math.random() * 8) + 1, ry = Math.floor(Math.random() * 8) + 1;
      if (aiHuntingStack.length > 0) {
        const last = aiHuntingStack[aiHuntingStack.length-1];
        rx = Math.max(1, Math.min(8, last.x)); ry = Math.max(1, Math.min(8, last.y));
      }
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const cx = rx + i, cy = ry + j;
          if (cx >= 0 && cx < 10 && cy >= 0 && cy < 10 && (tempGrid[cy][cx] === 0 || tempGrid[cy][cx] >= 10)) {
            const { newGrid, hitSomething, sunk, shipId } = processHit(tempGrid, cx, cy, true);
            newGrid.forEach((row, rry) => tempGrid[rry] = [...row]);
            if (hitSomething) setAiHuntingStack(prev => [...prev, {x: cx, y: cy}]);
            if (sunk) { addMessage(`[CRIT] VESSEL_SUNK: Our ${getShipName(shipId)}`, 'CRIT'); setAiHuntingStack([]); }
          }
        }
      }
      setOwnGrid(tempGrid);
    } else {
      let rx = -1, ry = -1, valid = false;
      const stack = [...aiHuntingStack];
      if (stack.length > 0) {
        const first = stack[0];
        let candidates = [];
        if (stack.length > 1) {
          const isHoriz = stack[0].y === stack[1].y;
          if (isHoriz) {
            const minX = Math.min(...stack.map(h => h.x)), maxX = Math.max(...stack.map(h => h.x));
            candidates = [{x: minX-1, y: first.y}, {x: maxX+1, y: first.y}];
          } else {
            const minY = Math.min(...stack.map(h => h.y)), maxY = Math.max(...stack.map(h => h.y));
            candidates = [{x: first.x, y: minY-1}, {x: first.x, y: maxY+1}];
          }
        } else {
          candidates = [{x: first.x+1, y: first.y}, {x: first.x-1, y: first.y}, {x: first.x, y: first.y+1}, {x: first.x, y: first.y-1}];
        }
        candidates = candidates.filter(p => p.x>=0 && p.x<10 && p.y>=0 && p.y<10 && (tempGrid[p.y][p.x] === 0 || tempGrid[p.y][p.x] >= 10));
        if (candidates.length > 0) { rx=candidates[0].x; ry=candidates[0].y; valid=true; }
        else { setAiHuntingStack([]); }
      }
      if (!valid) {
        const potential = [];
        for (let y=0; y<10; y++) { for (let x=0; x<10; x++) { if ((tempGrid[y][x]===0 || tempGrid[y][x]>=10) && (x+y)%2===0) potential.push({x,y}); } }
        if (potential.length > 0) { const pick = potential[Math.floor(Math.random()*potential.length)]; rx=pick.x; ry=pick.y; }
        else { do { rx=Math.floor(Math.random()*10); ry=Math.floor(Math.random()*10); } while (tempGrid[ry][rx] === 2 || tempGrid[ry][rx] < 0); }
      }
      const { newGrid, hitSomething, sunk, shipId } = processHit(tempGrid, rx, ry, true);
      if (hitSomething) { 
        addMessage(`[WARN] HULL_BREACH: ${'ABCDEFGHIJ'[rx]}-${ry + 1}`, 'WARN'); 
        setAiHuntingStack(prev => [...prev, {x:rx, y:ry}]);
        if (sunk) { addMessage(`[CRIT] VESSEL_SUNK: Our ${getShipName(shipId)}`, 'CRIT'); setAiHuntingStack([]); }
      } else addMessage(`[OK] EVASIVE: ${'ABCDEFGHIJ'[rx]}-${ry + 1}`, 'INFO');
      setOwnGrid(newGrid);
    }
    
    if (tempGrid.flat().filter(c => c < 0).length >= totalSegments) {
      setTimeout(() => { setGameState('DEFEAT'); addMessage('[CRIT] HULL_LOST', 'CRIT'); }, 600); return;
    }
    const myBattleshipRem = tempGrid.flat().filter(c => c >= 40 && c < 50).length;
    if (aiDC === 'LOCKED' && myBattleshipRem === 0) setAiDC('READY');
    setGameState('PLAYER_TURN');
  };

  const coreProgress = (destroyedSegments / totalSegments) * 100;
  const playerIntegrity = ((totalSegments - playerHits) / totalSegments) * 100;
  const canUseDC = playerDC === 'READY' && ownAnalysis.Battleship > 0;
  const canChangeMode = gameState === 'IDLE' || gameState === 'VICTORY' || gameState === 'DEFEAT' || !enemyGrid.flat().some(c => c === 2 || c < 0);

  const getLogColor = (type: LogType) => {
    switch (type) {
      case 'SUCCESS': return 'text-green';
      case 'WARN': return 'text-amber';
      case 'CRIT': return 'text-red-500';
      default: return 'text-muted';
    }
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-8 animate-in fade-in duration-1000 pb-24 text-green relative">
      {showBombAlert !== 'NONE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200">
           <div className={`absolute inset-0 opacity-20 animate-pulse ${showBombAlert === 'PLAYER' ? 'bg-amber' : 'bg-red-600'}`}></div>
           <div className="text-center z-10 flex flex-col items-center gap-4">
              <span className={`text-[150px] leading-none ${showBombAlert === 'PLAYER' ? 'text-amber drop-shadow-[0_0_50px_var(--amber)]' : 'text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.8)]'}`}>☢</span>
              <h1 className={`text-6xl font-black uppercase tracking-[0.5em] ${showBombAlert === 'PLAYER' ? 'text-amber' : 'text-red-500'}`}>DEPTH CHARGE</h1>
              <span className={`text-xl font-mono uppercase tracking-[1em] ${showBombAlert === 'PLAYER' ? 'text-amber/60' : 'text-red-500/60'}`}>{showBombAlert === 'PLAYER' ? 'Area Scan Initiated' : 'Hull Breach Imminent'}</span>
           </div>
        </div>
      )}
      <div className="w-full raised p-8 lg:p-12 rounded-[60px] border border-green/10 bg-green/[0.01] relative overflow-hidden flex flex-col gap-12">
          <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-5"><div className="w-full h-[2px] bg-green animate-scanline"></div></div>
          <div className="flex flex-col xl:flex-row justify-center items-center gap-12 xl:gap-16 relative z-10 w-full">
             <div className="flex items-center gap-6">
                <VerticalScale label="Integrity" value={playerIntegrity} color="bg-green" />
                <RadarUnit label="Local_Core // My_Fleet" type="OWN" grid={ownGrid} isActive={true} />
             </div>
             <div className="flex items-center gap-6">
                <RadarUnit 
                  label="Scanning_Sector // Enemy" 
                  type="ENEMY" 
                  grid={enemyGrid} 
                  isActive={gameState.includes('PLAYER') || gameState === 'IDLE'} 
                  onCellClick={handlePlayerShoot} 
                  isPlayerTurn={gameState.includes('PLAYER')} 
                  revealShips={gameState === 'DEFEAT'}
                />
                <VerticalScale label="Advantage" value={coreProgress} color="bg-amber" />
             </div>
          </div>
          <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-2xl mx-auto">
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-green font-black">Ghost Protocol</span>
                  <span className="text-[7px] uppercase tracking-[0.2em] text-green/40 font-bold">{gameMode === 'HARDCORE' ? 'No-Halo Deployment' : 'Standard Scan'}</span>
                </div>
                <button 
                  onClick={() => canChangeMode && setGameMode(prev => prev === 'CASUAL' ? 'HARDCORE' : 'CASUAL')}
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${!canChangeMode ? 'opacity-20 cursor-not-allowed' : ''} ${gameMode === 'HARDCORE' ? 'bg-red-500/40' : 'inset'}`}
                >
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 shadow-lg ${gameMode === 'HARDCORE' ? 'bg-red-500 translate-x-6' : 'raised translate-x-0'}`}></div>
                </button>
             </div>
             <div className="flex w-full gap-6">
               <button onClick={initializeGame} className="flex-1 py-6 raised rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-green hover:brightness-125 transition-all active:scale-95">{gameState === 'IDLE' ? 'Initialize Scan' : 'Restart Protocol'}</button>
               <button 
                 onClick={() => setGameState('PLAYER_AOE_SELECT')}
                 disabled={!canUseDC || gameState === 'PLAYER_AOE_SELECT'}
                 className={`flex-1 py-6 raised rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all
                   ${canUseDC ? 'text-red-500 hover:brightness-150 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-muted opacity-20 cursor-not-allowed'}
                   ${gameState === 'PLAYER_AOE_SELECT' ? 'bg-red-500/20 border border-red-500/50 brightness-150 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : ''}
                 `}
               >
                 {playerDC === 'USED' ? 'DC_DEPLOYED' : gameState === 'PLAYER_AOE_SELECT' ? 'SELECT TARGET' : 'Depth Charge'}
               </button>
             </div>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="raised p-6 rounded-[32px] border border-green/5 flex flex-col gap-4 h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-green font-black opacity-60 sticky top-0 bg-bg py-1 z-10">Tactical_Log</h2>
          <div className="flex flex-col gap-2 font-mono text-[9px] text-green/80 uppercase">
             {statusLog.map((entry, i) => (
               <div key={i} className={`flex gap-2 ${i === 0 ? 'brightness-125 animate-pulse' : 'opacity-40'} ${getLogColor(entry.type)}`}><span className="flex-none">[{entry.time.split(' ')[0]}]</span><span className="truncate">{entry.msg}</span></div>
             ))}
          </div>
        </div>
        <div className="raised p-6 rounded-[32px] border border-green/5 flex flex-col gap-6 justify-center items-center">
           <h2 className="text-[10px] uppercase tracking-[0.3em] text-green font-black opacity-60 font-mono">Reactor_Core</h2>
           <div className="w-full flex flex-col gap-3 px-4">
              <div className="h-6 w-full inset rounded-full overflow-hidden border border-green/10 p-1"><div className="h-full bg-green rounded-full shadow-[0_0_15px_var(--green)] transition-all duration-1000" style={{ width: `${coreProgress}%` }}></div></div>
              <div className="flex justify-between font-mono text-[9px] text-green/60 font-bold uppercase tracking-widest px-2"><span>Crit_Mass</span><span>{Math.round(coreProgress)}%</span></div>
           </div>
        </div>
        <div className="raised p-6 rounded-[32px] border border-green/5 flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-green font-black opacity-60 sticky top-0 bg-bg py-1 z-10 font-mono">Target_Analysis</h2>
          <div className="flex flex-col gap-4">
             <TargetItem label="Flagship" size={4} count={1} remaining={enemyAnalysis.Battleship} />
             <TargetItem label="Cruiser" size={3} count={2} remaining={enemyAnalysis.Cruiser} />
             <TargetItem label="Destroyer" size={2} count={3} remaining={enemyAnalysis.Destroyer} />
             <TargetItem label="Submarine" size={1} count={4} remaining={enemyAnalysis.Submarine} />
          </div>
        </div>
        <div className="raised p-6 rounded-[32px] border border-green/5 flex flex-col gap-4">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-green font-black opacity-60 font-mono">Manual</h2>
          <div className="flex flex-col gap-4">
             <ManualItem step="01" text="Initiate Scan to Deploy" />
             <ManualItem step="02" text="Sink Enemy Flagship to Unlock DC" />
             <ManualItem step="03" text="Protect your Flagship to use DC" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VerticalScale({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
       <span className="text-[7px] uppercase font-black tracking-[0.3em] vertical-text opacity-40">{label}</span>
       <div className="w-3 h-[300px] inset rounded-full p-0.5 border border-green/10 flex flex-col justify-end overflow-hidden"><div className={`w-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(0,255,65,0.3)] ${color}`} style={{ height: `${value}%` }}></div></div>
    </div>
  );
}

function RadarUnit({ label, type, grid, isActive, onCellClick, isPlayerTurn, revealShips }: { label: string, type: 'OWN' | 'ENEMY', grid: number[][], isActive: boolean, onCellClick?: (x: number, y: number) => void, isPlayerTurn?: boolean, revealShips?: boolean }) {
  return (
    <div className="flex flex-col gap-4 items-center">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isPlayerTurn ? 'bg-amber animate-pulse shadow-[0_0_8px_var(--amber)]' : 'bg-green opacity-40'}`}></div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-green font-black">{label}</span>
       </div>
       <div className="inset p-4 rounded-[40px] border border-green/10 shadow-2xl bg-black/20">
          <SeaBattleCanvas type={type} grid={grid} isActive={isActive} onCellClick={onCellClick} revealShips={revealShips} />
       </div>
    </div>
  );
}

function ManualItem({ step, text }: { step: string, text: string }) {
  return (
    <div className="flex gap-3 items-center opacity-40 hover:opacity-100 transition-opacity">
       <span className="text-[8px] font-mono font-bold text-green border border-green/20 px-1.5 py-0.5 rounded-sm">{step}</span>
       <p className="text-[8px] uppercase tracking-[0.15em] font-black leading-tight">{text}</p>
    </div>
  );
}

function TargetItem({ label, size, count, remaining }: { label: string, size: number, count: number, remaining: number }) {
  const totalCells = size * count;
  const status = remaining > 0 ? 'ACTIVE' : 'NEUTRALIZED';
  return (
    <div className="flex flex-col gap-2 opacity-80 group hover:opacity-100 transition-opacity">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
             <span className="text-[9px] uppercase font-black text-text/60 tracking-wider group-hover:text-green transition-colors">{label}</span>
             <span className="text-[8px] font-mono text-text/20">x{count}</span>
          </div>
          <span className={`text-[7px] px-1.5 py-0.5 rounded border ${status === 'ACTIVE' ? 'border-green/20 text-green' : 'border-red-500/20 text-red-500 opacity-40'}`}>{status}</span>
       </div>
       <div className="flex gap-1.5">
          {Array.from({ length: totalCells }).map((_, i) => {
            const isActive = i < remaining;
            return <div key={i} className={`h-1.5 flex-1 rounded-[1px] transition-all duration-500 ${isActive ? 'bg-green/20' : 'bg-red-500/10'}`}>{isActive && <div className="h-full bg-green w-full animate-pulse shadow-[0_0_5px_var(--green)]"></div>}</div>;
          })}
       </div>
    </div>
  );
}
