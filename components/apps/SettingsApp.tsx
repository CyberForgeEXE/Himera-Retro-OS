

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT, XP_THEME, CLASSIC_THEME } from '../../constants';
import { SystemSettings, Theme, AppState } from '../../types';

// Helper to extract keys of T whose values are objects.
type KeysWithObjectValues<T> = {
  [K in keyof T]: T[K] extends object ? K : never
}[keyof T];

const SettingsApp: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { isAdmin, settings, theme, language } = state;
  const text = UI_TEXT[language];

  const [activeTab, setActiveTab] = useState('appearance');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Local state for staging settings changes
  const [tempSettings, setTempSettings] = useState<SystemSettings>(() => JSON.parse(JSON.stringify(settings)));
  const [tempTheme, setTempTheme] = useState<Theme>(() => JSON.parse(JSON.stringify(theme)));

  // Resync local state if global state changes from elsewhere (e.g., terminal command, or reopening window)
  useEffect(() => {
    setTempSettings(JSON.parse(JSON.stringify(settings)));
    setTempTheme(JSON.parse(JSON.stringify(theme)));
  }, [settings, theme]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Thumex' && password === 'erixon2008') {
      dispatch({ type: 'LOGIN' });
      setError('');
    } else {
      setError('ACCESS DENIED. Invalid username or password.');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  const handleSettingsChange = (key: keyof SystemSettings, value: any) => {
      const newSettings = { ...tempSettings, [key]: value };
      setTempSettings(newSettings);
      if (key === 'themeStyle') {
          setTempTheme(value === 'classic' ? CLASSIC_THEME : XP_THEME);
      }
  };
  
  const handleNestedSettingsChange = (category: KeysWithObjectValues<SystemSettings>, key: string, value: any) => {
      setTempSettings(prev => ({
          ...prev,
          [category]: { ...prev[category], [key]: value }
      }));
  };
  
  const handleThemeChange = (key: keyof Theme, value: any) => {
      setTempTheme(prev => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
      const baseTheme = tempSettings.themeStyle === 'xp' ? XP_THEME : CLASSIC_THEME;
      setTempTheme(baseTheme);
  };

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: tempSettings });
    dispatch({ type: 'SET_THEME', payload: tempTheme });
    alert('Settings have been saved!');
  }

  const handleExport = () => {
    const stateToSave: Partial<AppState> = {
        isAdmin: state.isAdmin,
        theme: state.theme,
        settings: state.settings,
        desktopItems: state.desktopItems,
        blogPosts: state.blogPosts,
        fileSystem: state.fileSystem,
        currentPath: state.currentPath,
        terminalHistory: state.terminalHistory,
        language: state.language,
    };
    const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `himera-xp-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const textContent = event.target?.result;
              if (typeof textContent !== 'string') throw new Error("Invalid file content");
              const importedState = JSON.parse(textContent);
              
              if (importedState.settings && importedState.theme) {
                  dispatch({ type: 'LOAD_STATE', payload: importedState });
                  alert('Configuration imported successfully! It is now saved in this browser.');
              } else {
                  throw new Error("Invalid configuration file format.");
              }
          } catch (err: any) {
              console.error("Failed to import configuration:", err);
              alert(`Error importing configuration: ${err.message}`);
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Allow re-importing the same file
  };


  const inputStyle = "font-sans bg-white border border-gray-500 p-1 w-full outline-none focus:ring-1 focus:ring-blue-500 text-black";
  const buttonStyle = "font-sans bg-[#ccc] border border-gray-600 shadow-[1px_1px_1px_#999] px-4 py-1 hover:bg-gray-300 text-black active:shadow-none active:bg-gray-400";
  const fieldsetSyle = "border border-gray-400 p-3 mt-4";
  const legendStyle = "px-2 font-bold font-sans";
  const labelStyle = "w-40 inline-block mr-2";
  const checkboxLabelStyle = "ml-2 select-none";

  const renderAppearanceTab = () => (
    <>
        <fieldset className={fieldsetSyle}>
            <legend className={legendStyle}>{text.wallpaperUrl}</legend>
            <div className="flex items-center mb-2">
                <input type="text" id="wallpaper" value={tempTheme.wallpaper} onChange={(e) => handleThemeChange('wallpaper', e.target.value)} className={inputStyle + " w-auto flex-grow"} />
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
                 <button onClick={() => handleThemeChange('wallpaper', 'https://www.wallpaperhub.app/_next/image?url=https%3A%2F%2Fcdn.wallpaperhub.app%2Fcloudcache%2Fe%2F6%2F7%2F3%2F1%2F4%2Fe6731493cd50103e3561288c33a6a589c9bf67ab.jpg&w=1920&q=75')} className={buttonStyle}>Bliss</button>
                 <button onClick={() => handleThemeChange('wallpaper', 'https://cdn.benchmark.pl/thumbs/uploads/article/80379/MODERNICON/a88946ca8e4146ff0b931106a665eb90cfa5bfdb.jpg/936x639x1.jpg')} className={buttonStyle}>Windows</button>
                 <button onClick={() => handleThemeChange('wallpaper', 'https://www.wallpaperhub.app/_next/image?url=https%3A%2F%2Fcdn.wallpaperhub.app%2Fcloudcache%2F9%2F0%2Fc%2F7%2Ff%2Ff%2F90c7ff76ed6d6a78e7953c0d71b9a7162234a3c8.jpg&w=1920&q=75')} className={buttonStyle}>Gradient Hub</button>
            </div>
             <div className="flex items-center">
                <input type="checkbox" id="lowQualityWallpaper" checked={tempSettings.lowQualityWallpaper} onChange={(e) => handleSettingsChange('lowQualityWallpaper', e.target.checked)} />
                <label htmlFor="lowQualityWallpaper" className={checkboxLabelStyle}>{text.lowQualityWallpaper}</label>
            </div>
        </fieldset>

        <fieldset className={fieldsetSyle}>
            <legend className={legendStyle}>{text.retroEffects}</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <div className="flex items-center">
                    <input type="checkbox" id="screenJitter" checked={tempSettings.screenJitter} onChange={(e) => handleSettingsChange('screenJitter', e.target.checked)} />
                    <label htmlFor="screenJitter" className={checkboxLabelStyle}>{text.screenJitter}</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="vhsScanlines" checked={tempSettings.vhsScanlines} onChange={(e) => handleSettingsChange('vhsScanlines', e.target.checked)} />
                    <label htmlFor="vhsScanlines" className={checkboxLabelStyle}>{text.vhsScanlines}</label>
                </div>
                 <div className="flex items-center">
                    <input type="checkbox" id="textGlow" checked={tempSettings.textGlow} onChange={(e) => handleSettingsChange('textGlow', e.target.checked)} />
                    <label htmlFor="textGlow" className={checkboxLabelStyle}>{text.textGlow}</label>
                </div>
                 <div className="flex items-center">
                    <input type="checkbox" id="screenCurvature" checked={tempSettings.screenCurvature} onChange={(e) => handleSettingsChange('screenCurvature', e.target.checked)} />
                    <label htmlFor="screenCurvature" className={checkboxLabelStyle}>{text.screenCurvature}</label>
                </div>
            </div>
            <div className="flex items-center mt-3">
                <label htmlFor="vignetteIntensity" className="w-32 inline-block">{text.vignetteIntensity}:</label>
                <input type="range" id="vignetteIntensity" min="0" max="1" step="0.1" value={tempSettings.vignetteIntensity} onChange={e => handleSettingsChange('vignetteIntensity', parseFloat(e.target.value))} className="w-full" />
                <span className="ml-2 w-8 text-right">{tempSettings.vignetteIntensity.toFixed(1)}</span>
            </div>
        </fieldset>
       
        <fieldset className={fieldsetSyle}>
            <legend className={legendStyle}>Colors</legend>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label htmlFor="textColor" className="block">{text.textColor}:</label>
                    <input type="color" id="textColor" value={tempTheme.textColor} onChange={(e) => handleThemeChange('textColor', e.target.value)} className="w-full" />
                </div>
                <div>
                    <label htmlFor="accentColor" className="block">{text.accentColor}:</label>
                    <input type="color" id="accentColor" value={tempTheme.accentColor} onChange={(e) => handleThemeChange('accentColor', e.target.value)} className="w-full" />
                </div>
                <div>
                    <label htmlFor="windowBg" className="block">{text.windowBg}:</label>
                    <input type="color" id="windowBg" value={tempTheme.windowBg} onChange={(e) => handleThemeChange('windowBg', e.target.value)} className="w-full" />
                </div>
                <div>
                    <label htmlFor="borderColor" className="block">{text.borderColor}:</label>
                    <input type="color" id="borderColor" value={tempTheme.borderColor} onChange={(e) => handleThemeChange('borderColor', e.target.value)} className="w-full" />
                </div>
            </div>
            <button onClick={resetTheme} className={buttonStyle + " mt-2"}>Reset to Theme Default</button>
        </fieldset>
    </>
  );

  const renderDockTab = () => (
    <>
        <div className="flex items-center mb-2">
            <span className={labelStyle}>{text.dockStyle}:</span>
             {(['xp', 'classic'] as const).map(style => (
                 <label key={style} className="flex items-center mr-4">
                    <input type="radio" name="dockStyle" value={style} checked={tempSettings.themeStyle === style} onChange={() => handleSettingsChange('themeStyle', style)} />
                    <span className="ml-1">{text[style === 'xp' ? 'dockStyleXP' : 'dockStyleClassic']}</span>
                </label>
            ))}
        </div>
        <div className="flex items-center mb-2">
            <span className={labelStyle}>{text.dockPosition}:</span>
            {(['top', 'bottom', 'left', 'right'] as const).map(pos => (
                 <label key={pos} className="flex items-center mr-4">
                    <input type="radio" name="dockPosition" value={pos} checked={tempSettings.dockPosition === pos} onChange={() => handleSettingsChange('dockPosition', pos)} />
                    <span className="ml-1">{text[`dockPos${pos.charAt(0).toUpperCase() + pos.slice(1)}` as keyof typeof text]}</span>
                </label>
            ))}
        </div>
         <div className="flex items-center mb-4">
            <label htmlFor="dockIconSize" className={labelStyle}>{text.dockIconSize}:</label>
            <input type="range" id="dockIconSize" min="24" max="64" value={tempSettings.dockIconSize} onChange={e => handleSettingsChange('dockIconSize', parseInt(e.target.value))} className="w-full" />
            <span className="ml-2 w-8">{tempSettings.dockIconSize}</span>
        </div>
        <div className="flex items-center">
            <input type="checkbox" id="dockIsTransparent" checked={tempSettings.dockIsTransparent} onChange={(e) => handleSettingsChange('dockIsTransparent', e.target.checked)} />
            <label htmlFor="dockIsTransparent" className="ml-2">{text.dockIsTransparent}</label>
        </div>
    </>
  );
  
  const renderDesktopTab = () => (
     <div className="flex items-center">
        <label htmlFor="desktopIconSize" className={labelStyle}>{text.desktopIconSize}:</label>
        <input type="range" id="desktopIconSize" min="32" max="96" value={tempSettings.desktopIconSize} onChange={e => handleSettingsChange('desktopIconSize', parseInt(e.target.value))} className="w-full" />
        <span className="ml-2 w-8">{tempSettings.desktopIconSize}</span>
    </div>
  );
  
   const renderTerminalTab = () => (
    <>
       <div className="flex items-center mb-2">
            <label htmlFor="terminalFont" className={labelStyle}>{text.terminalFont}:</label>
            <select id="terminalFont" value={tempSettings.terminal.font} onChange={e => handleNestedSettingsChange('terminal', 'font', e.target.value)} className={inputStyle}>
                <option value="VT323">VT323</option>
                <option value="Roboto Mono">Roboto Mono</option>
                <option value="Fira Code">Fira Code</option>
            </select>
        </div>
        <div className="flex items-center mb-2">
            <label htmlFor="terminalBgUrl" className={labelStyle}>{text.terminalBgUrl}:</label>
            <input type="text" id="terminalBgUrl" value={tempSettings.terminal.bgImage} onChange={e => handleNestedSettingsChange('terminal', 'bgImage', e.target.value)} className={inputStyle + " w-auto flex-grow"} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
                <label htmlFor="terminalBgColor" className="block">{text.terminalBgColor}:</label>
                <input type="color" id="terminalBgColor" value={tempSettings.terminal.bgColor} onChange={(e) => handleNestedSettingsChange('terminal', 'bgColor', e.target.value)} className="w-full" />
            </div>
            <div>
                <label htmlFor="terminalTextColor" className="block">{text.terminalTextColor}:</label>
                <input type="color" id="terminalTextColor" value={tempSettings.terminal.textColor} onChange={(e) => handleNestedSettingsChange('terminal', 'textColor', e.target.value)} className="w-full" />
            </div>
        </div>
    </>
  );
  
  const renderClockTab = () => (
    <>
        <div className="flex items-center mb-2">
            <span className={labelStyle}>{text.clockPosition}:</span>
            {(['taskbar', 'center'] as const).map(pos => (
                 <label key={pos} className="flex items-center mr-4">
                    <input type="radio" name="clockPosition" value={pos} checked={tempSettings.clock.position === pos} onChange={() => handleNestedSettingsChange('clock', 'position', pos)} />
                    <span className="ml-1">{text[pos === 'taskbar' ? 'clockPosTaskbar' : 'clockPosCenter']}</span>
                </label>
            ))}
        </div>
        <div className="flex items-center">
            <label htmlFor="clockSize" className={labelStyle}>{text.clockSize}:</label>
            <input type="range" id="clockSize" min="14" max="72" value={tempSettings.clock.size} onChange={e => handleNestedSettingsChange('clock', 'size', parseInt(e.target.value))} className="w-full" />
            <span className="ml-2 w-8">{tempSettings.clock.size}</span>
        </div>
    </>
  );

  const renderBatteryTab = () => (
    <>
       <div className="flex items-center mb-4">
            <input type="checkbox" id="batteryShow" checked={tempSettings.battery.show} onChange={(e) => handleNestedSettingsChange('battery', 'show', e.target.checked)} />
            <label htmlFor="batteryShow" className="ml-2">{text.batteryShow}</label>
        </div>
        {tempSettings.battery.show && (
             <div className="flex items-center mb-2">
                <span className={labelStyle}>{text.batteryPosition}:</span>
                {(['clock', 'dock'] as const).map(pos => (
                    <label key={pos} className="flex items-center mr-4">
                        <input type="radio" name="batteryPosition" value={pos} checked={tempSettings.battery.position === pos} onChange={() => handleNestedSettingsChange('battery', 'position', pos)} />
                        <span className="ml-1">{text[pos === 'clock' ? 'batteryPosClock' : 'batteryPosDock']}</span>
                    </label>
                ))}
            </div>
        )}
    </>
  );
  
  const renderSaveLoadTab = () => (
      <fieldset className={fieldsetSyle}>
            <legend className={legendStyle}>{text.saveAndLoadConfig}</legend>
            <p className="text-xs mb-4">{text.saveAndLoadDesc}</p>
            <div className="flex gap-4">
                <button onClick={handleExport} className={buttonStyle}>{text.exportSettings}</button>
                <label className={`${buttonStyle} cursor-pointer`}>
                    {text.importSettings}
                    <input type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
                </label>
            </div>
        </fieldset>
  );

  const tabs = [
    { id: 'appearance', label: text.tabAppearance, content: renderAppearanceTab() },
    { id: 'dock', label: text.tabDock, content: renderDockTab() },
    { id: 'desktop', label: text.tabDesktop, content: renderDesktopTab() },
    { id: 'clock', label: text.tabClock, content: renderClockTab() },
    { id: 'battery', label: text.tabBattery, content: renderBatteryTab() },
    { id: 'saveLoad', label: text.tabSaveLoad, content: renderSaveLoadTab() },
  ];
  if(isAdmin) {
      tabs.splice(5, 0, { id: 'terminal', label: text.tabTerminal, content: renderTerminalTab() });
  }

  return (
    <div className="p-4 font-sans text-sm h-full overflow-y-auto custom-scrollbar flex flex-col">
       <div className="flex border-b border-gray-400 mb-4">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500'}`}>
                    {tab.label}
                </button>
            ))}
       </div>

       <div className="flex-grow">
           {tabs.find(t => t.id === activeTab)?.content}
       </div>
        
        {!isAdmin && (
            <fieldset className={fieldsetSyle}>
                <legend className={legendStyle}>{text.adminLogin}</legend>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-2">
                    <input type="text" placeholder={text.username} value={username} onChange={(e) => setUsername(e.target.value)} className={inputStyle} />
                    <input type="password" placeholder={text.password} value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} />
                    <button type="submit" className={buttonStyle + " w-full"}>
                        {text.login}
                    </button>
                </form>
            </fieldset>
        )}

        <div className="mt-auto flex justify-end items-center gap-4 border-t border-gray-400 pt-4">
            {isAdmin && (
                 <button onClick={handleLogout} className={buttonStyle}>
                    {text.logout}
                </button>
            )}
             <button onClick={handleSave} className={`${buttonStyle} font-bold`}>
                {text.saveSettings}
            </button>
        </div>
    </div>
  );
};

export default SettingsApp;
