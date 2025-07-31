
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const BatteryIndicator: React.FC = () => {
    const { state } = useAppContext();
    const { batteryLevel, isCharging } = state;

    if (batteryLevel === null) {
        return null; // Don't render if battery status is unavailable
    }

    const fillPercentage = Math.round(batteryLevel);
    // Inner width of the battery bar is 18 (from x=3 to x=21 in a 24-width viewbox)
    const barWidth = (fillPercentage / 100) * 16;
    const barColor = isCharging 
        ? '#64b5f6' // A pleasant blue for charging
        : fillPercentage < 20 
        ? '#ef5350' // Red for low battery
        : '#4caf50'; // Green for normal battery

    return (
        <div className="flex items-center space-x-1 px-2 text-white select-none" title={`${fillPercentage}% ${isCharging ? '(charging)' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
                <line x1="23" y1="10" x2="23" y2="14"></line>
                <rect x="3" y="8" width={barWidth} height="8" rx="1" ry="1" fill={barColor} stroke="none"></rect>
                {isCharging && (
                    <path d="M8 14l3-4h-2l3-4" stroke="yellow" strokeWidth="1.5" />
                )}
            </svg>
            <span className="text-xs font-sans">{fillPercentage}%</span>
        </div>
    );
};

export default BatteryIndicator;