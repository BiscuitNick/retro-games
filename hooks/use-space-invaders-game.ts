import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  BULLET_WIDTH,
  BULLET_HEIGHT,
  BULLET_SPEED,
  ALIEN_SPEED_X,
  ALIEN_DROP_Y,
  type Player,
  type Alien,
  type Bullet,
  createAliens,
  checkCollision,
} from '@/lib/games/space-invaders';

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useSpaceInvadersGame() {
  const [player, setPlayer] = useState<Player>({
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - 40,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    lives: 3
  });

  const [aliens, setAliens] = useState<Alien[]>(createAliens());
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Alien movement state
  const [alienDirection, setAlienDirection] = useState<1 | -1>(1);
  const [alienMoveTimer, setAlienMoveTimer] = useState(0);
  
  // Keys state
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const shoot = useCallback(() => {
    if (bullets.filter(b => b.owner === 'player').length >= 3) return; // Limit shots
    
    const newBullet: Bullet = {
      id: `bullet-${Date.now()}`,
      x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
      y: player.y,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT,
      owner: 'player'
    };
    setBullets(prev => [...prev, newBullet]);
  }, [bullets, player]);

  // Handle single key press actions (shooting)
  useEffect(() => {
      const handlePress = (e: KeyboardEvent) => {
          if (!gameOver && !isPaused && e.key === ' ') {
              shoot();
          }
      };
      window.addEventListener('keydown', handlePress);
      return () => window.removeEventListener('keydown', handlePress);
  }, [gameOver, isPaused, shoot]);


  const resetGame = useCallback(() => {
    setPlayer({
        x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - 40,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        lives: 3
    });
    setAliens(createAliens());
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    setAlienDirection(1);
    setAlienMoveTimer(0);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOver || gameWon || isPaused) return;

    // 1. Move Player
    setPlayer(prev => {
        let newX = prev.x;
        if (keys.current['ArrowLeft']) newX -= 5;
        if (keys.current['ArrowRight']) newX += 5;
        // Clamp
        newX = Math.max(0, Math.min(GAME_WIDTH - prev.width, newX));
        return { ...prev, x: newX };
    });

    // 2. Move Bullets & Remove off-screen
    let currentBullets = bullets.map(b => ({
        ...b,
        y: b.owner === 'player' ? b.y - BULLET_SPEED : b.y + BULLET_SPEED
    })).filter(b => b.y > -20 && b.y < GAME_HEIGHT + 20);

    // 3. Move Aliens (Stepped movement based on count)
    // Fewer aliens = faster movement.
    // Base interval = 60 ticks. Min = 5 ticks.
    // Let's use a timer accumulator.
    const moveInterval = Math.max(5, Math.floor(aliens.length / 55 * 30)); // Simple speed curve
    
    let currentAliens = [...aliens];
    let newDirection = alienDirection;
    let shouldDrop = false;
    let alienMoved = false;

    if (alienMoveTimer >= moveInterval) {
        alienMoved = true;
        // Check bounds before moving to decide if we need to drop and reverse
        const leftMost = Math.min(...currentAliens.map(a => a.x));
        const rightMost = Math.max(...currentAliens.map(a => a.x + a.width));

        if ((alienDirection === 1 && rightMost >= GAME_WIDTH - 10) ||
            (alienDirection === -1 && leftMost <= 10)) {
            shouldDrop = true;
            newDirection = (alienDirection * -1) as 1 | -1;
        }

        if (shouldDrop) {
             currentAliens = currentAliens.map(a => ({ ...a, y: a.y + ALIEN_DROP_Y }));
             // Check if aliens reached bottom
             if (currentAliens.some(a => a.y + a.height >= player.y)) {
                 setGameOver(true);
             }
        } else {
             currentAliens = currentAliens.map(a => ({ ...a, x: a.x + (10 * alienDirection) }));
        }
    }
    
    // 4. Alien Shooting
    // Only bottom aliens shoot.
    // Random chance every frame?
    if (Math.random() < 0.02 && currentAliens.length > 0) {
         // Find aliens with no one below them
         // Simple way: shuffle and pick one.
         const shooter = currentAliens[Math.floor(Math.random() * currentAliens.length)];
         currentBullets.push({
             id: `bullet-alien-${Date.now()}`,
             x: shooter.x + shooter.width / 2,
             y: shooter.y + shooter.height,
             width: BULLET_WIDTH,
             height: BULLET_HEIGHT,
             owner: 'alien'
         });
    }


    // 5. Collision Detection
    const destroyedBulletIds = new Set<string>();
    const destroyedAlienIds = new Set<string>();
    let hitPlayer = false;
    let scoreToAdd = 0;

    // Bullet vs Alien
    currentBullets.forEach(b => {
        if (b.owner === 'player') {
            const hitAlien = currentAliens.find(a => !destroyedAlienIds.has(a.id) && checkCollision(b, a));
            if (hitAlien) {
                destroyedBulletIds.add(b.id);
                destroyedAlienIds.add(hitAlien.id);
                scoreToAdd += hitAlien.scoreValue;
            }
        } else {
             // Bullet vs Player
             if (checkCollision(b, player)) {
                 destroyedBulletIds.add(b.id);
                 hitPlayer = true;
             }
        }
    });

    // Remove destroyed entities
    currentBullets = currentBullets.filter(b => !destroyedBulletIds.has(b.id));
    currentAliens = currentAliens.filter(a => !destroyedAlienIds.has(a.id));

    if (scoreToAdd > 0) {
        setScore(s => s + scoreToAdd);
    }

    if (hitPlayer) {
        if (player.lives > 1) {
            setPlayer(p => ({ ...p, lives: p.lives - 1, x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2 }));
            // Clear enemy bullets?
            currentBullets = currentBullets.filter(b => b.owner === 'player');
        } else {
            setPlayer(p => ({ ...p, lives: 0 }));
            setGameOver(true);
        }
    }

    if (currentAliens.length === 0 && aliens.length > 0) {
        setGameWon(true);
    }

    setBullets(currentBullets);
    if (alienMoved) {
        setAliens(currentAliens);
        setAlienDirection(newDirection);
        setAlienMoveTimer(0);
    } else {
        setAlienMoveTimer(t => t + 1);
    }

  }, [aliens, bullets, gameOver, gameWon, isPaused, player, alienDirection, alienMoveTimer]);

  useInterval(gameLoop, 20); // 50 FPS

  return {
    player,
    aliens,
    bullets,
    score,
    gameOver,
    gameWon,
    isPaused,
    setIsPaused,
    resetGame,
  };
}
