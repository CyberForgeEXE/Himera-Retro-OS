import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppIcon, HimeraMenuIcon } from './Icons';
import Clock from './Clock';
import BatteryIndicator from './Battery';
import { UI_TEXT } from '../../constants';

const TaskbarComponent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { windows, activeWindowId, settings, language, isSystemMenuOpen } = state;

  const handleTaskbarButtonClick = (id: string) => {
      const targetWindow = windows.find(w => w.id === id);
      if (targetWindow?.isMinimized || id !== activeWindowId) {
          dispatch({ type: 'FOCUS_WINDOW', payload: id });
      } else {
          dispatch({ type: 'TOGGLE_MINIMIZE_WINDOW', payload: id });
      }
  }

  const handleStartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: 'TOGGLE_SYSTEM_MENU' });
  };
  
  const dockContainerStyle: React.CSSProperties = {
      bottom: settings.screenCurvature ? '4rem' : '1rem',
      maxWidth: 'calc(100vw - 2rem)', // Ensure dock doesn't overflow on small screens
  };

  const Separator = () => <div className="h-8 w-px bg-white/30 mx-1" />;
  const iconDegradeClass = settings.vhsScanlines ? 'icon-degrade-effect' : '';

  return (
    <footer
        className="absolute left-1/2 -translate-x-1/2 flex z-[900]"
        style={dockContainerStyle}
    >
        <div className="flex h-auto w-auto items-center p-2 gap-2 rounded-2xl bg-black/40 backdrop-blur-md shadow-lg border border-white/20">
            <button
                onClick={handleStartClick}
                className={`flex-shrink-0 flex items-center justify-center p-1 rounded-full transition-all duration-200 group w-12 h-12 ${isSystemMenuOpen ? 'bg-cyan-500/50' : 'hover:bg-white/20'}`}
            >
                <HimeraMenuIcon className={`w-8 h-8 text-white transition-all duration-300 group-hover:rotate-90 ${isSystemMenuOpen ? 'text-cyan-200 rotate-90 scale-110' : ''}`} />
            </button>

            {windows.length > 0 && <Separator />}

            <div className="flex h-full gap-2 flex-row">
                {windows.map(win => {
                    const isActive = win.id === activeWindowId && !win.isMinimized;
                    const buttonStyle = isActive ? 'bg-white/20 scale-110' : 'bg-transparent';
                    return (
                        <button
                            key={win.id}
                            onClick={() => handleTaskbarButtonClick(win.id)}
                            className={`relative flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-200 hover:scale-110 ${buttonStyle}`}
                            title={win.title}
                        >
                            <AppIcon
                                iconType={win.appType}
                                themeStyle={settings.themeStyle}
                                className={`w-10 h-10 ${iconDegradeClass}`}
                            />
                            {!win.isMinimized && <div className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full mb-1" />}
                        </button>
                    )
                })}
            </div>

            {(settings.battery.show || settings.clock.position === 'taskbar') && windows.length > 0 && <Separator />}
            
            <div className="flex items-center text-white text-xs">
                {settings.battery.show && settings.battery.position === 'dock' && <BatteryIndicator />}
                {settings.clock.position === 'taskbar' && <Clock isTaskbarClock={true} size={14} />}
            </div>
        </div>
    </footer>
  );
};

const Taskbar = React.memo(TaskbarComponent);
export default Taskbar;
