import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT } from '../../constants';
import { BoldIcon, ItalicIcon, UnderlineIcon } from '../Icons';

const NotepadApp: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const { state } = useAppContext();
  const text = UI_TEXT[state.language];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedNote = localStorage.getItem('himera-notepad');
    if (savedNote) {
      try {
        const { title, content } = JSON.parse(savedNote);
        setTitle(title);
        setContent(content);
      } catch (e) {
        setContent(savedNote);
      }
    }
  }, []);
  
  const updateCursorPos = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textUpToCursor = textarea.value.substring(0, textarea.selectionStart);
    const line = textUpToCursor.split('\n').length;
    const lastNewlineIndex = textUpToCursor.lastIndexOf('\n');
    const col = textarea.selectionStart - lastNewlineIndex;

    setCursorPos({ line, col });
  };

  useEffect(updateCursorPos, [content]);

  const handleSaveLocal = () => {
    localStorage.setItem('himera-notepad', JSON.stringify({ title, content }));
    alert('Note saved to browser storage.');
  };

  const handleSaveTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buttonStyle = "p-1 border-r border-gray-400 text-gray-500";

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm">
      {/* Menu Bar */}
      <div className="flex-shrink-0 bg-inherit border-b border-t-white border-l-white border-r-gray-500 border-b-gray-500 px-1">
        <span className="inline-block p-1 hover:bg-blue-600 hover:text-white cursor-default"><u>F</u>ile</span>
        <span className="inline-block p-1 hover:bg-blue-600 hover:text-white cursor-default"><u>E</u>dit</span>
        <span className="inline-block p-1 hover:bg-blue-600 hover:text-white cursor-default"><u>V</u>iew</span>
      </div>
      
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-inherit border-b-2 border-gray-400 px-1 py-1 flex items-center space-x-1">
        <div className="flex border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white p-0.5">
          <button className={buttonStyle} disabled><BoldIcon className="w-5 h-5"/></button>
          <button className={buttonStyle} disabled><ItalicIcon className="w-5 h-5"/></button>
          <button className="p-1 text-gray-500" disabled><UnderlineIcon className="w-5 h-5"/></button>
        </div>
      </div>
      
      <div className="flex-grow p-1">
        <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyUp={updateCursorPos}
            onClick={updateCursorPos}
            className="p-2 outline-none w-full h-full resize-none border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white"
            style={{ backgroundColor: '#FFFFFF', color: '#000000', fontFamily: 'Arial', fontSize: '14px' }}
        />
      </div>

       <div className="flex-shrink-0 flex items-center justify-between border-t-2 border-t-white bg-inherit">
           <div className="flex">
            <div className="status-bar-panel">
                <button onClick={handleSaveTxt} className="hover:font-bold">{text.saveToTxt}</button>
            </div>
            <div className="status-bar-panel">
                <button onClick={handleSaveLocal} className="hover:font-bold">{text.saveLocal}</button>
            </div>
           </div>
           <div className="status-bar-panel">
                Ln {cursorPos.line}, Col {cursorPos.col}
           </div>
      </div>
    </div>
  );
};

export default NotepadApp;