import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const handleClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starRating: number) => {
    if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(starRating);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starRating = i + 1;
        const isFilled = starRating <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starRating)}
            onKeyDown={(e) => handleKeyDown(e, starRating)}
            className={cn(
              'focus:outline-none transition-transform',
              interactive && 'cursor-pointer hover:scale-110 focus:scale-110',
              !interactive && 'cursor-default'
            )}
            tabIndex={interactive ? 0 : -1}
            aria-label={`${starRating} star${starRating > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-muted-foreground/30'
              )}
            />
          </button>
        );
      })}
      
      {showValue && (
        <span className={cn('ml-1.5 font-medium text-foreground', textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Compact rating display with count
interface RatingBadgeProps {
  rating: number;
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function RatingBadge({ rating, count, size = 'md', className }: RatingBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Star
        className={cn(
          'fill-amber-400 text-amber-400',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
        )}
      />
      <span className={cn('font-semibold', size === 'sm' ? 'text-sm' : 'text-base')}>
        {rating > 0 ? rating.toFixed(1) : '-'}
      </span>
      <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
        ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
