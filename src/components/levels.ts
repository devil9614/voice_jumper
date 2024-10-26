import { Level } from './types';

export const levels: Level[] = [
  // Level 1: Simple jumps
  {
    platforms: [
      { x: 50, y: 500, width: 100, height: 20 },
      { x: 200, y: 450, width: 100, height: 20 },
      { x: 350, y: 400, width: 100, height: 20 },
      { x: 500, y: 450, width: 100, height: 20 },
      { x: 650, y: 500, width: 100, height: 20 },
    ]
  },
  // Level 2: Higher jumps
  {
    platforms: [
      { x: 50, y: 500, width: 100, height: 20 },
      { x: 250, y: 400, width: 80, height: 20 },
      { x: 450, y: 300, width: 80, height: 20 },
      { x: 650, y: 400, width: 100, height: 20 },
    ]
  },
  // Level 3: Precision jumps
  {
    platforms: [
      { x: 50, y: 500, width: 100, height: 20 },
      { x: 200, y: 450, width: 60, height: 20 },
      { x: 350, y: 400, width: 60, height: 20 },
      { x: 500, y: 350, width: 60, height: 20 },
      { x: 650, y: 300, width: 100, height: 20 },
    ]
  },
  // Level 4: Variable heights
  {
    platforms: [
      { x: 50, y: 500, width: 100, height: 20 },
      { x: 250, y: 450, width: 80, height: 20 },
      { x: 450, y: 350, width: 60, height: 20 },
      { x: 600, y: 450, width: 80, height: 20 },
      { x: 750, y: 300, width: 100, height: 20 },
    ]
  },
  // Level 5: Final challenge
  {
    platforms: [
      { x: 50, y: 500, width: 100, height: 20 },
      { x: 200, y: 400, width: 60, height: 20 },
      { x: 350, y: 300, width: 40, height: 20 },
      { x: 500, y: 200, width: 40, height: 20 },
      { x: 650, y: 300, width: 100, height: 20 },
    ]
  },
];