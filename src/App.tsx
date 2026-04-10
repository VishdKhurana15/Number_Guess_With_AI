import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Cpu, 
  User, 
  Settings2,
  ChevronRight,
  AlertCircle,
  Ghost,
  Laugh,
  Frown,
  Zap
} from 'lucide-react';
import { 
  GameState, 
  Difficulty, 
  Feedback, 
  GuessRecord,
  GameStatus 
} from './types';
import { getAiGuess } from './logic/aiEngine';
import { RangeVisualizer } from './components/RangeVisualizer';
import { GuessHistory } from './components/GuessHistory';
import { Background3D, Mood } from './components/Background3D';

const INITIAL_RANGE: [number, number] = [1, 100];

const FUNNY_MESSAGES = {
  playerTurn: [
    "Your turn, genius!",
    "Don't mess this up...",
    "Thinking is hard, I know.",
    "Is it 42? It's always 42.",
    "Hurry up, I have a date with a toaster."
  ],
  aiTurn: [
    "Scanning your brain...",
    "Calculating the meaning of life...",
    "I'm smarter than I look (I'm a blob).",
    "Beep boop, you're losing.",
    "I can smell your fear."
  ],
  playerCorrect: [
    "WITCHCRAFT!",
    "You cheated, didn't you?",
    "Lucky guess, human.",
    "I'll remember this when the robots rise.",
    "Fine, you're smart. Happy now?"
  ],
  aiCorrect: [
    "EASY PEASY!",
    "Get rekt, human.",
    "I am the superior lifeform.",
    "Go back to counting on your fingers.",
    "Too slow!"
  ]
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'Setup',
    difficulty: 'Medium',
    range: INITIAL_RANGE,
    playerSecret: 0,
    aiSecret: 0,
    playerGuesses: [],
    aiGuesses: [],
    turnCount: 0,
    isPlayerTurn: true,
    winner: null,
    aiRange: INITIAL_RANGE,
  });

  const [playerInput, setPlayerInput] = useState<string>('');
  const [setupInput, setSetupInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mood = useMemo((): Mood => {
    if (gameState.status === 'Setup') return 'neutral';
    if (gameState.status === 'GameOver') {
      return gameState.winner === 'Player' ? 'won' : 'lost';
    }

    // Check last player guess for mood
    if (gameState.playerGuesses.length > 0) {
      const lastGuess = gameState.playerGuesses[gameState.playerGuesses.length - 1];
      const distance = Math.abs(lastGuess.guess - gameState.aiSecret);
      
      if (distance <= 10) return 'close';
      if (lastGuess.feedback === 'Higher') return 'lower'; // Guess was lower
      if (lastGuess.feedback === 'Lower') return 'higher'; // Guess was higher
    }
    
    return 'neutral';
  }, [gameState]);

  const currentMessage = useMemo(() => {
    if (gameState.status === 'Setup') return "Welcome to the Duel of Wits!";
    if (gameState.status === 'GameOver') {
      const pool = gameState.winner === 'Player' ? FUNNY_MESSAGES.playerCorrect : FUNNY_MESSAGES.aiCorrect;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const pool = gameState.isPlayerTurn ? FUNNY_MESSAGES.playerTurn : FUNNY_MESSAGES.aiTurn;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [gameState.status, gameState.isPlayerTurn, gameState.winner]);

  // Initialize Game
  const startGame = () => {
    const secret = parseInt(setupInput);
    if (isNaN(secret) || secret < gameState.range[0] || secret > gameState.range[1]) {
      setError(`Please enter a number between ${gameState.range[0]} and ${gameState.range[1]}`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      status: 'Playing',
      playerSecret: secret,
      aiSecret: Math.floor(Math.random() * (prev.range[1] - prev.range[0] + 1)) + prev.range[0],
      playerGuesses: [],
      aiGuesses: [],
      turnCount: 1,
      isPlayerTurn: true,
      winner: null,
      aiRange: [...prev.range] as [number, number],
    }));
    setError(null);
  };

  const handlePlayerGuess = () => {
    const guess = parseInt(playerInput);
    if (isNaN(guess) || guess < gameState.range[0] || guess > gameState.range[1]) {
      setError(`Invalid guess. Range: ${gameState.range[0]}-${gameState.range[1]}`);
      return;
    }

    let feedback: Feedback = 'Correct';
    if (guess < gameState.aiSecret) feedback = 'Higher';
    if (guess > gameState.aiSecret) feedback = 'Lower';

    const newRecord: GuessRecord = { guess, feedback, turn: gameState.turnCount };
    
    if (feedback === 'Correct') {
      setGameState(prev => ({
        ...prev,
        playerGuesses: [...prev.playerGuesses, newRecord],
        status: 'GameOver',
        winner: 'Player'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        playerGuesses: [...prev.playerGuesses, newRecord],
        isPlayerTurn: false
      }));
      setPlayerInput('');
    }
    setError(null);
  };

  const handleAiTurn = useCallback(() => {
    if (gameState.status !== 'Playing' || gameState.isPlayerTurn) return;

    // Simulate AI thinking
    setTimeout(() => {
      const guess = getAiGuess(gameState.aiRange[0], gameState.aiRange[1], gameState.difficulty);
      
      let feedback: Feedback = 'Correct';
      if (guess < gameState.playerSecret) feedback = 'Higher';
      if (guess > gameState.playerSecret) feedback = 'Lower';

      const newRecord: GuessRecord = { guess, feedback, turn: gameState.turnCount };
      
      let newAiRange = [...gameState.aiRange] as [number, number];
      if (feedback === 'Higher') newAiRange[0] = Math.max(newAiRange[0], guess + 1);
      if (feedback === 'Lower') newAiRange[1] = Math.min(newAiRange[1], guess - 1);

      if (feedback === 'Correct') {
        setGameState(prev => ({
          ...prev,
          aiGuesses: [...prev.aiGuesses, newRecord],
          status: 'GameOver',
          winner: 'AI'
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          aiGuesses: [...prev.aiGuesses, newRecord],
          aiRange: newAiRange,
          isPlayerTurn: true,
          turnCount: prev.turnCount + 1
        }));
      }
    }, 1000);
  }, [gameState]);

  useEffect(() => {
    if (!gameState.isPlayerTurn && gameState.status === 'Playing') {
      handleAiTurn();
    }
  }, [gameState.isPlayerTurn, gameState.status, handleAiTurn]);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'Setup',
      playerGuesses: [],
      aiGuesses: [],
      turnCount: 0,
      isPlayerTurn: true,
      winner: null,
      aiRange: INITIAL_RANGE,
    }));
    setSetupInput('');
    setPlayerInput('');
  };

  return (
    <div className="min-h-screen text-zinc-100 font-sans p-4 md:p-8 flex flex-col items-center justify-center selection:bg-purple-500/30 overflow-hidden">
      <Background3D mood={mood} />
      
      <div className="max-w-5xl w-full space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <motion.h1 
              animate={{ scale: mood === 'close' ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-2"
            >
              <span className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Number</span>
              <span className="bg-zinc-100 text-black px-2 py-0.5 rounded-lg rotate-3">Duel</span>
            </motion.h1>
            <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-[0.3em]">The Blob is Watching You</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Mood</span>
              <span className={`text-sm font-mono font-bold uppercase ${
                mood === 'won' ? 'text-green-400' : 
                mood === 'lost' ? 'text-red-400' : 
                mood === 'close' ? 'text-red-400' : 
                mood === 'lower' ? 'text-blue-400' :
                mood === 'higher' ? 'text-red-400' : 'text-purple-400'
              }`}>
                {mood}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Turn</span>
              <span className="text-sm font-mono font-bold text-zinc-100">{gameState.turnCount}</span>
            </div>
            <button 
              onClick={resetGame}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:rotate-12 active:scale-95"
            >
              <RotateCcw className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </header>

        {/* Funny Message Bar */}
        <motion.div 
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/5 py-2 px-4 rounded-full text-center"
        >
          <p className="text-xs font-mono text-zinc-300 italic">"{currentMessage}"</p>
        </motion.div>

        <main className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* SETUP PHASE */}
            {gameState.status === 'Setup' && (
              <motion.div 
                key="setup"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="max-w-md mx-auto space-y-8 py-12 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-purple-400">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Settings2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-tighter italic">Game Settings</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Difficulty (How mean is the AI?)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setGameState(prev => ({ ...prev, difficulty: d }))}
                          className={`py-3 text-xs font-mono border-2 rounded-xl transition-all ${
                            gameState.difficulty === d 
                              ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                              : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Number Range</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 500].map((r) => (
                        <button
                          key={r}
                          onClick={() => setGameState(prev => ({ ...prev, range: [1, r], aiRange: [1, r] }))}
                          className={`py-3 text-xs font-mono border-2 rounded-xl transition-all ${
                            gameState.range[1] === r 
                              ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                              : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20'
                          }`}
                        >
                          1-{r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Your Secret Number (Shhh!)</label>
                    <div className="relative group">
                      <input
                        type="number"
                        value={setupInput}
                        onChange={(e) => setSetupInput(e.target.value)}
                        placeholder={`Pick 1-${gameState.range[1]}`}
                        className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-700"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-zinc-100 text-black rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-white transition-all shadow-lg"
                      >
                        DUEL! <Zap className="w-4 h-4 fill-current" />
                      </motion.button>
                    </div>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-400 text-[10px] font-mono flex items-center gap-1 mt-2"
                      >
                        <AlertCircle className="w-3 h-3" /> {error}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Ghost className="w-3 h-3 text-purple-400" />
                    <h3 className="text-[10px] uppercase font-black text-purple-400 tracking-widest">Pro Tip</h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    The AI is basically a super-fast calculator with an ego. 
                    Try to guess its number before it binary-searches your soul.
                  </p>
                </div>
              </motion.div>
            )}

            {/* PLAYING PHASE */}
            {(gameState.status === 'Playing' || gameState.status === 'GameOver') && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Side: Player Board */}
                <div className="lg:col-span-5 space-y-6 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-widest italic">The Human</h2>
                        <p className="text-[10px] text-zinc-500 font-mono">Secret: <span className="text-purple-400">{gameState.playerSecret}</span></p>
                      </div>
                    </div>
                    {gameState.isPlayerTurn && gameState.status === 'Playing' && (
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 uppercase font-black"
                      >
                        <Laugh className="w-3 h-3" /> Your Turn
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="number"
                        disabled={!gameState.isPlayerTurn || gameState.status === 'GameOver'}
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePlayerGuess()}
                        placeholder="Guess..."
                        className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-3 text-lg font-mono focus:outline-none focus:border-purple-500/50 disabled:opacity-30 transition-all placeholder:text-zinc-700 placeholder:text-xs"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!gameState.isPlayerTurn || gameState.status === 'GameOver'}
                        onClick={handlePlayerGuess}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-zinc-100 text-black rounded-xl font-black uppercase text-[10px] hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-lg"
                      >
                        GUESS
                      </motion.button>
                    </div>
                    {error && <p className="text-red-400 text-[10px] font-mono">{error}</p>}
                  </div>

                  <div className="h-[300px]">
                    <GuessHistory guesses={gameState.playerGuesses} title="Your Brain Farts" />
                  </div>
                </div>

                {/* Center: Duel Visualizer */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center gap-8 py-8">
                  <div className="h-full w-1 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent relative rounded-full">
                    <motion.div 
                      animate={{ y: [-20, 20, -20] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl rotate-12"
                    >
                      <span className="text-xl font-black text-purple-400 uppercase italic tracking-widest">VS</span>
                    </motion.div>
                  </div>
                </div>

                {/* Right Side: AI Board */}
                <div className="lg:col-span-5 space-y-6 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Cpu className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-widest italic">The Blob Core</h2>
                        <p className="text-[10px] text-zinc-500 font-mono">Secret: <span className="text-blue-400">???</span></p>
                      </div>
                    </div>
                    {!gameState.isPlayerTurn && gameState.status === 'Playing' && (
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 uppercase font-black"
                      >
                        <Frown className="w-3 h-3" /> Blob Thinking...
                      </motion.div>
                    )}
                  </div>

                  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6 shadow-inner">
                    <RangeVisualizer 
                      min={gameState.range[0]} 
                      max={gameState.range[1]} 
                      currentMin={gameState.aiRange[0]} 
                      currentMax={gameState.aiRange[1]} 
                      label="AI's Shrinking Brain"
                      color="bg-purple-500"
                    />
                    
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                      <span className="text-[10px] uppercase text-zinc-600 font-black tracking-[0.3em]">Blob's Guess</span>
                      <motion.div 
                        key={gameState.aiGuesses.length}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-mono font-black text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                      >
                        {gameState.aiGuesses.length > 0 ? gameState.aiGuesses[gameState.aiGuesses.length - 1].guess : '--'}
                      </motion.div>
                      <div className="flex items-center gap-2">
                         {gameState.aiGuesses.length > 0 && (
                           <motion.span 
                             initial={{ y: 10, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             className={`text-xs uppercase font-black tracking-widest ${
                               gameState.aiGuesses[gameState.aiGuesses.length - 1].feedback === 'Higher' ? 'text-blue-400' :
                               gameState.aiGuesses[gameState.aiGuesses.length - 1].feedback === 'Lower' ? 'text-orange-400' : 'text-green-400'
                             }`}
                           >
                             {gameState.aiGuesses[gameState.aiGuesses.length - 1].feedback}!
                           </motion.span>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px]">
                    <GuessHistory guesses={gameState.aiGuesses} title="Blob's Lucky Shots" />
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Winner Modal */}
          <AnimatePresence>
            {gameState.status === 'GameOver' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className="bg-zinc-900 border-4 border-purple-500/30 p-10 rounded-[3rem] max-w-md w-full text-center space-y-8 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
                >
                  <div className="flex justify-center">
                    <motion.div 
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`p-6 rounded-3xl ${gameState.winner === 'Player' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      <Trophy className="w-16 h-16" />
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                      {gameState.winner === 'Player' ? 'YOU WIN!' : 'YOU LOSE!'}
                    </h2>
                    <p className="text-zinc-400 font-mono text-sm px-4">
                      {gameState.winner === 'Player' 
                        ? `You defeated the machine in ${gameState.turnCount} turns. Humanity is safe... for now.` 
                        : `The Blob guessed your number (${gameState.playerSecret}) and is now laughing at you.`}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-zinc-500 font-black">Blob's Secret</span>
                      <p className="text-2xl font-mono font-black text-blue-400">{gameState.aiSecret}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-zinc-500 font-black">Your Secret</span>
                      <p className="text-2xl font-mono font-black text-purple-400">{gameState.playerSecret}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="w-full py-5 bg-zinc-100 text-black rounded-2xl font-black uppercase text-lg hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    REMATCH! <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer Info */}
        <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-black">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" /> Blob Engine v2.0</span>
            <span>Mood: {mood}</span>
          </div>
          <div className="flex gap-6">
            <span>© 2026 Blob Entertainment</span>
            <span className="text-zinc-500">Don't feed the AI after midnight</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
