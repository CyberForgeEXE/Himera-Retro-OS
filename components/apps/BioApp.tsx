import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const BioApp: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { bioData, isAdmin } = state;

    const [activeTab, setActiveTab] = useState('bio');
    
    // State for editing IT description
    const [isEditingIT, setIsEditingIT] = useState(false);
    const [tempItDescription, setTempItDescription] = useState('');
    
    // State for editing Photos/Media
    const [isEditingPhotos, setIsEditingPhotos] = useState(false);
    const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
    const [newMediaUrlInput, setNewMediaUrlInput] = useState('');

    const bioImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYYAXPzJWaTCUrVZFRKocd3YlQ4F_XOBbeUg&s';

    // --- IT Description Handlers ---
    const handleEditIT = () => {
        setTempItDescription(bioData.itDescription);
        setIsEditingIT(true);
    };

    const handleSaveIT = () => {
        dispatch({ type: 'UPDATE_BIO_DATA', payload: { itDescription: tempItDescription } });
        setIsEditingIT(false);
    };

    // --- Photos/Media Handlers ---
    const handleEditPhotos = () => {
        setTempMediaUrls([...bioData.mediaUrls]);
        setIsEditingPhotos(true);
    };

    const handleSavePhotos = () => {
        dispatch({ type: 'UPDATE_BIO_DATA', payload: { mediaUrls: tempMediaUrls } });
        setIsEditingPhotos(false);
    };

    const handleDeleteMedia = (index: number) => {
        setTempMediaUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddMediaUrl = () => {
        if (newMediaUrlInput.trim()) {
            setTempMediaUrls(prev => [...prev, newMediaUrlInput.trim()]);
            setNewMediaUrlInput('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setTempMediaUrls(prev => [...prev, event.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    // --- Styles ---
    const tabButtonStyle = "px-4 py-2 font-bold text-lg focus:outline-none transition-colors duration-200";
    const activeTabStyle = "border-b-4 border-[var(--accent-color)] text-gray-900";
    const inactiveTabStyle = "text-gray-500 hover:text-gray-700";
    const buttonStyle = "bg-gray-200 border border-gray-400 px-3 py-1 rounded shadow-sm hover:bg-gray-300 active:shadow-inner";
    const inputStyle = "bg-white border border-gray-400 p-2 w-full rounded outline-none focus:ring-1 focus:ring-[var(--accent-color)]";

    return (
        <div className="p-6 h-full flex flex-col font-sans bg-[#ece9d8] text-black overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 flex items-center mb-4 border-b-2 border-gray-400 pb-4">
                <img src={bioImageUrl} alt="Profile" className="w-24 h-24 rounded-full border-2 border-gray-500 mr-6" />
                <h1 className="text-4xl font-bold font-display text-gray-800">Thumex</h1>
            </div>

            <div className="flex-shrink-0 flex border-b border-gray-300 mb-6">
                <button
                    onClick={() => setActiveTab('bio')}
                    className={`${tabButtonStyle} ${activeTab === 'bio' ? activeTabStyle : inactiveTabStyle}`}
                >
                    Bio
                </button>
                <button
                    onClick={() => setActiveTab('it')}
                    className={`${tabButtonStyle} ${activeTab === 'it' ? activeTabStyle : inactiveTabStyle}`}
                >
                    IT
                </button>
                <button
                    onClick={() => setActiveTab('zdjecia')}
                    className={`${tabButtonStyle} ${activeTab === 'zdjecia' ? activeTabStyle : inactiveTabStyle}`}
                >
                    Zdjecia
                </button>
            </div>

            <div className="flex-grow text-base leading-relaxed">
                {activeTab === 'bio' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 border-b border-gray-300 pb-1">Moje Bio:</h2>
                            <p>
                                Jestem osobą, która głęboko zanurza się w świat technologii – komputery, systemy, programowanie i tworzenie gier to moje główne pasje. W wolnym czasie szukam równowagi między aktywnością fizyczną, snem, pisaniem wierszy i słuchaniem muzyki. Inspiruje mnie ciekawość świata i możliwość kształtowania go według własnej wizji. Moje największe marzenie to osiągnięcie spokoju, zarówno wewnętrznego, jak i finansowego, oraz znalezienie kobiety, która będzie mi towarzyszyć.
                            </p>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-bold mb-2 border-b border-gray-300 pb-1">Mój Opis:</h2>
                            <p>
                                Jestem ambitny i dążę do celu, choć moje nietypowe zainteresowania, takie jak pisanie wierszy czy tworzenie aplikacji i stron, mogą zaskakiwać. Nie cenię ludzi i nie lubię ich, co sprawia, że cisza i spokój są dla mnie niezwykle ważne. Szacunek to wartość, która jest dla mnie fundamentalna. Moja droga życiowa, naznaczona chorobami i operacjami, ukształtowała mnie i pozwoliła mi dosłownie stanąć na nogi, co nauczyło mnie siły i determinacji. Film "Mr. Robot" to dla mnie inspirujące dzieło. Chciałbym zmienić sposób, w jaki ludzie postrzegają świat, ponieważ często na pierwszy rzut oka nie dostrzegają, że jestem kimś innym, kimś, kto nie pasuje do typowych schematów. Moim celem na najbliższe pięć lat jest osiągnięcie wewnętrznego spokoju. Podróż, o której marzę, to podróż do czyjegoś serca.
                            </p>
                        </div>
                    </div>
                )}
                {activeTab === 'it' && (
                    <div>
                        <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-2">
                            <h2 className="text-2xl font-bold">Pasja do Technologii</h2>
                            {isAdmin && !isEditingIT && <button onClick={handleEditIT} className={buttonStyle}>Edit</button>}
                        </div>
                        {isEditingIT ? (
                            <div className="space-y-2">
                                <textarea
                                    value={tempItDescription}
                                    onChange={(e) => setTempItDescription(e.target.value)}
                                    className={`${inputStyle} h-96 resize-y`}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditingIT(false)} className={buttonStyle}>Cancel</button>
                                    <button onClick={handleSaveIT} className={`${buttonStyle} font-bold bg-blue-200`}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{bioData.itDescription}</p>
                        )}
                    </div>
                )}
                {activeTab === 'zdjecia' && (
                    <div>
                         <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-4">
                            <h2 className="text-2xl font-bold">Galeria</h2>
                            {isAdmin && (
                                isEditingPhotos ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingPhotos(false)} className={buttonStyle}>Cancel</button>
                                        <button onClick={handleSavePhotos} className={`${buttonStyle} font-bold bg-blue-200`}>Save Changes</button>
                                    </div>
                                ) : (
                                    <button onClick={handleEditPhotos} className={buttonStyle}>Edit Gallery</button>
                                )
                            )}
                        </div>
                        {isEditingPhotos && (
                            <div className="mb-4 p-4 border border-dashed border-gray-400 rounded-lg space-y-3 bg-gray-200/50">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Add image/video URL" value={newMediaUrlInput} onChange={e => setNewMediaUrlInput(e.target.value)} className={inputStyle} />
                                    <button onClick={handleAddMediaUrl} className={buttonStyle}>Add from URL</button>
                                </div>
                                <div>
                                    <label className={`${buttonStyle} cursor-pointer`}>
                                        Upload from computer
                                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(isEditingPhotos ? tempMediaUrls : bioData.mediaUrls).map((url, index) => {
                                const isVideo = ['.mp4', '.webm', '.ogg'].some(ext => url.toLowerCase().endsWith(ext));
                                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', 'data:image'].some(ext => url.toLowerCase().includes(ext));

                                return (
                                    <div key={index} className="relative group bg-black rounded-lg overflow-hidden shadow-lg border-2 border-gray-400">
                                        {isVideo ? (
                                            <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ aspectRatio: '16/9' }} />
                                        ) : isImage ? (
                                            <img src={url} alt={`media-${index}`} className="w-full h-full object-cover" style={{ aspectRatio: '16/9' }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white p-2" style={{ aspectRatio: '16/9' }}>Unsupported format</div>
                                        )}
                                        {isEditingPhotos && (
                                            <button onClick={() => handleDeleteMedia(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-80 group-hover:opacity-100 transition-all hover:scale-110">&times;</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BioApp;
