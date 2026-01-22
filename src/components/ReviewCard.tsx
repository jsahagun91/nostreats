import { formatDistanceToNow } from 'date-fns';
import { Zap, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars } from '@/components/RatingStars';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import type { Review } from '@/lib/nostreats';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  featured?: boolean;
  className?: string;
}

export function ReviewCard({ review, featured = false, className }: ReviewCardProps) {
  const { data: author, isLoading: authorLoading } = useAuthor(review.pubkey);
  
  const displayName = author?.metadata?.name || genUserName(review.pubkey);
  const profileImage = author?.metadata?.picture;
  const timeAgo = formatDistanceToNow(new Date(review.createdAt * 1000), { addSuffix: true });

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all',
      featured && 'ring-2 ring-amber-400/50 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10',
      className
    )}>
      {featured && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-medium py-1 px-3 flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-current" />
          Featured 5-Star Review
        </div>
      )}
      
      <CardContent className={cn('p-4', featured && 'pt-10')}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {authorLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {authorLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-medium truncate">{displayName}</span>
                )}
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
              </div>
              
              {/* Zap amount badge */}
              <Badge 
                variant="secondary" 
                className="shrink-0 gap-1 bg-lightning/10 text-amber-700 dark:text-amber-400 border-lightning/20"
              >
                <Zap className="h-3 w-3 fill-current" />
                {review.zapAmount}
              </Badge>
            </div>

            {/* Rating */}
            <RatingStars rating={review.rating} size="sm" className="mb-2" />

            {/* Review content */}
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {review.content}
            </p>

            {/* Update indicator */}
            {review.supersedesId && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Updated review
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for review cards
export function ReviewCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Reviews list component
interface ReviewsListProps {
  reviews: Review[];
  featuredReview?: Review | null;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReviewsList({
  reviews,
  featuredReview,
  isLoading,
  emptyMessage = 'No reviews yet. Be the first to share your experience!',
}: ReviewsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out the featured review from the main list to avoid duplication
  const regularReviews = featuredReview
    ? reviews.filter((r) => r.id !== featuredReview.id)
    : reviews;

  return (
    <div className="space-y-4">
      {/* Featured review at top */}
      {featuredReview && (
        <ReviewCard review={featuredReview} featured />
      )}

      {/* Regular reviews */}
      {regularReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
