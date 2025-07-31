
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT } from '../../constants';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 440;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface SnakeAppProps {
    windowId: string;
}

const SnakeApp: React.FC<SnakeAppProps> = ({ windowId }) => {
    const { state, dispatch } = useAppContext();
    const text = UI_TEXT[state.language];
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const initialSnake = () => [{ x: 10, y: 10 }];
    const createInitialFood = () => ({
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
    });
    
    const [snake, setSnake] = useState(initialSnake);
    const [food, setFood] = useState(createInitialFood);
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [speed, setSpeed] = useState<number | null>(120);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const createFood = useCallback((currentSnake: {x:number, y:number}[]) => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
                y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
            };
        } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        setFood(newFood);
    }, []);
    
    const changeDirection = useCallback((newDir: Direction) => {
        setDirection(currentDir => {
            if (newDir === 'UP' && currentDir !== 'DOWN') return 'UP';
            if (newDir === 'DOWN' && currentDir !== 'UP') return 'DOWN';
            if (newDir === 'LEFT' && currentDir !== 'RIGHT') return 'LEFT';
            if (newDir === 'RIGHT' && currentDir !== 'LEFT') return 'RIGHT';
            return currentDir;
        });
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if(state.activeWindowId !== windowId) return;
        e.preventDefault();
        switch (e.key) {
            case 'ArrowUp': case 'w': changeDirection('UP'); break;
            case 'ArrowDown': case 's': changeDirection('DOWN'); break;
            case 'ArrowLeft': case 'a': changeDirection('LEFT'); break;
            case 'ArrowRight': case 'd': changeDirection('RIGHT'); break;
        }
    }, [changeDirection, state.activeWindowId, windowId]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const runGame = useCallback(() => {
        setSnake(prevSnake => {
            const newSnake = [...prevSnake];
            const head = { ...newSnake[0] };

            switch (direction) {
                case 'UP': head.y -= 1; break;
                case 'DOWN': head.y += 1; break;
                case 'LEFT': head.x -= 1; break;
                case 'RIGHT': head.x += 1; break;
            }

            if (
                head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE ||
                head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE ||
                newSnake.some(segment => segment.x === head.x && segment.y === head.y)
            ) {
                setGameOver(true);
                setSpeed(null);
                return prevSnake;
            }

            newSnake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                setScore(prev => prev + 10);
                createFood(newSnake);
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food.x, food.y, createFood]);

    useEffect(() => {
        if (speed === null || gameOver) return;
        const gameInterval = setInterval(runGame, speed);
        return () => clearInterval(gameInterval);
    }, [runGame, speed, gameOver]);
    
    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');
        if (!context) return;
        
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.fillStyle = '#4a5568';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        context.fillStyle = '#48bb78';
        snake.forEach(segment => {
            context.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        });

        context.fillStyle = '#f56565';
        context.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    }, [snake, food, gameOver]);

    const restartGame = () => {
        setSnake(initialSnake());
        setFood(createInitialFood());
        setDirection('RIGHT');
        setGameOver(false);
        setSpeed(120);
        setScore(0);
    };

    const handleExit = () => {
        dispatch({ type: 'CLOSE_WINDOW', payload: windowId });
    };

    const controlButtonClass = "w-16 h-16 bg-gray-500 text-white text-3xl font-bold rounded-lg flex items-center justify-center opacity-70 active:opacity-100";

    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#c0c0c0] font-sans p-2">
            <div className='flex justify-between w-full max-w-[440px] mb-2 px-1'>
                <h2 className='font-bold text-lg'>Snake</h2>
                <div className='font-bold text-lg'>{text.score}: {score}</div>
            </div>
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="bg-gray-800 border-2 border-t-gray-700 border-l-gray-700 border-r-white border-b-white"
                />
                {gameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                        <h3 className="text-4xl font-bold font-retro">{text.gameOver}</h3>
                        <p className="text-2xl font-retro mt-2">{text.score}: {score}</p>
                        <div className="mt-6 flex space-x-4">
                            <button onClick={restartGame} className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 active:bg-blue-700 border-2 border-t-white border-l-white border-b-black border-r-black">{text.restart}</button>
                            <button onClick={handleExit} className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 active:bg-red-700 border-2 border-t-white border-l-white border-b-black border-r-black">{text.exit}</button>
                        </div>
                    </div>
                )}
                 {/* On-screen controls for touch devices */}
                <div className="absolute bottom-4 right-4 game-controls grid-cols-3 grid-rows-3 gap-2 w-auto">
                    <div className="col-start-2 row-start-1">
                        <button onClick={() => changeDirection('UP')} className={controlButtonClass}>▲</button>
                    </div>
                    <div className="col-start-1 row-start-2">
                        <button onClick={() => changeDirection('LEFT')} className={controlButtonClass}>◀</button>
                    </div>
                     <div className="col-start-3 row-start-2">
                        <button onClick={() => changeDirection('RIGHT')} className={controlButtonClass}>▶</button>
                    </div>
                    <div className="col-start-2 row-start-3">
                        <button onClick={() => changeDirection('DOWN')} className={controlButtonClass}>▼</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnakeApp;
