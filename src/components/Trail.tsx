import React from 'react';

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export function drawTrail(ctx: CanvasRenderingContext2D, trail: TrailPoint[]) {
  trail.forEach((point) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity})`;
    ctx.fillRect(point.x, point.y, 30, 30);
  });
}

export function updateTrail(trail: TrailPoint[], x: number, y: number): TrailPoint[] {
  const newTrail = trail
    .map(point => ({
      ...point,
      opacity: point.opacity - 0.05
    }))
    .filter(point => point.opacity > 0);

  newTrail.unshift({ x, y, opacity: 0.5 });
  return newTrail;
}