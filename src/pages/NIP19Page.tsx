import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';
import { RestaurantPage } from './RestaurantPage';
import { NOSTREATS_KINDS } from '@/lib/nostreats';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      // Profile view not implemented for NostrEats
      return <NotFound />;

    case 'note':
      // Note view not implemented for NostrEats
      return <NotFound />;

    case 'nevent':
      // Event view not implemented for NostrEats
      return <NotFound />;

    case 'naddr': {
      const { kind, pubkey, identifier: dTag } = decoded.data;
      
      // Handle restaurant profiles (kind 30023)
      if (kind === NOSTREATS_KINDS.RESTAURANT_PROFILE) {
        return <RestaurantPage pubkey={pubkey} identifier={dTag} />;
      }
      
      // Other addressable events not supported
      return <NotFound />;
    }

    default:
      return <NotFound />;
  }
} 