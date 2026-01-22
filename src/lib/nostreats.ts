import type { NostrEvent } from '@nostrify/nostrify';

// ============================================
// NostrEats Platform Configuration
// ============================================

// Platform pubkey - receives all review zaps
// This should be replaced with the actual NostrEats platform pubkey
export const NOSTREATS_PUBKEY = 'nostreats_platform_pubkey_placeholder';

// Allowed zap amounts in sats
export const ALLOWED_ZAP_AMOUNTS = [86, 420] as const;
export type AllowedZapAmount = typeof ALLOWED_ZAP_AMOUNTS[number];

// Event kinds
export const NOSTREATS_KINDS = {
  RESTAURANT_PROFILE: 30023,
  REVIEW: 30024,
  COMMUNITY_SIGNAL: 30025,
  OWNERSHIP_TRANSFER: 30026,
  PLATFORM_POLICY: 30078,
  ZAP_RECEIPT: 9735,
} as const;

// Restaurant status values
export type RestaurantStatus = 'open' | 'closed' | 'inactive';

// ============================================
// Types
// ============================================

export interface Restaurant {
  id: string;
  pubkey: string;
  name: string;
  about?: string;
  content: string;
  phone?: string;
  website?: string;
  address?: string;
  lat: number;
  lng: number;
  status: RestaurantStatus;
  claimed: boolean;
  createdAt: number;
  event: NostrEvent;
}

export interface Review {
  id: string;
  pubkey: string;
  content: string;
  rating: number;
  zapAmount: AllowedZapAmount;
  restaurantRef: string;
  supersedesId?: string;
  createdAt: number;
  event: NostrEvent;
  isValidated: boolean;
}

export interface ReviewWithAuthor extends Review {
  authorName?: string;
  authorPicture?: string;
}

// ============================================
// Parsing Functions
// ============================================

export function parseRestaurant(event: NostrEvent): Restaurant | null {
  if (event.kind !== NOSTREATS_KINDS.RESTAURANT_PROFILE) {
    return null;
  }

  const getTag = (name: string): string | undefined => {
    return event.tags.find(([t]) => t === name)?.[1];
  };

  const name = getTag('name');
  const lat = getTag('lat');
  const lng = getTag('lng');
  const status = getTag('status') as RestaurantStatus | undefined;
  const d = getTag('d');

  // Required fields
  if (!name || !lat || !lng || !d) {
    return null;
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return null;
  }

  return {
    id: d,
    pubkey: event.pubkey,
    name,
    about: getTag('about'),
    content: event.content,
    phone: getTag('phone'),
    website: getTag('website'),
    address: getTag('address'),
    lat: parsedLat,
    lng: parsedLng,
    status: status || 'open',
    claimed: getTag('claimed') === 'true',
    createdAt: event.created_at,
    event,
  };
}

export function parseReview(event: NostrEvent): Review | null {
  if (event.kind !== NOSTREATS_KINDS.REVIEW) {
    return null;
  }

  const getTag = (name: string): string | undefined => {
    return event.tags.find(([t]) => t === name)?.[1];
  };

  const restaurantRef = getTag('a');
  const rating = getTag('rating');
  const zapAmount = getTag('zap_amount');

  // Required fields
  if (!restaurantRef || !rating || !zapAmount) {
    return null;
  }

  const parsedRating = parseInt(rating, 10);
  const parsedZapAmount = parseInt(zapAmount, 10);

  // Validate rating range
  if (parsedRating < 1 || parsedRating > 5) {
    return null;
  }

  // Validate zap amount
  if (!ALLOWED_ZAP_AMOUNTS.includes(parsedZapAmount as AllowedZapAmount)) {
    return null;
  }

  return {
    id: event.id,
    pubkey: event.pubkey,
    content: event.content,
    rating: parsedRating,
    zapAmount: parsedZapAmount as AllowedZapAmount,
    restaurantRef,
    supersedesId: getTag('supersedes'),
    createdAt: event.created_at,
    event,
    isValidated: false, // Will be set after zap verification
  };
}

// ============================================
// Validation Functions
// ============================================

/**
 * Check if a review has a valid zap receipt.
 * A review is valid if:
 * 1. A zap receipt exists for the review or restaurant
 * 2. The zap recipient is the NostrEats platform pubkey
 * 3. The zap amount matches 86 or 420 sats
 */
