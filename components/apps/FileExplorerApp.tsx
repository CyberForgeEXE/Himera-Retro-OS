import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { DirectoryNode, FileSystemNode, PageNode } from '../../types';
import { UI_TEXT } from '../../constants';
import { AppIcon } from '../Icons';
import { useWindowVirtualization } from '../../hooks/useWindowVirtualization';

interface FileExplorerAppProps {
    data: { path: string };
    windowId: string;
    scaleFactor?: number;
}

// --- Filesystem Helpers (in-file) ---
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

const resolvePath = (currentPath: string, targetPath: string): string => {
    if (targetPath.startsWith('~')) return targetPath;
    let pathParts: string[] = (currentPath === '~' || currentPath === '/') ? [] : (currentPath.startsWith('~/') ? currentPath.substring(2).split('/') : currentPath.split('/'));
    for(const part of targetPath.split('/').filter(p => p)) {
        if (part === '..') pathParts.pop();
        else if (part !== '.') pathParts.push(part);
    }
    return pathParts.length === 0 ? '~' : `~/${pathParts.join('/')}`;
};


const FileExplorerApp: React.FC<FileExplorerAppProps> = ({ data, windowId, scaleFactor = 1 }) => {
    const { state, dispatch } = useAppContext();
    const { settings, fileSystem, isAdmin, language } = state;
    const text = UI_TEXT[language];

    const [currentPath, setCurrentPath] = useState(data.path);
    const [node, setNode] = useState<FileSystemNode | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreatingPage, setIsCreatingPage] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', images: [] as string[], titleColor: '#ffffff', descriptionColor: '#ffffff'});
    const [newPageData, setNewPageData] = useState({ name: '', html: '', css: '', js: ''});
    
    const containerRef = useRef<HTMLDivElement>(null);

    // Prepare items for virtualization
    const items = node?.type === 'directory' ? Object.entries(node.children) : [];
    
    // Virtualization Hook
    const { visibleItems, virtualizer } = useWindowVirtualization(items.length, {
        itemHeight: 28, // Height of a single file/folder row
        containerRef: containerRef,
    });


    const updateNode = useCallback(() => {
        const resolvedNode = getNodeFromPath(currentPath, fileSystem);
        setNode(resolvedNode);
        if (resolvedNode?.type === 'directory') {
            setEditData({ title: resolvedNode.title || '', description: resolvedNode.description || '', images: resolvedNode.images || [], titleColor: resolvedNode.titleColor || '#ffffff', descriptionColor: resolvedNode.descriptionColor || '#ffffff'});
        }
    }, [currentPath, fileSystem]);

    useEffect(() => { updateNode(); }, [updateNode]);
    useEffect(() => { dispatch({ type: 'FOCUS_WINDOW', payload: windowId }); }, [currentPath, dispatch, windowId]);

    const handleNavigate = (itemName: string, itemNode: FileSystemNode) => {
        if (itemNode.type === 'directory') {
            setCurrentPath(resolvePath(currentPath, itemName));
        } else if (itemNode.type === 'page') {
            dispatch({ type: 'OPEN_WINDOW', payload: { appType: 'WebPage', title: itemName, size: { width: 1024, height: 768 }, data: { name: itemName, ...itemNode } } });
        } else {
            // Potentially open in notepad
        }
    };
    
    const handleGoUp = () => { if (currentPath !== '~') setCurrentPath(resolvePath(currentPath, '..')); };
    const handleSaveChanges = (e: React.FormEvent) => { e.preventDefault(); dispatch({ type: 'UPDATE_FOLDER_DATA', payload: { path: currentPath, data: editData } }); setIsEditing(false); };

    const handleCreatePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPageData.name) { alert('Page name is required.'); return; }
        const pageName = newPageData.name.endsWith('.page') ? newPageData.name : `${newPageData.name}.page`;
        dispatch({ type: 'CREATE_PAGE_IN_FOLDER', payload: { path: currentPath, name: pageName, data: { html: newPageData.html, css: newPageData.css, js: newPageData.js } } });
        setNewPageData({ name: '', html: '', css: '', js: '' });
        setIsCreatingPage(false);
    };
    
    const controlStyle = "bg-gray-700/50 border border-gray-500 p-1 w-full outline-none focus:ring-1 focus:ring-cyan-400";
    const buttonStyle = "bg-gray-600/50 border border-gray-500 px-3 py-1 hover:bg-gray-500/50";
    
    const renderContent = () => {
        if (!node) return <div className="text-red-500">Error: Path not found: {currentPath}</div>;
        if (node.type === 'file') return <pre className="whitespace-pre-wrap p-2">{node.content}</pre>;
        if (node.type !== 'directory') return null;

        if (isEditing && isAdmin) {
            if (isCreatingPage) {
                return (
                    <form onSubmit={handleCreatePageSubmit} className="space-y-2 p-2 bg-black/40 rounded">
                        <h3 className='font-bold text-lg'>{text.createPage}</h3>
                        <div><label>{text.pageName}:</label><input type="text" value={newPageData.name} onChange={e => setNewPageData({...newPageData, name: e.target.value})} className={controlStyle} required /></div>
                        <div><label>{text.pageHtml}:</label><textarea value={newPageData.html} onChange={e => setNewPageData({...newPageData, html: e.target.value})} className={`${controlStyle} h-24 font-mono`} /></div>
                        <div><label>{text.pageCss}:</label><textarea value={newPageData.css} onChange={e => setNewPageData({...newPageData, css: e.target.value})} className={`${controlStyle} h-20 font-mono`} /></div>
                        <div><label>{text.pageJs}:</label><textarea value={newPageData.js} onChange={e => setNewPageData({...newPageData, js: e.target.value})} className={`${controlStyle} h-20 font-mono`} /></div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsCreatingPage(false)} className={buttonStyle}>{text.cancel}</button>
                            <button type="submit" className={`${buttonStyle} font-bold text-cyan-300`}>{text.save}</button>
                        </div>
                    </form>
                );
            }
            return (
                <form onSubmit={handleSaveChanges} className="space-y-3 p-2 bg-black/30 rounded">
                    <div><label className="block mb-1">{text.folderTitle}:</label><input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className={controlStyle} /></div>
                    <div><label htmlFor="titleColor" className="block mb-1">{text.titleColor}:</label><input type="color" id="titleColor" value={editData.titleColor} onChange={e => setEditData({...editData, titleColor: e.target.value})} className="w-full h-8" /></div>
                    <div><label className="block mb-1">{text.folderDescription}:</label><textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} className={`${controlStyle} h-24 resize-y`} /></div>
                    <div><label htmlFor="descColor" className="block mb-1">{text.descriptionColor}:</label><input type="color" id="descColor" value={editData.descriptionColor} onChange={e => setEditData({...editData, descriptionColor: e.target.value})} className="w-full h-8" /></div>
                    <div><label className={`${buttonStyle} cursor-pointer`}>{text.addImages}<input type="file" multiple accept="image/*" onChange={e => setEditData({...editData, images: [...editData.images, ...Array.from(e.target.files).map(f => URL.createObjectURL(f))]})} className="hidden" /></label></div>
                    <div className="flex gap-2 flex-wrap mt-2">{editData.images.map((img, i) => (<div key={i} className="relative group"><img src={img} alt={`img-${i}`} className="w-24 h-24 object-cover border-2 border-gray-500" /><button type="button" onClick={() => setEditData(d => ({...d, images: d.images.filter((_, idx) => idx !== i)}))} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button></div>))}</div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-600 mt-2">
                        <button type="button" onClick={() => setIsCreatingPage(true)} className={`${buttonStyle} text-green-300`}>{text.createPage}</button>
                        <div className='flex gap-2'>
                           <button type="button" onClick={() => setIsEditing(false)} className={buttonStyle}>{text.cancel}</button>
                           <button type="submit" className={`${buttonStyle} font-bold text-cyan-300`}>{text.save}</button>
                        </div>
                    </div>
                </form>
            );
        }

        return (
            <div className='p-2'>
                {isAdmin && <button onClick={() => setIsEditing(true)} className={`${buttonStyle} mb-4`}>{text.editFolder}</button>}
                {node.title && <h2 className="text-2xl font-bold font-display mb-2" style={{color: node.titleColor || settings.terminal.textColor}}>{node.title}</h2>}
                {node.description && <p className="mb-4 whitespace-pre-wrap" style={{color: node.descriptionColor || settings.terminal.textColor}}>{node.description}</p>}
                {node.images && node.images.length > 0 && (<div className="mb-4 flex gap-2 flex-wrap border-b border-gray-600 pb-4">{node.images.map((img, i) => <img key={i} src={img} alt={`img-${i}`} className="max-w-xs h-auto border-2 border-gray-600" />)}</div>)}
                <button onClick={handleGoUp} className="w-full text-left flex items-center gap-2 hover:bg-white/10 p-1 rounded"><AppIcon iconType='Folder' themeStyle={settings.themeStyle} className="w-5 h-5" /> ..</button>
                <div className="relative" style={virtualizer.style}>
                    {visibleItems.map(index => {
                        const [name, childNode] = items[index];
                         if (!childNode) return null;
                        const iconType = childNode.type === 'directory' ? 'Folder' : childNode.type === 'page' ? 'WebPage' : 'Notepad';
                        return (
                           <button key={name} onDoubleClick={() => handleNavigate(name, childNode)} className="w-full text-left flex items-center gap-2 hover:bg-white/10 p-1 rounded" style={virtualizer.getItemStyle(index)}>
                                <AppIcon iconType={iconType} themeStyle={settings.themeStyle} className="w-5 h-5 flex-shrink-0" />
                                <span>{name}</span>
                           </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const terminalBgStyle = settings.terminal.bgImage ? { backgroundImage: `url(${settings.terminal.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' } : { backgroundColor: settings.terminal.bgColor };
    const fontClass = `font-${settings.terminal.font.toLowerCase().replace(' ', '-')}`;

    return (
        <div className={`h-full text-lg leading-tight relative overflow-hidden flex flex-col ${fontClass} text-shadow-none`} style={{ ...terminalBgStyle, color: settings.terminal.textColor }}>
          <div className="flex-shrink-0 flex p-2 z-10 sticky top-0" style={{...terminalBgStyle, borderBottom: `1px solid ${settings.terminal.textColor}40`}}>
            <span className="text-green-400">HIMERA:<span className="text-blue-400">{currentPath}</span>$&nbsp;</span>
          </div>
          <div ref={containerRef} className="flex-grow w-full overflow-y-auto custom-scrollbar relative">
             {renderContent()}
          </div>
        </div>
    );
};

export default FileExplorerApp;
