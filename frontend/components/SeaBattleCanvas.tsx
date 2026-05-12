'use client';

import React, { useEffect, useRef } from 'react';

interface SeaBattleCanvasProps {
  type: 'OWN' | 'ENEMY';
  isActive: boolean;
  grid: number[][];
  onCellClick?: (x: number, y: number) => void;
  revealShips?: boolean;
}

const GRID_SIZE = 10;
const CELL_SIZE = 35;
const PADDING = 25;

export default function SeaBattleCanvas({ type, isActive, grid, onCellClick, revealShips }: SeaBattleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !onCellClick) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - PADDING;
    const y = e.clientY - rect.top - PADDING;
    const cellX = Math.floor(x / CELL_SIZE);
    const cellY = Math.floor(y / CELL_SIZE);
    if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
      onCellClick(cellX, cellY);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Labels
    ctx.font = 'bold 9px var(--font-geist-mono)';
    ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const letters = 'ABCDEFGHIJ'.split('');
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.fillText(letters[i], PADDING + i * CELL_SIZE + CELL_SIZE/2, PADDING / 2);
      ctx.fillText((i + 1).toString(), PADDING / 2, PADDING + i * CELL_SIZE + CELL_SIZE/2);
    }

    // Grid Dots & Objects
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cx = PADDING + x * CELL_SIZE + CELL_SIZE / 2;
        const cy = PADDING + y * CELL_SIZE + CELL_SIZE / 2;
        const cell = grid[y] ? grid[y][x] : 0;

        // Background Dot
        ctx.beginPath();
        ctx.arc(cx, cy, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 65, 0.15)';
        ctx.fill();

        // DRAW OBJECTS
        if (cell >= 10) {
          if (type === 'OWN') {
            // Own Ship (Visible)
            ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
            ctx.lineWidth = 1;
            ctx.fillRect(PADDING + x * CELL_SIZE + 4, PADDING + y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
            ctx.strokeRect(PADDING + x * CELL_SIZE + 4, PADDING + y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
          } else if (type === 'ENEMY' && revealShips) {
            // Revealed Enemy Ship (Dim Red)
            ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.lineWidth = 1;
            ctx.fillRect(PADDING + x * CELL_SIZE + 6, PADDING + y * CELL_SIZE + 6, CELL_SIZE - 12, CELL_SIZE - 12);
            ctx.strokeRect(PADDING + x * CELL_SIZE + 6, PADDING + y * CELL_SIZE + 6, CELL_SIZE - 12, CELL_SIZE - 12);
          }
        }

        if (cell === 2) {
          // MISS
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 65, 0.4)';
          ctx.fill();
        }

        if (cell === 3 || cell < 0) {
          // HIT
          ctx.strokeStyle = '#00FF41';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(PADDING + x * CELL_SIZE + 8, PADDING + y * CELL_SIZE + 8);
          ctx.lineTo(PADDING + (x+1) * CELL_SIZE - 8, PADDING + (y+1) * CELL_SIZE - 8);
          ctx.moveTo(PADDING + (x+1) * CELL_SIZE - 8, PADDING + y * CELL_SIZE + 8);
          ctx.lineTo(PADDING + x * CELL_SIZE + 8, PADDING + (y+1) * CELL_SIZE - 8);
          ctx.stroke();
        }
      }
    }

    // Main Grid Lines
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.moveTo(PADDING + i * CELL_SIZE, PADDING);
      ctx.lineTo(PADDING + i * CELL_SIZE, PADDING + GRID_SIZE * CELL_SIZE);
      ctx.moveTo(PADDING, PADDING + i * CELL_SIZE);
      ctx.lineTo(PADDING + GRID_SIZE * CELL_SIZE, PADDING + i * CELL_SIZE);
    }
    ctx.stroke();

    if (isActive) {
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(PADDING - 2, PADDING - 2, GRID_SIZE * CELL_SIZE + 4, GRID_SIZE * CELL_SIZE + 4);
    }

  }, [isActive, type, grid, revealShips]);

  return (
    <canvas 
      ref={canvasRef}
      onClick={handleClick}
      width={GRID_SIZE * CELL_SIZE + PADDING * 2}
      height={GRID_SIZE * CELL_SIZE + PADDING * 2}
      className={`rounded-lg transition-all duration-500 ${isActive ? 'opacity-100 scale-[1.02]' : 'opacity-40 grayscale-[0.5]'}`}
    />
  );
}
