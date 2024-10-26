export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Level {
  platforms: Platform[];
}

export interface GameState {
  level: number;
  characterX: number;
  characterY: number;
  velocity: number;
  isDead: boolean;
}