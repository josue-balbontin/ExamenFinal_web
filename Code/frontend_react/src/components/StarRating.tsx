import React, { useState } from 'react';

export interface StarRatingProps {
  value: number;
  interactive?: boolean;
  size?: 'sm' | 'md';
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  interactive = false,
  size = 'md',
  onChange,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div
      className={`star-rating star-rating--${size}${interactive ? ' star-rating--interactive' : ''}`}
      aria-label={`Calificación: ${value} de 5`}
      role={interactive ? 'group' : undefined}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const isFilled = i <= displayValue;
        const className = `star-rating__star${isFilled ? ' star-rating__star--filled' : ''}`;
        
        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              className={className}
              aria-hidden="false"
              aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
              onMouseEnter={() => setHoverValue(i)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={() => onChange?.(i)}
            >
              ★
            </button>
          );
        }

        return (
          <span key={i} className={className} aria-hidden="true">
            ★
          </span>
        );
      })}
    </div>
  );
};
