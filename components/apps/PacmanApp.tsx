
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT } from '../../constants';

const TILE_SIZE = 20;
const ROWS = 21;
const COLS = 19;
const POWER_PELLET_DURATION = 7000; // ms
const GHOST_FRIGHTENED_SPEED = 250;
const GHOST_NORMAL_SPEED = 160;
const PACMAN_SPEED = 140;

const MAP = [
  "###################",
  "#O.......#........O#",
  "#.##.###.#.###.##.#",
  "#.................#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.### # ###.####",
  "####.# GGG #.####",
  "####.# ### #.####",
  "     # G G #     ",
  "####.# ### #.####",
  "####.#     #.####",
  "####.# ### #.####",
  "#........#........#",
  "#.##.###.#.###.##.#",
  "#..#.....P.....#..#",
  "##.#.#.#####.#.#.##",
  "#O...#...#...#...O#",
  "#.######.#.######.#",
  "#.................#",
  "###################",
];

type Direction = { x: 0, y: -1 } | { x: 0, y: 1 } | { x: -1, y: 0 } | { x: 1, y: 0 } | null;
const DIRS = { UP: {x: 0, y: -1}, DOWN: {x: 0, y: 1}, LEFT: {x: -1, y: 0}, RIGHT: {x: 1, y: 0} } as const;

interface PacmanAppProps { windowId: string; }
interface Position { x: number, y: number }
interface PacmanState extends Position { dir: Direction, nextDir: Direction }
interface GhostState extends Position { dir: Direction, id: number }

