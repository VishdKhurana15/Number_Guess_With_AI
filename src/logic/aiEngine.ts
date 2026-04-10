import { Difficulty } from '../types';

export const getAiGuess = (
  min: number,
  max: number,
  difficulty: Difficulty
): number => {
  if (min > max) return min;

  switch (difficulty) {
    case 'Hard': {
      // Perfect Binary Search
      return Math.floor((min + max) / 2);
    }
    case 'Medium': {
      // Binary search with a bit of randomness (jitter)
      const mid = Math.floor((min + max) / 2);
      const range = max - min;
      const jitter = Math.floor((Math.random() - 0.5) * (range * 0.1)); // 10% jitter
      const guess = mid + jitter;
      return Math.max(min, Math.min(max, guess));
    }
    case 'Easy':
    default: {
      // Random guess within range
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
};
