'use client';

import React, { useState } from 'react';
import TetrisCanvas from './TetrisCanvas';
import Leaderboard from './Leaderboard';
import GameInstructions from './GameInstructions';
import GameOverModal from './GameOverModal';
import { LeaderboardEntry, Homepage } from '@/types/strapi';
import { getLeaderboards, submitScore } from '@/lib/strapi';

interface GameContainerProps {
  homepage: Homepage;
  initialLeaderboard: LeaderboardEntry[];
}

export default function GameContainer({ homepage, initialLeaderboard }: GameContainerProps) {
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);
  const [velocity, setVelocity] = useState(1);
  const [gameKey, setGameKey] = useState(0);

  const handleGameOver = (score: number) => {
    setGameOverScore(score);
  };

  const handleSubmitScore = async (name: string) => {
    if (gameOverScore === null) return false;
    const success = await submitScore(name, gameOverScore);
    if (success) {
      setTimeout(async () => {
        const updated = await getLeaderboards();
        setLeaderboard(updated);
      }, 200);
    }
    return success;
  };

  const handleRestart = () => {
    setGameOverScore(null);
    setGameKey(prev => prev + 1);
    setVelocity(1);
  };

  return (
    <div className="w-full max-w-[1400px] flex flex-col items-center">
      {/* Flattened Header */}
      <div className="w-full mb-8 flex flex-col items-center">
        <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase italic leading-none mb-4 text-center">
          {homepage.title}
        </h1>
        <div 
          className="w-full max-w-4xl text-muted text-[10px] lg:text-xs uppercase tracking-[0.3em] font-bold opacity-50 text-center px-4"
          dangerouslySetInnerHTML={{ __html: homepage.description }}
        />
      </div>

      {/* Main Interface Grid */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12 w-full">
        
        {/* Left: Protocol */}
        <div className="hidden lg:block lg:sticky lg:top-12">
          <GameInstructions />
        </div>

        {/* Center: The Core Console */}
        <div className="flex flex-col items-center">
          <div className="md:hidden w-full aspect-[2/3] max-h-[400px] raised bg-surface flex items-center justify-center p-8 text-center rounded-3xl mb-8">
            <p className="text-muted text-[10px] uppercase tracking-[0.25em] font-bold leading-loose">
              Terminal access restricted.<br /> Use desktop/tablet class hardware.
            </p>
          </div>

          <div className="hidden md:block">
            <TetrisCanvas 
              key={gameKey}
              gameActive={homepage.gameActive} 
              onGameOver={handleGameOver} 
              onLevelChange={setVelocity}
            />
          </div>
        </div>

        {/* Right: Records & Velocity */}
        <div className="hidden lg:flex lg:flex-col gap-8 lg:sticky lg:top-12 min-w-[200px]">
          <Leaderboard entries={leaderboard} />
          
          {/* Velocity Display Block */}
          <div className="raised p-6 rounded-2xl flex flex-col items-center gap-4 animate-in slide-in-from-right-4 duration-500">
             <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-black opacity-50">Current Velocity</span>
             <div className="inset w-full py-4 flex items-center justify-center rounded-xl">
                <span className="text-4xl font-black text-green tracking-tighter animate-pulse">{velocity}</span>
             </div>
             <span className="text-[8px] uppercase tracking-[0.2em] text-muted font-bold opacity-30 italic">Protocol Level 0{velocity}</span>
          </div>
        </div>

        {/* Tablet/Mobile fallback */}
        <div className="lg:hidden flex flex-col gap-8 w-full max-w-2xl items-center mt-8">
           <div className="flex gap-8">
              <GameInstructions />
              <Leaderboard entries={leaderboard} />
           </div>
           <div className="raised p-6 rounded-2xl w-full flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-black">Velocity</span>
              <span className="text-3xl font-black text-green">{velocity}</span>
           </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOverScore !== null && (
        <GameOverModal 
          score={gameOverScore} 
          onSubmit={handleSubmitScore} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}