const PacmanApp: React.FC<PacmanAppProps> = ({ windowId }) => {
    const { state, dispatch } = useAppContext();
    const text = UI_TEXT[state.language];
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // State
    const [pacman, setPacman] = useState<PacmanState>({ x: 9, y: 15, dir: DIRS.RIGHT, nextDir: DIRS.RIGHT });
    const [ghosts, setGhosts] = useState<GhostState[]>([]);
    const [board, setBoard] = useState<string[][]>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [isFrightened, setIsFrightened] = useState(false);

    // Refs for game loop
    const gameLoopRef = useRef<number | null>(null);
    const pacmanTimeoutRef = useRef<number | null>(null);
    const ghostsTimeoutRef = useRef<number | null>(null);
    const powerPelletTimeoutRef = useRef<number | null>(null);
    const frightenedModeRef = useRef(isFrightened);
    const boardRef = useRef(board);
    
    useEffect(() => { frightenedModeRef.current = isFrightened }, [isFrightened]);
    useEffect(() => { boardRef.current = board }, [board]);
    
    const isWall = (x: number, y: number) => boardRef.current[y]?.[x] === '#';

    const resetGame = useCallback(() => {
        if (pacmanTimeoutRef.current) clearTimeout(pacmanTimeoutRef.current);
        if (ghostsTimeoutRef.current) clearTimeout(ghostsTimeoutRef.current);
        if (powerPelletTimeoutRef.current) clearTimeout(powerPelletTimeoutRef.current);

        const newBoard = MAP.map(row => row.split(''));
        let pacmanStart = { x: 9, y: 15, dir: DIRS.RIGHT, nextDir: DIRS.RIGHT };
        const ghostStarts: Position[] = [];
        
        newBoard.forEach((row, y) => row.forEach((cell, x) => {
            if (cell === 'P') pacmanStart = { ...pacmanStart, x, y };
            if (cell === 'G') ghostStarts.push({x,y});
        }));
        
        const initialGhosts = ghostStarts.map((pos, id) => ({...pos, dir: DIRS.UP, id}));

        setPacman(pacmanStart);
        setGhosts(initialGhosts);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setIsWin(false);
        setIsFrightened(false);
    }, []);

    useEffect(() => {
        resetGame();
        return () => {
             if (pacmanTimeoutRef.current) clearTimeout(pacmanTimeoutRef.current);
             if (ghostsTimeoutRef.current) clearTimeout(ghostsTimeoutRef.current);
             if (powerPelletTimeoutRef.current) clearTimeout(powerPelletTimeoutRef.current);
             if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
    }, [resetGame]);

    const movePacman = useCallback(() => {
        setPacman(p => {
            let newPacman = { ...p };
            
            if (!isWall(newPacman.x + (newPacman.nextDir?.x || 0), newPacman.y + (newPacman.nextDir?.y || 0))) {
                newPacman.dir = newPacman.nextDir;
            }

            const nextX = newPacman.x + (newPacman.dir?.x || 0);
            const nextY = newPacman.y + (newPacman.dir?.y || 0);

            if (isWall(nextX, nextY)) return p;
            
            newPacman.x = nextX;
            newPacman.y = nextY;
            if (newPacman.x <= -1) newPacman.x = COLS - 1; 
            else if (newPacman.x >= COLS) newPacman.x = 0;

            setBoard(b => {
                const newBoard = b.map(r => [...r]);
                const cell = newBoard[newPacman.y]?.[newPacman.x];
                if (cell === '.' || cell === 'O') {
                    newBoard[newPacman.y][newPacman.x] = ' ';
                    setScore(s => s + (cell === '.' ? 10 : 50));
                    if (cell === 'O') {
                        if(powerPelletTimeoutRef.current) clearTimeout(powerPelletTimeoutRef.current);
                        setIsFrightened(true);
                        powerPelletTimeoutRef.current = window.setTimeout(() => setIsFrightened(false), POWER_PELLET_DURATION);
                    }
                    if (newBoard.flat().every(c => c !== '.' && c !== 'O')) {
                        setIsWin(true);
                        setGameOver(true);
                    }
                }
                return newBoard;
            });
            return newPacman;
        });
    }, []);

    const moveGhosts = useCallback(() => {
        setGhosts(gs => gs.map(ghost => {
            const possibleDirs = Object.values(DIRS).filter(d => !isWall(ghost.x + d.x, ghost.y + d.y));
            const oppositeDir = ghost.dir ? { x: -ghost.dir.x, y: -ghost.dir.y } : null;
            let validDirs = possibleDirs;
            if (validDirs.length > 1) {
                validDirs = validDirs.filter(d => !(d.x === oppositeDir?.x && d.y === oppositeDir?.y));
            }

            let newDir = ghost.dir;
            if (validDirs.length > 0 && (!validDirs.includes(newDir) || Math.random() < 0.25)) {
                newDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            }

            if(newDir) {
                return {...ghost, x: ghost.x + newDir.x, y: ghost.y + newDir.y, dir: newDir};
            }
            return ghost;
        }));
    }, []);

    // Game logic intervals
    useEffect(() => {
        if(gameOver) return;
        pacmanTimeoutRef.current = window.setTimeout(movePacman, PACMAN_SPEED);
        return () => { if (pacmanTimeoutRef.current) clearTimeout(pacmanTimeoutRef.current); };
    }, [pacman, gameOver, movePacman]);

    useEffect(() => {
        if(gameOver) return;
        ghostsTimeoutRef.current = window.setTimeout(moveGhosts, isFrightened ? GHOST_FRIGHTENED_SPEED : GHOST_NORMAL_SPEED);
        return () => { if (ghostsTimeoutRef.current) clearTimeout(ghostsTimeoutRef.current); };
    }, [ghosts, gameOver, isFrightened, moveGhosts]);
    
    // Collision Detection
    useEffect(() => {
        ghosts.forEach((ghost, i) => {
            if (ghost.x === pacman.x && ghost.y === pacman.y) {
                if (frightenedModeRef.current) {
                    setScore(s => s + 200);
                    setGhosts(gs => gs.map(g => g.id === i ? {...g, x: 9, y: 9} : g));
                } else {
                    setGameOver(true);
                }
            }
        });
    }, [pacman, ghosts]);

    // Drawing Loop
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        const draw = () => {
            ctx.clearRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);
            
            if (board.length === 0) return;

            board.forEach((row, y) => row.forEach((cell, x) => {
                if (cell === '#') {
                    ctx.fillStyle = '#0022ff';
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (cell === '.') {
                    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 2, 0, 2 * Math.PI); ctx.fill();
                } else if (cell === 'O') {
                    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 6, 0, 2 * Math.PI); ctx.fill();
                }
            }));

            const mouthAngle = 0.2 * Math.abs(Math.sin(Date.now() * 0.01));
            ctx.save();
            ctx.translate(pacman.x * TILE_SIZE + TILE_SIZE / 2, pacman.y * TILE_SIZE + TILE_SIZE / 2);
            if (pacman.dir === DIRS.RIGHT) ctx.rotate(0); if (pacman.dir === DIRS.DOWN) ctx.rotate(0.5 * Math.PI); if (pacman.dir === DIRS.LEFT) ctx.rotate(Math.PI); if (pacman.dir === DIRS.UP) ctx.rotate(1.5 * Math.PI);
            ctx.fillStyle = 'yellow'; ctx.beginPath();
            ctx.arc(0, 0, TILE_SIZE / 2 - 1, mouthAngle, 2 * Math.PI - mouthAngle);
            ctx.lineTo(0, 0); ctx.fill();
            ctx.restore();
            
            const ghostColors = ['#ff5252', '#ffc0cb', '#00ffff', '#ffa500'];
            ghosts.forEach((ghost, i) => {
                 ctx.fillStyle = isFrightened ? '#42a5f5' : ghostColors[ghost.id % ghostColors.length];
                 ctx.beginPath(); ctx.arc(ghost.x * TILE_SIZE + TILE_SIZE / 2, ghost.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2 - 1, Math.PI, 0);
                 ctx.lineTo(ghost.x * TILE_SIZE + TILE_SIZE -1, ghost.y * TILE_SIZE + TILE_SIZE - 2);
                 ctx.lineTo(ghost.x * TILE_SIZE + 1, ghost.y * TILE_SIZE + TILE_SIZE - 2);
                 ctx.fill();
                 ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(ghost.x * TILE_SIZE + 5, ghost.y * TILE_SIZE + 8, 2, 0, 2*Math.PI); ctx.fill();
                 ctx.beginPath(); ctx.arc(ghost.x * TILE_SIZE + 15, ghost.y * TILE_SIZE + 8, 2, 0, 2*Math.PI); ctx.fill();
            });

            gameLoopRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => { if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current) };
    }, [board, pacman, ghosts, isFrightened]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(state.activeWindowId !== windowId) return;
            e.preventDefault();
            let newDir: Direction = null;
            if (e.key === 'ArrowUp' || e.key === 'w') newDir = DIRS.UP;
            if (e.key === 'ArrowDown' || e.key === 's') newDir = DIRS.DOWN;
            if (e.key === 'ArrowLeft' || e.key === 'a') newDir = DIRS.LEFT;
            if (e.key === 'ArrowRight' || e.key === 'd') newDir = DIRS.RIGHT;
            if (newDir) setPacman(p => ({...p, nextDir: newDir}));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.activeWindowId, windowId]);
    
    const changeDirection = (dir: keyof typeof DIRS) => setPacman(p => ({...p, nextDir: DIRS[dir]}));
    const handleExit = () => dispatch({ type: 'CLOSE_WINDOW', payload: windowId });
    const controlButtonClass = "w-16 h-16 bg-gray-500/80 text-white text-3xl font-bold rounded-lg flex items-center justify-center active:bg-gray-400";

    return (
        <div className="flex flex-col items-center justify-center h-full bg-black font-display p-2">
            <div className="flex justify-between w-full text-yellow-300 mb-2 px-1" style={{ width: COLS * TILE_SIZE }}>
                <h2 className='font-bold text-lg'>PAC-MAN</h2>
                <div className='font-bold text-lg'>{text.score}: {score}</div>
            </div>
             <div className="relative">
                <canvas ref={canvasRef} width={COLS * TILE_SIZE} height={ROWS * TILE_SIZE} />
                 {gameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
                        <h3 className="text-4xl font-bold text-yellow-400">{isWin ? text.youWin : text.gameOver}</h3>
                        <div className="mt-6 flex space-x-4">
                            <button onClick={resetGame} className="px-4 py-2 bg-blue-500 text-white font-bold rounded">{text.restart}</button>
                            <button onClick={handleExit} className="px-4 py-2 bg-red-500 text-white font-bold rounded">{text.exit}</button>
                        </div>
                    </div>
                )}
                <div className="absolute bottom-4 left-4 game-controls grid-cols-3 grid-rows-3 gap-2 w-auto">
                    <div className="col-start-2 row-start-1"><button onClick={() => changeDirection('UP')} className={controlButtonClass}>▲</button></div>
                    <div className="col-start-1 row-start-2"><button onClick={() => changeDirection('LEFT')} className={controlButtonClass}>◀</button></div>
                    <div className="col-start-3 row-start-2"><button onClick={() => changeDirection('RIGHT')} className={controlButtonClass}>▶</button></div>
                    <div className="col-start-2 row-start-3"><button onClick={() => changeDirection('DOWN')} className={controlButtonClass}>▼</button></div>
                </div>
            </div>
        </div>
    );
};

export default PacmanApp;
