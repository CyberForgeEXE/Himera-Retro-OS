import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppIcon } from './Icons';

const FullScreenMenu: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { desktopItems, settings } = state;

  const handleAppClick = (appLabel: string) => {
    dispatch({ type: 'EXECUTE_COMMAND', payload: { command: `start ${appLabel}`, history: state.terminalHistory } });
    dispatch({ type: 'TOGGLE_FULLSCREEN_MENU' }); // Close menu after opening app
  };
  
  const handleClose = () => {
    dispatch({ type: 'TOGGLE_FULLSCREEN_MENU' });
  };

  const appList = desktopItems.filter(item => item.type === 'app').sort((a,b) => a.label.localeCompare(b.label));

  return (
    <div 
        className="fixed inset-0 bg-black/90 z-[1000] flex flex-col items-center justify-center p-8 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out;
        }
        .menu-item-glitch {
            animation: text-flicker-anim 5s infinite;
            transition: all 0.2s ease-in-out;
        }
        .menu-item-glitch:hover {
            transform: scale(1.05);
            background-color: var(--accent-color);
            color: white;
            text-shadow: 0 0 10px white;
        }
      `}</style>
      <div 
        className="w-full max-w-4xl h-full max-h-[80vh] p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the grid
      >
        {appList.map(item => (
            <button
                key={item.id}
                onClick={() => handleAppClick(item.label)}
                className="menu-item-glitch flex flex-col items-center justify-center p-4 border border-gray-700 rounded-lg text-gray-300"
            >
                <AppIcon iconType={item.iconType} themeStyle={settings.themeStyle} className="w-16 h-16 mb-2" />
                <span className="font-display text-lg">{item.label}</span>
            </button>
        ))}
      </div>
      <p className="text-gray-500 mt-4 text-sm">Press ESC to close</p>
    </div>
  );
};

export default FullScreenMenu;
