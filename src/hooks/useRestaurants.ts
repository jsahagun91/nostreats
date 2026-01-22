import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import {
  NOSTREATS_KINDS,
  parseRestaurant,
  type Restaurant,
} from '@/lib/nostreats';

/**
 * Fetch all open restaurants for map display
 */
export function useRestaurants() {
  const { nostr } = useNostr();

  return useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      const events = await nostr.query(
        [
          {
            kinds: [NOSTREATS_KINDS.RESTAURANT_PROFILE],
            limit: 500,
          },
        ],
        { signal }
      );

      const restaurants: Restaurant[] = [];

      for (const event of events) {
        const restaurant = parseRestaurant(event);
        if (restaurant && restaurant.status === 'open') {
          restaurants.push(restaurant);
        }
      }

      // Sort by creation date descending
      return restaurants.sort((a, b) => b.createdAt - a.createdAt);
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Fetch a single restaurant by its pubkey and d-tag
 */
export function useRestaurant(pubkey: string | undefined, dTag: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<Restaurant | null>({
    queryKey: ['restaurant', pubkey, dTag],
    queryFn: async (c) => {
      if (!pubkey || !dTag) return null;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query(
        [
          {
            kinds: [NOSTREATS_KINDS.RESTAURANT_PROFILE],
            authors: [pubkey],
            '#d': [dTag],
            limit: 1,
          },
        ],
        { signal }
      );

      if (events.length === 0) return null;

      return parseRestaurant(events[0]);
    },
    enabled: !!pubkey && !!dTag,
    staleTime: 30000,
  });
}

/**
 * Search restaurants by name or address
 */
export function useRestaurantSearch(query: string) {
  const { data: restaurants, ...rest } = useRestaurants();

  const filteredRestaurants = restaurants?.filter((r) => {
    const searchLower = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(searchLower) ||
      r.address?.toLowerCase().includes(searchLower) ||
      r.about?.toLowerCase().includes(searchLower)
    );
  });

  return {
    data: filteredRestaurants ?? [],
    ...rest,
  };
}

/**
 * Get restaurants near a location
 */
export function useNearbyRestaurants(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm: number = 10
) {
  const { data: restaurants, ...rest } = useRestaurants();

  const nearbyRestaurants = restaurants?.filter((r) => {
    if (lat === undefined || lng === undefined) return false;

    const distance = getDistanceKm(lat, lng, r.lat, r.lng);
    return distance <= radiusKm;
  });

  return {
    data: nearbyRestaurants ?? [],
    ...rest,
  };
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
