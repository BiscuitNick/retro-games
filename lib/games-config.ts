export interface GameConfig {
  id: string;
  name: string;
  route: string;
  description: string;
  controls: string;
}

export const games: GameConfig[] = [
  {
    id: "snake",
    name: "Snake",
    route: "/games/snake",
    description: "Classic snake eating food and growing",
    controls: "Arrow keys or WASD",
  },
  {
    id: "tetris",
    name: "Tetris",
    route: "/games/tetris",
    description: "Falling block puzzle game",
    controls: "Arrow keys, Space to drop",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    route: "/games/minesweeper",
    description: "Grid-based mine detection puzzle",
    controls: "Click to reveal, Right-click to flag",
  },
  {
    id: "conways-life",
    name: "Conway's Life",
    route: "/games/conways-life",
    description: "Cellular automaton simulation",
    controls: "Click to toggle cells",
  },
  {
    id: "blackjack",
    name: "Blackjack",
    route: "/games/blackjack",
    description: "Card game (21)",
    controls: "Click buttons to play",
  },
  {
    id: "asteroids",
    name: "Asteroids",
    route: "/games/asteroids",
    description: "Space shooter with rotating ship",
    controls: "Arrow keys to move, Space to shoot",
  },
  {
    id: "space-invaders",
    name: "Space Invaders",
    route: "/games/space-invaders",
    description: "Classic alien shooting arcade game",
    controls: "Arrow keys to move, Space to shoot",
  },
  {
    id: "breakout",
    name: "Breakout",
    route: "/games/breakout",
    description: "Brick-breaking paddle game",
    controls: "Mouse or Arrow keys",
  },
  {
    id: "pinball",
    name: "Pinball",
    route: "/games/pinball",
    description: "Classic pinball with flippers and bumpers",
    controls: "Z/M or Arrow keys for flippers",
  },
  {
    id: "barrack",
    name: "Barrack",
    route: "/games/barrack",
    description: "Artillery strategy game",
    controls: "Mouse to aim and fire",
  },
];

export function getGameById(id: string): GameConfig | undefined {
  return games.find((game) => game.id === id);
}
