import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useWindowVirtualization } from '../../hooks/useWindowVirtualization';

const TerminalApp: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { settings, terminalLines, terminalHistory, currentPath } = state;

  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Virtualization Hook
  const { visibleItems, virtualizer, scrollToBottom } = useWindowVirtualization(terminalLines.length, {
    itemHeight: 22, // Approximate height of a single line
    containerRef: scrollContainerRef,
  });

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) {
      dispatch({ type: 'EXECUTE_COMMAND', payload: { command: '', history: terminalHistory } });
      return;
    }
    
    dispatch({ type: 'EXECUTE_COMMAND', payload: { command: cmd, history: terminalHistory } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < terminalHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(terminalHistory[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(terminalHistory[newIndex]);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setInput('');
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Basic auto-completion could be added here
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLines.length, scrollToBottom]);

  const terminalBgStyle = settings.terminal.bgImage ? {
      backgroundImage: `url(${settings.terminal.bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
  } : { backgroundColor: settings.terminal.bgColor };
  
  const fontClass = `font-${settings.terminal.font.toLowerCase().replace(' ', '-')}`;

  return (
    <div 
      className={`h-full text-lg leading-tight relative overflow-hidden flex flex-col ${fontClass} text-shadow-none`} 
      onClick={() => inputRef.current?.focus()}
      style={{ ...terminalBgStyle, color: settings.terminal.textColor }}
    >
      <div ref={scrollContainerRef} className="flex-grow w-full overflow-y-auto custom-scrollbar p-2 pr-4 relative">
          <div style={virtualizer.style}>
            {visibleItems.map(index => {
                const line = terminalLines[index];
                if (!line) return null;
                const promptPath = line.type === 'input' ? line.path || currentPath : null;
                return (
                  <div key={index} style={virtualizer.getItemStyle(index)} className="whitespace-pre-wrap">
                      {promptPath && (
                          <span className="text-green-400">
                              guest@himera:<span className="text-blue-400">{promptPath}</span>$&nbsp;
                          </span>
                      )}
                      <span style={{ color: line.type === 'error' ? '#ff6b6b' : 'inherit' }}>
                        {line.content}
                      </span>
                  </div>
                )
            })}
          </div>
      </div>

      <div className="flex-shrink-0 flex p-2 pt-0 z-10">
        <span className="text-green-400">
            guest@himera:<span className="text-blue-400">{currentPath}</span>$&nbsp;
        </span>
        <input
            ref={inputRef}
            id="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-inherit flex-grow"
            autoFocus
            spellCheck="false"
        />
      </div>
    </div>
  );
};

export default TerminalApp;
