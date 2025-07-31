import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { AppState, WindowInstance, AppType, Theme, BlogEntry, SystemSettings, DesktopItem, TerminalLine, SelectionBoxData, DirectoryNode, FileSystemNode, Language, PageNode, BioData } from '../types';
import { XP_THEME, CLASSIC_THEME, INITIAL_BLOG_POSTS, DEFAULT_SETTINGS, INITIAL_DESKTOP_ITEMS, UI_TEXT, GRID_SIZE, INITIAL_FILESYSTEM, INITIAL_BIO_DATA } from '../constants';
import { processCommand } from '../lib/commandProcessor';

type Action =
  | { type: 'OPEN_WINDOW'; payload: { appType: AppType; title: string; size?: { width: number, height: number }, data?: any } }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'FOCUS_WINDOW'; payload: string }
  | { type: 'MOVE_WINDOW'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'RESIZE_WINDOW'; payload: { id: string; size: { width: number, height: number } } }
  | { type: 'TOGGLE_MINIMIZE_WINDOW'; payload: string }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: Partial<Theme> }
  | { type: 'SET_SETTINGS'; payload: Partial<SystemSettings> }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_BLOG_POSTS'; payload: BlogEntry[] }
  | { type: 'UPDATE_BLOG_POST'; payload: BlogEntry }
  | { type: 'DELETE_BLOG_POST'; payload: string }
  | { type: 'UPDATE_BIO_DATA'; payload: Partial<BioData> }
  | { type: 'MOVE_DESKTOP_ITEM'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'CREATE_DESKTOP_ITEM'; payload: DesktopItem }
  | { type: 'UPDATE_FOLDER_DATA', payload: { path: string, data: Partial<DirectoryNode> } }
  | { type: 'CREATE_PAGE_IN_FOLDER', payload: { path: string; name: string; data: { html: string; css: string; js: string; } } }
  | { type: 'SHOW_CONTEXT_MENU'; payload: { x: number, y: number, targetId?: string } }
  | { type: 'HIDE_CONTEXT_MENU' }
  | { type: 'ARRANGE_ICONS' }
  | { type: 'START_SELECTION'; payload: { x: number, y: number } }
  | { type: 'UPDATE_SELECTION'; payload: { x: number, y: number } }
  | { type: 'END_SELECTION' }
  | { type: 'EXECUTE_COMMAND'; payload: { command: string; history: string[] } }
  | { type: 'START_RENAMING'; payload: string }
  | { type: 'RENAME_ITEM'; payload: { id: string, newLabel: string } }
  | { type: 'DELETE_DESKTOP_ITEM'; payload: string }
  | { type: 'SET_SELECTION'; payload: { ids: string[], isSelected: boolean, isToggle?: boolean } }
  | { type: 'SET_BATTERY_STATUS', payload: { level: number, isCharging: boolean } }
  | { type: 'SHUTDOWN' }
  | { type: 'TOGGLE_SYSTEM_MENU' }
  | { type: 'HIDE_SYSTEM_MENU' }
  | { type: 'TOGGLE_FULLSCREEN_MENU' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'APPLY_UPDATE'; payload: Partial<AppState> }
  // Internal actions for command processor
  | { type: '@@COMMAND/SET_PATH'; payload: string }
  | { type: '@@COMMAND/SET_FILESYSTEM'; payload: DirectoryNode }
  | { type: '@@COMMAND/CLEAR_TERMINAL' }
  | { type: '@@COMMAND/RM_NODE'; payload: string };


const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);


// Helper for debouncing
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: number;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), waitFor);
  };
}

