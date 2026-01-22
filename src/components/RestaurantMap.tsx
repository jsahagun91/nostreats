import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Restaurant } from '@/lib/nostreats';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom restaurant marker icon
const createRestaurantIcon = (rating?: number) => {
  const color = rating && rating >= 4 ? '#f97316' : rating && rating >= 3 ? '#fb923c' : '#fdba74';
  
  return L.divIcon({
    className: 'custom-restaurant-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        <span style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">&#127860;</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

interface RestaurantMapProps {
  restaurants: Restaurant[];
  ratings?: Map<string, number>;
  isLoading?: boolean;
  className?: string;
  onRestaurantClick?: (restaurant: Restaurant) => void;
  center?: [number, number];
  zoom?: number;
}

export function RestaurantMap({
  restaurants,
  ratings,
  isLoading,
  className = '',
  onRestaurantClick,
  center = [40.7128, -74.006], // Default to NYC
  zoom = 12,
}: RestaurantMapProps) {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const handleViewRestaurant = (restaurant: Restaurant) => {
    if (onRestaurantClick) {
      onRestaurantClick(restaurant);
    } else {
      const naddr = nip19.naddrEncode({
        kind: 30023,
        pubkey: restaurant.pubkey,
        identifier: restaurant.id,
      });
      navigate(`/${naddr}`);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Try to get user location
    map.locate({ setView: false, maxZoom: 16 });
    map.on('locationfound', (e) => {
      L.circleMarker(e.latlng, {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup('You are here');
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center and zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    restaurants.forEach((restaurant) => {
      const rating = ratings?.get(restaurant.id);
      const marker = L.marker([restaurant.lat, restaurant.lng], {
        icon: createRestaurantIcon(rating),
      });

      const popupContent = `
        <div style="min-width: 180px; font-family: inherit;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${restaurant.name}</h3>
          ${rating !== undefined ? `<div style="margin-bottom: 8px;">Rating: ${rating.toFixed(1)}/5</div>` : ''}
          ${restaurant.address ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${restaurant.address}</div>` : ''}
          ${restaurant.about ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${restaurant.about}</div>` : ''}
          <button 
            id="view-${restaurant.id}" 
            style="width: 100%; padding: 8px 12px; background: hsl(24, 95%, 53%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-${restaurant.id}`);
        if (btn) {
          btn.onclick = () => handleViewRestaurant(restaurant);
        }
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [restaurants, ratings, handleViewRestaurant]);

  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <Skeleton className="w-full h-full min-h-[400px]" />
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px]"
        style={{ background: '#f5f5f5' }}
      />
    </Card>
  );
}

// Mini map for restaurant detail pages
interface MiniMapProps {
  lat: number;
  lng: number;
  name: string;
  className?: string;
}

export function RestaurantMiniMap({ lat, lng, name, className = '' }: MiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([lat, lng], { icon: createRestaurantIcon() })
      .addTo(map)
      .bindPopup(name);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[200px]"
      />
    </Card>
  );
}
