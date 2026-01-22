import { useState } from 'react';
import { Zap, Sparkles, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RatingStars } from '@/components/RatingStars';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { LoginArea } from '@/components/auth/LoginArea';
import {
  NOSTREATS_KINDS,
  ALLOWED_ZAP_AMOUNTS,
  createReviewEventTags,
  type Restaurant,
  type Review,
  type AllowedZapAmount,
} from '@/lib/nostreats';

interface ReviewFormProps {
  restaurant: Restaurant;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

export function ReviewForm({ restaurant, existingReview, onSuccess }: ReviewFormProps) {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [content, setContent] = useState(existingReview?.content ?? '');
  const [zapAmount, setZapAmount] = useState<AllowedZapAmount>(
    existingReview?.zapAmount ?? 86
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUpdating = !!existingReview;
  const canSubmit = rating > 0 && content.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;

    setIsSubmitting(true);

    try {
      // Create the review event
      const tags = createReviewEventTags({
        restaurantPubkey: restaurant.pubkey,
        restaurantDTag: restaurant.id,
        rating,
        content: content.trim(),
        zapAmount,
        supersedesId: existingReview?.id,
      });

      // TODO: Integrate with actual zap payment flow
      // For now, we'll publish the review and show a message about zap requirement
      // In production, this should:
      // 1. Create the review event
      // 2. Initiate zap to NostrEats platform pubkey
      // 3. Only display review after zap is verified

      await publishEvent({
        kind: NOSTREATS_KINDS.REVIEW,
        content: content.trim(),
        tags,
      });

      toast({
        title: isUpdating ? 'Review updated!' : 'Review submitted!',
        description: `Your ${rating}-star review has been published. Zap payment of ${zapAmount} sats required for verification.`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['restaurant-reviews'],
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast({
        title: 'Failed to submit review',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <Zap className="h-12 w-12 mx-auto text-primary/60" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Login to Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign in with your Nostr account to leave a zap-powered review.
              </p>
            </div>
            <LoginArea className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {isUpdating ? (
            <>
              <Sparkles className="h-5 w-5 text-primary" />
              Update Your Review
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 text-primary" />
              Write a Review
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isUpdating
            ? 'Updating your review requires a new zap payment.'
            : 'Share your experience with a zap-powered review.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Update notice */}
        {isUpdating && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Updating your review requires a new zap and replaces your previous review.
              Your old review remains auditable but won't be displayed.
            </AlertDescription>
          </Alert>
        )}

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Your Rating</Label>
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          {rating === 0 && (
            <p className="text-sm text-muted-foreground">
              Tap to select a rating
            </p>
          )}
        </div>

        {/* Review content */}
        <div className="space-y-3">
          <Label htmlFor="review-content" className="text-base font-medium">
            Your Review
          </Label>
          <Textarea
            id="review-content"
            placeholder="Share your experience... What did you order? How was the service? Would you recommend it?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {content.length} characters
          </p>
        </div>

        {/* Zap amount selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Review Type</Label>
          <RadioGroup
            value={zapAmount.toString()}
            onValueChange={(v) => setZapAmount(parseInt(v) as AllowedZapAmount)}
            className="grid gap-3"
          >
            {ALLOWED_ZAP_AMOUNTS.map((amount) => (
              <label
                key={amount}
                htmlFor={`zap-${amount}`}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  zapAmount === amount
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={amount.toString()} id={`zap-${amount}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-lightning fill-lightning" />
                    <span className="font-semibold">{amount} sats</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {amount === 86 ? 'Quick review' : 'Detailed review'}
                  </p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Platform fee notice */}
        <Alert variant="default" className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Your zap goes to NostrEats platform to verify authentic reviews.
            Reviews are immutable and permanently recorded on Nostr.
          </AlertDescription>
        </Alert>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isPublishing}
          className="w-full"
          size="lg"
        >
          {isSubmitting || isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUpdating ? 'Updating Review...' : 'Submitting Review...'}
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              {isUpdating ? `Update Review (${zapAmount} sats)` : `Submit Review (${zapAmount} sats)`}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
