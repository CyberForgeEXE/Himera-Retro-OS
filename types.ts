import React from 'react';

export interface WindowInstance {
  id: string;
  title: string;
  appType: AppType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  initialSize?: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  data?: any;
}

export type AppType = 'Terminal' | 'Notepad' | 'Settings' | 'Blog' | 'Contact' | 'Snake' | 'Minesweeper' | 'Pacman' | 'FileExplorer' | 'WebPage' | 'Updater' | 'CodeExecutor' | 'Bio';

export interface DesktopItem {
    id: string;
    type: 'app' | 'folder';
    label: string;
    iconType: AppType | 'Folder' | 'WebPage';
    position: { x: number; y: number };
    isSelected: boolean;
    isRenaming?: boolean;
    path?: string;
}

export interface TerminalLine {
    type: 'input' | 'output' | 'error';
    content: string;
    path?: string;
}

export interface Theme {
    wallpaper: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    windowBg: string;
    taskbarBg: string;
}

export interface BlogEntry {
    id: string;
    title: string;
    date: string;
    content: string;
    images: string[];
}

export interface BioData {
    itDescription: string;
    mediaUrls: string[];
}

export interface FileNode {
    type: 'file';
    content: string;
}

export interface PageNode {
    type: 'page';
    html: string;
    css: string;
    js: string;
}

export interface DirectoryNode {
    type: 'directory';
    children: { [name: string]: FileSystemNode };
    title?: string;
    description?: string;
    images?: string[];
    titleColor?: string;
    descriptionColor?: string;
}

export type FileSystemNode = DirectoryNode | FileNode | PageNode;


export interface SystemSettings {
    themeStyle: 'xp' | 'classic';
    dockPosition: 'top' | 'bottom' | 'left' | 'right';
    dockIconSize: number;
    dockIsTransparent: boolean;
    desktopIconSize: number;
    lowQualityWallpaper: boolean;
    clock: {
        position: 'taskbar' | 'center';
        size: number;
    };
    battery: {
        show: boolean;
        position: 'clock' | 'dock';
    };
    screenJitter: boolean;
    vhsScanlines: boolean;
    textGlow: boolean;
    screenCurvature: boolean;
    vignetteIntensity: number; // Range 0 to 1
    terminal: {
        font: 'VT323' | 'Roboto Mono' | 'Fira Code';
        bgColor: string;
        textColor: string;
        bgImage: string;
    }
}

export interface SelectionBoxData {
    x: number;
    y: number;
    width: number;
    height: number;
    isVisible: boolean;
}

export interface AppState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  isAdmin: boolean;
  theme: Theme;
  settings: SystemSettings;
  desktopItems: DesktopItem[];
  contextMenu: { isOpen: boolean; x: number; y: number; targetId?: string };
  selectionBox: SelectionBoxData;
  isSelecting: boolean;
  language: Language;
  blogPosts: BlogEntry[];
  bioData: BioData;
  terminalLines: TerminalLine[];
  terminalHistory: string[];
  currentPath: string;
  fileSystem: DirectoryNode;
  nextZIndex: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  isShuttingDown: boolean;
  isSystemMenuOpen: boolean;
  isFullScreenMenuOpen: boolean;
}

export type Language = 'PL' | 'GB';