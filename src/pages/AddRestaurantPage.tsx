import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { nip19 } from 'nostr-tools';
import {
  ArrowLeft,
  MapPin,
  Store,
  Phone,
  Globe,
  FileText,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import {
  NOSTREATS_KINDS,
  createRestaurantEventTags,
  generateRestaurantId,
  type CreateRestaurantInput,
} from '@/lib/nostreats';

export function AddRestaurantPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent, isPending } = useNostrPublish();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateRestaurantInput>({
    name: '',
    about: '',
    content: '',
    phone: '',
    website: '',
    address: '',
    lat: 0,
    lng: 0,
  });

  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [hasCoordinates, setHasCoordinates] = useState(false);

  useSeoMeta({
    title: 'Add Restaurant - NostrEats',
    description: 'Add a new restaurant to NostrEats',
  });

  const updateField = (field: keyof CreateRestaurantInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Geocode address using Nominatim
  const geocodeAddress = async () => {
    if (!formData.address) {
      toast({
        title: 'Address required',
        description: 'Please enter an address to geocode.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'NostrEats/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lon);

        setFormData((prev) => ({ ...prev, lat: parsedLat, lng: parsedLng }));
        setLatInput(parsedLat.toFixed(6));
        setLngInput(parsedLng.toFixed(6));
        setHasCoordinates(true);

        toast({
          title: 'Location found!',
          description: 'Coordinates have been set from the address.',
        });
      } else {
        toast({
          title: 'Location not found',
          description: 'Could not find coordinates for this address. Please enter them manually.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Geocoding failed',
        description: 'Please enter coordinates manually.',
        variant: 'destructive',
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLatChange = (value: string) => {
    setLatInput(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setFormData((prev) => ({ ...prev, lat: parsed }));
      setHasCoordinates(!!lngInput && !isNaN(parseFloat(lngInput)));
    }
  };

  const handleLngChange = (value: string) => {
    setLngInput(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setFormData((prev) => ({ ...prev, lng: parsed }));
      setHasCoordinates(!!latInput && !isNaN(parseFloat(latInput)));
    }
  };

  const canSubmit = formData.name.trim() && hasCoordinates && !isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;

    try {
      const dTag = generateRestaurantId(formData.name);
      const tags = createRestaurantEventTags(formData, dTag, true); // Claimed by creator

      const event = await publishEvent({
        kind: NOSTREATS_KINDS.RESTAURANT_PROFILE,
        content: formData.content || formData.about || '',
        tags,
      });

      toast({
        title: 'Restaurant added!',
        description: `${formData.name} has been added to NostrEats.`,
      });

      // Navigate to the new restaurant page
      const naddr = nip19.naddrEncode({
        kind: NOSTREATS_KINDS.RESTAURANT_PROFILE,
        pubkey: event.pubkey,
        identifier: dTag,
      });
      navigate(`/${naddr}`);
    } catch (error) {
      console.error('Failed to add restaurant:', error);
      toast({
        title: 'Failed to add restaurant',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-2xl flex items-center h-14 px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container max-w-2xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Add a Restaurant</h1>
          <p className="text-muted-foreground">
            Add a new restaurant to NostrEats. You'll own this listing and can update it anytime.
          </p>
        </div>

        {!user ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Login Required</h3>
              <p className="text-muted-foreground mb-6">
                Sign in with your Nostr account to add a restaurant.
              </p>
              <LoginArea className="w-full max-w-xs mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the restaurant's basic details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Taqueria El Fuego"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">Short Description</Label>
                  <Input
                    id="about"
                    placeholder="e.g., Family-owned taqueria serving handmade tortillas"
                    value={formData.about}
                    onChange={(e) => updateField('about', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Detailed Description</Label>
                  <Textarea
                    id="content"
                    placeholder="Tell people more about this restaurant..."
                    value={formData.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Enter the address and coordinates. You can geocode from the address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={geocodeAddress}
                      disabled={isGeocoding || !formData.address}
                    >
                      {isGeocoding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Geocode'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude *</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="e.g., 38.1074"
                      value={latInput}
                      onChange={(e) => handleLatChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude *</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      placeholder="e.g., -122.5697"
                      value={lngInput}
                      onChange={(e) => handleLngChange(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {hasCoordinates && (
                  <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Coordinates set: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Optional contact details for the restaurant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1-415-555-1234"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!canSubmit}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Restaurant...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  Add Restaurant
                </>
              )}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}

export default AddRestaurantPage;
