import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// Organization schema for NostrEats
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NostrEats',
  description: 'Zap-powered restaurant review platform built on Nostr',
  url: 'https://nostreats.app',
  logo: 'https://nostreats.app/favicon.svg',
  sameAs: [
    'https://github.com/jsahagun91/nostreats',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Creator',
    url: 'https://primal.net/p/nprofile1qqsw7q2lh7j40c4rhdffu862f7uwhn3lak8dsr8ve2m0pa2wa202zscmyl6uh',
  },
};

// WebApplication schema
export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NostrEats',
  description: 'Discover restaurants with authentic, zap-verified reviews on Nostr',
  url: 'https://nostreats.app',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Zap-gated restaurant reviews',
    'Bitcoin Lightning payments',
    'Decentralized identity with Nostr',
    'Immutable review history',
    'Interactive restaurant map',
  ],
};

// Restaurant schema generator
export function createRestaurantSchema(restaurant: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: restaurant.address,
        }
      : undefined,
    telephone: restaurant.phone,
    url: restaurant.website,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: restaurant.lat,
      longitude: restaurant.lng,
    },
    aggregateRating: restaurant.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: restaurant.rating,
          reviewCount: restaurant.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

// Review schema generator
export function createReviewSchema(review: {
  restaurantName: string;
  authorName: string;
  rating: number;
  content: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Restaurant',
      name: review.restaurantName,
    },
    author: {
      '@type': 'Person',
      name: review.authorName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.content,
    datePublished: review.datePublished,
  };
}
