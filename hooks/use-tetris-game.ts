import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  createEmptyBoard,
  getRandomTetrominoType,
  TETROMINOES,
  checkCollision,
  rotateMatrix,
  type Board,
  type TetrominoType,
} from '@/lib/games/tetris';

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

export function useTetrisGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType | null>(null); // Optional: Next piece preview
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  
  // Game loop speed
  const baseSpeed = 800;
  const speed = Math.max(100, baseSpeed - (level - 1) * 50);

  const spawnPiece = useCallback((type: TetrominoType) => {
    const pieceDef = TETROMINOES[type];
    // Center the piece
    const startX = Math.floor((BOARD_WIDTH - pieceDef.shape[0].length) / 2);
    // Start above or at top? Let's start at y=0 or -1 depending on preference.
    // Standard tetris spawns somewhat inside.
    const newPiece = {
      type,
      shape: pieceDef.shape,
      x: startX,
      y: 0,
    };

    if (checkCollision(board, newPiece.shape, { x: newPiece.x, y: newPiece.y })) {
      setGameOver(true);
      setCurrentPiece(newPiece); // Show the colliding piece
    } else {
      setCurrentPiece(newPiece);
    }
  }, [board]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    const firstType = getRandomTetrominoType();
    const nextType = getRandomTetrominoType();
    setNextPieceType(nextType);
    spawnPiece(firstType);
  }, [spawnPiece]);

  // Initial start
  useEffect(() => {
    if (!currentPiece && !gameOver && !isPaused) {
       // Only start if we explicitly call resetGame or similar? 
       // Or auto start? Let's wait for user or auto-start on mount.
       // Let's auto-start on mount for simplicity.
       const firstType = getRandomTetrominoType();
       const nextType = getRandomTetrominoType();
       setNextPieceType(nextType);
       spawnPiece(firstType);
    }
  }, []); // Run once

  const lockPiece = useCallback((pieceToLock: Piece | null = currentPiece) => {
    if (!pieceToLock) return;

    const newBoard = board.map(row => [...row]);
    
    // Paint piece onto board
    pieceToLock.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const boardY = pieceToLock.y + dy;
          const boardX = pieceToLock.x + dx;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = {
              type: pieceToLock.type,
              color: TETROMINOES[pieceToLock.type].color
            };
          }
        }
      });
    });

    // Check for lines
    let linesCleared = 0;
    const finalBoard = newBoard.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    // Add new empty lines at top
    while (finalBoard.length < BOARD_HEIGHT) {
      finalBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (linesCleared > 0) {
      setScore(s => s + [0, 100, 300, 500, 800][linesCleared] * level);
      setLevel(l => Math.floor((score + linesCleared * 100) / 1000) + 1); // Simple level up logic
    }

    setBoard(finalBoard);

    // Spawn next
    if (nextPieceType) {
        spawnPiece(nextPieceType);
        setNextPieceType(getRandomTetrominoType());
    }
  }, [board, currentPiece, nextPieceType, level, score, spawnPiece]);

  const move = useCallback((dx: number, dy: number) => {
    if (gameOver || isPaused || !currentPiece) return;

    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;

    if (!checkCollision(board, currentPiece.shape, { x: newX, y: newY })) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY });
      return true; // Moved successfully
    } else {
        // If moving down and collision, lock
        if (dy > 0) {
            lockPiece();
        }
        return false; // Blocked
    }
  }, [board, currentPiece, gameOver, isPaused, lockPiece]);

  const rotate = useCallback(() => {
    if (gameOver || isPaused || !currentPiece) return;

    const rotatedShape = rotateMatrix(currentPiece.shape);
    // Simple wall kick: try current pos, then try +/- 1 x
    // If still collision, don't rotate
    
    // Try center
    if (!checkCollision(board, rotatedShape, { x: currentPiece.x, y: currentPiece.y })) {
        setCurrentPiece({ ...currentPiece, shape: rotatedShape });
        return;
    }
    
    // Try right kick
    if (!checkCollision(board, rotatedShape, { x: currentPiece.x + 1, y: currentPiece.y })) {
        setCurrentPiece({ ...currentPiece, shape: rotatedShape, x: currentPiece.x + 1 });
        return;
    }
    
    // Try left kick
    if (!checkCollision(board, rotatedShape, { x: currentPiece.x - 1, y: currentPiece.y })) {
        setCurrentPiece({ ...currentPiece, shape: rotatedShape, x: currentPiece.x - 1 });
        return;
    }

  }, [board, currentPiece, gameOver, isPaused]);

  // Drop (Hard drop)
  const hardDrop = useCallback(() => {
      if (gameOver || isPaused || !currentPiece) return;
      
      let tempY = currentPiece.y;
      while(!checkCollision(board, currentPiece.shape, { x: currentPiece.x, y: tempY + 1})) {
          tempY++;
      }
      
      const droppedPiece = { ...currentPiece, y: tempY };
      setCurrentPiece(droppedPiece);
      lockPiece(droppedPiece);
  }, [board, currentPiece, gameOver, isPaused, lockPiece]);


  // Game Tick
  useInterval(() => {
    move(0, 1);
  }, (!gameOver && !isPaused) ? speed : null);

  return {
    board,
    currentPiece,
    score,
    gameOver,
    isPaused,
    setIsPaused,
    resetGame,
    move,
    rotate,
    hardDrop,
    nextPieceType,
    level
  };
}
