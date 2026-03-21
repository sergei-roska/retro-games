'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeCanvasProps {
  gridSize: 20 | 30;
  mode: 'CLASSIC' | 'MISSION';
  useFirewalls: boolean;
  useDataPackets: boolean;
  gameState: 'PLAYING' | 'GAMEOVER' | 'VICTORY';
  onGameOver: (score: number) => void;
  onVictory: () => void;
  onScoreChange: (score: number) => void;
  onLevelChange: (level: number) => void;
  onVelocityChange: (velocity: number) => void;
  onEat: () => void;
}

type Point = { x: number; y: number };

export default function SnakeCanvas({
  gridSize,
  mode,
  useFirewalls,
  useDataPackets,
  gameState,
  onGameOver,
  onVictory,
  onScoreChange,
  onLevelChange,
  onVelocityChange,
  onEat
}: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState<Point>({ x: 1, y: 0 });
  const [firewalls, setFirewalls] = useState<Point[]>([]);
  const [dataPacket, setDataPacket] = useState<(Point & { type: 'SLOW_MO' | 'GHOST' }) | null>(null);
  const [isGhost, setIsGhost] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const cellSize = 600 / gridSize;

  const getRandomPoint = useCallback((): Point => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  }, [gridSize]);

  const spawnFood = useCallback((currentSnake: Point[], currentFirewalls: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = getRandomPoint();
      const onSnake = currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
      const onWall = currentFirewalls.some(w => w.x === newFood.x && w.y === newFood.y);
      if (!onSnake && !onWall) break;
    }
    return newFood;
  }, [getRandomPoint]);

  const playPulse = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Frequency based on level: slightly higher as we speed up
      osc.frequency.setValueAtTime(60 + levelRef.current * 2, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, []);

  const move = useCallback(() => {
    if (gameState !== 'PLAYING' || !isStarted) return;

    // Play procedural pulse sync with move
    playPulse();

    setDirection(nextDirection); // Update direction for the current move
    const currentSnake = snakeRef.current;
    const head = currentSnake[0];
    const newHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y };

    // Collision: Walls
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
      onGameOver(scoreRef.current);
      return;
    }

    // Collision: Self
    if (!isGhost && currentSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      onGameOver(scoreRef.current);
      return;
    }

    // Collision: Firewalls
    if (firewalls.some(fw => fw.x === newHead.x && fw.y === newHead.y)) {
      onGameOver(scoreRef.current);
      return;
    }

    let growing = false;
    // Eat Food
    if (newHead.x === food.x && newHead.y === food.y) {
      growing = true;
      scoreRef.current += 1;
      onScoreChange(scoreRef.current);
      onEat();
      
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 50);

      // Level Up Logic
      const newLevel = Math.floor(scoreRef.current / 5) + 1;
      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel;
        onLevelChange(newLevel);
        if (mode === 'MISSION' && newLevel >= 11) {
          onVictory();
          return;
        }
        const vels = [150, 140, 130, 120, 110, 100, 95, 85, 75, 50];
        onVelocityChange(vels[Math.min(newLevel - 1, 9)]);
        if (useFirewalls && newLevel >= 6) {
          setFirewalls(prev => [...prev, spawnFood([newHead, ...currentSnake], prev)]);
        }
      }

      setFood(spawnFood([newHead, ...currentSnake], firewalls));

      if (useDataPackets && Math.random() < 0.15 && !dataPacket) {
         const type = Math.random() > 0.5 ? 'SLOW_MO' : 'GHOST';
         setDataPacket({ ...spawnFood([newHead, ...currentSnake], firewalls), type });
      }
    }

    // Data Packet?
    if (dataPacket && newHead.x === dataPacket.x && newHead.y === dataPacket.y) {
      if (dataPacket.type === 'SLOW_MO') {
        const velocities = [150, 140, 130, 120, 110, 100, 95, 85, 75, 50];
        onVelocityChange(300);
        setTimeout(() => onVelocityChange(velocities[Math.min(levelRef.current - 1, 9)]), 5000);
      } else {
        setIsGhost(true);
        setTimeout(() => setIsGhost(false), 5000);
      }
      setDataPacket(null);
    }

    const newSnake = growing ? [newHead, ...currentSnake] : [newHead, ...currentSnake.slice(0, -1)];
    snakeRef.current = newSnake;
    setSnake(newSnake);
  }, [gameState, isStarted, nextDirection, gridSize, isGhost, firewalls, food, onGameOver, onScoreChange, onEat, mode, onLevelChange, onVictory, onVelocityChange, useFirewalls, spawnFood, useDataPackets, dataPacket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      
      if (!isStarted) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          setIsStarted(true);
        }
      }

      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setNextDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setNextDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setNextDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setNextDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setThemeTick(t => t + 1);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (gameState === 'PLAYING') {
      const velocities = [200, 190, 180, 170, 160, 150, 140, 130, 110, 80];
      const currentVel = velocities[Math.min(levelRef.current - 1, 9)];
      intervalId = setInterval(move, currentVel);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [gameState, move]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(document.body);
    const bgColor = styles.getPropertyValue('--bg').trim() || '#0A0A0A';
    const textColor = styles.getPropertyValue('--text').trim() || '#FFFFFF';
    const mutedColor = styles.getPropertyValue('--muted').trim() || '#8E8E93';
    const amberColor = styles.getPropertyValue('--amber').trim() || '#D87E4A';
    const greenColor = styles.getPropertyValue('--green').trim() || '#618D68';
    const redColor = styles.getPropertyValue('--red').trim() || '#EF4444';

    // Draw Loop
    const draw = () => {
      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 600, 600);

      // Dynamic Grid
      ctx.strokeStyle = textColor === '#FFFFFF' || textColor === 'rgb(255, 255, 255)' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, 600);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(600, i * cellSize);
        ctx.stroke();
      }

      // Firewalls
      ctx.fillStyle = '#2A1010';
      firewalls.forEach(fw => {
        ctx.fillRect(fw.x * cellSize + 2, fw.y * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.strokeStyle = '#EF4444';
        ctx.strokeRect(fw.x * cellSize + 4, fw.y * cellSize + 4, cellSize - 8, cellSize - 8);
      });

      // Data Packet
      if (dataPacket) {
        ctx.fillStyle = dataPacket.type === 'SLOW_MO' ? '#60A5FA' : '#C084FC';
        ctx.fillRect(dataPacket.x * cellSize + 4, dataPacket.y * cellSize + 4, cellSize - 8, cellSize - 8);
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        ctx.strokeRect(dataPacket.x * cellSize + 2, dataPacket.y * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.shadowBlur = 0;
      }

      // Neon Core (Food)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#EF4444';
      ctx.stroke();
      ctx.shadowBlur = 0;

       // Crawler (Snake)
      snake.forEach((s, i) => {
        const opacity = Math.max(0.2, 1 - (i / snake.length));
        ctx.globalAlpha = opacity;
        const color = levelRef.current <= 5 ? greenColor : 
                    levelRef.current <= 9 ? amberColor : 
                    redColor;
        
        ctx.fillStyle = color;
        const padding = i === 0 ? 1 : 2;
        ctx.fillRect(s.x * cellSize + padding, s.y * cellSize + padding, cellSize - padding*2, cellSize - padding*2);
        
        if (i === 0) {
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.strokeRect(s.x * cellSize + 1, s.y * cellSize + 1, cellSize - 2, cellSize - 2);
          ctx.shadowBlur = 0;
        }
      });
      ctx.globalAlpha = 1.0;

      // Glitch Overlay
      if (isGlitching) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
         ctx.fillRect(0, Math.random() * 600, 600, 2);
         ctx.translate(Math.random() * 4 - 2, 0);
      } else {
         ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      if (gameState === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 600, 600);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px var(--font-geist-mono)';
        ctx.textAlign = 'center';
        ctx.fillText('TERMINAL FAILURE', 300, 280);
        ctx.font = '14px var(--font-geist-mono)';
        ctx.fillText('CRITICAL CORE COLLISION DETECTED', 300, 320);
      }

      if (gameState === 'VICTORY') {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 600, 600);
        ctx.fillStyle = '#618D68';
        ctx.font = 'bold 32px var(--font-geist-mono)';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION SUCCESS', 300, 280);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px var(--font-geist-mono)';
        ctx.fillText('CORE STABILIZED // SEQUENCE COMPLETE', 300, 320);
      }
    };

    const animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame);
  }, [snake, food, firewalls, gridSize, cellSize, gameState, isGlitching, themeTick, isStarted]);

  return (
    <div className="raised p-1 rounded-2xl border border-stroke shadow-2xl overflow-hidden relative group">
       <canvas 
         ref={canvasRef} 
         width={600} 
         height={600} 
         className="max-w-full aspect-square"
       />
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-scanlines mix-blend-overlay" />
        
        {gameState === 'PLAYING' && !isStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="raised p-6 rounded-2xl animate-pulse backdrop-blur-sm border border-stroke/20">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-amber">
                   Press SPACE_OR_ARROWS to Initiate Tracing
                </span>
             </div>
          </div>
        )}
    </div>
  );
}
