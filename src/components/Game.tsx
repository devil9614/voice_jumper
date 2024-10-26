import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { drawTrail, updateTrail } from './Trail';
import { levels } from './levels';
import { Platform, GameState } from './types';

const GRAVITY = 0.4;
const VOLUME_THRESHOLD = 35;
const CHARACTER_SIZE = 30;

export default function Game() {
  const [isListening, setIsListening] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('gameState');
    return saved ? JSON.parse(saved) : {
      level: 0,
      characterX: 0,
      characterY: 0,
      velocity: 0,
      isDead: false
    };
  });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; opacity: number }>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();

  const currentLevel = levels[gameState.level];

  const resetLevel = () => {
    const startPlatform = currentLevel.platforms[0];
    setGameState(prev => ({
      ...prev,
      characterX: startPlatform.x + startPlatform.width / 2,
      characterY: startPlatform.y - CHARACTER_SIZE,
      velocity: 0,
      isDead: false
    }));
    setTrail([]);
  };

  const checkCollision = (x: number, y: number, platforms: Platform[]) => {
    return platforms.find(platform => 
      x + CHARACTER_SIZE > platform.x &&
      x < platform.x + platform.width &&
      y + CHARACTER_SIZE > platform.y &&
      y < platform.y + platform.height
    );
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      setIsListening(true);
      resetLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const updateGame = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current || gameState.isDead) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Get volume data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const volume = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;

    // Update character physics
    let newVelocity = gameState.velocity;
    let newX = gameState.characterX + 2; // Constant forward movement
    let newY = gameState.characterY;

    if (volume > VOLUME_THRESHOLD) {
      const jumpForce = -Math.min((volume - VOLUME_THRESHOLD) / 15, 8);
      newVelocity = jumpForce;
    }

    newVelocity += GRAVITY;
    newY += newVelocity;

    // Check collisions
    const platform = checkCollision(newX, newY, currentLevel.platforms);
    if (platform) {
      newY = platform.y - CHARACTER_SIZE;
      newVelocity = 0;
    }

    // Check if reached goal
    const goalPlatform = currentLevel.platforms[currentLevel.platforms.length - 1];
    if (newX > goalPlatform.x + goalPlatform.width / 2) {
      if (gameState.level < levels.length - 1) {
        setGameState(prev => {
          const newState = {
            ...prev,
            level: prev.level + 1,
            isDead: false
          };
          localStorage.setItem('gameState', JSON.stringify(newState));
          return newState;
        });
        resetLevel();
        return;
      }
    }

    // Check death
    if (newY > canvasRef.current.height) {
      setGameState(prev => ({ ...prev, isDead: true }));
      return;
    }

    // Update game state
    setGameState(prev => ({
      ...prev,
      characterX: newX,
      characterY: newY,
      velocity: newVelocity
    }));

    // Draw level
    currentLevel.platforms.forEach((platform, index) => {
      ctx.fillStyle = index === currentLevel.platforms.length - 1 ? '#4ade80' : '#ffffff';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Update and draw trail
    const newTrail = updateTrail(trail, newX, newY);
    setTrail(newTrail);
    drawTrail(ctx, newTrail);

    // Draw character
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(newX, newY, CHARACTER_SIZE, CHARACTER_SIZE);

    // Draw volume meter
    const meterHeight = (volume / 100) * 100;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(20, 50, 20, 100);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(20, 150 - meterHeight, 20, meterHeight);

    animationFrameRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, gameState, trail]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Voice Jumper</h1>
          <p className="text-gray-400 mb-2">Level {gameState.level + 1} of {levels.length}</p>
          <p className="text-gray-400 mb-4">Shout to jump between platforms!</p>
          {!isListening && (
            <button
              onClick={startAudio}
              className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mx-auto"
            >
              <Volume2 className="w-5 h-5" />
              Start Game
            </button>
          )}
          {gameState.isDead && (
            <button
              onClick={resetLevel}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors mx-auto mt-4"
            >
              Retry Level
            </button>
          )}
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="bg-black rounded-lg"
        />
      </div>
    </div>
  );
}