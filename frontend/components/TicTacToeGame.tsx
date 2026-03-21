'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Series002Container from './Series002Container';
import { Homepage } from '@/types/strapi';

type Player = 'X' | 'O' | null;
type GameMode = 'PvE' | 'PvP';
type Difficulty = 'INFANT' | 'ADULT' | 'MERCILESS';
type GameState = 'IDLE' | 'PLAYING' | 'RESULT';

interface TicTacToeGameProps {
  homepage: Homepage;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToeGame({ homepage }: TicTacToeGameProps) {
  const router = useRouter();
  
  // Settings
  const [mode, setMode] = useState<GameMode>('PvE');
  const [difficulty, setDifficulty] = useState<Difficulty>('MERCILESS');
  
  // Game State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  
  // Stats
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  // Audio Engine
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    const tracks = ['sfx_chips', 'sfx_win', 'sfx_fold', 'sfx_card_deal'];
    tracks.forEach(t => {
      audioRefs.current[t] = new Audio(`/audio/poker/${t}.mp3`);
    });
  }, []);

  const playSFX = (name: string) => {
    const sfx = audioRefs.current[name];
    if (sfx) {
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    }
  };

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('ttt_stats');
    if (saved) setStats(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('ttt_stats', JSON.stringify(stats));
  }, [stats]);

  // Game Logic
  const checkWinner = useCallback((currentBoard: Player[]) => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every(cell => cell !== null)) return { winner: 'DRAW', line: null };
    return null;
  }, []);

  const finalizeGame = useCallback((result: { winner: Player | 'DRAW', line: number[] | null }) => {
    setWinner(result.winner as Player | 'DRAW');
    setWinningLine(result.line);
    setGameState('RESULT');
    if (result.winner === 'DRAW') {
      setStats(s => ({ ...s, draws: s.draws + 1 }));
      playSFX('sfx_fold');
    } else {
      if (mode === 'PvE') {
        if (result.winner === 'X') {
          setStats(s => ({ ...s, wins: s.wins + 1 }));
          playSFX('sfx_win');
        } else {
          setStats(s => ({ ...s, losses: s.losses + 1 }));
          playSFX('sfx_fold');
        }
      } else {
         playSFX('sfx_win');
      }
    }
  }, [mode]);

  const handleMove = useCallback((index: number) => {
    let currentIsXNext = isXNext;
    let currentGameState = gameState;
    let currentBoard = [...board];

    if (currentGameState === 'IDLE') {
      currentGameState = 'PLAYING';
      currentIsXNext = true;
      setGameState('PLAYING');
      setIsXNext(true);
      playSFX('sfx_card_deal');
    }

    if (currentBoard[index] || winner || currentGameState !== 'PLAYING') return;

    currentBoard[index] = currentIsXNext ? 'X' : 'O';
    setBoard(currentBoard);
    playSFX('sfx_chips');

    const result = checkWinner(currentBoard);
    if (result) {
      finalizeGame(result as { winner: Player | 'DRAW', line: number[] | null });
    } else {
      setIsXNext(!currentIsXNext);
    }
  }, [board, winner, gameState, isXNext, checkWinner, finalizeGame]);

  // AI Logic (Minimax)
  const minimax = useCallback((currentBoard: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(currentBoard);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [checkWinner]);

  const getBestMove = useCallback((currentBoard: Player[]) => {
    if (difficulty === 'INFANT') {
      const available = currentBoard.map((c, i) => c === null ? i : null).filter(c => c !== null);
      return available[Math.floor(Math.random() * available.length)] as number;
    }

    if (difficulty === 'ADULT') {
      if (Math.random() > 0.7) {
        const available = currentBoard.map((c, i) => c === null ? i : null).filter(c => c !== null);
        return available[Math.floor(Math.random() * available.length)] as number;
      }
    }

    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }, [difficulty, minimax]);

  // Effect for AI turn
  useEffect(() => {
    if (mode === 'PvE' && !isXNext && gameState === 'PLAYING' && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getBestMove([...board]);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          playSFX('sfx_chips');
          const result = checkWinner(newBoard);
          if (result) {
            finalizeGame(result as { winner: Player | 'DRAW', line: number[] | null });
          } else {
            setIsXNext(true);
          }
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameState, winner, mode, board, getBestMove, checkWinner, finalizeGame]);

  const startNewGame = (playerStarts = true) => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setGameState('PLAYING');
    setIsXNext(playerStarts);
    playSFX('sfx_card_deal');
  };

  // --- REACTIVE PROTOCOL MANUAL ---
  const reactiveControls = [
    { key: gameState, action: 'System_State' },
    { key: mode === 'PvE' ? 'VS_TERMINAL' : 'VS_HUMAN', action: 'Active_Mode' },
    ...(mode === 'PvE' ? [{ key: difficulty, action: 'Intelligence' }] : []),
    { 
      key: gameState === 'PLAYING' ? (isXNext ? 'PLAYER_X' : (mode === 'PvE' ? 'TERMINAL_O' : 'PARTNER_O')) : 'WAITING', 
      action: 'Current_Turn' 
    },
    { key: `${stats.wins}W / ${stats.losses}L`, action: 'Session_Record' },
  ];

  return (
    <Series002Container 
      homepage={homepage}
      subtitle="SERIES_002 // LOGIC DUEL PROTOCOL"
      controls={reactiveControls}
    >
      <div className="w-full flex flex-col items-center gap-12 animate-in fade-in duration-700">
        
        {/* Control Panel */}
        <div className="w-full grid md:grid-cols-2 gap-6">
          <div className="raised p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <span className="text-[10px] uppercase tracking-widest font-black text-muted opacity-50">Mode Select</span>
               <div className="flex gap-2 h-10 inset p-1 rounded-full w-40 relative">
                  <button onClick={() => {setMode('PvE'); setGameState('IDLE'); setBoard(Array(9).fill(null));}} className={`flex-1 flex items-center justify-center text-[10px] font-bold z-10 ${mode === 'PvE' ? 'text-text' : 'opacity-40'}`}>PvE</button>
                  <button onClick={() => {setMode('PvP'); setGameState('IDLE'); setBoard(Array(9).fill(null));}} className={`flex-1 flex items-center justify-center text-[10px] font-bold z-10 ${mode === 'PvP' ? 'text-text' : 'opacity-40'}`}>PvP</button>
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] raised rounded-full transition-all duration-300 ${mode === 'PvE' ? 'left-1' : 'left-[50%]'}`} />
               </div>
            </div>
            
            {mode === 'PvE' && (
              <div className="flex justify-between items-center border-t border-white/5 pt-4 animate-in slide-in-from-top-2">
                 <span className="text-[10px] uppercase tracking-widest font-black text-muted opacity-50">Intelligence</span>
                 <div className="flex gap-2 h-10 inset p-1 rounded-full w-56 relative">
                    <button onClick={() => setDifficulty('INFANT')} className={`flex-1 flex items-center justify-center text-[8px] font-black z-10 ${difficulty === 'INFANT' ? 'text-text' : 'opacity-40'}`}>INFANT</button>
                    <button onClick={() => setDifficulty('ADULT')} className={`flex-1 flex items-center justify-center text-[8px] font-black z-10 ${difficulty === 'ADULT' ? 'text-text' : 'opacity-40'}`}>ADULT</button>
                    <button onClick={() => setDifficulty('MERCILESS')} className={`flex-1 flex items-center justify-center text-[8px] font-black z-10 ${difficulty === 'MERCILESS' ? 'text-text' : 'opacity-40'}`}>MERCILESS</button>
                    <div className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] raised rounded-full transition-all duration-300 ${difficulty === 'INFANT' ? 'left-1' : difficulty === 'ADULT' ? 'left-[33.33%]' : 'left-[66.66%]'}`} />
                 </div>
              </div>
            )}
          </div>

          <div className="raised p-6 rounded-2xl flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-widest font-black text-muted opacity-50 mb-2">History</span>
                   <div className="flex gap-4">
                      <StatItem label="W" val={stats.wins} color="text-green" />
                      <StatItem label="L" val={stats.losses} color="text-red-500" />
                      <StatItem label="D" val={stats.draws} color="text-amber" />
                   </div>
                </div>
                <button onClick={() => {setStats({wins: 0, losses: 0, draws: 0}); playSFX('sfx_fold');}} className="text-[8px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity">Reset Logs</button>
             </div>
             <button 
               onClick={() => router.push('/')}
               className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 hover:opacity-100 transition-all hover:translate-x-1"
             >
               TERMINATE_CONNECTION →
             </button>
          </div>
        </div>

        {/* Grid Interface */}
        <div className="relative flex flex-col items-center gap-12 w-full">
          <div className="grid grid-cols-3 gap-6 p-8 raised rounded-[48px] bg-bg/50 relative">
             {board.map((cell, i) => (
               <button
                 key={i}
                 onClick={() => handleMove(i)}
                 disabled={cell !== null || (mode === 'PvE' && !isXNext) || (gameState === 'RESULT')}
                 className={`w-32 h-32 rounded-[24px] inset shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center relative group transition-all duration-500
                   ${winningLine?.includes(i) ? 'brightness-125 shadow-[inset_0_0_20px_rgba(216,126,74,0.2),0_0_30px_rgba(216,126,74,0.1)]' : ''}
                   hover:bg-white/[0.02] active:scale-95
                 `}
               >
                  {cell === 'X' && (
                    <span className={`text-6xl font-black text-amber drop-shadow-[0_4px_8px_rgba(0,0,0,0.8),0_0_15px_rgba(216,126,74,0.4)] animate-in zoom-in-75 duration-300 ${winningLine?.includes(i) ? 'animate-pulse' : ''}`}>X</span>
                  )}
                  {cell === 'O' && (
                    <span className={`text-6xl font-black text-green drop-shadow-[0_4px_8px_rgba(0,0,0,0.8),0_0_20px_rgba(34,197,94,0.5)] animate-in zoom-in-75 duration-300 ${winningLine?.includes(i) ? 'animate-pulse' : ''}`}>O</span>
                  )}
                  {!cell && (gameState === 'PLAYING' || gameState === 'IDLE') && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-amber/20 transition-all group-hover:scale-150" />
                  )}
               </button>
             ))}

             {/* Results Overlay */}
             {gameState === 'RESULT' && (
               <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in fade-in duration-500">
                  <div className="absolute inset-0 bg-bg/60 backdrop-blur-[4px] rounded-[48px]" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                     <span className="text-[10px] uppercase tracking-[0.5em] text-muted font-black opacity-50">
                       Sequence Terminated
                     </span>
                     <h2 className={`text-5xl font-black tracking-[0.2em] uppercase drop-shadow-2xl ${winner === 'X' ? 'text-amber' : winner === 'O' ? 'text-green' : 'text-text'}`}>
                       {winner === 'X' ? 'Player Win' : winner === 'O' ? 'Terminal Win' : 'Draw // Sync'}
                     </h2>
                  </div>
               </div>
             )}
          </div>

          {/* Global Action Button Area */}
          <div className="w-full max-w-2xl relative flex flex-col items-center gap-6">
            {gameState === 'IDLE' ? (
              <div className="flex flex-col md:flex-row gap-6 w-full animate-in slide-in-from-bottom-4">
                 <button 
                   onClick={() => startNewGame(true)}
                   className="flex-1 raised hover:brightness-110 h-20 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-text transition-all active:scale-95 shadow-xl border border-white/5 group relative overflow-hidden"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-amber/0 via-amber/5 to-amber/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   {mode === 'PvE' ? 'Player_First_Initiate' : 'Initiate_Duel'}
                 </button>
                 {mode === 'PvE' && (
                   <button 
                     onClick={() => startNewGame(false)}
                     className="flex-1 raised hover:brightness-110 h-20 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-green transition-all active:scale-95 shadow-xl border border-white/5 group relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-green/0 via-green/5 to-green/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     Terminal_First_Initiate
                   </button>
                 )}
              </div>
            ) : gameState === 'RESULT' ? (
              <button 
                onClick={() => setGameState('IDLE')}
                className="w-64 h-20 raised hover:brightness-110 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-text transition-all active:scale-95 animate-in slide-in-from-bottom-4 shadow-2xl"
              >
                Return to Menu
              </button>
            ) : (
               <div className="flex items-center gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${isXNext ? 'scale-110 opacity-100' : 'scale-90 opacity-20'}`}>
                     <span className="text-[8px] uppercase tracking-[0.3em] font-black text-amber">Active_Control</span>
                     <div className="w-16 h-16 rounded-2xl raised flex items-center justify-center border border-amber/10 shadow-[0_0_20px_rgba(216,126,74,0.1)]">
                        <span className="text-2xl font-black text-amber drop-shadow-[0_0_10px_rgba(216,126,74,0.3)]">X</span>
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                     <div className="h-[2px] w-24 inset bg-white/5 relative overflow-hidden rounded-full">
                        <div className={`absolute inset-0 bg-gradient-to-r from-amber to-green transition-all duration-700 ${isXNext ? '-translate-x-full' : 'translate-x-0'}`} />
                     </div>
                     <span className="text-[6px] uppercase tracking-widest text-muted opacity-30 font-bold">Logic_Stream</span>
                  </div>

                  <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${!isXNext ? 'scale-110 opacity-100' : 'scale-90 opacity-20'}`}>
                     <span className="text-[8px] uppercase tracking-[0.3em] font-black text-green">{mode === 'PvE' ? 'Terminal' : 'Partner'}</span>
                     <div className="w-16 h-16 rounded-2xl raised flex items-center justify-center border border-green/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                        <span className="text-2xl font-black text-green drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">O</span>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </Series002Container>
  );
}

function StatItem({ label, val, color }: { label: string, val: number, color: string }) {
  return (
    <div className="flex flex-col">
       <span className="text-[8px] font-black opacity-30">{label}</span>
       <span className={`text-2xl font-black tabular-nums ${color}`}>{val}</span>
    </div>
  );
}
