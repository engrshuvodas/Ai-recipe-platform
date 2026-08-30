import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';

export const scaleQuantity = (originalQuantityStr, scaleRatio) => {
  if (!originalQuantityStr || scaleRatio === 1) return originalQuantityStr;

  // Handle common fractional strings like "1/2", "1/4", "3/4", "1 1/2"
  const parseFraction = (str) => {
    str = str.trim();
    if (str.includes('/')) {
      const parts = str.split(' ');
      if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const [num, den] = parts[1].split('/').map(Number);
        return whole + num / den;
      } else {
        const [num, den] = str.split('/').map(Number);
        return num / den;
      }
    }
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  const parsed = parseFraction(originalQuantityStr);
  if (parsed === null) return originalQuantityStr; // e.g. "to taste"

  const scaled = parsed * scaleRatio;

  // Format cleanly
  if (scaled % 1 === 0) {
    return scaled.toString();
  }
  // Convert near simple fractions
  const fractionMap = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.66: '2/3',
    0.75: '3/4',
  };

  const whole = Math.floor(scaled);
  const decimal = Number((scaled - whole).toFixed(2));

  for (const [dec, frac] of Object.entries(fractionMap)) {
    if (Math.abs(decimal - parseFloat(dec)) <= 0.05) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }

  return scaled.toFixed(1).replace(/\.0$/, '');
};

const ServingScaler = ({ currentServings, originalServings, onServingsChange }) => {
  const handleDecrement = () => {
    if (currentServings > 1) {
      onServingsChange(currentServings - 1);
    }
  };

  const handleIncrement = () => {
    if (currentServings < 24) {
      onServingsChange(currentServings + 1);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-stone-100 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-stone-800 dark:text-stone-200">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
        <Users className="w-4 h-4 text-gold-500" />
        <span>Servings:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={currentServings <= 1}
          className="w-7 h-7 rounded-xl bg-white dark:bg-forest-900 border border-stone-200 dark:border-forest-800 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-gold-500 hover:text-forest-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="font-bold text-sm min-w-[20px] text-center font-mono">
          {currentServings}
        </span>

        <button
          onClick={handleIncrement}
          disabled={currentServings >= 24}
          className="w-7 h-7 rounded-xl bg-white dark:bg-forest-900 border border-stone-200 dark:border-forest-800 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-gold-500 hover:text-forest-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {currentServings !== originalServings && (
        <button
          onClick={() => onServingsChange(originalServings)}
          className="text-[10px] uppercase font-bold text-gold-600 dark:text-gold-400 hover:underline"
        >
          Reset ({originalServings})
        </button>
      )}
    </div>
  );
};

export default ServingScaler;
