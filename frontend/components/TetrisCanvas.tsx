'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const FIGURES: Record<string, number[][]> = {
  'I': [[1, 1, 1, 1]],
  'J': [[1, 0, 0], [1, 1, 1]],
  'L': [[0, 0, 1], [1, 1, 1]],
  'O': [[1, 1], [1, 1]],
  'S': [[0, 1, 1], [1, 1, 0]],
  'T': [[0, 1, 0], [1, 1, 1]],
  'Z': [[1, 1, 0], [0, 1, 1]],
};

const PIECE_COLORS = [
  '#2C2C2E', // Graphite piece 1
  '#3A3A3C', // Graphite piece 2
  '#48484A', // Graphite piece 3
  '#636366', // Graphite piece 4
  '#8E8E93', // Graphite piece 5
];

interface Piece {
  pos: { x: number, y: number };
  shape: number[][] ;
  color: string;
}

interface TetrisCanvasProps {
  onGameOver: (score: number) => void;
  onLevelChange?: (level: number) => void;
  gameActive: boolean;
}

export default function TetrisCanvas({ onGameOver, onLevelChange, gameActive }: TetrisCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const dropRef = useRef<() => boolean>(() => false);
  const [canSoftDrop, setCanSoftDrop] = useState(true);

  // Audio Engine
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    const tracks = ['sfx_tetris_tick_v3', 'sfx_tetris_line', 'sfx_tetris_gameover', 'sfx_tetris_start'];
    tracks.forEach(t => {
      const audio = new Audio(`/audio/tetris/${t}.mp3`);
      // Lower volume for louder sounds
      if (t === 'sfx_tetris_start' || t === 'sfx_tetris_gameover') {
        audio.volume = 0.4;
      }
      audioRefs.current[t] = audio;
    });
  }, []);

  const playSFX = useCallback((name: string) => {
    const sfx = audioRefs.current[name];
    if (sfx) {
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    }
  }, []);

  const currentLevel = Math.min(9, Math.floor(lines / 10) + 1);
  const progressToNextLevel = lines % 10;

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const generateRandomPiece = useCallback((): Piece => {
    const keys = Object.keys(FIGURES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    const shape = FIGURES[type];
    const color = PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
    return {
      pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
      shape,
      color,
    };
  }, []);

  const collide = (pos: { x: number, y: number }, shape: number[][], currentGrid: number[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && currentGrid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const spawnPiece = useCallback(() => {
    let currentNext = nextPiece;
    if (!currentNext) currentNext = generateRandomPiece();
    const newNext = generateRandomPiece();
    setNextPiece(newNext);
    if (collide(currentNext.pos, currentNext.shape, grid)) {
      setIsGameOver(true);
      playSFX('sfx_tetris_gameover');
      onGameOver(score);
      return null;
    }
    return currentNext;
  }, [grid, score, onGameOver, nextPiece, generateRandomPiece, playSFX]);

  const merge = (pos: { x: number, y: number }, shape: number[][], color: string) => {
    const newGrid = grid.map(row => [...row]);
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = pos.y + y;
          const gridX = pos.x + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            newGrid[gridY][gridX] = PIECE_COLORS.indexOf(color) + 1;
          }
        }
      });
    });
    let linesCleared = 0;
    const finalGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) linesCleared++;
      return !isFull;
    });
    while (finalGrid.length < ROWS) finalGrid.unshift(Array(COLS).fill(0));
    if (linesCleared > 0) {
      playSFX('sfx_tetris_line');
      const lineScores = [0, 100, 300, 500, 800];
      setScore(prev => prev + lineScores[linesCleared]);
      setLines(prev => {
        const newTotal = prev + linesCleared;
        if (Math.floor(newTotal / 10) > Math.floor(prev / 10)) {
          setSpeed(s => Math.max(200, s - 100));
        }
        return newTotal;
      });
    }
    setGrid(finalGrid);
    const nextP = spawnPiece();
    setPiece(nextP);
  };

  const move = (dir: { x: number, y: number }): boolean => {
    if (!piece || isGameOver || isPaused || !isStarted) return false;
    const newPos = { x: piece.pos.x + dir.x, y: piece.pos.y + dir.y };
    if (!collide(newPos, piece.shape, grid)) {
      setPiece({ ...piece, pos: newPos });
      return true;
    } else if (dir.y > 0) {
      merge(piece.pos, piece.shape, piece.color);
      return false;
    }
    return false;
  };

  const rotate = () => {
    if (!piece || isGameOver || isPaused || !isStarted) return;
    const shape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (!collide(piece.pos, shape, grid)) setPiece({ ...piece, shape });
  };

  const drop = useCallback((): boolean => {
    if (isPaused || isGameOver || !isStarted) return false;
    playSFX('sfx_tetris_tick_v3');
    return move({ x: 0, y: 1 });
  }, [piece, isPaused, isGameOver, isStarted, grid, playSFX]);

  useEffect(() => {
    dropRef.current = drop;
  }, [drop]);

  const handleStart = () => {
    if (!isStarted) {
      playSFX('sfx_tetris_start');
      const first = generateRandomPiece();
      const second = generateRandomPiece();
      setPiece(first);
      setNextPiece(second);
      setIsStarted(true);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setThemeTick(t => t + 1);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!gameActive || isGameOver) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'p', 'P', 'Escape'].includes(e.key)) e.preventDefault();
      
      if (!isStarted) {
        if (e.key === ' ' || e.key === 'Enter') handleStart();
        return;
      }
      
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      
      if (isPaused) return;
      
      switch (e.key) {
        case 'ArrowLeft': move({ x: -1, y: 0 }); break;
        case 'ArrowRight': move({ x: 1, y: 0 }); break;
        case 'ArrowDown': 
          if (canSoftDrop) {
            const moved = drop();
            if (!moved) setCanSoftDrop(false);
          }
          break;
        case 'ArrowUp': 
        case ' ': rotate(); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setCanSoftDrop(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [piece, grid, isGameOver, isPaused, isStarted, gameActive, generateRandomPiece, drop, canSoftDrop]);

  useEffect(() => {
    if (!gameActive || isGameOver || isPaused || !isStarted) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }
    gameLoopRef.current = setInterval(() => {
      dropRef.current();
    }, speed);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [speed, isGameOver, isPaused, isStarted, gameActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const styles = getComputedStyle(document.body);
    const bgColor = styles.getPropertyValue('--bg').trim();
    const surfaceInset = styles.getPropertyValue('--surface-inset').trim();
    const textColor = styles.getPropertyValue('--text').trim();
    const amberColor = styles.getPropertyValue('--amber').trim() || '#D87E4A';

    const drawBlock = (c: CanvasRenderingContext2D, x: number, y: number, color: string, bSize: number) => {
      const padding = 1;
      const size = bSize - padding * 2;
      const rx = x * bSize + padding;
      const ry = y * bSize + padding;
      c.fillStyle = color;
      c.fillRect(rx, ry, size, size);
      c.fillStyle = 'rgba(255, 255, 255, 0.2)';
      c.fillRect(rx, ry, size, 3);
      c.fillRect(rx, ry, 3, size);
      c.fillStyle = 'rgba(0, 0, 0, 0.5)';
      c.fillRect(rx, ry + size - 3, size, 3);
      c.fillRect(rx + size - 3, ry, 3, size);
      c.fillStyle = 'rgba(255, 255, 255, 0.05)';
      c.fillRect(rx + 4, ry + 4, size - 8, size - 8);
    };

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cupPadding = 2;
    ctx.strokeStyle = textColor === '#FFFFFF' || textColor === 'rgb(255, 255, 255)' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cupPadding, cupPadding, canvas.width - cupPadding * 2, canvas.height - cupPadding * 2);
    ctx.fillStyle = surfaceInset;
    ctx.fillRect(cupPadding, cupPadding, canvas.width - cupPadding * 2, canvas.height - cupPadding * 2);
    ctx.fillStyle = textColor === '#FFFFFF' || textColor === 'rgb(255, 255, 255)' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        ctx.beginPath();
        ctx.arc(x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) drawBlock(ctx, x, y, PIECE_COLORS[cell - 1], BLOCK_SIZE);
      });
    });
    if (piece) {
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) drawBlock(ctx, piece.pos.x + x, piece.pos.y + y, piece.color, BLOCK_SIZE);
        });
      });
    }
    if (!isStarted && !isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 14px var(--font-geist-mono)';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText('INJECT SEQUENCE', canvas.width / 2, canvas.height / 2 - 15);
      ctx.fillStyle = amberColor;
      ctx.font = 'bold 16px var(--font-geist-mono)';
      ctx.letterSpacing = '4px';
      ctx.fillText('PRESS SPACE', canvas.width / 2, canvas.height / 2 + 25);
    }
    if (isPaused) {
      ctx.fillStyle = textColor === '#FFFFFF' || textColor === 'rgb(255, 255, 255)' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 20px var(--font-geist-mono)';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '8px';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
  }, [grid, piece, isPaused, isStarted, isGameOver, themeTick]);

  useEffect(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const styles = getComputedStyle(document.body);
    const surfaceInset = styles.getPropertyValue('--surface-inset').trim();
    ctx.fillStyle = surfaceInset;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!isStarted || !nextPiece) return;
    const bSize = 20;
    const shape = nextPiece.shape;
    const color = nextPiece.color;
    const offsetX = (canvas.width - shape[0].length * bSize) / 2;
    const offsetY = (canvas.height - shape.length * bSize) / 2;
    const drawB = (c: CanvasRenderingContext2D, x: number, y: number, col: string) => {
      const padding = 1;
      const size = bSize - padding * 2;
      const rx = offsetX + x * bSize + padding;
      const ry = offsetY + y * bSize + padding;
      c.fillStyle = col;
      c.fillRect(rx, ry, size, size);
      c.fillStyle = 'rgba(255, 255, 255, 0.1)';
      c.fillRect(rx, ry, size, 2);
      c.fillRect(rx, ry, 2, size);
    };
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) drawB(ctx, x, y, color);
      });
    });
  }, [nextPiece, themeTick, isStarted]);

  if (!gameActive) {
    return (
      <div className="w-[300px] h-[600px] flex items-center justify-center inset p-8 text-center rounded-2xl">
        <p className="text-muted text-sm uppercase tracking-widest">Protocol Offline</p>
      </div>
    );
  }

  return (
    <div className="raised p-8 lg:p-10 pb-6 lg:pb-8 rounded-[40px] lg:rounded-[60px] flex flex-col items-center relative overflow-hidden animate-in fade-in zoom-in duration-700">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
      
      {/* Console Header */}
      <div className="w-full flex justify-between items-end mb-8 px-2">
         <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-text font-black">Matrix Protocol</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber font-bold opacity-80">Series_01 // ACTIVE</span>
         </div>
         <div className="inset px-4 py-1.5 rounded-full border border-white/5">
            <span className="text-[10px] text-muted font-mono font-bold tracking-widest">LOCAL_CORE</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 lg:gap-12 relative z-10">
        {/* Main Game Screen */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-white/5 dark:bg-black/20 rounded-sm blur-sm pointer-events-none opacity-50"></div>
          <div className="cursor-pointer" onClick={() => !isStarted && handleStart()}>
            <canvas
              ref={canvasRef}
              width={COLS * BLOCK_SIZE}
              height={ROWS * BLOCK_SIZE}
              className="relative z-10 border border-stroke shadow-2xl rounded-sm transition-all duration-500"
            />
          </div>
        </div>

        {/* Side Integrated HUD */}
        <div className="flex flex-row md:flex-col justify-between md:justify-start gap-8 md:gap-12 min-w-[140px] w-full md:w-auto self-stretch">
          
          <div className="flex flex-col gap-8">
            {/* Next Piece Display */}
            <div className="flex flex-col items-center md:items-start">
              <span className="text-muted text-xs uppercase tracking-[0.2em] mb-3 font-black opacity-60">Next_Obj</span>
              <div className="p-1.5 inset rounded-2xl border border-white/5">
                <canvas
                  ref={nextCanvasRef}
                  width={100}
                  height={100}
                  className="rounded-xl opacity-90"
                />
              </div>
            </div>

            {/* Stats Display */}
            <div className="flex flex-col gap-6 lg:gap-8 font-mono">
              <div className="border-l-4 border-amber/40 pl-5 py-1">
                <div className="text-muted text-xs uppercase tracking-[0.15em] mb-1 font-black opacity-60">Score</div>
                <div className="text-3xl lg:text-4xl text-text font-black tracking-tighter tabular-nums">{score}</div>
              </div>
              <div className="border-l-4 border-white/10 pl-5 py-1">
                <div className="text-muted text-xs uppercase tracking-[0.15em] mb-1 font-black opacity-60">Lines</div>
                <div className="text-3xl lg:text-4xl text-text font-black tracking-tighter opacity-60 tabular-nums">{lines}</div>
              </div>
            </div>
          </div>

          {/* NEW DECORATIVE AREA */}
          <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-white/5 gap-4">
             {/* Level Progress Segments */}
             <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted font-black opacity-40">Level_Buffer</span>
                <div className="flex gap-1.5">
                   {Array.from({ length: 10 }).map((_, i) => (
                     <div 
                       key={i} 
                       className={`h-2.5 w-1.5 rounded-[1px] transition-all duration-300 ${i < progressToNextLevel ? 'bg-amber shadow-[0_0_5px_var(--amber)]' : 'inset opacity-20'}`}
                     ></div>
                   ))}
                </div>
             </div>

             {/* Technical Decals */}
             <div className="flex flex-col font-mono text-[8px] leading-tight text-muted opacity-30 uppercase font-bold tracking-widest">
                <span>Ref: TR-MOD-01</span>
                <span>Data_Stream: OK</span>
             </div>

             {/* Decorative Cooling Vents */}
             <div className="flex flex-col gap-1.5">
                <div className="h-[1px] w-full inset opacity-20"></div>
                <div className="h-[1px] w-3/4 inset opacity-20"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Bar */}
      <div className="w-full mt-8 pt-4 border-t border-white/5 flex justify-center items-center gap-6 opacity-30">
         <div className="w-2 h-2 rounded-full inset"></div>
         <div className="w-20 h-1.5 inset rounded-full"></div>
         <div className="w-2 h-2 rounded-full inset bg-amber shadow-[0_0_8px_var(--amber)]"></div>
      </div>
    </div>
  );
}
