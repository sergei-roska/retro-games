'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import SnakeCanvas from './SnakeCanvas';
import Leaderboard from './Leaderboard';
import SystemDiagnostic from './SystemDiagnostic';
import GameOverModal from './GameOverModal';
import { LeaderboardEntry } from '@/types/strapi';
import { useRouter } from 'next/navigation';

interface SnakeGameProps {
  initialLeaderboard: LeaderboardEntry[];
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'IDLE' | 'PLAYING' | 'VICTORY' | 'GAMEOVER';

export default function SnakeGame({ initialLeaderboard }: SnakeGameProps) {
  const router = useRouter();
  
  // Calibration State
  const [gridSize, setGridSize] = useState<20 | 30>(20);
  const [mode, setMode] = useState<'CLASSIC' | 'MISSION'>('CLASSIC');
  const [useFirewalls, setUseFirewalls] = useState(false);
  const [useDataPackets, setUseDataPackets] = useState(false);

  // Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [velocity, setVelocity] = useState(200);
  const [combo, setCombo] = useState(0);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState(typeof window !== 'undefined' ? localStorage.getItem('operator_id') || '' : '');
  const [gameId, setGameId] = useState(0);

  // Audio Refs
  const audioRefs = useRef<{
    [key: string]: HTMLAudioElement | null;
  }>({});

  useEffect(() => {
    // Preload audio
    const tracks = ['bgm_ambient', 'bgm_victory', 'sfx_eat', 'sfx_fail', 'sfx_click'];
    tracks.forEach(t => {
      audioRefs.current[t] = new Audio(`/audio/snake/${t}.mp3`);
      if (t.startsWith('bgm')) {
        audioRefs.current[t]!.loop = true;
      }
    });
  }, []);

  // Status Log
  const [messages, setMessages] = useState<string[]>(['[OK] INITIALIZING_CRAWLER_CORE', '[OK] GRID_SYNC_COMPLETE']);

  const addMessage = (msg: string) => {
    setMessages(prev => [msg, ...prev].slice(0, 5));
  };

  const playSFX = (name: string) => {
    const sfx = audioRefs.current[name];
    if (sfx) {
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    }
  };

  const handleEat = useCallback(() => {
    playSFX('sfx_eat');
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('GAMEOVER');
    playSFX('sfx_fail');
    addMessage(`[CRIT] CORE_COLLISION_AT_LEVEL_${levelRef.current}`);
    setGameOverScore(finalScore);
  }, []);

  const handleSubmitScore = async (name: string) => {
    localStorage.setItem('operator_id', name);
    setPlayerName(name);
    
    try {
      const res = await fetch('/api/records', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ game: 'snake', playerName: name, score: gameOverScore })
      });
      const data = await res.json();
      if (data.records) {
         setLeaderboard(data.records);
         addMessage(`[OK] DATA_SYNCED_TO_LEAD_CORE`);
         return true;
      }
    } catch (e) {
      addMessage(`[ERR] SYNC_FAILURE`);
    }
    return false;
  };

  const levelRef = useRef(1);
  useEffect(() => {
    levelRef.current = level;
    if (level === 6) addMessage('[WARN] PHASE_02_INACCESSIBLE_ZONES_DETECTED');
    if (level === 10) addMessage('[ALERT] PHASE_03_OVERDRIVE_MODE_ENGAGED');
  }, [level]);

  const handleVictory = useCallback(() => {
    setGameState('VICTORY');
    playSFX('bgm_victory');
    addMessage('[OK] MISSION_ACCOMPLISHED_CORE_STABILIZED');
  }, []);

  const handleStay = useCallback(() => {
    setGameOverScore(null);
  }, []);

  const handleExit = useCallback(() => {
    router.push('/');
  }, [router]);

  const startNewGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setLevel(1);
    setVelocity(200);
    setGameOverScore(null);
    setGameId(prev => prev + 1);
    setMessages(['[OK] SEQUENCE_INITIATED', '[ALERT] READY_FOR_SYNC', '[INFO] PRESS_SPACE_OR_ARROWS']);
    playSFX('sfx_click');
    // BGM is now ambient and triggered manually if needed
  };

  return (
    <div className="w-full flex flex-col items-center gap-12 max-w-6xl animate-in fade-in duration-700">
      
      {/* Calibration HUD */}
      {gameState === 'IDLE' && (
        <div className="w-full grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
          <div className="raised p-8 rounded-2xl flex flex-col gap-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-muted opacity-50 mb-2">Protocol Calibration</h3>
            
            {/* Mission Mode */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest font-black">Mission Mode</span>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold opacity-60">Level 11 = Victory</span>
              </div>
              <button 
                onClick={() => setMode(prev => prev === 'CLASSIC' ? 'MISSION' : 'CLASSIC')}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${mode === 'MISSION' ? 'bg-amber/40' : 'inset'}`}
              >
                <div className={`w-6 h-6 rounded-full transition-all duration-300 ${mode === 'MISSION' ? 'bg-amber translate-x-6' : 'raised translate-x-0'}`} />
              </button>
            </div>

            {/* Grid Size Slider */}
            <div className="flex justify-between items-center border-t border-stroke/20 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest font-black">Grid Matrix</span>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold opacity-60">Resolution Scaling</span>
              </div>
              <div className="h-10 inset rounded-full p-1 flex relative w-32">
                <button onClick={() => setGridSize(20)} className={`flex-1 flex items-center justify-center text-[10px] font-bold z-10 ${gridSize === 20 ? 'text-text' : 'opacity-40'}`}>20x20</button>
                <button onClick={() => setGridSize(30)} className={`flex-1 flex items-center justify-center text-[10px] font-bold z-10 ${gridSize === 30 ? 'text-text' : 'opacity-40'}`}>30x30</button>
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] raised rounded-full border-stroke transition-all duration-300 ${gridSize === 20 ? 'left-1' : 'left-[50%]'}`} />
              </div>
            </div>

            {/* Power-ups Toggle */}
            <div className="flex justify-between items-center border-t border-stroke/20 pt-4">
               <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-widest font-black">Overclock</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold opacity-60">Spawn Data Packets</span>
               </div>
               <button 
                 onClick={() => setUseDataPackets(!useDataPackets)}
                 className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${useDataPackets ? 'bg-green/40' : 'inset'}`}
               >
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 ${useDataPackets ? 'bg-green translate-x-6' : 'raised translate-x-0'}`} />
               </button>
            </div>

            {/* Firewalls */}
            <div className="flex justify-between items-center border-t border-stroke/20 pt-4">
               <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-widest font-black">Secure Layer</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold opacity-60">Static Firewalls</span>
               </div>
               <button 
                 onClick={() => setUseFirewalls(!useFirewalls)}
                 className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${useFirewalls ? 'bg-red/40' : 'inset'}`}
               >
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 ${useFirewalls ? 'bg-red translate-x-6' : 'raised translate-x-0'}`} />
               </button>
            </div>
          </div>

          {/* Records & Launch */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
               <Leaderboard entries={leaderboard} />
               <SystemDiagnostic />
            </div>
            <button 
              onClick={startNewGame}
              className="relative h-24 rounded-2xl font-black uppercase tracking-[0.5em] text-sm overflow-hidden transition-all duration-500 hover:scale-[1.01] active:scale-95 group flex items-center justify-center w-full"
            >
              {/* Darkened Base */}
              <div className="absolute inset-0 inset rounded-2xl group-hover:border-amber/40 transition-colors" />
              
              {/* Snake Trace Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <rect 
                  x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" 
                  rx="16" ry="16"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  pathLength="100"
                  strokeDasharray="10 23.33 10 23.33 10 23.33"
                  strokeLinecap="round"
                  className="animate-snake-trace text-amber opacity-30 group-hover:opacity-100 transition-opacity"
                />
              </svg>

              {/* Shimmer Flow Effect (Moving Gradient) */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-amber/[0.15] to-transparent animate-shimmer-flow pointer-events-none" />

              {/* Text */}
              <span className="relative z-10 text-amber/60 group-hover:text-amber transition-colors drop-shadow-[0_0_8px_rgba(216,126,74,0.3)] font-mono">
                Initiate Sequence
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Game Canvas & HUD */}
      {gameState !== 'IDLE' && (
        <div className="w-full flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center">
          <SnakeCanvas 
            key={gameId}
            gridSize={gridSize}
            mode={mode}
            useFirewalls={useFirewalls}
            useDataPackets={useDataPackets}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onScoreChange={setScore}
            onLevelChange={setLevel}
            onVelocityChange={setVelocity}
            onEat={handleEat}
            gameState={gameState}
          />

          {gameOverScore !== null && (
            <GameOverModal 
              score={gameOverScore}
              onSubmit={handleSubmitScore}
              onRestart={startNewGame}
              onStay={handleStay}
              onExit={handleExit}
            />
          )}

          {/* Stats HUD */}
          <div className="flex flex-col gap-8 w-full max-w-xs font-mono">
             <div className="raised p-8 rounded-2xl flex flex-col gap-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-scanlines" />
                
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold mb-2">Current Velocity</span>
                  <div className="inset p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-3xl font-black text-green tracking-tighter tabular-nums">{Math.floor(1000/velocity * 10) / 10}</span>
                    <span className="text-[8px] opacity-40 uppercase tracking-widest">hz // cycle</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold mb-2">Integration Progress</span>
                  <div className="flex gap-1.5 items-center">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-4 w-2 rounded-[2px] transition-all duration-500 ${i < level ? 'bg-amber shadow-[0_0_10px_rgba(216,126,74,0.5)]' : 'inset opacity-20'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold">Session Cores</span>
                     <span className="text-2xl font-black text-text tabular-nums">{score}</span>
                   </div>
                   <div className="h-2 inset rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-green rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${(score % 5) * 20}%` }} />
                   </div>
                </div>
             </div>

             {/* Terminal Message Log */}
             <div className="p-6 inset rounded-2xl border border-stroke/20 flex flex-col gap-2 min-h-[120px]">
                {messages.map((m, i) => (
                   <div key={i} className={`flex items-center gap-2 ${i === 0 ? 'animate-pulse' : 'opacity-40'}`}>
                      <div className={`w-1 h-1 rounded-full ${m.includes('OK') ? 'bg-green' : m.includes('WARN') ? 'bg-amber' : 'bg-red'}`} />
                      <span className={`text-[8px] uppercase tracking-widest font-black ${m.includes('OK') ? 'text-green' : m.includes('WARN') ? 'text-amber' : 'text-red'}`}>
                         {m}
                      </span>
                   </div>
                ))}
             </div>

              {/* Actions */}
              {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={startNewGame}
                    className="raised hover:brightness-110 h-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] bg-green/10"
                  >
                     Initiate New Session
                  </button>
                  <button 
                    onClick={() => setGameState('IDLE')}
                    className=" raised h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] opacity-60 hover:opacity-100 transition-opacity"
                  >
                     Re-calibrate Protocol
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
