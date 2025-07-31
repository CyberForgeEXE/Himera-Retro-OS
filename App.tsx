import React, { useState, useEffect } from 'react';
import BootScreen from './components/BootScreen';
import Desktop from './components/Desktop';
import { useAppContext } from './contexts/AppContext';
import ContextMenu from './components/ContextMenu';
import SelectionBox from './components/SelectionBox';
import ShutdownScreen from './components/ShutdownScreen';
import FullScreenMenu from './components/FullScreenMenu';

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const { state, dispatch } = useAppContext();
  const { theme, settings, contextMenu, isShuttingDown, isFullScreenMenuOpen } = state;

  const VIRTUAL_WIDTH = 1440; // The width the app is designed for
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
        const { innerWidth } = window;
        // Scale down if the screen width is less than the virtual width.
        // This ensures a consistent desktop-like view on smaller devices like tablets and landscape phones.
        if (innerWidth < VIRTUAL_WIDTH) {
            setScale(innerWidth / VIRTUAL_WIDTH);
        } else {
            setScale(1);
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--window-bg', theme.windowBg);
    root.style.setProperty('--taskbar-bg', theme.taskbarBg);
    root.style.setProperty('--vignette-intensity', String(settings.vignetteIntensity));
  }, [theme, settings.vignetteIntensity]);
  
  useEffect(() => {
    const setFallbackBattery = () => {
        dispatch({
            type: 'SET_BATTERY_STATUS',
            payload: { level: 88, isCharging: true },
        });
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryStatus = () => {
          dispatch({
            type: 'SET_BATTERY_STATUS',
            payload: {
              level: battery.level * 100,
              isCharging: battery.charging,
            },
          });
        };
        updateBatteryStatus();
        battery.addEventListener('chargingchange', updateBatteryStatus);
        battery.addEventListener('levelchange', updateBatteryStatus);

        return () => {
          battery.removeEventListener('chargingchange', updateBatteryStatus);
          battery.removeEventListener('levelchange', updateBatteryStatus);
        };
      }).catch(setFallbackBattery);
    } else {
        setFallbackBattery();
    }
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.isFullScreenMenuOpen) {
          dispatch({ type: 'TOGGLE_FULLSCREEN_MENU' });
        } else if (state.isSystemMenuOpen) {
          dispatch({ type: 'HIDE_SYSTEM_MENU' });
        } else if (state.contextMenu.isOpen) {
          dispatch({ type: 'HIDE_CONTEXT_MENU' });
        } else {
          // If no other menus are open, open the fullscreen menu
          dispatch({ type: 'TOGGLE_FULLSCREEN_MENU' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, state.isFullScreenMenuOpen, state.isSystemMenuOpen, state.contextMenu.isOpen]);


  return (
    <>
      <div style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: scale === 1 ? '100vw' : VIRTUAL_WIDTH,
          height: scale === 1 ? '100vh' : (window.innerHeight / scale)
      }}>
          <div className={`font-retro w-full h-full ${booting ? 'screen-jitter-boot' : ''} ${settings.screenCurvature ? 'screen-curvature' : ''}`}>
            <div 
              className={`w-full h-full bg-black overflow-hidden relative effects-container ${settings.vignetteIntensity > 0 ? 'vignette-effect' : ''} ${settings.screenJitter ? 'screen-jitter' : ''} ${settings.vhsScanlines ? 'vhs-scanlines' : ''} ${settings.textGlow ? 'text-glow' : ''}`}
            >
              {/* Background Layer */}
              {!isShuttingDown && (
                <div
                  className={`absolute inset-0 bg-cover bg-center ${settings.lowQualityWallpaper ? 'low-quality-effect' : ''}`}
                  style={{ backgroundImage: `url(${theme.wallpaper})`}}
                />
              )}
              
              {/* Content Layer */}
              <div className="absolute inset-0">
                {isShuttingDown ? (
                  <ShutdownScreen />
                ) : booting ? (
                  <BootScreen onBootComplete={() => setBooting(false)} />
                ) : (
                  <>
                    <Desktop />
                    {contextMenu.isOpen && <ContextMenu />}
                    <SelectionBox />
                  </>
                )}
              </div>
            </div>
          </div>
      </div>
      {isFullScreenMenuOpen && <FullScreenMenu />}
    </>
  );
};

export default App;