import { DirectoryNode, FileSystemNode, TerminalLine, AppType } from '../types';

type AppState = any; // Avoid circular dependency, we only need a few fields
type Action = any;
type Dispatch = React.Dispatch<Action>;


// --- Filesystem Helpers ---

const getNodeFromPath = (path: string, fs: DirectoryNode): FileSystemNode | null => {
    if (path === '~' || path === '/') return fs;
    const parts = path.startsWith('~/') ? path.substring(2).split('/') : path.split('/');
     if (parts[0] === '' && parts.length === 1) return fs;
    let currentNode: FileSystemNode = fs;
    for (const part of parts) {
        if (part === '') continue;
        if (currentNode.type !== 'directory' || !currentNode.children[part]) {
            return null; // Path does not exist
        }
        currentNode = currentNode.children[part];
    }
    return currentNode;
};

const resolvePath = (currentPath: string, targetPath: string): string => {
    if (targetPath.startsWith('/')) {
        // Absolute path
        const parts = targetPath.split('/').filter(p => p);
        if (parts.length === 0) return '~';
        return `~/${parts.join('/')}`;
    }
     if (targetPath.startsWith('~')) {
        return targetPath;
    }
    // Relative path
    const pathParts = (currentPath === '~' || currentPath === '/' ? [] : currentPath.substring(2).split('/'));
    const targetParts = targetPath.split('/').filter(p => p);
    
    for(const part of targetParts) {
        if (part === '..') {
            pathParts.pop();
        } else if (part !== '.') {
            pathParts.push(part);
        }
    }
    if (pathParts.length === 0) return '~';
    return `~/${pathParts.join('/')}`;
};


// --- Main Command Processor ---

