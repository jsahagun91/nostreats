import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { nip19 } from 'nostr-tools';
import { StructuredData, organizationSchema, webApplicationSchema } from '@/components/StructuredData';
import {
  Zap,
  MapPin,
  Star,
  Search,
  Plus,
  Utensils,
  Shield,
  Users,
  Wallet,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RestaurantMap } from '@/components/RestaurantMap';
import { RatingBadge } from '@/components/RatingStars';
import { LoginArea } from '@/components/auth/LoginArea';
import { WalletModal } from '@/components/WalletModal';
import { useRestaurants, useRestaurantSearch } from '@/hooks/useRestaurants';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Restaurant } from '@/lib/nostreats';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: allRestaurants, isLoading } = useRestaurants();
  const { data: searchResults } = useRestaurantSearch(searchQuery);

  // Use search results if searching, otherwise show all
  const displayRestaurants = searchQuery ? searchResults : allRestaurants;

  // Calculate map center based on restaurants
  const mapCenter = useMemo<[number, number]>(() => {
    if (!allRestaurants || allRestaurants.length === 0) {
      return [40.7128, -74.006]; // Default to NYC
    }
    const avgLat = allRestaurants.reduce((sum, r) => sum + r.lat, 0) / allRestaurants.length;
    const avgLng = allRestaurants.reduce((sum, r) => sum + r.lng, 0) / allRestaurants.length;
    return [avgLat, avgLng];
  }, [allRestaurants]);

  useSeoMeta({
    title: 'NostrEats - Zap-Powered Restaurant Reviews',
    description: 'Discover restaurants with authentic, zap-verified reviews. No ads, no fiat, just sats and honest opinions.',
  });

  const handleRestaurantClick = (restaurant: Restaurant) => {
    const naddr = nip19.naddrEncode({
      kind: 30023,
      pubkey: restaurant.pubkey,
      identifier: restaurant.id,
    });
    navigate(`/${naddr}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={webApplicationSchema} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-6xl flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Utensils className="h-7 w-7 text-primary" />
              <Zap className="h-3 w-3 text-lightning fill-lightning absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="text-xl font-bold">NostrEats</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search toggle for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Desktop search */}
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Wallet button for logged in users */}
            {user && (
              <WalletModal>
                <Button variant="outline" size="icon">
                  <Wallet className="h-4 w-4" />
                </Button>
              </WalletModal>
            )}

            {/* Login */}
            <LoginArea className="max-w-48" />
          </div>
        </div>

        {/* Mobile search bar */}
        {showSearch && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_50%)]" />
          
          <div className="container max-w-6xl px-4 py-16 md:py-24 relative">
            <div className="max-w-2xl space-y-6">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Zap className="h-3 w-3 fill-lightning text-lightning" />
                Zap-Powered Reviews
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Discover Restaurants.
                <br />
                <span className="text-primary">Pay with Sats.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                NostrEats is a zap-only restaurant review platform where reviews cost sats, 
                opinions are immutable, and trust is earned.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gap-2" onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <MapPin className="h-4 w-4" />
                  Explore Restaurants
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/add')}>
                  <Plus className="h-4 w-4" />
                  Add a Restaurant
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-6xl px-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Zap-Gated Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Every review requires 86 or 420 sats. Spam-resistant by design.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Immutable & Auditable</h3>
                  <p className="text-sm text-muted-foreground">
                    Reviews can't be edited or deleted. Updates require new zaps.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nostr Native</h3>
                  <p className="text-sm text-muted-foreground">
                    Your identity, your keys. No accounts, no KYC, no ads.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section id="map-section" className="py-12">
          <div className="container max-w-6xl px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Explore Restaurants</h2>
                <p className="text-muted-foreground">
                  {isLoading ? 'Loading...' : `${displayRestaurants?.length ?? 0} restaurants nearby`}
                </p>
              </div>
              
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear search
                  <X className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            <RestaurantMap
              restaurants={displayRestaurants ?? []}
              isLoading={isLoading}
              center={mapCenter}
              zoom={11}
              className="h-[500px] rounded-xl"
              onRestaurantClick={handleRestaurantClick}
            />
          </div>
        </section>

        {/* Restaurant List */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-6xl px-4">
            <h2 className="text-2xl font-bold mb-6">Recent Restaurants</h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayRestaurants && displayRestaurants.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayRestaurants.slice(0, 9).map((restaurant) => (
                  <RestaurantCard
                    key={`${restaurant.pubkey}-${restaurant.id}`}
                    restaurant={restaurant}
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Restaurants Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to add a restaurant to NostrEats!
                  </p>
                  <Button onClick={() => navigate('/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurant
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Share Your Experience?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the NostrEats community. Leave honest reviews backed by sats, 
              discover authentic recommendations, and support restaurant owners directly.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {!user && <LoginArea className="w-auto" />}
              <Button size="lg" variant={user ? 'default' : 'outline'} onClick={() => navigate('/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add a Restaurant
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <span className="font-semibold">NostrEats</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Zap-only reviews. No ads, no fiat, no KYC.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <p>
                Made with <span className="text-orange-500">🧡</span> by{' '}
                <a
                  href="https://primal.net/p/nprofile1qqsw7q2lh7j40c4rhdffu862f7uwhn3lak8dsr8ve2m0pa2wa202zscmyl6uh"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Jose
                </a>
              </p>
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <p>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Restaurant card component
interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
        </div>
        
        {restaurant.address && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
        )}
        
        {restaurant.about && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {restaurant.about}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-3">
          {!restaurant.claimed && (
            <Badge variant="outline" className="text-xs">Unclaimed</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Index;
