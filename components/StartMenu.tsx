import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UI_TEXT } from '../constants';
import { AppIcon } from './Icons';
import { DesktopItem } from '../types';

const SystemMenu: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isSystemMenuOpen, isAdmin, desktopItems, language, settings, theme } = state;
    const text = UI_TEXT[language];

    if (!isSystemMenuOpen) {
        return null;
    }
    
    const handleAppClick = (item: DesktopItem) => {
        dispatch({ type: 'EXECUTE_COMMAND', payload: { command: `start ${item.label}`, history: state.terminalHistory } });
        dispatch({ type: 'HIDE_SYSTEM_MENU' });
    };

    const handleLogoff = () => {
        dispatch({ type: 'LOGOUT' });
    };

    const handleShutdown = () => {
        dispatch({ type: 'SHUTDOWN' });
    };

    const DOCK_APPROX_HEIGHT_PX = 64; // Approx height of the new floating dock
    const MENU_MARGIN_PX = 8;
    const dockBottomRem = settings.screenCurvature ? 2.5 : 1;

    const menuPositionStyle: React.CSSProperties = {
        bottom: `calc(${dockBottomRem}rem + ${DOCK_APPROX_HEIGHT_PX}px + ${MENU_MARGIN_PX}px)`,
        left: '50%',
        transform: 'translateX(-50%)',
    };
    
    const menuStyle = {
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        color: '#e0e0e0',
        border: `1px solid ${theme.borderColor}`,
        boxShadow: '4px 4px 12px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
    };
    
    const appList = desktopItems.filter(item => item.type === 'app').sort((a,b) => a.label.localeCompare(b.label));

    return (
        <div 
            className="absolute flex flex-col w-72 h-auto max-h-[70vh] rounded-lg z-[950] system-menu-component overflow-hidden" 
            style={{...menuPositionStyle, ...menuStyle}}
            onMouseDown={(e) => e.stopPropagation()} // Prevent desktop click-away
        >
            <div className="flex items-center p-3 border-b" style={{borderColor: theme.borderColor}}>
                 <div className="w-12 h-12 rounded-full bg-gray-500 mr-4 flex items-center justify-center text-white font-bold text-2xl border-2 border-gray-400">
                    {isAdmin ? 'A' : 'G'}
                </div>
                <span className="font-bold text-xl">{isAdmin ? text.admin : text.guest}</span>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-1">
                {appList.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => handleAppClick(item)}
                        className="flex items-center w-full p-2 hover:bg-[var(--accent-color)] hover:text-white rounded-md transition-colors duration-150"
                    >
                        <AppIcon iconType={item.iconType} themeStyle={settings.themeStyle} className="w-8 h-8 mr-3" />
                        <span className="font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
            <div className="flex-shrink-0 border-t" style={{borderColor: theme.borderColor}}>
                <div className="flex justify-around p-2">
                     <button onClick={handleLogoff} className="font-bold hover:underline">{isAdmin ? text.logOff : text.login}</button>
                     <button onClick={handleShutdown} className="font-bold text-red-500 hover:underline">{text.shutDown}</button>
                </div>
            </div>
        </div>
    );
};

export default SystemMenu;