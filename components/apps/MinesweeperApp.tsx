
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT } from '../../constants';

interface Cell {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    adjacentMines: number;
}

interface MinesweeperAppProps {
    windowId: string;
}

const ROWS = 10;
const COLS = 10;
const MINES = 12;

const MinesweeperApp: React.FC<MinesweeperAppProps> = ({ windowId }) => {
    const { state, dispatch } = useAppContext();
    const text = UI_TEXT[state.language];

    const [board, setBoard] = useState<Cell[][]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [flags, setFlags] = useState(MINES);
    const [face, setFace] = useState('🙂');
    const touchTimer = useRef<number | null>(null);

    const createEmptyBoard = () => Array(ROWS).fill(null).map(() => 
        Array(COLS).fill(null).map(() => ({
            isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0
        }))
    );

    const restartGame = useCallback(() => {
        setBoard(createEmptyBoard());
        setGameOver(false);
        setIsWin(false);
        setIsGameStarted(false);
        setFlags(MINES);
        setFace('🙂');
    }, []);

    useEffect(() => {
        restartGame();
    }, [restartGame]);

    const revealCellRecursive = (r: number, c: number, boardCopy: Cell[][]): Cell[][] => {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS || boardCopy[r][c].isRevealed || boardCopy[r][c].isFlagged) {
            return boardCopy;
        }

        boardCopy[r][c].isRevealed = true;

        if (boardCopy[r][c].adjacentMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    revealCellRecursive(r + i, c + j, boardCopy);
                }
            }
        }
        return boardCopy;
    };
    
    const handleCellClick = (r: number, c: number) => {
        if (gameOver || board[r][c].isRevealed || board[r][c].isFlagged) return;

        let newBoard = JSON.parse(JSON.stringify(board));

        if (!isGameStarted) {
            // First click logic: generate board ensuring first click is safe
            let minesPlaced = 0;
            while (minesPlaced < MINES) {
                const row = Math.floor(Math.random() * ROWS);
                const col = Math.floor(Math.random() * COLS);
                // Don't place a mine on the first clicked cell
                if (!newBoard[row][col].isMine && !(row === r && col === c)) {
                    newBoard[row][col].isMine = true;
                    minesPlaced++;
                }
            }

            // Calculate adjacent mines
            for (let r_idx = 0; r_idx < ROWS; r_idx++) {
                for (let c_idx = 0; c_idx < COLS; c_idx++) {
                    if (newBoard[r_idx][c_idx].isMine) continue;
                    let count = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const newR = r_idx + i;
                            const newC = c_idx + j;
                            if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS && newBoard[newR][newC].isMine) {
                                count++;
                            }
                        }
                    }
                    newBoard[r_idx][c_idx].adjacentMines = count;
                }
            }
            setIsGameStarted(true);
        }

        if (newBoard[r][c].isMine) {
            setGameOver(true);
            setIsWin(false);
            setFace('😵');
            newBoard.forEach((row: Cell[]) => row.forEach(cell => { if (cell.isMine) cell.isRevealed = true; }));
        } else {
            newBoard = revealCellRecursive(r, c, newBoard);
        }
        
        setBoard(newBoard);
    };
    
    const toggleFlag = (r: number, c: number) => {
        if (gameOver || board[r][c].isRevealed || !isGameStarted) return;

        const newBoard = JSON.parse(JSON.stringify(board));
        const cell = newBoard[r][c];

        if (cell.isFlagged) {
            cell.isFlagged = false;
            setFlags(f => f + 1);
        } else if (flags > 0) {
            cell.isFlagged = true;
            setFlags(f => f - 1);
        }
        setBoard(newBoard);
    };

    const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        toggleFlag(r, c);
    };
    
    const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
        e.preventDefault();
        touchTimer.current = window.setTimeout(() => {
            toggleFlag(r, c);
            touchTimer.current = null;
        }, 300);
    };
    
    const handleTouchEnd = (e: React.TouchEvent, r: number, c: number) => {
        e.preventDefault();
        if (touchTimer.current) {
            clearTimeout(touchTimer.current);
            touchTimer.current = null;
            handleCellClick(r, c);
        }
    };

     useEffect(() => {
        if(gameOver || !isGameStarted) return;
        const revealedCount = board.flat().filter(cell => cell.isRevealed).length;
        if(revealedCount > 0 && revealedCount === ROWS * COLS - MINES) {
            setGameOver(true);
            setIsWin(true);
            setFace('😎');
        }
    }, [board, gameOver, isGameStarted]);

    const handleExit = () => dispatch({ type: 'CLOSE_WINDOW', payload: windowId });
    
    const getCellContent = (cell: Cell) => {
        if (gameOver && cell.isMine && !cell.isFlagged) return '💣';
        if (cell.isFlagged) return '🚩';
        if (!cell.isRevealed) return '';
        if (cell.isMine) return '💥';
        if (cell.adjacentMines > 0) return cell.adjacentMines.toString();
        return '';
    };
    
    const colorMap: {[key: number]: string} = {1: '#0000ff', 2: '#008000', 3: '#ff0000', 4: '#000080', 5: '#800000', 6: '#008080', 7: '#000000', 8: '#808080'};
    const classicButton = "border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 active:border-t-gray-500 active:border-l-gray-500 active:border-b-white active:border-r-white";

    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#c0c0c0] font-sans p-4 select-none">
            <div className="flex justify-between w-full max-w-sm mb-2 p-2 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
                <div className="font-bold text-lg text-red-600 bg-black px-2 py-1 font-mono">{String(flags).padStart(3, '0')}</div>
                <button onClick={restartGame} className={`text-2xl w-10 h-10 flex items-center justify-center ${classicButton}`}>{face}</button>
                <div className="font-bold text-lg text-red-600 bg-black px-2 py-1 font-mono">000</div>
            </div>
            <div className="grid border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                {board.map((row, r) => row.map((cell, c) => (
                    <button 
                        key={`${r}-${c}`} 
                        onClick={() => handleCellClick(r, c)}
                        onContextMenu={(e) => handleRightClick(e, r, c)}
                        onTouchStart={(e) => handleTouchStart(e, r, c)}
                        onTouchEnd={(e) => handleTouchEnd(e, r, c)}
                        onMouseDown={() => !gameOver && setFace('😮')}
                        onMouseUp={() => !gameOver && setFace('🙂')}
                        className={`w-8 h-8 flex items-center justify-center font-bold text-xl ${
                            cell.isRevealed 
                                ? 'border-gray-400 border-b border-l' 
                                : classicButton
                        }`}
                        style={{color: cell.isRevealed ? colorMap[cell.adjacentMines] : 'black' }}
                        disabled={gameOver && !isWin}
                    >
                        {getCellContent(cell)}
                    </button>
                )))}
            </div>
            {gameOver && (
                <div className="mt-4 flex flex-col items-center justify-center text-black">
                    <h3 className="text-3xl font-bold font-retro">{isWin ? text.youWin : text.gameOver}</h3>
                    <div className="mt-4 flex space-x-4">
                        <button onClick={restartGame} className={`px-4 py-2 bg-[#c0c0c0] text-black font-bold ${classicButton}`}>{text.restart}</button>
                        <button onClick={handleExit} className={`px-4 py-2 bg-[#c0c0c0] text-black font-bold ${classicButton}`}>{text.exit}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinesweeperApp;