const getInitialState = (): AppState => {
    let savedState: Partial<AppState> = {};
    try {
        const admin = localStorage.getItem('himera-admin');
        const blog = localStorage.getItem('himera-blog');
        const settings = localStorage.getItem('himera-settings');
        const theme = localStorage.getItem('himera-theme');
        const desktopItems = localStorage.getItem('himera-desktop-items');
        const vfs = localStorage.getItem('himera-vfs');
        const bioData = localStorage.getItem('himera-bio-data');

        if (admin) savedState.isAdmin = JSON.parse(admin);
        if (blog) savedState.blogPosts = JSON.parse(blog);
        if (settings) {
            const loadedSettings = JSON.parse(settings);
            // Migration for old crtEffects setting
            if (loadedSettings.crtEffects !== undefined) {
                loadedSettings.screenJitter = loadedSettings.crtEffects;
                delete loadedSettings.crtEffects;
            }
            savedState.settings = loadedSettings;
        }
        if (theme) savedState.theme = JSON.parse(theme);
        if (desktopItems) savedState.desktopItems = JSON.parse(desktopItems);
        if (vfs) {
            const { fs, path } = JSON.parse(vfs);
            savedState.fileSystem = fs;
            savedState.currentPath = path;
        }
        if (bioData) savedState.bioData = JSON.parse(bioData);

    } catch (error) {
        console.error("Failed to load state from localStorage", error);
        savedState = {}; // Reset on parse error
    }

    const initialState: AppState = {
        windows: [],
        activeWindowId: null,
        isAdmin: false,
        theme: { ...XP_THEME },
        settings: { ...DEFAULT_SETTINGS },
        desktopItems: [...INITIAL_DESKTOP_ITEMS],
        contextMenu: { isOpen: false, x: 0, y: 0 },
        selectionBox: { x: 0, y: 0, width: 0, height: 0, isVisible: false },
        isSelecting: false,
        language: 'PL',
        blogPosts: [...INITIAL_BLOG_POSTS],
        bioData: { ...INITIAL_BIO_DATA },
        terminalLines: [{ type: 'output', content: `Thumex OS [Version 1.0]. (c) 1998 Thumex Corp.\nType 'help' for a list of commands.` }],
        terminalHistory: [],
        currentPath: '~',
        fileSystem: JSON.parse(JSON.stringify(INITIAL_FILESYSTEM)), // Deep copy
        nextZIndex: 100,
        batteryLevel: null,
        isCharging: null,
        isShuttingDown: false,
        isSystemMenuOpen: false,
        isFullScreenMenuOpen: false,
    };
    
    // Merge saved settings over defaults
    const finalSettings = { ...initialState.settings, ...savedState.settings };
    const finalTheme = savedState.theme ? savedState.theme : (finalSettings.themeStyle === 'classic' ? CLASSIC_THEME : XP_THEME);


    return { ...initialState, ...savedState, settings: finalSettings, theme: finalTheme };
};

// --- Filesystem Helpers ---
const getNodeFromPath = (path: string, fs: DirectoryNode): FileSystemNode | null => {
    if (path === '~' || path === '/') return fs;
    let parts = path.startsWith('~/') ? path.substring(2).split('/') : path.split('/');
    if (path.startsWith('~')) parts = path.substring(1).split('/').filter(p => p);
    
    let currentNode: FileSystemNode = fs;
    for (const part of parts) {
        if (part === '') continue;
        if (currentNode.type !== 'directory' || !currentNode.children[part]) {
            return null;
        }
        currentNode = currentNode.children[part];
    }
    return currentNode;
};


// Helper function for immutable update of filesystem
const updateNodeByPath = (root: DirectoryNode, path: string, data: Partial<DirectoryNode>): DirectoryNode => {
    const newRoot = JSON.parse(JSON.stringify(root)); // Deep copy for simplicity
    
    if (path === '~' || path === '/') {
        Object.assign(newRoot, data);
        return newRoot;
    }

    let parts = path.startsWith('~/') ? path.substring(2).split('/') : path.split('/');
    if (path.startsWith('~')) parts = path.substring(1).split('/').filter(p => p);
    
    let currentNode: DirectoryNode = newRoot;
    // Traverse to the parent of the target node
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (currentNode.children[part] && currentNode.children[part].type === 'directory') {
            currentNode = currentNode.children[part] as DirectoryNode;
        } else {
            console.error("Path not found for update:", path);
            return root; // Path not found, return original
        }
    }
    
    const targetName = parts[parts.length - 1];
    if (currentNode.children[targetName] && currentNode.children[targetName].type === 'directory') {
        const targetNode = currentNode.children[targetName] as DirectoryNode;
        currentNode.children[targetName] = { ...targetNode, ...data };
    } else {
         console.error("Target node not found or not a directory:", targetName);
    }
    
    return newRoot;
};

