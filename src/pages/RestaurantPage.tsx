import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import {
  MapPin,
  Phone,
  Globe,
  ArrowLeft,
  Share2,
  ExternalLink,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RatingBadge } from '@/components/RatingStars';
import { ReviewsList } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { RestaurantMiniMap } from '@/components/RestaurantMap';
import { useRestaurant } from '@/hooks/useRestaurants';
import { useRestaurantReviews, useUserReview } from '@/hooks/useRestaurantReviews';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import type { Restaurant } from '@/lib/nostreats';

interface RestaurantPageProps {
  pubkey: string;
  identifier: string;
}

export function RestaurantPage({ pubkey, identifier }: RestaurantPageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(pubkey, identifier);
  const {
    latestReviews,
    featuredReview,
    averageRating,
    totalReviewCount,
    isLoading: reviewsLoading,
  } = useRestaurantReviews(restaurant);
  const existingReview = useUserReview(restaurant, user?.pubkey);

  // SEO
  useSeoMeta({
    title: restaurant ? `${restaurant.name} - NostrEats` : 'Restaurant - NostrEats',
    description: restaurant?.about || restaurant?.content || 'View reviews on NostrEats',
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant?.name,
          text: `Check out ${restaurant?.name} on NostrEats`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Restaurant link copied to clipboard.',
      });
    }
  };

  if (restaurantLoading) {
    return <RestaurantPageSkeleton />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8">
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Restaurant Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This restaurant doesn't exist or may have been removed.
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl flex items-center justify-between h-14 px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl py-6 px-4 space-y-6">
        {/* Restaurant Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
                {restaurant.status === 'closed' && (
                  <Badge variant="destructive">Permanently Closed</Badge>
                )}
                {!restaurant.claimed && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Unclaimed
                  </Badge>
                )}
              </div>
              
              <RatingBadge
                rating={averageRating}
                count={totalReviewCount}
                size="md"
              />
            </div>
          </div>

          {(restaurant.about || restaurant.content) && (
            <p className="text-muted-foreground leading-relaxed">
              {restaurant.about || restaurant.content}
            </p>
          )}
        </div>

        {/* Quick Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {restaurant.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{restaurant.address}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Directions
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {restaurant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`tel:${restaurant.phone}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {restaurant.phone}
                </a>
              </div>
            )}

            {restaurant.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary transition-colors truncate"
                >
                  {restaurant.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3 ml-1 inline" />
                </a>
              </div>
            )}

            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 shrink-0" />
              <span className="text-sm">
                Added {new Date(restaurant.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mini Map */}
        <RestaurantMiniMap
          lat={restaurant.lat}
          lng={restaurant.lng}
          name={restaurant.name}
          className="h-[200px]"
        />

        <Separator />

        {/* Write/Update Review Section */}
        <Collapsible open={showReviewForm} onOpenChange={setShowReviewForm}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {existingReview ? 'Update Your Review' : 'Write a Review'}
                  </CardTitle>
                  {showReviewForm ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <ReviewForm
                  restaurant={restaurant}
                  existingReview={existingReview}
                  onSuccess={() => setShowReviewForm(false)}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reviews</h2>
            <span className="text-sm text-muted-foreground">
              {totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <ReviewsList
            reviews={latestReviews}
            featuredReview={featuredReview}
            isLoading={reviewsLoading}
          />
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-sm text-muted-foreground">
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shakespeare
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function RestaurantPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl flex items-center justify-between h-14 px-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </header>

      <main className="container max-w-4xl py-6 px-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-56" />
          </CardContent>
        </Card>

        <Skeleton className="h-[200px] w-full rounded-lg" />

        <Separator />

        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default RestaurantPage;