export const processCommand = (state: AppState, dispatch: Dispatch, cmd: string, history: string[]): { outputLines: TerminalLine[], newHistory: string[] } => {
    const text = UI_TEXT[state.language];
    const [command, ...args] = cmd.trim().split(' ');
    const outputLines: TerminalLine[] = [];
    
    let newHistory = history;
    if(cmd.trim()) {
        newHistory = [cmd.trim(), ...history].filter((c, i, a) => a.indexOf(c) === i).slice(0, 50);
    }

    const openWindow = (appType: AppType, title: string, size?: {width: number, height: number}, data?: any) => {
        dispatch({ type: 'OPEN_WINDOW', payload: { appType, title, size, data } });
    };

    switch (command.toLowerCase()) {
        case 'help': outputLines.push({ type: 'output', content: text.helpDetailed }); break;
        case 'ls':
        case 'la':
        case 'dir': {
            const path = args[0] ? resolvePath(state.currentPath, args[0]) : state.currentPath;
            const node = getNodeFromPath(path, state.fileSystem);
            if(node?.type === 'directory') {
                const content = Object.keys(node.children).map(name => {
                    const child = node.children[name];
                    return child.type === 'directory' ? `<DIR>  ${name}` : `       ${name}`;
                }).join('\n');
                outputLines.push({ type: 'output', content: content || 'Directory is empty.' });
            } else if (node?.type === 'file') {
                outputLines.push({ type: 'output', content: args[0] });
            } else {
                outputLines.push({ type: 'error', content: `${text.notADirectory} '${args[0] || path}'` });
            }
            break;
        }
        case 'cd': {
            if(!args[0]) {
                dispatch({type: '@@COMMAND/SET_PATH', payload: '~'});
                break;
            }
            const newPath = resolvePath(state.currentPath, args[0]);
            const node = getNodeFromPath(newPath, state.fileSystem);
            if(node?.type === 'directory') {
                dispatch({type: '@@COMMAND/SET_PATH', payload: newPath});
            } else if (node?.type === 'file') {
                 outputLines.push({ type: 'error', content: `${text.notADirectory} '${args[0]}'` });
            } else {
                 outputLines.push({ type: 'error', content: `No such file or directory: '${args[0]}'` });
            }
            break;
        }
        case 'mkdir': {
            if(!args[0]) { outputLines.push({type: 'output', content: 'Usage: mkdir [directory_name]'}); break; }
            if(!state.isAdmin) { outputLines.push({type: 'error', content: text.accessDenied }); break; }

            const parentNode = getNodeFromPath(state.currentPath, state.fileSystem);
            if (parentNode?.type !== 'directory') { outputLines.push({ type: 'error', content: `Current path is not a directory.` }); break; }

            if(parentNode.children[args[0]]) { outputLines.push({type: 'error', content: `File or directory '${args[0]}' already exists.`}); break; }

            const newFileSystem = JSON.parse(JSON.stringify(state.fileSystem));
            const parentInNewFs = getNodeFromPath(state.currentPath, newFileSystem) as DirectoryNode;
            parentInNewFs.children[args[0]] = { type: 'directory', children: {} };
            dispatch({ type: '@@COMMAND/SET_FILESYSTEM', payload: newFileSystem });
            outputLines.push({ type: 'output', content: `Directory '${args[0]}' created.` });
            break;
        }
        case 'cat': {
            if(!args[0]) { outputLines.push({type: 'output', content: 'Usage: cat [filename]'}); break; }
            const path = resolvePath(state.currentPath, args[0]);
            const node = getNodeFromPath(path, state.fileSystem);
            if(node?.type === 'file') {
                outputLines.push({ type: 'output', content: node.content });
            } else if (node?.type === 'directory') {
                outputLines.push({ type: 'error', content: `${text.isDirectory} '${args[0]}'` });
            } else {
                outputLines.push({ type: 'error', content: `${text.fileNotFound} '${args[0]}'` });
            }
            break;
        }
         case 'echo': {
            const contentIndex = cmd.indexOf('"');
            const redirectionIndex = cmd.indexOf('>');
            if (contentIndex !== -1 && redirectionIndex !== -1 && contentIndex < redirectionIndex) {
                const content = cmd.substring(contentIndex + 1, cmd.lastIndexOf('"'));
                const filename = cmd.substring(redirectionIndex + 1).trim();
                
                if(!state.isAdmin) { outputLines.push({type: 'error', content: text.accessDenied }); break; }

                const parentNode = getNodeFromPath(state.currentPath, state.fileSystem);
                if (parentNode?.type !== 'directory') { outputLines.push({ type: 'error', content: `Current path is not a directory.` }); break; }

                const newFileSystem = JSON.parse(JSON.stringify(state.fileSystem));
                const parentInNewFs = getNodeFromPath(state.currentPath, newFileSystem) as DirectoryNode;
                parentInNewFs.children[filename] = { type: 'file', content: content };
                dispatch({ type: '@@COMMAND/SET_FILESYSTEM', payload: newFileSystem });

            } else {
                outputLines.push({type: 'output', content: args.join(' ')});
            }
            break;
        }
        case 'rm': {
            if (!args[0]) { outputLines.push({ type: 'output', content: 'Usage: rm [file_or_empty_dir]' }); break; }
            if (!state.isAdmin) { outputLines.push({ type: 'error', content: text.accessDenied }); break; }
            
            const path = resolvePath(state.currentPath, args[0]);
            const node = getNodeFromPath(path, state.fileSystem);

            if (!node) { outputLines.push({ type: 'error', content: `${text.fileNotFound} '${args[0]}'` }); break; }
            if (node.type === 'directory' && Object.keys(node.children).length > 0) {
                outputLines.push({ type: 'error', content: `Directory not empty: '${args[0]}'` });
                break;
            }

            dispatch({ type: '@@COMMAND/RM_NODE', payload: path });
            outputLines.push({ type: 'output', content: `Removed '${args[0]}'` });
            break;
        }
        case 'start': {
            const itemName = args.join(' ').toLowerCase();
            if (!itemName) {
                outputLines.push({ type: 'output', content: `Usage: start [application or folder name]` });
                break;
            }
            const item = state.desktopItems.find((i: any) => i.label.toLowerCase() === itemName);
            if (item) {
                if (item.type === 'app') {
                    let size;
                    if (['Snake', 'Minesweeper', 'Pacman'].includes(item.iconType as string)) {
                        size = { width: 600, height: 640 };
                    }
                    openWindow(item.iconType as AppType, item.label, size);
                    outputLines.push({ type: 'output', content: `Starting ${item.label}...` });
                } else if (item.type === 'folder' && item.path) {
                    openWindow('FileExplorer', item.label, { width: 600, height: 400 }, { path: item.path });
                    outputLines.push({ type: 'output', content: `Opening ${item.label}...` });
                }
            } else {
                outputLines.push({ type: 'error', content: `Application or folder not found: ${args.join(' ')}` });
            }
            break;
        }
        case 'nano': {
             const itemName = (args[0] || '').toLowerCase();
             openWindow('Notepad', `Notepad - ${itemName || 'Untitled'}`);
             break;
        }
        case 'sudo': {
            if (state.isAdmin) { outputLines.push({type: 'output', content: 'You already have superuser privileges.'}); break; }
            outputLines.push({type: 'error', content: `${text.accessDenied} Try 'login' first.`});
            break;
        }
        case 'kill': {
            const appToKillName = (args[0] || '').toLowerCase();
            const appToKill = state.windows.find((w: any) => w.title.toLowerCase().includes(appToKillName));
            if (appToKill) {
                dispatch({ type: 'CLOSE_WINDOW', payload: appToKill.id });
                outputLines.push({ type: 'output', content: `Process ${appToKill.title} terminated.` });
            } else { outputLines.push({ type: 'error', content: `Process not found: ${args[0]}` }); }
            break;
        }
        case 'clear': case 'cls': 
            dispatch({ type: '@@COMMAND/CLEAR_TERMINAL' });
            break;
        case 'login': {
            if (state.isAdmin) { outputLines.push({type: 'output', content: text.alreadyLoggedIn}); break; }
            const [loginUser, loginPass] = args;
            if (loginUser === 'Thumex' && loginPass === 'erixon2008') {
                dispatch({ type: 'LOGIN' });
                outputLines.push({ type: 'output', content: text.loginSuccess });
            } else if (loginUser || loginPass) {
                outputLines.push({ type: 'error', content: text.invalidCredentials });
            } else {
                outputLines.push({ type: 'output', content: text.loginUsage });
            }
            break;
        }
        case 'logout':
            if (!state.isAdmin) { outputLines.push({type: 'output', content: 'Not logged in.'}); } 
            else { dispatch({ type: 'LOGOUT' }); outputLines.push({type: 'output', content: text.logoutSuccess}); }
            break;
        case 'date': outputLines.push({type: 'output', content: new Date().toLocaleString()}); break;
        case 'whoami': outputLines.push({type: 'output', content: state.isAdmin ? 'admin' : 'guest'}); break;
        case 'hostname': outputLines.push({type: 'output', content: 'Project-Himera-XP'}); break;
        case 'history': outputLines.push({type: 'output', content: history.map((h, i) => `${history.length - i}: ${h}`).join('\n')}); break;
        case 'shutdown':
            outputLines.push({ type: 'output', content: 'Shutting down system...' });
            dispatch({ type: 'SHUTDOWN' });
            break;
        case 'reboot': 
            outputLines.push({ type: 'output', content: 'Rebooting system...' });
            setTimeout(() => window.location.reload(), 1000);
            break;
        case 'theme': {
            const themeArg = args[0] as 'xp' | 'classic';
            if (themeArg === 'xp' || themeArg === 'classic') {
                dispatch({ type: 'SET_SETTINGS', payload: { themeStyle: themeArg } });
                outputLines.push({ type: 'output', content: `Theme set to ${themeArg}` });
            } else {
                outputLines.push({ type: 'output', content: 'Usage: theme [xp|classic]' });
            }
            break;
        }
        case 'wallpaper':
            if (args[0]) {
                dispatch({ type: 'SET_THEME', payload: { wallpaper: args[0] } });
                outputLines.push({ type: 'output', content: 'Wallpaper updated.' });
            } else {
                outputLines.push({ type: 'output', content: 'Usage: wallpaper [url]' });
            }
            break;
        case '': break; // Handle empty command
        default: outputLines.push({ type: 'error', content: `${text.commandNotFound}'${command}'` });
    }

    return { outputLines, newHistory };
};

// Dummy UI_TEXT for type safety if this file were more isolated
const UI_TEXT = {
    PL: { helpDetailed: '', commandNotFound: '', accessDenied: '', isDirectory: '', notADirectory: '', fileNotFound: '', loginSuccess: '', logoutSuccess: '', invalidCredentials: '', loginUsage: '', alreadyLoggedIn: '' },
    GB: { helpDetailed: '', commandNotFound: '', accessDenied: '', isDirectory: '', notADirectory: '', fileNotFound: '', loginSuccess: '', logoutSuccess: '', invalidCredentials: '', loginUsage: '', alreadyLoggedIn: '' },
};