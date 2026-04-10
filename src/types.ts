export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type GameStatus = 'Setup' | 'Playing' | 'GameOver';

export type Feedback = 'Higher' | 'Lower' | 'Correct';

export interface GuessRecord {
  guess: number;
  feedback: Feedback;
  turn: number;
}

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  range: [number, number];
  playerSecret: number;
  aiSecret: number;
  playerGuesses: GuessRecord[];
  aiGuesses: GuessRecord[];
  turnCount: number;
  isPlayerTurn: boolean;
  winner: 'Player' | 'AI' | null;
  aiRange: [number, number]; // What the AI knows about the player's number
}
