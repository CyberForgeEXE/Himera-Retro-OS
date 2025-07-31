import React from 'react';

interface IconProps {
    className?: string;
    style?: React.CSSProperties;
    isCharging?: boolean;
}

// --- Window Control Icons ---
export const XPCloseIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.00003 5.00001L16 16M16 5.00001L5.00004 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);
export const XPMinimizeIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 14H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

// --- UI Icons ---
export const HimeraMenuIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8"/>
        <path d="M50 5L50 95" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
        <path d="M5 50H95" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="50" cy="50" r="15" fill="currentColor"/>
    </svg>
);


// --- Editor Icons ---
export const BoldIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    </svg>
);
export const ItalicIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="4" x2="10" y2="4"></line>
        <line x1="14" y1="20" x2="5" y2="20"></line>
        <line x1="15" y1="4" x2="9" y2="20"></line>
    </svg>
);
export const UnderlineIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
        <line x1="4" y1="21" x2="20" y2="21"></line>
    </svg>
);


// --- XP Style App Icons ---
const XPFolderIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M57.1,19.1l-4-5.2C52.1,12.7,50.6,12,49,12H30.4l-6.2-4.1C23.3,7.3,22.2,7,21,7H8C5.8,7,4,8.8,4,11v10.9V47c0,2.2,1.8,4,4,4h49c2.2,0,4-1.8,4-4V23C61,21.2,59.3,19.6,57.1,19.1z" fill="#ffca28"/><path d="M8,22h51c2.2,0,4,1.8,4,4v17c0,2.2-1.8,4-4,4H8c-2.2,0-4-1.8,4-4V26C4,23.8,5.8,22,8,22z" fill="#ffd759"/><path d="M60.4,22.4L57.1,19.1l-4-5.2C52.1,12.7,50.6,12,49,12H30.4l-6.2-4.1C23.3,7.3,22.2,7,21,7H8C5.8,7,4,8.8,4,11v11h55C60.7,22,61.4,22.1,60.4,22.4z" fill="#ffca28"/></svg> );
const XPTerminalIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M58,5H6C5.4,5,5,5.4,5,6v52c0,0.6,0.4,1,1,1h52c0.6,0,1-0.4,1-1V6C59,5.4,58.6,5,58,5z" fill="#39475c"/><path d="M56,8H8C7.4,8,7,8.4,7,9v46c0,0.6,0.4,1,1,1h48c0.6,0,1-0.4,1-1V9C57,8.4,56.6,8,56,8z" fill="#1e2732"/><path d="M21.1,38.9C20,40,18.4,40,17.3,38.9l-5.8-5.8C10.4,32,10.4,30,11.5,28.9l5.8-5.8c1.1-1.1,2.8-1.1,3.8,0C22.2,24.2,22.2,37.8,21.1,38.9z M25,41h24c0.6,0,1-0.4,1-1s-0.4-1-1-1H25c-0.6,0-1,0.4-1,1S24.4,41,25,41z" fill="#92e3a9"/></svg> );
const XPNotepadIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M49,6H15c-1.7,0-3,1.3-3,3v46c0,1.7,1.3,3,3,3h34c1.7,0,3-1.3,3-3V16.8L49,6z" fill="#f5f5f5"/><path d="M52,16.8V49c0,1.7-1.3,3-3,3H15c-1.7,0-3-1.3,3-3V9c0-1.7,1.3-3,3-3h34L52,16.8z" fill="#e8e8e8"/><path d="M49,6l6,10.8H49V6z" fill="#cfcfcf"/><path d="M45,26H19c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h26c0.6,0,1-0.4,1-1v-2C46,26.4,45.6,26,45,26z" fill="#64b5f6"/><path d="M45,34H19c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h26c0.6,0,1-0.4,1-1v-2C46,34.4,45.6,34,45,34z" fill="#64b5f6"/><path d="M35,42H19c-0.6,0-1,0.4-1,1v2c0,0.6,0.4,1,1,1h16c0.6,0,1-0.4,1-1v-2C36,42.4,35.6,42,35,42z" fill="#64b5f6"/></svg> );
const XPSettingsIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M52.4,35.7h-9.2c-0.8-2.6-2.2-5-4-7.1l6.5-6.5c2.4-2.4,2.4-6.3,0-8.7l-4.9-4.9c-2.4-2.4-6.3-2.4-8.7,0l-6.5,6.5c-2.1-1.8-4.5-3.2-7.1-4V11.6c0-3.4-2.8-6.2-6.2-6.2h-7C7.8,5.4,5,8.2,5,11.6v6.9c-2.6,0.8-5,2.2-7.1,4l-6.5-6.5c-2.4-2.4-6.3-2.4-8.7,0l-4.9,4.9c-2.4,2.4-2.4,6.3,0,8.7l6.5,6.5c-1.8,2.1-3.2,4.5-4,7.1H11.6c-3.4,0-6.2,2.8-6.2,6.2v7c0,3.4,2.8,6.2,6.2,6.2h6.9c0.8,2.6,2.2,5,4,7.1l-6.5,6.5c-2.4,2.4-2.4,6.3,0,8.7l4.9,4.9c2.4,2.4,6.3,2.4,8.7,0l6.5-6.5c2.1,1.8,4.5,3.2,7.1,4v6.9c0,3.4,2.8,6.2,6.2,6.2h7c3.4,0,6.2-2.8,6.2-6.2v-6.9c2.6-0.8,5-2.2,7.1-4l6.5,6.5c2.4,2.4,6.3,2.4,8.7,0l4.9-4.9c2.4-2.4,2.4,6.3,0,8.7l-6.5-6.5c1.8-2.1,3.2-4.5,4-7.1h6.9c3.4,0,6.2-2.8,6.2-6.2v-7C58.6,38.5,55.8,35.7,52.4,35.7z" fill="#bdbdbd"/><path d="M42.2,42.2c-5.6,5.6-14.8,5.6-20.4,0c-5.6-5.6-5.6-14.8,0-20.4c5.6-5.6,14.8-5.6,20.4,0C47.8,27.4,47.8,36.6,42.2,42.2z" fill="#616161"/></svg> );
const XPBlogIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M52,5H12c-1.7,0-3,1.3-3,3v48c0,1.7,1.3,3,3,3h40c1.7,0,3-1.3,3-3V8C55,6.3,53.7,5,52,5z" fill="#29b6f6"/><path d="M46,18H18c-1.1,0-2,0.9-2,2s0.9,2,2,2h28c1.1,0,2-0.9,2-2S47.1,18,46,18z" fill="#fff"/><path d="M46,28H18c-1.1,0-2,0.9-2,2s0.9,2,2,2h28c1.1,0,2-0.9,2-2S47.1,28,46,28z" fill="#fff"/><path d="M34,38H18c-1.1,0-2,0.9-2,2s0.9,2,2,2h16c1.1,0,2-0.9,2-2S35.1,38,34,38z" fill="#fff"/><path d="M46,48H18c-1.1,0-2,0.9-2,2s0.9,2,2,2h28c1.1,0,2-0.9,2-2S47.1,48,46,48z" fill="#ffeb3b"/></svg> );
const XPContactIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M56,13H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h48c2.2,0,4-1.8,4-4V17C60,14.8,58.2,13,56,13z" fill="#90caf9"/><path d="M55.8,14.3L32.5,31.2c-0.3,0.2-0.7,0.2-1,0L8.2,14.3C7.4,13.8,6.5,14,6.2,14.8L6,15.3c-0.3,0.8,0,1.7,0.8,2.2l24,16.8c0.6,0.4,1.4,0.4,2,0l24-16.8c0.8-0.5,1-1.4,0.8-2.2l-0.2-0.5C57.5,14,56.6,13.8,55.8,14.3z" fill="#42a5f5"/></svg> );
const XPSnakeIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M32,5h12v12H32V5z" fill="#4caf50"/><path d="M44,17h12v12H44V17z" fill="#4caf50"/><path d="M32,29h12v12H32V29z" fill="#4caf50"/><path d="M20,41h12v12H20V41z" fill="#4caf50"/><path d="M32,53h12v12H32V53z" fill="#4caf50"/><path d="M20,5h12v12H20V5z" fill="#8bc34a"/><path d="M32,17h12v12H32V17z" fill="#8bc34a"/><path d="M44,29h12v12H44V29z" fill="#8bc34a"/><path d="M20,29h12v12H20V29z" fill="#8bc34a"/><path d="M8,41h12v12H8V41z" fill="#8bc34a"/></svg> );
const XPMinesweeperIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M10,5h44v44H10z" fill="#e0e0e0"/><path d="M54,5H10v44h44V5z M50,45H14V9h36V45z" fill="#bdbdbd"/><path d="M24,24c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S26.2,24,24,24z" fill="#ef5350"/><path d="M40,24c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S42.2,24,40,24z" fill="#ef5350"/><path d="M32,32c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S34.2,32,32,32z" fill="#ef5350"/><path d="M40,40c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S42.2,40,40,40z" fill="#ef5350"/><path d="M24,40c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S26.2,40,24,40z" fill="#ef5350"/><circle cx="32" cy="18" r="4" fill="#39475c"/><path d="M50,53H14c-2.2,0-4-1.8-4-4V9c0-2.2,1.8-4,4-4h36c2.2,0,4,1.8,4,4v40C54,51.2,52.2,53,50,53z" fill="none" stroke="#9e9e9e" stroke-miterlimit="10" stroke-width="2"/></svg> );
const XPPacmanIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M32 59C17.1 59 5 46.9 5 32S17.1 5 32 5s27 12.1 27 27c0 7.8-3.3 14.8-8.6 19.9L32 32 32 59z" fill="#ffde59"></path><path d="M32 32l18.4 20.3C45.2 55.7 38.9 59 32 59V32z" fill="#212121"></path></svg> );
const XPWebPageIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path fill="#f5f5f5" d="M52 5H12c-2.2 0-4 1.8-4 4v46c0 2.2 1.8 4 4 4h40c2.2 0 4-1.8 4-4V9c0-2.2-1.8-4-4-4z"/><path fill="#cfd8dc" d="m51.1 8-.1.1V55H12.9l.1-.2V9c0-1.6 1.3-2.9 2.9-2.9l32.3.1c1.5 0 2.8 1.3 2.8 2.8z"/><path fill="#546e7a" d="m22.1 24-5.8 7 5.8 7h4l-5.8-7 5.8-7h-4zm9.8 15L27 24h3.6l4.9 15h-3.3z"/><path fill="#78909c" d="m41.9 41-5.8-7 5.8-7h-4l-5.8 7 5.8 7h4z"/></svg> );
const XPUpdaterIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path d="M52.4,35.7h-9.2c-0.8-2.6-2.2-5-4-7.1l6.5-6.5c2.4-2.4,2.4-6.3,0-8.7l-4.9-4.9c-2.4-2.4-6.3-2.4-8.7,0l-6.5,6.5c-2.1-1.8-4.5-3.2-7.1-4V11.6c0-3.4-2.8-6.2-6.2-6.2h-7C7.8,5.4,5,8.2,5,11.6v6.9c-2.6,0.8-5,2.2-7.1,4l-6.5-6.5c-2.4-2.4-6.3-2.4-8.7,0l-4.9,4.9c-2.4,2.4-2.4,6.3,0,8.7l6.5,6.5c-1.8,2.1-3.2,4.5-4,7.1H11.6c-3.4,0-6.2,2.8-6.2,6.2v7c0,3.4,2.8,6.2,6.2,6.2h6.9c0.8,2.6,2.2,5,4,7.1l-6.5,6.5c-2.4,2.4-2.4,6.3,0,8.7l4.9,4.9c2.4,2.4,6.3,2.4,8.7,0l6.5-6.5c2.1,1.8,4.5,3.2,7.1,4v6.9c0,3.4,2.8,6.2,6.2,6.2h7c3.4,0,6.2-2.8,6.2-6.2v-6.9c2.6-0.8,5-2.2,7.1-4l6.5,6.5c2.4,2.4,6.3,2.4,8.7,0l4.9-4.9c2.4-2.4,2.4,6.3,0,8.7l-6.5-6.5c1.8-2.1,3.2-4.5,4-7.1h6.9c3.4,0,6.2-2.8,6.2-6.2v-7C58.6,38.5,55.8,35.7,52.4,35.7z" fill="#bdbdbd"/><circle cx="32" cy="32" r="8" fill="#616161"/><path d="M28 34l4-4 4 4m-4-4v10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> );
const XPCodeExecutorIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 64 64"><path fill="#f5f5f5" d="M49 6H15c-1.7 0-3 1.3-3 3v46c0 1.7 1.3 3 3 3h34c1.7 0 3-1.3 3-3V16.8L49 6z"/><path fill="#e8e8e8" d="M52 16.8V49c0 1.7-1.3 3-3 3H15c-1.7 0-3-1.3 3-3V9c0-1.7 1.3-3 3-3h34L52 16.8z"/><path fill="#cfcfcf" d="M49 6l6 10.8H49V6z"/><path fill="#FFEB3B" stroke="#FBC02D" strokeWidth="2" d="M36 24L28 36h6l-4 8 8-10h-6z"/></svg> );
const XPBioIcon: React.FC<IconProps> = ({ className, style }) => ( <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYYAXPzJWaTCUrVZFRKocd3YlQ4F_XOBbeUg&s" alt="Bio Icon" className={className} style={{...style, borderRadius: '8px' }} /> );

const XPIconSet = {
    Folder: XPFolderIcon,
    Terminal: XPTerminalIcon,
    Notepad: XPNotepadIcon,
    Settings: XPSettingsIcon,
    Blog: XPBlogIcon,
    Contact: XPContactIcon,
    Snake: XPSnakeIcon,
    Minesweeper: XPMinesweeperIcon,
    Pacman: XPPacmanIcon,
    FileExplorer: XPFolderIcon,
    WebPage: XPWebPageIcon,
    Updater: XPUpdaterIcon,
    CodeExecutor: XPCodeExecutorIcon,
    Bio: XPBioIcon,
};

// --- Classic Style App Icons ---
const ClassicFolderIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10h40v30H4zM2 14h44M10 4h12l4 6" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ClassicTerminalIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8h36v32H6z" stroke="var(--text-color)" strokeWidth="3" /><path d="M14 20l6 6-6 6m8 0h10" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ClassicNotepadIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h28v40H10z" stroke="var(--text-color)" strokeWidth="3" /><path d="M16 14h16m-16 8h16m-16 8h8" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round"/></svg> );
const ClassicSettingsIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="8" stroke="var(--text-color)" strokeWidth="3"/><path d="M24 4v6m0 28v6m14-20h6M4 24h6" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round"/></svg> );
const ClassicBlogIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8h32v32H8z" stroke="var(--text-color)" strokeWidth="3" /><path d="M16 16h16M16 24h16M16 32h8" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round"/></svg> );
const ClassicContactIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10h40v28H4z" stroke="var(--text-color)" strokeWidth="3"/><path d="M4 10l20 14 20-14" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ClassicSnakeIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 10h12v12H18zM30 22h12v12H30zM6 34h12v12H6z" stroke="var(--text-color)" strokeWidth="3"/></svg> );
const ClassicMinesweeperIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8h36v32H6z" stroke="var(--text-color)" strokeWidth="3"/><path d="M16 18h4v4h-4zm8 8h4v4h-4zm8-8h4v4h-4z" stroke="var(--text-color)" strokeWidth="3"/></svg> );
const ClassicPacmanIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke="var(--text-color)" strokeWidth="3"/><path d="M24 24L42 15V33L24 24z" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ClassicWebPageIcon: React.FC<IconProps> = XPWebPageIcon; // Reuse for now
const ClassicUpdaterIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8h36v32H6z" stroke="var(--text-color)" strokeWidth="3" /><path d="M24 18v14m-7-8l7-7 7 7" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ClassicCodeExecutorIcon: React.FC<IconProps> = ({ className, style }) => ( <svg className={className} style={style} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4h28v40H10z" stroke="var(--text-color)" strokeWidth="3" /><path d="M28 18L20 28h5l-4 8 8-10h-5z" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const ClassicBioIcon: React.FC<IconProps> = ({ className, style }) => ( <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYYAXPzJWaTCUrVZFRKocd3YlQ4F_XOBbeUg&s" alt="Bio Icon" className={className} style={{...style, borderRadius: '8px' }} /> );


const ClassicIconSet = {
    Folder: ClassicFolderIcon,
    Terminal: ClassicTerminalIcon,
    Notepad: ClassicNotepadIcon,
    Settings: ClassicSettingsIcon,
    Blog: ClassicBlogIcon,
    Contact: ClassicContactIcon,
    Snake: ClassicSnakeIcon,
    Minesweeper: ClassicMinesweeperIcon,
    Pacman: ClassicPacmanIcon,
    FileExplorer: ClassicFolderIcon,
    WebPage: ClassicWebPageIcon,
    Updater: ClassicUpdaterIcon,
    CodeExecutor: ClassicCodeExecutorIcon,
    Bio: ClassicBioIcon,
};

const IconSets = {
    xp: XPIconSet,
    classic: ClassicIconSet,
};

export const AppIcon: React.FC<{
    iconType: string;
    themeStyle: 'xp' | 'classic';
    className?: string;
    style?: React.CSSProperties;
}> = ({ iconType, themeStyle, className, style }) => {
    const SelectedIconSet = IconSets[themeStyle] || IconSets.xp;
    const IconComponent = SelectedIconSet[iconType as keyof typeof SelectedIconSet] || SelectedIconSet.Folder;
    return <IconComponent className={className} style={style} />;
};