export function validateReviewZap(
  review: Review,
  zapReceipts: NostrEvent[]
): boolean {
  // Find zap receipts that reference this review or the restaurant
  const relevantZaps = zapReceipts.filter((zap) => {
    const eTag = zap.tags.find(([t]) => t === 'e')?.[1];
    const aTag = zap.tags.find(([t]) => t === 'a')?.[1];
    const pTag = zap.tags.find(([t]) => t === 'p')?.[1];

    // Zap must be to platform pubkey
    if (pTag !== NOSTREATS_PUBKEY) {
      return false;
    }

    // Zap references the review event directly
    if (eTag === review.id) {
      return true;
    }

    // Zap references the restaurant
    if (aTag === review.restaurantRef) {
      return true;
    }

    return false;
  });

  if (relevantZaps.length === 0) {
    return false;
  }

  // Check if any zap has the correct amount
  for (const zap of relevantZaps) {
    const amount = extractZapAmount(zap);
    if (amount && ALLOWED_ZAP_AMOUNTS.includes(amount as AllowedZapAmount)) {
      return true;
    }
  }

  return false;
}

/**
 * Extract zap amount from a zap receipt event
 */
export function extractZapAmount(zapEvent: NostrEvent): number | null {
  // Try amount tag first
  const amountTag = zapEvent.tags.find(([t]) => t === 'amount')?.[1];
  if (amountTag) {
    const millisats = parseInt(amountTag, 10);
    if (!isNaN(millisats)) {
      return Math.floor(millisats / 1000);
    }
  }

  // Try to parse from description (zap request)
  const descriptionTag = zapEvent.tags.find(([t]) => t === 'description')?.[1];
  if (descriptionTag) {
    try {
      const zapRequest = JSON.parse(descriptionTag);
      const requestAmountTag = zapRequest.tags?.find(
        ([name]: string[]) => name === 'amount'
      )?.[1];
      if (requestAmountTag) {
        const millisats = parseInt(requestAmountTag, 10);
        if (!isNaN(millisats)) {
          return Math.floor(millisats / 1000);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
}

/**
 * Get the latest review per user for a restaurant.
 * Handles supersession logic.
 */
export function getLatestReviewsPerUser(reviews: Review[]): Review[] {
  const latestByUser = new Map<string, Review>();

  // Sort by created_at descending to process newest first
  const sortedReviews = [...reviews].sort((a, b) => b.createdAt - a.createdAt);

  for (const review of sortedReviews) {
    if (!latestByUser.has(review.pubkey)) {
      latestByUser.set(review.pubkey, review);
    }
  }

  return Array.from(latestByUser.values());
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get a random 5-star review for featured display
 */
export function getRandomFeaturedReview(reviews: Review[]): Review | null {
  const fiveStarReviews = reviews.filter((r) => r.rating === 5);
  if (fiveStarReviews.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * fiveStarReviews.length);
  return fiveStarReviews[randomIndex];
}

// ============================================
// Event Creation Helpers
// ============================================

export interface CreateRestaurantInput {
  name: string;
  about?: string;
  content?: string;
  phone?: string;
  website?: string;
  address?: string;
  lat: number;
  lng: number;
}

export function createRestaurantEventTags(
  input: CreateRestaurantInput,
  dTag: string,
  claimed: boolean = false
): string[][] {
  const tags: string[][] = [
    ['d', dTag],
    ['name', input.name],
    ['lat', input.lat.toString()],
    ['lng', input.lng.toString()],
    ['status', 'open'],
    ['claimed', claimed.toString()],
    ['alt', `Restaurant profile: ${input.name}`],
  ];

  if (input.about) tags.push(['about', input.about]);
  if (input.phone) tags.push(['phone', input.phone]);
  if (input.website) tags.push(['website', input.website]);
  if (input.address) tags.push(['address', input.address]);

  return tags;
}

export interface CreateReviewInput {
  restaurantPubkey: string;
  restaurantDTag: string;
  rating: number;
  content: string;
  zapAmount: AllowedZapAmount;
  supersedesId?: string;
}

export function createReviewEventTags(input: CreateReviewInput): string[][] {
  const restaurantRef = `${NOSTREATS_KINDS.RESTAURANT_PROFILE}:${input.restaurantPubkey}:${input.restaurantDTag}`;

  const tags: string[][] = [
    ['a', restaurantRef],
    ['rating', input.rating.toString()],
    ['zap_amount', input.zapAmount.toString()],
    ['platform', NOSTREATS_PUBKEY],
    ['alt', `NostrEats restaurant review (${input.rating}/5 stars)`],
  ];

  if (input.supersedesId) {
    tags.push(['supersedes', input.supersedesId]);
  }

  return tags;
}

/**
 * Generate a unique identifier for a restaurant
 */
export function generateRestaurantId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);

  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}
