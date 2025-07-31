

import React, { useState, useEffect } from 'react';

interface BootScreenProps {
  onBootComplete: () => void;
}

const BootLine: React.FC<{ text: string; delay: number; showCursor?: boolean }> = ({ text, delay, showCursor = false }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!visible) return null;

  return (
    <p>
      {text}
      {showCursor && <span className="bg-green-400 w-2.5 h-5 inline-block animate-[blink_1s_step-end_infinite]" />}
    </p>
  );
};

const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalTime = 4000;
    const intervalTime = 50;
    let elapsedTime = 0;

    const interval = setInterval(() => {
      elapsedTime += intervalTime;
      setProgress((elapsedTime / totalTime) * 100);
      if (elapsedTime >= totalTime) {
        clearInterval(interval);
        onBootComplete();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onBootComplete]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black p-8 font-mono text-lg text-green-400" style={{ textShadow: '0 0 5px rgba(50, 255, 50, 0.7)' }}>
      <div className="w-full max-w-2xl">
        <BootLine text="THUMEX OS v1.0 [Build 9812]" delay={100} />
        <BootLine text="Copyright (c) 1998 Thumex Corp." delay={200} />
        <br />
        <BootLine text="Initializing kernel..." delay={500} />
        <BootLine text="Loading drivers... [OK]" delay={800} />
        <BootLine text="Mounting file systems... [OK]" delay={1200} />
        <BootLine text="Starting network services... [OK]" delay={1600} />
        <BootLine text="Loading user interface..." delay={2000} />
        <div className="mt-4">
            <div className="w-full bg-gray-800 border border-green-700 h-6">
                <div className="h-full bg-green-500" style={{width: `${progress}%`}}></div>
            </div>
        </div>
        <BootLine text="Finalizing..." delay={3500} showCursor={true} />
      </div>
      <style>{`@keyframes blink { 50% { visibility: hidden; } }`}</style>
    </div>
  );
};

export default BootScreen;