// Helper to add a node to a directory
const addNodeToPath = (root: DirectoryNode, path: string, name: string, node: FileSystemNode): DirectoryNode => {
    const newRoot = JSON.parse(JSON.stringify(root));
    const parentNode = getNodeFromPath(path, newRoot);
    if (parentNode?.type === 'directory') {
        if (parentNode.children[name]) {
            console.error("Node with this name already exists:", name);
            return root; // Don't overwrite existing node
        }
        parentNode.children[name] = node;
    } else {
        console.error("Parent path not found or not a directory:", path);
        return root;
    }
    return newRoot;
};

// Helper to remove a file/folder
const removeNodeByPath = (root: DirectoryNode, path: string): DirectoryNode => {
    const newRoot = JSON.parse(JSON.stringify(root));
    if (path === '~' || path === '/') return root; // Cannot delete root

    let parts = (path.startsWith('~/') ? path.substring(2) : path.substring(1)).split('/');
    let currentNode: DirectoryNode = newRoot;
    
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (currentNode.children[part]?.type === 'directory') {
            currentNode = currentNode.children[part] as DirectoryNode;
        } else {
            return root; // Path not found
        }
    }

    const targetName = parts[parts.length - 1];
    if (currentNode.children[targetName]) {
        delete currentNode.children[targetName];
    }

    return newRoot;
};



