import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, maxStars = 5, size = 'sm', interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentScore = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentScore;
        const isHalf = !isFilled && starValue - 0.5 <= currentScore;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform focus:outline-none`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'fill-stone-200 dark:fill-forest-900 text-stone-300 dark:text-forest-800'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
