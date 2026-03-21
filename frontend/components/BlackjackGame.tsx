'use client';

import React, { useState, useCallback, useEffect } from 'react';

// --- TYPES ---
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

// --- LOGIC ---
const calculateScore = (hand: Card[]) => {
  if (hand.length === 0) return 0;
  let score = 0;
  let aces = 0;
  hand.forEach(card => {
    if (card.rank === 14) {
      aces += 1;
      score += 11;
    } else if (card.rank >= 10) {
      score += 10;
    } else {
      score += card.rank;
    }
  });
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
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

export default function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [credits, setCredits] = useState(1000);
  const [activeBet, setActiveBet] = useState(10);
  const [isCharlieActive, setIsCharlieActive] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'DEALER_TURN' | 'RESULT' | 'BANKRUPT'>('IDLE');
  const [message, setMessage] = useState('INITIATE PROTOCOL // BET 10');

  // Audio Engine
  const audioRefs = React.useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    const tracks = ['sfx_card_deal', 'sfx_chips', 'sfx_win', 'sfx_fold'];
    tracks.forEach(t => {
      const audio = new Audio(`/audio/poker/${t}.mp3`);
      audioRefs.current[t] = audio;
    });

    return () => {
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
    const saved = localStorage.getItem('bj_credits');
    if (saved) setCredits(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('bj_credits', credits.toString());
  }, [credits]);

  const startNewGame = () => {
    if (credits < 10) {
      setGameState('BANKRUPT');
      setMessage('CRITICAL FAILURE // NO CREDITS');
      playSFX('sfx_fold');
      return;
    }
    
    playSFX('sfx_chips');
    setTimeout(() => playSFX('sfx_card_deal'), 150);

    const newDeck = shuffle(createDeck());
    const pHand = [newDeck.shift()!, newDeck.shift()!];
    const dHand = [newDeck.shift()!, newDeck.shift()!];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setCredits(prev => prev - 10);
    setActiveBet(10);
    setGameState('PLAYING');
    setMessage('PLAYER ACTION REQUIRED');

    if (calculateScore(pHand) === 21) {
      setMessage('BLACKJACK!');
      playSFX('sfx_win');
      handleStand(pHand, dHand, newDeck, 10);
    }
  };

  const handleHit = () => {
    if (gameState !== 'PLAYING') return;
    playSFX('sfx_card_deal');
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.shift()!];
    setPlayerHand(newHand);
    setDeck(newDeck);

    const score = calculateScore(newHand);
    if (score > 21) {
      setMessage('SYSTEM OVERLOAD // BUST');
      playSFX('sfx_fold');
      setGameState('RESULT');
    } else if (isCharlieActive && newHand.length >= 5) {
      // 5-Card Charlie Victory
      setCredits(prev => prev + (activeBet * 2));
      setMessage('CHARLIE PROTOCOL // VICTORY');
      playSFX('sfx_win');
      setGameState('RESULT');
    }
  };

  const handleDouble = () => {
    if (gameState !== 'PLAYING' || playerHand.length !== 2 || credits < 10) return;
    
    playSFX('sfx_chips');
    setTimeout(() => playSFX('sfx_card_deal'), 100);

    const currentBet = activeBet;
    setCredits(prev => prev - 10);
    setActiveBet(currentBet + 10);
    
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.shift()!];
    setPlayerHand(newHand);
    setDeck(newDeck);

    const score = calculateScore(newHand);
    if (score > 21) {
      setMessage('SYSTEM OVERLOAD // BUST');
      playSFX('sfx_fold');
      setGameState('RESULT');
    } else if (isCharlieActive && newHand.length >= 5) {
       setCredits(prev => prev + ((currentBet + 10) * 2));
       setMessage('CHARLIE PROTOCOL // VICTORY');
       playSFX('sfx_win');
       setGameState('RESULT');
    } else {
      handleStand(newHand, dealerHand, newDeck, currentBet + 10);
    }
  };

  const handleStand = (pHand = playerHand, dHand = dealerHand, currentDeck = deck, betOverride?: number) => {
    setGameState('DEALER_TURN');
    playSFX('sfx_chips');
    
    let tempDealerHand = [...dHand];
    let tempDeck = [...currentDeck];
    const finalBet = betOverride || activeBet;

    while (calculateScore(tempDealerHand) < 17) {
      tempDealerHand.push(tempDeck.shift()!);
    }

    setDealerHand(tempDealerHand);
    setDeck(tempDeck);
    
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(tempDealerHand);

    if (dScore > 21 || pScore > dScore) {
      setCredits(prev => prev + (finalBet * 2));
      setMessage('VICTORY // CREDITS SYNCED');
      playSFX('sfx_win');
    } else if (pScore < dScore) {
      setMessage('DEFEAT // SEQUENCE TERMINATED');
      playSFX('sfx_fold');
    } else {
      setCredits(prev => prev + finalBet);
      setMessage('DRAW // PROTOCOL RECOVERY');
      playSFX('sfx_chips');
    }
    setGameState('RESULT');
  };

  const getDealerVisibleScore = () => {
    if (dealerHand.length === 0) return 0;
    if (gameState === 'PLAYING') return calculateScore([dealerHand[0]]);
    return calculateScore(dealerHand);
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl animate-in fade-in duration-700">
      
      {/* Settings / Options Area */}
      {gameState === 'IDLE' && (
        <div className="w-full max-w-sm flex items-center justify-between raised p-6 rounded-2xl animate-in slide-in-from-top-4">
           <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-text font-black">Charlie Protocol</span>
              <span className="text-[8px] uppercase tracking-widest text-muted font-bold opacity-60">5 Cards = Auto Win</span>
           </div>
           <button 
             onClick={() => {
               setIsCharlieActive(!isCharlieActive);
               playSFX('sfx_chips');
             }}
             className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isCharlieActive ? 'bg-green/40' : 'inset'}`}
           >
              <div className={`w-6 h-6 rounded-full transition-all duration-300 shadow-lg ${isCharlieActive ? 'bg-green translate-x-6' : 'raised translate-x-0'}`}></div>
           </button>
        </div>
      )}

      {/* LCD Display HUD */}
      <div className="w-full raised p-10 rounded-[40px] flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
        
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-12 font-mono">
          <div className="flex flex-col flex-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold mb-1">Bank</span>
            <span className={`text-3xl font-black ${credits < 10 ? 'text-red-500 animate-pulse' : 'text-green'}`}>{credits}</span>
          </div>
          
          <div className="text-center px-4 flex-none">
            <div className="inset px-8 py-2 rounded-full mb-3 flex items-center justify-center gap-3 mx-auto w-fit">
               <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">BLACKJACK</span>
               {isCharlieActive && <div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse"></div>}
            </div>
            <span className={`block text-xs uppercase tracking-[0.2em] font-black ${gameState === 'BANKRUPT' ? 'text-red-500' : 'text-text opacity-80'}`}>
              {message}
            </span>
          </div>
          
          <div className="flex flex-col items-end flex-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold mb-1">Current Bet</span>
            <span className={`text-3xl font-black transition-all ${activeBet > 10 ? 'text-amber scale-110' : 'text-text/40'}`}>
              {gameState === 'IDLE' || gameState === 'BANKRUPT' ? '0' : activeBet}
            </span>
          </div>
        </div>

        {/* Game Board */}
        <div className="w-full flex flex-col gap-12 mb-12">
          {/* Dealer Area */}
          <div className="flex flex-col items-center gap-4">
             <div className="flex gap-4 justify-center h-32">
                {dealerHand.map((card, i) => (
                  <CardTile key={i} card={card} hidden={gameState === 'PLAYING' && i === 1} />
                ))}
                {dealerHand.length === 0 && <EmptySlot count={2} />}
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.4em] text-muted opacity-30 font-bold">Dealer Sequence</span>
                {dealerHand.length > 0 && (
                  <span className="text-sm font-mono font-black text-text/40">[{getDealerVisibleScore()}{gameState === 'PLAYING' ? '+' : ''}]</span>
                )}
             </div>
          </div>

          <div className="h-[1px] w-full bg-white/5 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inset px-4 py-1 rounded-full">
                <span className="text-[10px] text-muted font-mono font-bold">VS</span>
             </div>
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center gap-4">
             <div className="flex gap-4 justify-center h-32">
                {playerHand.map((card, i) => (
                  <CardTile key={i} card={card} />
                ))}
                {playerHand.length === 0 && <EmptySlot count={2} />}
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.4em] text-muted opacity-30 font-bold">Player Sequence</span>
                {playerHand.length > 0 && (
                  <span className="text-sm font-mono font-black text-green">[{calculateScore(playerHand)}]</span>
                )}
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-lg">
          {gameState === 'IDLE' || gameState === 'RESULT' || gameState === 'BANKRUPT' ? (
            gameState === 'BANKRUPT' ? (
              <button onClick={() => {setCredits(1000); setGameState('IDLE');}} className="flex-1 bg-red-500/20 border border-red-500/50 text-red-500 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95">Re-Inject Credits</button>
            ) : (
              <button onClick={startNewGame} className="flex-1 raised hover:brightness-110 text-text py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-95">Deal Initial Hand</button>
            )
          ) : (
            <>
              <button onClick={handleHit} disabled={gameState !== 'PLAYING'} className="flex-1 raised hover:brightness-110 text-text py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all active:scale-95">Hit</button>
              
              {playerHand.length === 2 && credits >= 10 && (
                <button onClick={handleDouble} disabled={gameState !== 'PLAYING'} className="flex-1 raised hover:text-amber text-amber/80 border border-amber/20 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all active:scale-95">Double</button>
              )}

              <button onClick={() => handleStand()} disabled={gameState !== 'PLAYING'} className="flex-1 raised hover:text-green text-text py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all active:scale-95">Stand</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CardTile({ card, hidden = false }: { card: Card, hidden?: boolean }) {
  return (
    <div className={`w-20 aspect-[2/3] rounded-xl flex flex-col items-center justify-center transition-all duration-500 ${hidden ? 'inset opacity-40' : 'raised animate-in zoom-in-95'}`}>
      {!hidden ? (
        <>
          <span className={`text-2xl font-black font-mono mb-1 ${card.suit === 'H' || card.suit === 'D' ? 'text-amber' : 'text-text'}`}>
            {RANK_LABELS[card.rank]}
          </span>
          <span className={`text-lg ${card.suit === 'H' || card.suit === 'D' ? 'text-amber/60' : 'text-text/40'}`}>
            {SUIT_ICONS[card.suit]}
          </span>
        </>
      ) : (
        <div className="w-4 h-4 rounded-full border border-white/10 animate-pulse"></div>
      )}
    </div>
  );
}

function EmptySlot({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-20 aspect-[2/3] rounded-xl inset opacity-10"></div>
      ))}
    </>
  );
}
