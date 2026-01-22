import { useState, useEffect } from 'react';
import { useSeoMeta } from '@unhead/react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  X,
  Store,
  Star,
  Lock,
  BarChart3,
  Utensils,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    title: 'NostrEats',
    subtitle: 'Authentic Restaurant Reviews, Powered by Bitcoin',
    icon: Utensils,
    content: (
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Utensils className="h-16 w-16 text-white" />
          </div>
        </div>
        <p className="text-xl text-muted-foreground">
          The future of restaurant reviews is here.
          <br />
          No ads. No manipulation. Just honest feedback backed by sats.
        </p>
      </div>
    ),
  },
  {
    title: 'The Problem',
    subtitle: 'Traditional Review Platforms Are Broken',
    icon: X,
    content: (
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              Fake Reviews
            </h3>
            <p className="text-sm text-muted-foreground">
              Competitors and bots flood platforms with fake reviews, making it impossible to trust ratings.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              Pay-to-Win
            </h3>
            <p className="text-sm text-muted-foreground">
              Restaurants can manipulate rankings by paying platforms or running ads.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              Review Extortion
            </h3>
            <p className="text-sm text-muted-foreground">
              Platforms can remove negative reviews for a fee or pressure restaurants to advertise.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              Data Ownership
            </h3>
            <p className="text-sm text-muted-foreground">
              Your reviews and identity are owned by the platform, not you.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'The Solution',
    subtitle: 'Zap-Gated Reviews on Nostr',
    icon: Zap,
    content: (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Every Review Costs Sats</h3>
              <p className="text-muted-foreground">
                86 or 420 sats per review. Spam becomes expensive. Real customers share their experience.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Immutable & Transparent</h3>
              <p className="text-muted-foreground">
                Reviews can't be deleted or edited. Updates require a new zap. Everything is auditable on Nostr.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">You Own Your Identity</h3>
              <p className="text-muted-foreground">
                Your Nostr keys, your data. No platform can censor you or sell your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'For Restaurants',
    subtitle: 'Build Trust, Attract Customers',
    icon: Store,
    content: (
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="p-6 rounded-xl bg-card border">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Verified Reviews Only</h3>
          <p className="text-sm text-muted-foreground">
            Every review is backed by a Lightning payment. No bots, no fake accounts.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Own Your Listing</h3>
          <p className="text-sm text-muted-foreground">
            Claim your restaurant, update details anytime. No monthly fees or subscriptions.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Fair Competition</h3>
          <p className="text-sm text-muted-foreground">
            No pay-to-rank. Your quality speaks for itself through authentic customer feedback.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border md:col-span-3 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Featured Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  We randomly highlight 5-star reviews on your page. Great service gets noticed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'For Customers',
    subtitle: 'Trust What You Read',
    icon: Users,
    content: (
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-card border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Real People, Real Money</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Every reviewer paid sats to share their opinion. Skin in the game means honest feedback.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Latest First</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              We show the most recent review from each person. See current quality, not outdated opinions.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-card border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Support Quality</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your zaps fund the platform and verify reviews. No ads, no data selling.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Your Keys, Your Reviews</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Control your identity with Nostr. Your reviews are yours, portable across clients.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'How It Works',
    subtitle: 'Simple for Everyone',
    icon: CheckCircle,
    content: (
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 md:left-1/2" />

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative flex items-start gap-6 md:gap-12">
              <div className="relative z-10 h-16 w-16 rounded-full bg-primary flex items-center justify-center shrink-0 md:ml-auto">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-xl mb-2">Restaurant Adds Profile</h3>
                <p className="text-muted-foreground">
                  Restaurant owner or community member creates a listing with location, photos, and details.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-6 md:gap-12 md:flex-row-reverse">
              <div className="relative z-10 h-16 w-16 rounded-full bg-primary flex items-center justify-center shrink-0 md:mr-auto">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <div className="flex-1 pt-2 md:text-right">
                <h3 className="font-semibold text-xl mb-2">Customer Visits & Reviews</h3>
                <p className="text-muted-foreground">
                  After dining, customer writes a review, selects 1-5 stars, and zaps 86 or 420 sats.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-6 md:gap-12">
              <div className="relative z-10 h-16 w-16 rounded-full bg-primary flex items-center justify-center shrink-0 md:ml-auto">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-xl mb-2">Review Goes Live</h3>
                <p className="text-muted-foreground">
                  Review is published to Nostr, verified by zap receipt. Latest reviews appear first.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start gap-6 md:gap-12 md:flex-row-reverse">
              <div className="relative z-10 h-16 w-16 rounded-full bg-primary flex items-center justify-center shrink-0 md:mr-auto">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <div className="flex-1 pt-2 md:text-right">
                <h3 className="font-semibold text-xl mb-2">Trust Grows</h3>
                <p className="text-muted-foreground">
                  Great restaurants get authentic positive reviews. Quality speaks for itself.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Join NostrEats',
    subtitle: 'Be Part of the Future',
    icon: TrendingUp,
    content: (
      <div className="space-y-8 max-w-3xl mx-auto text-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Ready to Get Started?</h3>
          <p className="text-lg text-muted-foreground">
            Whether you're a restaurant owner or a food lover, NostrEats is built for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <Store className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold text-xl mb-3">Restaurant Owners</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Claim your listing, build trust with verified reviews, and connect with real customers.
            </p>
            <Button size="lg" className="w-full" asChild>
              <a href="/add">Add Your Restaurant</a>
            </Button>
          </div>

          <div className="p-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold text-xl mb-3">Food Lovers</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Discover great restaurants, leave honest reviews, and help build a trusted community.
            </p>
            <Button size="lg" className="w-full" asChild>
              <a href="/">Explore Restaurants</a>
            </Button>
          </div>
        </div>

        <div className="pt-8 border-t">
          <p className="text-muted-foreground text-sm">
            Built on Nostr. Powered by Lightning. Trusted by the community.
          </p>
        </div>
      </div>
    ),
  },
];

export function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useSeoMeta({
    title: 'NostrEats Presentation',
    description: 'Learn about NostrEats - authentic restaurant reviews powered by Bitcoin',
  });

  const goNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-6xl space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                {slide.subtitle}
              </p>
            </div>

            {/* Slide content */}
            <div className="animate-in fade-in duration-500">
              {slide.content}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t bg-muted/30 backdrop-blur">
          <div className="container max-w-6xl px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Previous button */}
              <Button
                variant="outline"
                size="lg"
                onClick={goPrev}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Slide indicators */}
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      index === currentSlide
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next button */}
              <Button
                size="lg"
                onClick={goNext}
                className="gap-2"
              >
                {currentSlide === slides.length - 1 ? 'Start Over' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Slide counter */}
            <div className="text-center mt-4">
              <span className="text-sm text-muted-foreground">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard navigation hint */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur px-3 py-2 rounded-lg border hidden md:block">
        Use ← → arrow keys to navigate
      </div>

      {/* Keyboard navigation */}
      <div className="sr-only">
        <button onClick={goPrev}>Previous slide</button>
        <button onClick={goNext}>Next slide</button>
      </div>
    </div>
  );
}

export default PresentationPage;
