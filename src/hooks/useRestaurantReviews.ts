import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  NOSTREATS_KINDS,
  parseReview,
  getLatestReviewsPerUser,
  calculateAverageRating,
  getRandomFeaturedReview,
  validateReviewZap,
  type Review,
  type Restaurant,
} from '@/lib/nostreats';
import type { NostrEvent } from '@nostrify/nostrify';

interface UseRestaurantReviewsResult {
  reviews: Review[];
  latestReviews: Review[];
  featuredReview: Review | null;
  averageRating: number;
  totalReviewCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch and process reviews for a restaurant
 */
export function useRestaurantReviews(
  restaurant: Restaurant | null | undefined
): UseRestaurantReviewsResult {
  const { nostr } = useNostr();

  // Build the addressable event reference
  const restaurantRef = restaurant
    ? `${NOSTREATS_KINDS.RESTAURANT_PROFILE}:${restaurant.pubkey}:${restaurant.id}`
    : null;

  // Query for reviews and zap receipts in a single efficient query
  const { data, isLoading, isError, error } = useQuery<{
    reviews: NostrEvent[];
    zaps: NostrEvent[];
  }>({
    queryKey: ['restaurant-reviews', restaurantRef],
    queryFn: async (c) => {
      if (!restaurantRef) return { reviews: [], zaps: [] };

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      // Query reviews and zap receipts
      const [reviewEvents, zapEvents] = await Promise.all([
        nostr.query(
          [
            {
              kinds: [NOSTREATS_KINDS.REVIEW],
              '#a': [restaurantRef],
              limit: 200,
            },
          ],
          { signal }
        ),
        nostr.query(
          [
            {
              kinds: [NOSTREATS_KINDS.ZAP_RECEIPT],
              '#a': [restaurantRef],
              limit: 500,
            },
          ],
          { signal }
        ),
      ]);

      return { reviews: reviewEvents, zaps: zapEvents };
    },
    enabled: !!restaurantRef,
    staleTime: 30000,
  });

  // Process reviews with validation
  const processedData = useMemo(() => {
    if (!data) {
      return {
        reviews: [],
        latestReviews: [],
        featuredReview: null,
        averageRating: 0,
        totalReviewCount: 0,
      };
    }

    // Parse all review events
    const allReviews: Review[] = [];
    for (const event of data.reviews) {
      const review = parseReview(event);
      if (review) {
        // Validate the review has a zap
        review.isValidated = validateReviewZap(review, data.zaps);
        if (review.isValidated) {
          allReviews.push(review);
        }
      }
    }

    // Get latest review per user (handles supersession)
    const latestReviews = getLatestReviewsPerUser(allReviews);

    // Sort by creation date for display
    const sortedLatestReviews = [...latestReviews].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    // Calculate stats based on latest reviews only
    const averageRating = calculateAverageRating(latestReviews);
    const featuredReview = getRandomFeaturedReview(latestReviews);

    return {
      reviews: allReviews,
      latestReviews: sortedLatestReviews,
      featuredReview,
      averageRating,
      totalReviewCount: latestReviews.length,
    };
  }, [data]);

  return {
    ...processedData,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Get the user's existing review for a restaurant (if any)
 */
export function useUserReview(
  restaurant: Restaurant | null | undefined,
  userPubkey: string | undefined
) {
  const { reviews } = useRestaurantReviews(restaurant);

  return useMemo(() => {
    if (!userPubkey || reviews.length === 0) return null;

    // Find the user's latest review
    const userReviews = reviews.filter((r) => r.pubkey === userPubkey);
    if (userReviews.length === 0) return null;

    // Sort by date and return the latest
    return userReviews.sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [reviews, userPubkey]);
}
