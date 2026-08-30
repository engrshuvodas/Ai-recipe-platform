import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Bell, Timer as TimerIcon } from 'lucide-react';

const KitchenTimer = ({ initialMinutes = 5, stepTitle = 'Cooking Step Timer', onComplete }) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setTotalSeconds(initialMinutes * 60);
    setIsActive(false);
    setIsCompleted(false);
  }, [initialMinutes]);

  useEffect(() => {
    let interval = null;
    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((sec) => sec - 1);
      }, 1000);
    } else if (totalSeconds === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      if (onComplete) onComplete();
      // Optional browser audio chime
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        // AudioContext not permitted without interaction
      }
    }
    return () => clearInterval(interval);
  }, [isActive, totalSeconds, onComplete]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const toggleTimer = () => {
    if (isCompleted) {
      setTotalSeconds(initialMinutes * 60);
      setIsCompleted(false);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTotalSeconds(initialMinutes * 60);
  };

  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-amber-500 text-forest-950 border-amber-400 animate-bounce'
          : isActive
          ? 'bg-forest-900 text-cream-50 border-gold-500/50 shadow-md'
          : 'bg-stone-100 dark:bg-forest-950/70 border-stone-200 dark:border-forest-800 text-stone-700 dark:text-stone-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isCompleted
              ? 'bg-forest-950 text-gold-400'
              : isActive
              ? 'bg-gold-500 text-forest-950 animate-spin-slow'
              : 'bg-stone-200 dark:bg-forest-900 text-stone-600 dark:text-stone-300'
          }`}
        >
          {isCompleted ? <Bell className="w-5 h-5" /> : <TimerIcon className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-xs font-semibold">{stepTitle}</p>
          <p className="text-lg font-mono font-bold tracking-wider">{formattedTime}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTimer}
          className={`p-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-sm ${
            isCompleted
              ? 'bg-forest-950 text-cream-50'
              : isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-forest-950'
              : 'bg-gold-500 hover:bg-gold-600 text-forest-950'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-stone-200 dark:bg-forest-900 hover:bg-stone-300 dark:hover:bg-forest-800 text-stone-700 dark:text-stone-300 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default KitchenTimer;
