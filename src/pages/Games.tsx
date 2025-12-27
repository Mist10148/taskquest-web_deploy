import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spade, Hand, Type, Sparkles, ArrowLeft, RotateCcw, Loader2, Gamepad2, Trophy, Zap, Info, Crown, Target, Dice1, Minus, Plus, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRecordGame, useGameHistory, HANGMAN_WORDS, BLACKJACK_CONFIG } from "@/hooks/useApi";
import { toast } from "sonner";

type GameType = "menu" | "blackjack" | "rps" | "hangman";
interface Card { suit: "♠" | "♥" | "♦" | "♣"; value: string; numericValue: number; }

// Neon Number Input Component
const NeonNumberInput = ({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) => {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(Math.min(max, value + step));
  
  return (
    <div className="flex items-center gap-1 bg-background-secondary/50 rounded-lg border border-border p-1">
      <button 
        onClick={decrease} 
        disabled={value <= min}
        className="h-8 w-8 rounded-md flex items-center justify-center bg-background hover:bg-primary/20 hover:text-primary disabled:opacity-30 disabled:hover:bg-background transition-all border border-transparent hover:border-primary/50 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value) || min;
            onChange(Math.min(max, Math.max(min, v)));
          }}
          min={min}
          max={max}
          className="w-16 h-8 bg-background border border-border rounded-md text-center font-heading font-bold text-lg focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Sparkles className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-xp opacity-60" />
      </div>
      <button 
        onClick={increase}
        disabled={value >= max}
        className="h-8 w-8 rounded-md flex items-center justify-center bg-background hover:bg-primary/20 hover:text-primary disabled:opacity-30 disabled:hover:bg-background transition-all border border-transparent hover:border-primary/50 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

const createDeck = (): Card[] => {
  const suits: Card["suit"][] = ["♠", "♥", "♦", "♣"];
  const values = [{ v: "A", n: 11 }, { v: "2", n: 2 }, { v: "3", n: 3 }, { v: "4", n: 4 }, { v: "5", n: 5 }, { v: "6", n: 6 }, { v: "7", n: 7 }, { v: "8", n: 8 }, { v: "9", n: 9 }, { v: "10", n: 10 }, { v: "J", n: 10 }, { v: "Q", n: 10 }, { v: "K", n: 10 }];
  return suits.flatMap(suit => values.map(({ v, n }) => ({ suit, value: v, numericValue: n }))).sort(() => Math.random() - 0.5);
};

const calcHand = (cards: Card[]): number => {
  let total = cards.reduce((s, c) => s + c.numericValue, 0), aces = cards.filter(c => c.value === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
};

const PlayingCard = ({ card, hidden }: { card: Card; hidden?: boolean }) => {
  if (hidden) return <div className="w-12 h-18 sm:w-16 sm:h-24 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 flex items-center justify-center text-xl sm:text-2xl text-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]">?</div>;
  return <motion.div initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} className={cn("w-12 h-18 sm:w-16 sm:h-24 rounded-lg bg-foreground border-2 border-border flex flex-col items-center justify-center shadow-lg", ["♥","♦"].includes(card.suit) ? "text-destructive" : "text-background")}><span className="text-base sm:text-lg font-bold">{card.value}</span><span className="text-lg sm:text-xl">{card.suit}</span></motion.div>;
};

// Game Instructions Component
const GameInstructions = ({ game }: { game: 'blackjack' | 'rps' | 'hangman' }) => {
  const [expanded, setExpanded] = useState(false);
  
  const instructions = {
    blackjack: [
      "🎯 Goal: Get as close to 21 without going over",
      "🃏 Number cards = face value, Face cards = 10, Ace = 11 or 1",
      "👆 Hit = draw card, ✋ Stand = keep hand",
      "💰 Blackjack pays 1.5x, Win pays 1x, Push returns bet"
    ],
    rps: [
      "🪨 Rock beats ✂️ Scissors",
      "📄 Paper beats 🪨 Rock", 
      "✂️ Scissors beats 📄 Paper",
      "🛡️ 100% Risk-free! Lose = no XP lost"
    ],
    hangman: [
      "🔤 Guess the hidden word letter by letter",
      "❤️ You have 6 lives (wrong guesses)",
      "🎁 Win bonus: +10 XP per remaining life",
      "💀 Lose all lives = lose entry fee"
    ]
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-xs text-foreground-muted hover:text-primary transition-colors mx-auto">
        <HelpCircle className="h-3.5 w-3.5" />
        {expanded ? 'Hide' : 'Show'} Rules
      </button>
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 p-3 rounded-lg bg-background-secondary/50 border border-border/50">
          <ul className="space-y-1.5">
            {instructions[game].map((rule, i) => (
              <li key={i} className="text-xs text-foreground-muted">{rule}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

// Blackjack Game with neon styling
const BlackjackGame = ({ onBack, bet, onResult }: { onBack: () => void; bet: number; onResult: (r: string, p: number) => void }) => {
  const [deck, setDeck] = useState(createDeck), [pHand, setPHand] = useState<Card[]>([]), [dHand, setDHand] = useState<Card[]>([]), [state, setState] = useState<"bet"|"play"|"end">("bet"), [result, setResult] = useState<string|null>(null);
  
  const end = (r: string) => { 
    setResult(r); setState("end"); 
    const payout = r === "blackjack" ? Math.floor(bet * BLACKJACK_CONFIG.BLACKJACK_MULTIPLIER) + bet : r === "win" ? bet * 2 : r === "push" ? bet : 0;
    const apiResult = r === "lose" ? "lost" : r === "win" ? "won" : r;
    onResult(apiResult, payout); 
  };
  
  const start = () => { const d = createDeck(), p = [d.pop()!, d.pop()!], de = [d.pop()!, d.pop()!]; setDeck(d); setPHand(p); setDHand(de); setState("play"); setResult(null); if (calcHand(p) === 21) setTimeout(() => end("blackjack"), 500); };
  const hit = () => { const c = deck.pop()!, h = [...pHand, c]; setPHand(h); setDeck([...deck]); if (calcHand(h) > 21) end("lose"); };
  const stand = () => { let d = [...dHand], dk = [...deck]; while (calcHand(d) < 17) d.push(dk.pop()!); setDHand(d); const pt = calcHand(pHand), dt = calcHand(d); if (dt > 21 || pt > dt) end("win"); else if (pt < dt) end("lose"); else end("push"); };
  
  const pt = calcHand(pHand), dt = calcHand(dHand);
  const getDisplayPayout = () => {
    if (result === "blackjack") return Math.floor(bet * BLACKJACK_CONFIG.BLACKJACK_MULTIPLIER);
    if (result === "win") return bet;
    if (result === "push") return 0;
    return -bet;
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-foreground-muted hover:text-primary text-sm group transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />Back
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-xp/20 to-xp/5 border border-xp/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
          <Sparkles className="h-4 w-4 text-xp" />
          <span className="font-heading font-bold text-xp">{bet} XP</span>
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        {/* Neon border glow */}
        <div className="absolute inset-0 rounded-2xl border border-primary/20" style={{ boxShadow: 'inset 0 0 30px rgba(99,102,241,0.05)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="relative">
          {state === "bet" ? (
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Spade className="h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-xp shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Blackjack</h2>
              <p className="text-foreground-muted mb-6">Get as close to 21 as possible!</p>
              <Button onClick={start} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-[0_0_20px_rgba(99,102,241,0.4)] border-0">
                <Gamepad2 className="h-4 w-4" /> Deal Cards ({bet} XP)
              </Button>
              <GameInstructions game="blackjack" />
            </div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-foreground-muted">Dealer</span>
                  {state === "end" && <span className="font-bold font-heading text-lg">{dt}</span>}
                </div>
                <div className="flex gap-2 flex-wrap">{dHand.map((c, i) => <PlayingCard key={i} card={c} hidden={i === 1 && state === "play"} />)}</div>
              </div>
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-foreground-muted">You</span>
                  <span className={cn("font-bold font-heading text-lg", pt > 21 ? "text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : pt === 21 ? "text-success drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "")}>{pt}</span>
                </div>
                <div className="flex gap-2 flex-wrap">{pHand.map((c, i) => <PlayingCard key={i} card={c} />)}</div>
              </div>
              {state === "play" && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={hit} className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] border-0">
                    <Zap className="h-4 w-4" /> Hit
                  </Button>
                  <Button variant="outline" onClick={stand} className="flex-1 sm:flex-none hover:border-primary/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">Stand</Button>
                </div>
              )}
              {state === "end" && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className={cn("text-2xl sm:text-3xl font-heading font-bold mb-2", result && ["win","blackjack"].includes(result) ? "text-success drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" : result === "lose" ? "text-destructive drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "")}>
                    {result === "blackjack" && "🎉 BLACKJACK!"}{result === "win" && "✅ YOU WIN!"}{result === "lose" && "❌ YOU LOSE"}{result === "push" && "🤝 PUSH"}
                  </div>
                  <p className={cn("text-xl font-bold mb-4", getDisplayPayout() > 0 ? "text-success" : getDisplayPayout() < 0 ? "text-destructive" : "text-foreground-muted")}>
                    {getDisplayPayout() > 0 ? `+${getDisplayPayout()}` : getDisplayPayout() === 0 ? "±0" : getDisplayPayout()} XP
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button onClick={start} className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] border-0"><RotateCcw className="h-4 w-4" /> Play Again</Button>
                    <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none hover:border-primary/50">Exit</Button>
                  </div>
                </motion.div>
              )}
              {state !== "bet" && <GameInstructions game="blackjack" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// RPS Game with neon styling
const RPSGame = ({ onBack, bet, onResult }: { onBack: () => void; bet: number; onResult: (r: string, p: number) => void }) => {
  const [state, setState] = useState<"pick"|"result">("pick"), [pChoice, setPChoice] = useState<string|null>(null), [cChoice, setCChoice] = useState<string|null>(null), [result, setResult] = useState<string|null>(null);
  const choices = ["🪨", "📄", "✂️"];
  
  const play = (p: string) => {
    const c = choices[Math.floor(Math.random() * 3)];
    setPChoice(p); setCChoice(c); setState("result");
    const win = (p === "🪨" && c === "✂️") || (p === "📄" && c === "🪨") || (p === "✂️" && c === "📄");
    const tie = p === c;
    const res = win ? "won" : tie ? "push" : "lost";
    setResult(res);
    onResult(res, win ? bet * 2 : tie ? bet : 0);
  };
  
  const reset = () => { setState("pick"); setPChoice(null); setCChoice(null); setResult(null); };
  const getXP = () => result === "won" ? bet : 0;

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-foreground-muted hover:text-primary text-sm group transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />Back
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="font-heading font-bold text-emerald-400">{bet} XP • Risk-free!</span>
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <div className="absolute inset-0 rounded-2xl border border-emerald-500/20" style={{ boxShadow: 'inset 0 0 30px rgba(16,185,129,0.05)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="relative">
          {state === "pick" ? (
            <div className="text-center">
              <Hand className="h-16 w-16 mx-auto text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Rock Paper Scissors</h2>
              <p className="text-foreground-muted text-sm mb-1">Win to earn XP, lose nothing!</p>
              <p className="text-xs text-emerald-400 mb-6 flex items-center justify-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                100% Risk-Free
              </p>
              <p className="text-foreground-muted text-sm mb-4">Choose your weapon:</p>
              <div className="flex justify-center gap-4">
                {choices.map(c => (
                  <motion.button key={c} whileHover={{ scale: 1.15, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => play(c)} className="text-5xl p-4 rounded-xl bg-background-secondary hover:bg-emerald-500/20 border-2 border-transparent hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">{c}</motion.button>
                ))}
              </div>
              <GameInstructions game="rps" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex justify-center items-center gap-6 sm:gap-10 mb-6">
                <div>
                  <p className="text-sm text-foreground-muted mb-2">You</p>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl sm:text-6xl block">{pChoice}</motion.span>
                </div>
                <span className="text-2xl font-heading font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">VS</span>
                <div>
                  <p className="text-sm text-foreground-muted mb-2">CPU</p>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl sm:text-6xl block">{cChoice}</motion.span>
                </div>
              </div>
              <div className={cn("text-2xl sm:text-3xl font-heading font-bold mb-2", result === "won" ? "text-success drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" : "text-foreground-muted")}>
                {result === "won" && "🎉 YOU WIN!"}{result === "lost" && "Better luck next time!"}{result === "push" && "🤝 IT'S A TIE!"}
              </div>
              <p className={cn("text-xl font-bold mb-4", getXP() > 0 ? "text-success" : "text-foreground-muted")}>
                {getXP() > 0 ? `+${getXP()} XP` : "±0 XP"}
              </p>
              {result === "lost" && <p className="text-xs text-emerald-400 mb-4 flex items-center justify-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> No XP lost - Risk-free! 🛡️</p>}
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={reset} className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] border-0"><RotateCcw className="h-4 w-4" /> Play Again</Button>
                <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none hover:border-emerald-500/50">Exit</Button>
              </div>
              <GameInstructions game="rps" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hangman Game with neon styling
const HangmanGame = ({ onBack, bet, onResult }: { onBack: () => void; bet: number; onResult: (r: string, p: number) => void }) => {
  const [word] = useState(() => HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)]);
  const [guessed, setGuessed] = useState<string[]>([]), [lives, setLives] = useState(6), [state, setState] = useState<"play"|"end">("play");
  
  const revealed = word.split("").map(l => guessed.includes(l) ? l : "_").join(" ");
  const won = !revealed.includes("_");
  
  const guess = (l: string) => {
    if (guessed.includes(l) || state === "end") return;
    setGuessed([...guessed, l]);
    if (!word.includes(l)) {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) { setState("end"); onResult("lost", 0); }
    } else if (word.split("").every(c => [...guessed, l].includes(c))) {
      setState("end");
      const payout = bet + (lives * 10);
      onResult("won", payout);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-foreground-muted hover:text-primary text-sm group transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />Back
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(6)].map((_, i) => (
              <motion.span 
                key={i} 
                animate={i >= lives ? { scale: [1, 0.8], opacity: 0.3 } : {}}
                className={cn("text-lg transition-all", i < lives ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "")}
              >
                ❤️
              </motion.span>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="font-heading font-bold text-cyan-400">{bet} XP</span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="absolute inset-0 rounded-2xl border border-cyan-500/20" style={{ boxShadow: 'inset 0 0 30px rgba(6,182,212,0.05)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="relative text-center">
          <Type className="h-12 w-12 mx-auto text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <h2 className="text-2xl font-heading font-bold mb-6">Hangman</h2>
          <div className="text-3xl sm:text-4xl font-mono tracking-[0.4em] mb-8 font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{revealed}</div>
          
          {state === "play" ? (
            <>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-lg mx-auto">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
                  <button 
                    key={l} 
                    onClick={() => guess(l)} 
                    disabled={guessed.includes(l)} 
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-sm sm:text-base transition-all",
                      guessed.includes(l) 
                        ? word.includes(l) 
                          ? "bg-success/20 text-success shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                          : "bg-destructive/20 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                        : "bg-background-secondary hover:bg-cyan-500/20 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:border-cyan-500/50 border border-transparent"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <GameInstructions game="hangman" />
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className={cn("text-2xl sm:text-3xl font-heading font-bold mb-2", won ? "text-success drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" : "text-destructive drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]")}>
                {won ? "🎉 YOU WON!" : "💀 GAME OVER"}
              </div>
              {!won && <p className="text-foreground-muted mb-2">The word was: <span className="font-bold text-cyan-400">{word}</span></p>}
              <p className={cn("text-xl font-bold mb-4", won ? "text-success" : "text-destructive")}>
                {won ? `+${lives * 10} XP` : `-${bet} XP`}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={() => window.location.reload()} className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] border-0"><RotateCcw className="h-4 w-4" /> Play Again</Button>
                <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none hover:border-cyan-500/50">Exit</Button>
              </div>
              <GameInstructions game="hangman" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Games List with neon styling
const gamesList = [
  { 
    id: "blackjack", 
    name: "Blackjack", 
    desc: "Beat the dealer to 21!", 
    risk: "Bet XP", 
    icon: Spade, 
    color: "from-violet-500 to-purple-600",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    border: "hover:border-violet-500/50",
  },
  { 
    id: "rps", 
    name: "Rock Paper Scissors", 
    desc: "Win to earn XP!", 
    risk: "Risk-free", 
    icon: Hand, 
    color: "from-emerald-500 to-green-600",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    border: "hover:border-emerald-500/50",
  },
  { 
    id: "hangman", 
    name: "Hangman", 
    desc: "Guess the word!", 
    risk: "Entry fee", 
    icon: Type, 
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    border: "hover:border-cyan-500/50",
  }
];

const Games = () => {
  const { user, refresh } = useAuth();
  const recordGame = useRecordGame();
  const { data: history, isLoading } = useGameHistory();
  const [game, setGame] = useState<GameType>("menu");
  const [bet, setBet] = useState(BLACKJACK_CONFIG.MIN_BET);
  
  const xp = user?.user?.player_xp || 1250;
  const maxBet = Math.min(Math.floor(xp * BLACKJACK_CONFIG.MAX_BET_PERCENT), BLACKJACK_CONFIG.HARD_CAP);

  const onResult = async (type: string, result: string, b: number, payout: number) => {
    try { 
      await recordGame.mutateAsync({ gameType: type, result, bet: b, payout }); 
      refresh(); 
      
      if (type === 'rps') {
        if (result === 'won') toast.success(`Won +${b} XP!`);
        else if (result === 'lost') toast.info('Better luck next time! (Risk-free)');
        else toast.info('Tie - try again!');
      } else if (type === 'hangman') {
        if (result === 'won') toast.success(`Won +${payout - b} XP!`);
        else toast.error(`Lost ${b} XP`);
      } else {
        if (["won","blackjack","win"].includes(result)) toast.success(`Won +${payout - b} XP!`); 
        else if (result === "lost") toast.error(`Lost ${b} XP`);
        else if (result === "push") toast.info('Push - bet returned'); 
      }
    } catch {}
  };

  const start = (id: string) => { 
    setGame(id as GameType); 
  };

  if (game === "blackjack") return <DashboardLayout><BlackjackGame onBack={() => setGame("menu")} bet={bet} onResult={(r,p) => onResult("blackjack",r,bet,p)} /></DashboardLayout>;
  if (game === "rps") return <DashboardLayout><RPSGame onBack={() => setGame("menu")} bet={bet} onResult={(r,p) => onResult("rps",r,bet,p)} /></DashboardLayout>;
  if (game === "hangman") return <DashboardLayout><HangmanGame onBack={() => setGame("menu")} bet={bet} onResult={(r,p) => onResult("hangman",r,bet,p)} /></DashboardLayout>;

  const getHistoryXP = (entry: any) => {
    const state = entry.state, betAmt = entry.bet_amount || 0, payout = entry.payout || 0, gameType = entry.game_type;
    if (gameType === 'rps') { if (state === 'won') return betAmt; return 0; }
    if (gameType === 'hangman') { if (state === 'won') return payout - betAmt; if (state === 'lost') return -betAmt; return 0; }
    if (state === 'lost') return -betAmt;
    if (state === 'push') return 0;
    return payout - betAmt;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        {/* Header with neon glow */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-1 flex items-center gap-3">
            <div className="relative">
              <Gamepad2 className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </div>
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">Game Center</span>
          </h1>
          <p className="text-foreground-muted text-sm sm:text-base">Test your luck and win XP!</p>
        </div>

        {/* Balance & Bet Section with neon styling */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-xp/10 to-transparent border border-xp/30 relative overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.15)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-xp/50 to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-xp/20 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Crown className="h-6 w-6 text-xp drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Your Balance</p>
                <p className="font-heading font-bold text-2xl text-xp drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{xp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-card border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <p className="text-xs text-foreground-muted mb-3 flex items-center gap-1"><Target className="h-3 w-3" /> Bet Amount</p>
            <div className="flex items-center gap-3 flex-wrap">
              <NeonNumberInput value={bet} onChange={setBet} min={BLACKJACK_CONFIG.MIN_BET} max={maxBet} step={10} />
              <span className="text-xs text-foreground-muted">XP</span>
              <div className="flex gap-1.5 ml-auto">
                {[10, 25, 50, 100].map(a => (
                  <button 
                    key={a} 
                    onClick={() => setBet(Math.min(a, maxBet))} 
                    disabled={a > xp}
                    className={cn(
                      "px-2.5 py-1.5 text-xs rounded-md font-medium transition-all border",
                      bet === a 
                        ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                        : "bg-background-secondary border-transparent hover:border-primary/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] disabled:opacity-40"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-foreground-muted mt-2">Min: {BLACKJACK_CONFIG.MIN_BET} • Max: {maxBet}</p>
          </div>
        </div>

        {/* Game Cards with neon effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {gamesList.map((g, i) => (
            <motion.div 
              key={g.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              whileHover={{ y: -6, scale: 1.02 }} 
              onClick={() => start(g.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-card border border-border cursor-pointer transition-all duration-300",
                g.border,
                "hover:" + g.glow
              )}
            >
              {/* Gradient overlay */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300", g.color)} />
              {/* Top neon line */}
              <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity", `via-${g.id === 'blackjack' ? 'violet' : g.id === 'rps' ? 'emerald' : 'cyan'}-500/70`)} />
              
              <div className="relative p-5 sm:p-6">
                <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center mb-4 transition-all bg-gradient-to-br", g.color, "group-hover:shadow-lg", g.glow.replace('shadow-', 'group-hover:shadow-'))}>
                  <g.icon className="h-7 w-7 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold mb-1">{g.name}</h3>
                <p className="text-foreground-muted text-sm mb-4">{g.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium border",
                    g.id === "rps" 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                      : "bg-background-secondary text-foreground-muted border-border"
                  )}>{g.risk}</span>
                  <Button variant="ghost" size="sm" className="group-hover:bg-white/10 gap-1">
                    Play <Zap className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Games */}
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-xp drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" /> Recent Games
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-foreground-muted" /></div>
            ) : !(history || []).length ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="h-14 w-14 rounded-xl bg-background-secondary flex items-center justify-center mx-auto mb-3">
                  <Dice1 className="h-7 w-7 text-foreground-muted" />
                </div>
                <p className="text-foreground-muted text-sm">No games yet. Play one above!</p>
              </div>
            ) : (
              (history || []).slice(0, 5).map((e: any, i: number) => {
                const xpChange = getHistoryXP(e);
                const gameInfo = gamesList.find(g => g.id === e.game_type);
                return (
                  <div key={i} className="flex items-center justify-between p-3 sm:p-4 border-b border-border last:border-0 hover:bg-background-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br", gameInfo?.color || 'from-primary to-violet-600')}>
                        {gameInfo?.icon && <gameInfo.icon className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">{e.game_type === 'rps' ? 'Rock Paper Scissors' : e.game_type.charAt(0).toUpperCase() + e.game_type.slice(1)}</p>
                        <p className="text-xs text-foreground-muted">{new Date(e.ended_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold text-sm sm:text-base", xpChange > 0 ? "text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" : xpChange < 0 ? "text-destructive" : "text-foreground-muted")}>
                        {xpChange > 0 ? `+${xpChange}` : xpChange === 0 ? "±0" : xpChange} XP
                      </p>
                      <p className={cn("text-xs capitalize", e.state === 'won' || e.state === 'blackjack' ? 'text-success' : e.state === 'lost' ? 'text-destructive' : 'text-foreground-muted')}>
                        {e.state === "lost" ? "Lost" : e.state === "push" ? "Push" : e.state === "blackjack" ? "Blackjack!" : "Won"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Games;
