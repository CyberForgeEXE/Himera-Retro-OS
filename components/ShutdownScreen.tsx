import React from 'react';

const ShutdownScreen: React.FC = () => {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-gray-300 font-retro text-2xl p-4 text-center">
            <p>It is now safe to turn off your computer.</p>
            <span className="bg-gray-300 w-4 h-8 inline-block animate-[blink_1s_step-end_infinite] mt-4" />
            <style>{`@keyframes blink { 50% { visibility: hidden; } }`}</style>
        </div>
    );
};

export default ShutdownScreen;
