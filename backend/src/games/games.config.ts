/**
 * The three code games. A game unlocks when the student's total XP reaches unlockXp; finishing it
 * (verified by the server) awards rewardXp once, plus the badge achievementId.
 */
export interface GameDefinition {
  id: string;
  title: string;
  unlockXp: number;
  rewardXp: number;
  achievementId: string;
}

export const GAMES: readonly GameDefinition[] = [
  { id: 'robot-maze', title: 'Robot Maze', unlockXp: 2000, rewardXp: 300, achievementId: 'maze-runner' },
  { id: 'sky-traps', title: 'Sky Traps', unlockXp: 3000, rewardXp: 400, achievementId: 'sky-defender' },
  { id: 'bomb-defuser', title: 'Defuse the Bomb', unlockXp: 4000, rewardXp: 500, achievementId: 'bomb-defuser' },
];

export function findGame(gameId: string): GameDefinition | undefined {
  return GAMES.find((game) => game.id === gameId);
}
