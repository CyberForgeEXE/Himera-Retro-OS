import React, { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const CodeExecutorApp: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isAdmin } = state;
    const [code, setCode] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setCode('');
            setFileName('');
            setError('');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const textContent = event.target?.result as string;
            setCode(textContent);
            setFileName(file.name);
            setError('');
        };
        reader.onerror = () => {
             setError('Error: Could not read the selected file.');
             setCode('');
             setFileName('');
        }
        reader.readAsText(file);
    };

    const handleExecute = () => {
        if (!code) {
            setError('No code to execute.');
            return;
        }
        if (window.confirm('Executing this code can cause irreversible changes or break the application. Are you sure you want to proceed?')) {
            try {
                // new Function is safer than eval. It runs in the global scope, not the local one.
                // We can pass dispatch and state to it.
                const func = new Function('dispatch', 'state', code);
                func(dispatch, state);
                
                // Reset state after execution
                setError('');
                setCode('');
                setFileName('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset file input
                }
                alert('Code executed successfully and has been applied permanently.');

            } catch (err: any) {
                console.error("Code execution failed:", err);
                setError(`Execution Error: ${err.message}`);
                alert('Code execution failed. Check console for details.');
            }
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-full bg-black text-red-500 font-display text-2xl p-4 text-center">
                ACCESS DENIED - ADMIN PRIVILEGES REQUIRED
            </div>
        );
    }

    const controlStyle = "bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2 w-full outline-none focus:ring-1 focus:ring-blue-500 text-black";
    const buttonStyle = "font-sans bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-sm px-4 py-2 hover:bg-gray-300 active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black";

    return (
        <div className="p-4 h-full flex flex-col font-sans bg-[#c0c0c0] text-black">
            <h2 className="text-xl font-bold mb-2">Code Executor</h2>
            <p className="text-sm mb-4">
                Select a JavaScript file (.js, .txt) to execute. The code will have access to `dispatch` and `state` variables.
                <br />
                <strong>Warning:</strong> This is a powerful and dangerous tool.
            </p>
            
            <div className="mb-4">
                 <label htmlFor="file-upload" className={`${buttonStyle} cursor-pointer`}>
                    Select Code File
                </label>
                <input ref={fileInputRef} id="file-upload" type="file" accept=".js,.txt,text/plain" className="hidden" onChange={handleFileChange} />
                {fileName && <span className="ml-4 italic">{fileName}</span>}
            </div>

            {error && <p className="text-red-600 mb-2 font-bold">{error}</p>}
            
            <textarea
                value={code}
                readOnly
                placeholder="File content will be previewed here..."
                className={`${controlStyle} flex-grow resize-none font-mono text-xs bg-gray-200`}
                spellCheck="false"
            />

            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleExecute} 
                    className={`${buttonStyle} font-bold bg-red-500 hover:bg-red-400 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    disabled={!code || !!error}
                >
                    Execute & Apply Permanently
                </button>
            </div>
        </div>
    );
};

export default CodeExecutorApp;