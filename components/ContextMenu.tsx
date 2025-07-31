import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UI_TEXT } from '../constants';
import { DesktopItem } from '../types';

const ContextMenu: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { contextMenu, language } = state;
    const text = UI_TEXT[language];

    const handleCreateFolder = () => {
        const newFolder: DesktopItem = {
            id: `folder-${Date.now()}`,
            type: 'folder',
            label: 'New Folder', // Reducer will handle unique name and renaming state
            iconType: 'Folder',
            position: { x: contextMenu.x, y: contextMenu.y },
            isSelected: false,
        };
        dispatch({ type: 'CREATE_DESKTOP_ITEM', payload: newFolder });
        dispatch({ type: 'HIDE_CONTEXT_MENU' });
    };

    const handleArrangeIcons = () => {
        dispatch({ type: 'ARRANGE_ICONS' });
        dispatch({ type: 'HIDE_CONTEXT_MENU' });
    };

    const handleRename = () => {
        if (contextMenu.targetId) {
            dispatch({ type: 'START_RENAMING', payload: contextMenu.targetId });
        }
        dispatch({ type: 'HIDE_CONTEXT_MENU' });
    };
    
    const handleDeleteItem = () => {
        if (contextMenu.targetId) {
            if (window.confirm('Are you sure you want to delete this item?')) {
                dispatch({ type: 'DELETE_DESKTOP_ITEM', payload: contextMenu.targetId });
            }
        }
        dispatch({ type: 'HIDE_CONTEXT_MENU' });
    };

    const isIconTarget = !!contextMenu.targetId;

    return (
        <div
            className="absolute bg-gray-200 border border-gray-500 shadow-lg py-2 z-[9999] context-menu-component"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()} 
        >
            {isIconTarget ? (
                 <>
                    <button
                        onClick={handleRename}
                        className="block w-full text-left px-8 py-2 text-lg text-black hover:bg-blue-500 hover:text-white"
                    >
                        {text.rename}
                    </button>
                    <button
                        onClick={handleDeleteItem}
                        className="block w-full text-left px-8 py-2 text-lg text-black hover:bg-blue-500 hover:text-white"
                    >
                        {text.delete}
                    </button>
                 </>
            ) : (
                <>
                    <button
                        onClick={handleCreateFolder}
                        className="block w-full text-left px-8 py-2 text-lg text-black hover:bg-blue-500 hover:text-white"
                    >
                        {text.newFolder}
                    </button>
                    <button
                        onClick={handleArrangeIcons}
                        className="block w-full text-left px-8 py-2 text-lg text-black hover:bg-blue-500 hover:text-white"
                    >
                        {text.arrangeIcons}
                    </button>
                </>
            )}
        </div>
    );
};

export default ContextMenu;