const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const { appType, title, size = { width: 960, height: 720 }, data } = action.payload;
      const existingWindow = state.windows.find(w => w.appType === appType && !w.data); // Don't focus existing FileExplorer windows
      if (existingWindow) {
        return { ...state, activeWindowId: existingWindow.id, nextZIndex: state.nextZIndex + 1, windows: state.windows.map(w => w.id === existingWindow.id ? { ...w, zIndex: state.nextZIndex, isMinimized: false } : w) };
      }
      const newWindow: WindowInstance = { id: `${appType}-${Date.now()}`, appType, title, position: { x: 50 + state.windows.length * 20, y: 50 + state.windows.length * 20 }, size, initialSize: size, zIndex: state.nextZIndex, isMinimized: false, data };
      return { ...state, windows: [...state.windows, newWindow], activeWindowId: newWindow.id, nextZIndex: state.nextZIndex + 1 };
    }
    case 'CLOSE_WINDOW': return { ...state, windows: state.windows.filter(w => w.id !== action.payload), activeWindowId: state.activeWindowId === action.payload ? null : state.activeWindowId };
    case 'FOCUS_WINDOW':
      if (state.activeWindowId === action.payload && !state.windows.find(w=>w.id === action.payload)?.isMinimized) return state;
      return { ...state, activeWindowId: action.payload, nextZIndex: state.nextZIndex + 1, windows: state.windows.map(w => w.id === action.payload ? { ...w, zIndex: state.nextZIndex, isMinimized: false } : w) };
    case 'MOVE_WINDOW': return { ...state, windows: state.windows.map(w => w.id === action.payload.id ? { ...w, position: action.payload.position } : w) };
    case 'RESIZE_WINDOW': return { ...state, windows: state.windows.map(w => w.id === action.payload.id ? { ...w, size: action.payload.size } : w) };
    case 'TOGGLE_MINIMIZE_WINDOW': return { ...state, windows: state.windows.map(w => w.id === action.payload ? {...w, isMinimized: !w.isMinimized} : w), activeWindowId: state.activeWindowId === action.payload ? null : state.activeWindowId };
    case 'LOGIN': return { ...state, isAdmin: true, isSystemMenuOpen: false };
    case 'LOGOUT': return { ...state, isAdmin: false, isSystemMenuOpen: false };
    case 'SET_SETTINGS': {
        const newSettings = { ...state.settings, ...action.payload };
        let newTheme = state.theme;
        // Only change theme if the style itself changes, not other settings
        if (action.payload.themeStyle && action.payload.themeStyle !== state.settings.themeStyle) {
            newTheme = action.payload.themeStyle === 'classic' ? { ...CLASSIC_THEME } : { ...XP_THEME };
        }
        return { ...state, settings: newSettings, theme: newTheme };
    }
    case 'SET_THEME': return { ...state, theme: {...state.theme, ...action.payload }};
    case 'SET_LANGUAGE': return { ...state, language: action.payload, isSystemMenuOpen: false };
    case 'SET_BLOG_POSTS': return { ...state, blogPosts: action.payload };
    case 'UPDATE_BLOG_POST': return { ...state, blogPosts: state.blogPosts.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_BLOG_POST':
        return { ...state, blogPosts: state.blogPosts.filter(p => p.id !== action.payload) };
    case 'UPDATE_BIO_DATA':
        return { ...state, bioData: { ...state.bioData, ...action.payload } };
    case 'UPDATE_FOLDER_DATA': {
        const { path, data } = action.payload;
        const newFileSystem = updateNodeByPath(state.fileSystem, path, data);
        return { ...state, fileSystem: newFileSystem };
    }
    case 'CREATE_PAGE_IN_FOLDER': {
        const { path, name, data } = action.payload;
        const newPageNode: PageNode = { type: 'page', ...data };
        const newFileSystem = addNodeToPath(state.fileSystem, path, name, newPageNode);
        return { ...state, fileSystem: newFileSystem };
    }
    case 'MOVE_DESKTOP_ITEM': {
        const { id, position } = action.payload;
        const { settings, desktopItems } = state;

        const iconWidth = settings.desktopIconSize + 16; // Icon size + L/R padding
        const iconHeight = settings.desktopIconSize + 40; // Approx height with label and padding

        let minX = 0;
        let minY = 0;
        let maxX = window.innerWidth - iconWidth;
        let maxY = window.innerHeight - iconHeight;

        const dockSize = 60; // Approximate size of dock
        switch (settings.dockPosition) {
            case 'top': minY = dockSize; break;
            case 'bottom': maxY = window.innerHeight - dockSize - iconHeight; break;
            case 'left': minX = dockSize; break;
            case 'right': maxX = window.innerWidth - dockSize - iconWidth; break;
        }

        const clampedX = Math.max(minX, Math.min(position.x, maxX));
        const clampedY = Math.max(minY, Math.min(position.y, maxY));

        const targetX = Math.round(clampedX / GRID_SIZE) * GRID_SIZE;
        const targetY = Math.round(clampedY / GRID_SIZE) * GRID_SIZE;

        const movedItemRect = { x: targetX, y: targetY, width: iconWidth, height: iconHeight };

        const isOccupied = desktopItems.some(item => {
            if (item.id === id) return false;
            const otherItemRect = { x: item.position.x, y: item.position.y, width: iconWidth, height: iconHeight };
            return (
                movedItemRect.x < otherItemRect.x + otherItemRect.width &&
                movedItemRect.x + movedItemRect.width > otherItemRect.x &&
                movedItemRect.y < otherItemRect.y + otherItemRect.height &&
                movedItemRect.y + movedItemRect.height > otherItemRect.y
            );
        });

        if (isOccupied) {
            return state;
        }
        
        const newDesktopItems = desktopItems.map(item =>
            item.id === id ? { ...item, position: { x: targetX, y: targetY } } : item
        );
        
        return { ...state, desktopItems: newDesktopItems };
    }
    case 'CREATE_DESKTOP_ITEM': {
        const newItems = [...state.desktopItems];
        const newItem = { ...action.payload };

        if (newItem.type === 'folder') {
            let baseName = UI_TEXT[state.language].newFolder;
            let name = baseName;
            let counter = 1;
            while(newItems.some(i => i.label === name)) {
                name = `${baseName} (${counter})`;
                counter++;
            }
            newItem.label = name;
            newItem.isRenaming = true;
            // Create in VFS
            const newFileSystem = JSON.parse(JSON.stringify(state.fileSystem));
            (newFileSystem.children[name] = { type: 'directory', children: {} });
            newItem.path = `~/${name}`;
            return { ...state, desktopItems: [...newItems, newItem], fileSystem: newFileSystem };
        }
        
        return { ...state, desktopItems: [...newItems, newItem] };
    }
    case 'SHOW_CONTEXT_MENU': return { ...state, contextMenu: { isOpen: true, ...action.payload }, isSystemMenuOpen: false };
    case 'HIDE_CONTEXT_MENU': return { ...state, contextMenu: { ...state.contextMenu, isOpen: false, targetId: undefined } };
    case 'ARRANGE_ICONS': {
        const iconContainerWidth = 120; // Corresponds to desktop icon size + padding
        const iconContainerHeight = 120;
        const padding = 20;
        const desktopHeight = window.innerHeight - 60; // Assuming taskbar height
        const iconsPerColumn = Math.floor((desktopHeight - padding * 2) / iconContainerHeight);

        const arrangedItems = state.desktopItems.map((item, index) => ({
            ...item, 
            position: {
                x: padding + Math.floor(index / iconsPerColumn) * iconContainerWidth, 
                y: padding + (index % iconsPerColumn) * iconContainerHeight
            }
        }));
        return { ...state, desktopItems: arrangedItems.map(item => ({...item, position: {x: Math.round(item.position.x / GRID_SIZE) * GRID_SIZE, y: Math.round(item.position.y / GRID_SIZE) * GRID_SIZE}})) };
    }
    case 'START_SELECTION': return { ...state, isSelecting: true, selectionBox: { x: action.payload.x, y: action.payload.y, width: 0, height: 0, isVisible: true }, desktopItems: state.desktopItems.map(i => ({...i, isSelected: false})), isSystemMenuOpen: false };
    case 'UPDATE_SELECTION': {
        if (!state.isSelecting) return state;
        const newWidth = action.payload.x - state.selectionBox.x;
        const newHeight = action.payload.y - state.selectionBox.y;
        return { ...state, selectionBox: {...state.selectionBox, width: newWidth, height: newHeight} };
    }
    case 'END_SELECTION': {
        if (!state.isSelecting) {
            // This case handles a simple click on the desktop to deselect all icons.
             if (state.desktopItems.some(i => i.isSelected)) {
                return { ...state, desktopItems: state.desktopItems.map(i => ({...i, isSelected: false})) };
            }
            return state;
        }
        const { x, y, width, height } = state.selectionBox;
        const selStart = { x: Math.min(x, x + width), y: Math.min(y, y + height) };
        const selEnd = { x: Math.max(x, x + width), y: Math.max(y, y + height) };
        const updatedItems = state.desktopItems.map(item => {
            const itemRect = { x: item.position.x, y: item.position.y, width: state.settings.desktopIconSize, height: state.settings.desktopIconSize };
            const isSelected = itemRect.x < selEnd.x && itemRect.x + itemRect.width > selStart.x && itemRect.y < selEnd.y && itemRect.y + itemRect.height > selStart.y;
            return { ...item, isSelected };
        });
        return { ...state, isSelecting: false, selectionBox: { ...state.selectionBox, isVisible: false }, desktopItems: updatedItems };
    }
    case 'START_RENAMING': {
        return { ...state, contextMenu: { ...state.contextMenu, isOpen: false }, desktopItems: state.desktopItems.map(item => ({ ...item, isRenaming: item.id === action.payload })) };
    }
    case 'RENAME_ITEM': {
        return { ...state, desktopItems: state.desktopItems.map(item => item.id === action.payload.id ? { ...item, label: action.payload.newLabel, isRenaming: false } : item) };
    }
    case 'DELETE_DESKTOP_ITEM': {
        const itemIdToDelete = action.payload;
        const itemToDelete = state.desktopItems.find(item => item.id === itemIdToDelete);
        
        if (!itemToDelete) return state;

        const newDesktopItems = state.desktopItems.filter(item => item.id !== itemIdToDelete);
        let newFileSystem = state.fileSystem;

        if (itemToDelete.type === 'folder' && itemToDelete.path) {
            newFileSystem = removeNodeByPath(state.fileSystem, itemToDelete.path);
        }

        return { ...state, desktopItems: newDesktopItems, fileSystem: newFileSystem };
    }
    case 'SET_SELECTION': {
        const { ids, isSelected, isToggle } = action.payload;
        return {
            ...state,
            desktopItems: state.desktopItems.map(item => {
                if (ids.includes(item.id)) { return { ...item, isSelected }; }
                if (!isToggle) { return { ...item, isSelected: false }; }
                return item;
            })
        };
    }
     case 'SET_BATTERY_STATUS': return { ...state, batteryLevel: action.payload.level, isCharging: action.payload.isCharging };
    case 'SHUTDOWN': return { ...state, isShuttingDown: true, isSystemMenuOpen: false };
    case 'TOGGLE_SYSTEM_MENU': return { ...state, isSystemMenuOpen: !state.isSystemMenuOpen, contextMenu: { ...state.contextMenu, isOpen: false } };
    case 'HIDE_SYSTEM_MENU': return { ...state, isSystemMenuOpen: false };
    case 'TOGGLE_FULLSCREEN_MENU':
        return {
            ...state,
            isFullScreenMenuOpen: !state.isFullScreenMenuOpen,
            isSystemMenuOpen: false, // Close other menus
            contextMenu: { ...state.contextMenu, isOpen: false },
        };
    case 'LOAD_STATE': {
        const loadedState = action.payload as Partial<AppState>;
        // Selectively merge the loaded state to avoid overwriting runtime state like open windows.
        return {
            ...state,
            isAdmin: loadedState.isAdmin ?? state.isAdmin,
            theme: loadedState.theme ?? state.theme,
            settings: loadedState.settings ?? state.settings,
            desktopItems: loadedState.desktopItems ?? state.desktopItems,
            blogPosts: loadedState.blogPosts ?? state.blogPosts,
            bioData: loadedState.bioData ?? state.bioData,
            fileSystem: loadedState.fileSystem ?? state.fileSystem,
            currentPath: loadedState.currentPath ?? state.currentPath,
            terminalHistory: loadedState.terminalHistory ?? state.terminalHistory,
            language: loadedState.language ?? state.language,
        };
    }
    case 'APPLY_UPDATE': {
        const updates = action.payload as Partial<AppState>;
        // A full state replacement is too risky. Overwrite only persistent data.
        return {
            ...state,
            // Merge theme and settings for partial updates
            theme: updates.theme ? { ...state.theme, ...updates.theme } : state.theme,
            settings: updates.settings ? { ...state.settings, ...updates.settings } : state.settings,
            // Replace arrays and file system
            desktopItems: updates.desktopItems ?? state.desktopItems,
            blogPosts: updates.blogPosts ?? state.blogPosts,
            bioData: updates.bioData ? { ...state.bioData, ...updates.bioData } : state.bioData,
            fileSystem: updates.fileSystem ?? state.fileSystem,
            currentPath: updates.currentPath ?? state.currentPath,
            terminalHistory: updates.terminalHistory ?? state.terminalHistory,
            language: updates.language ?? state.language,
        };
    }
    // Command Actions
    case '@@COMMAND/SET_PATH': return { ...state, currentPath: action.payload };
    case '@@COMMAND/SET_FILESYSTEM': return { ...state, fileSystem: action.payload };
    case '@@COMMAND/CLEAR_TERMINAL': return { ...state, terminalLines: [{ type: 'output', content: `Thumex OS [Version 1.0]. (c) 1998 Thumex Corp.\nType 'help' for a list of commands.` }] };
    case '@@COMMAND/RM_NODE': {
        const newFileSystem = removeNodeByPath(state.fileSystem, action.payload);
        return { ...state, fileSystem: newFileSystem };
    }

    case 'EXECUTE_COMMAND': {
        const { command, history } = action.payload;
        const dispatchedActions: Action[] = [];
        const proxyDispatch = (a: Action) => dispatchedActions.push(a);

        const { outputLines, newHistory } = processCommand(state, proxyDispatch, command, history);
        
        let newState: AppState = {
            ...state,
            terminalLines: [...state.terminalLines, { type: 'input', content: command, path: state.currentPath }, ...outputLines],
            terminalHistory: newHistory,
        };
        
        dispatchedActions.forEach(dispatchedAction => {
            newState = appReducer(newState, dispatchedAction);
        });
        
        return newState;
    }
    default: return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Debounced save to localStorage for performance
  const debouncedSaveState = useCallback(
    debounce((currentState: AppState) => {
      try {
        localStorage.setItem('himera-admin', JSON.stringify(currentState.isAdmin));
        localStorage.setItem('himera-blog', JSON.stringify(currentState.blogPosts));
        localStorage.setItem('himera-bio-data', JSON.stringify(currentState.bioData));
        localStorage.setItem('himera-settings', JSON.stringify(currentState.settings));
        localStorage.setItem('himera-theme', JSON.stringify(currentState.theme));
        localStorage.setItem('himera-desktop-items', JSON.stringify(currentState.desktopItems));
        localStorage.setItem('himera-vfs', JSON.stringify({ fs: currentState.fileSystem, path: currentState.currentPath }));
      } catch(e) {
          console.error("Failed to save state to localStorage", e);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSaveState(state);
  }, [
    state.isAdmin, 
    state.blogPosts, 
    state.bioData, 
    state.settings, 
    state.theme, 
    state.desktopItems, 
    state.fileSystem, 
    state.currentPath,
    debouncedSaveState
  ]);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
