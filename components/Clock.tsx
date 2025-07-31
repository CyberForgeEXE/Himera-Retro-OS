import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import BatteryIndicator from './Battery';

interface ClockProps {
    isTaskbarClock: boolean;
    size: number;
}

const ClockComponent: React.FC<ClockProps> = ({ isTaskbarClock, size }) => {
  const [date, setDate] = useState(new Date());
  const { state } = useAppContext();
  const { settings } = state;

  useEffect(() => {
    const timerId = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });

  const showBattery = settings.battery.show && settings.battery.position === 'clock';

  if (isTaskbarClock) {
      return (
          <div className="flex items-center justify-center text-white select-none px-2 h-full text-center">
              {showBattery && <BatteryIndicator />}
              <div style={{fontSize: `${size}px`}} className="flex flex-col items-center leading-tight">
                <span>{time}</span>
                <span className="opacity-80">{day}</span>
              </div>
          </div>
      )
  }

  return (
    <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[var(--text-color)] rounded-md z-[50] p-4 flex items-center space-x-4`}
        style={{ 
            backgroundColor: 'var(--window-bg)', 
            border: '2px solid var(--border-color)',
            boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
            fontSize: `${size}px` 
        }}>
      {showBattery && <BatteryIndicator />}
      <div>
        <div>{time}</div>
        <div className="text-sm text-center">{day}</div>
      </div>
    </div>
  );
};

const Clock = React.memo(ClockComponent);
export default Clock;
