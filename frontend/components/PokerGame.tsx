'use client';

import React, { useState, useCallback, useEffect } from 'react';

// --- TYPES & CONSTANTS ---
type Suit = 'H' | 'D' | 'C' | 'S';
type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; 

interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const SUIT_ICONS = { H: '♥', D: '♦', C: '♣', S: '♠' };
const RANK_LABELS: Record<number, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => RANKS.forEach(rank => deck.push({ suit, rank, id: `${rank}${suit}` })));
  return deck;
};

const shuffle = (deck: Card[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const evaluateHand = (hand: Card[]): { name: string; multiplier: number } => {
  const ranks = hand.map(c => c.rank).sort((a, b) => a - b);
  const suits = hand.map(c => c.suit);
  const isFlush = new Set(suits).size === 1;
  const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1) || 
                     (ranks[4] === 14 && ranks[0] === 2 && ranks[1] === 3 && ranks[2] === 4 && ranks[3] === 5);
  const counts: Record<number, number> = {};
  ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
  const valCounts = Object.values(counts).sort((a, b) => b - a);

  if (isStraight && isFlush && ranks[0] === 10) return { name: 'ROYAL FLUSH', multiplier: 250 };
  if (isStraight && isFlush) return { name: 'STRAIGHT FLUSH', multiplier: 50 };
  if (valCounts[0] === 4) return { name: 'FOUR OF A KIND', multiplier: 25 };
  if (valCounts[0] === 3 && valCounts[1] === 2) return { name: 'FULL HOUSE', multiplier: 9 };
  if (isFlush) return { name: 'FLUSH', multiplier: 6 };
  if (isStraight) return { name: 'STRAIGHT', multiplier: 4 };
  if (valCounts[0] === 3) return { name: 'THREE OF A KIND', multiplier: 3 };
  if (valCounts[0] === 2 && valCounts[1] === 2) return { name: 'TWO PAIR', multiplier: 2 };
  const pairRank = Number(Object.keys(counts).find(r => counts[Number(r)] === 2));
  if (valCounts[0] === 2 && pairRank >= 11) return { name: 'JACKS OR BETTER', multiplier: 1 };
  return { name: '', multiplier: 0 };
};

export default function PokerGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [credits, setScore] = useState(1000);
  const [bet] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'DEALT' | 'RESULT' | 'BANKRUPT'>('IDLE');
  const [message, setMessage] = useState('PRESS DEAL TO START');

  // Audio Engine
  const audioRefs = React.useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    const tracks = ['sfx_card_deal', 'sfx_chips', 'sfx_win', 'sfx_fold'];
    tracks.forEach(t => {
      const audio = new Audio(`/audio/poker/${t}.mp3`);
      audioRefs.current[t] = audio;
    });

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach(a => {
        if (a) {
          a.pause();
          a.src = '';
        }
      });
    };
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
    const saved = localStorage.getItem('poker_credits');
    if (saved) setScore(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('poker_credits', credits.toString());
  }, [credits]);

  const deal = () => {
    if (credits < bet) {
      setGameState('BANKRUPT');
      setMessage('CRITICAL FAILURE // NO CREDITS');
      playSFX('sfx_fold');
      return;
    }
    
    playSFX('sfx_chips');
    
    const newDeck = shuffle(createDeck());
    const newHand = newDeck.slice(0, 5);
    setDeck(newDeck.slice(5));
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setScore(prev => prev - bet);
    setGameState('DEALT');
    setMessage('SELECT CARDS TO HOLD');
    
    // Slight delay for card sound to feel natural
    setTimeout(() => playSFX('sfx_card_deal'), 100);
  };

  const draw = () => {
    playSFX('sfx_card_deal');
    const newHand = [...hand];
    const currentDeck = [...deck];
    held.forEach((isHeld, i) => { if (!isHeld) newHand[i] = currentDeck.shift()!; });
    setHand(newHand);
    const result = evaluateHand(newHand);
    if (result.multiplier > 0) {
      const win = bet * result.multiplier;
      setScore(prev => prev + win);
      setMessage(`${result.name} // +${win}`);
      setTimeout(() => playSFX('sfx_win'), 200);
    } else {
      setMessage('NO COMBINATION');
      playSFX('sfx_fold');
    }
    setGameState('RESULT');
  };

  const reInject = () => {
    playSFX('sfx_win');
    setScore(1000);
    setGameState('IDLE');
    setHand([]);
    setMessage('PROTOCOL RE-INITIALIZED');
  };

  const toggleHold = (i: number) => {
    if (gameState !== 'DEALT') return;
    playSFX('sfx_chips');
    const newHeld = [...held];
    newHeld[i] = !newHeld[i];
    setHeld(newHeld);
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl animate-in fade-in duration-700">
      
      {/* LCD Display HUD */}
      <div className="w-full raised p-8 rounded-[32px] flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
        
        <div className="w-full flex justify-between items-center mb-8 px-4 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold mb-1">Credits</span>
            <span className={`text-3xl font-black ${credits < bet ? 'text-red-500 animate-pulse' : 'text-amber'}`}>{credits}</span>
          </div>
          <div className="text-center">
            <div className="inset px-6 py-2 rounded-full mb-2">
               <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Protocol Status</span>
            </div>
            <span className={`text-xs uppercase tracking-widest font-black ${gameState === 'BANKRUPT' ? 'text-red-500' : 'text-text opacity-80'}`}>
              {message}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold mb-1">Current Bet</span>
            <span className="text-3xl font-black text-text/40">{bet}</span>
          </div>
        </div>

        {/* Hand Slots */}
        <div className="grid grid-cols-5 gap-4 w-full mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div 
                onClick={() => toggleHold(i)}
                className={`w-full aspect-[2/3] rounded-2xl cursor-pointer transition-all duration-300 transform 
                  ${(gameState === 'IDLE' || gameState === 'BANKRUPT') ? 'inset opacity-20' : held[i] ? 'raised scale-105 brightness-110' : 'raised'}
                  flex flex-col items-center justify-center relative group
                `}
              >
                {hand[i] ? (
                  <>
                    <span className={`text-3xl font-black font-mono mb-1 ${hand[i].suit === 'H' || hand[i].suit === 'D' ? 'text-amber' : 'text-text'}`}>
                      {RANK_LABELS[hand[i].rank]}
                    </span>
                    <span className={`text-xl ${hand[i].suit === 'H' || hand[i].suit === 'D' ? 'text-amber/60' : 'text-text/40'}`}>
                      {SUIT_ICONS[hand[i].suit]}
                    </span>
                    {held[i] && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-amber rounded-full animate-pulse shadow-[0_0_8px_var(--amber)]"></div>
                    )}
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white/5 opacity-20"></div>
                )}
              </div>
              
              <button
                disabled={gameState !== 'DEALT'}
                onClick={() => toggleHold(i)}
                className={`w-full py-2 rounded-xl font-mono text-[9px] font-black uppercase tracking-widest transition-all
                  ${held[i] ? 'raised text-amber shadow-[0_0_10px_rgba(216,126,74,0.3)]' : 'inset text-muted opacity-40 hover:opacity-100'}
                  disabled:cursor-not-allowed
                `}
              >
                {held[i] ? 'HELD' : 'HOLD'}
              </button>
            </div>
          ))}
        </div>

        {/* Main Controls */}
        <div className="flex gap-6 w-full max-w-sm">
          {gameState === 'BANKRUPT' ? (
            <button 
              onClick={reInject}
              className="flex-1 bg-red-500/20 border border-red-500/50 text-red-500 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95 hover:bg-red-500/30"
            >
              Re-Inject Credits
            </button>
          ) : gameState === 'DEALT' ? (
            <button 
              onClick={draw}
              className="flex-1 raised hover:brightness-110 text-text py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95"
            >
              Draw Cards
            </button>
          ) : (
            <button 
              onClick={deal}
              className="flex-1 raised hover:brightness-110 text-text py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95"
            >
              Deal Sequence
            </button>
          )}
        </div>
      </div>

      {/* Paytable */}
      <div className="w-full raised p-8 rounded-[32px] grid grid-cols-3 gap-8 opacity-60">
         <div className="space-y-2">
            <PaytableRow label="Royal Flush" val="2500" />
            <PaytableRow label="Straight Flush" val="500" />
            <PaytableRow label="Four of a Kind" val="250" />
         </div>
         <div className="space-y-2">
            <PaytableRow label="Full House" val="90" />
            <PaytableRow label="Flush" val="60" />
            <PaytableRow label="Straight" val="40" />
         </div>
         <div className="space-y-2">
            <PaytableRow label="Three of a Kind" val="30" />
            <PaytableRow label="Two Pair" val="20" />
            <PaytableRow label="Jacks or Better" val="10" />
         </div>
      </div>
    </div>
  );
}

function PaytableRow({ label, val }: { label: string, val: string }) {
  return (
    <div className="flex justify-between items-center font-mono border-b border-white/5 pb-1">
      <span className="text-[9px] uppercase tracking-widest text-muted">{label}</span>
      <span className="text-[10px] font-bold text-text/40">{val}</span>
    </div>
  );
}
