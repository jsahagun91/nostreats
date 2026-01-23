# NostrEats Platform Setup

## Platform Pubkey Configuration

The NostrEats platform pubkey is configured to receive all review zaps:

**npub**: `npub1d9r528nf3qus8jnp2ml2feyxxweh3dywa6mrnqjmkusn7kz2qves9zghv5`  
**hex**: `6f47d5a8d9a81c0780f455a93249b3775dc6ed6db9b61c33a652737655051459`

## ⚡ CRITICAL: Lightning Address Setup

For review zaps to work, **you MUST configure a Lightning address** on your Nostr profile (kind 0 metadata event).

### Required Fields in Your Profile

Your Nostr profile metadata must include ONE of:

- `lud16` - Email-style Lightning address (recommended)
  - Example: `"lud16": "supereagle3@primal.net"`
  
- `lud06` - LNURL Lightning address
  - Example: `"lud06": "LNURL1..."`

### How to Add Lightning Address

1. **Option A: Edit Profile in NostrEats**
   - Log in to NostrEats with the platform account (npub1d9r528...)
   - Click your profile/account menu
   - Add your Lightning address (e.g., `supereagle3@primal.net`)
   - Save changes

2. **Option B: Edit Profile in Any Nostr Client**
   - Use Primal, Damus, Amethyst, Nostur, or any Nostr client
   - Edit your profile metadata
   - Add your Lightning address to the `lud16` field
   - Publish the profile update

3. **Option C: Use NIP-05 Verification**
   - Many NIP-05 verification services also provide Lightning addresses
   - Your current NIP-05 (`jos3@viva-bitcoin.com`) may already include one

### Verify Your Setup

Once configured, verify your Lightning address is working:

1. Go to any Nostr client
2. View your profile (npub1d9r528...)
3. Check if the Lightning icon/zap button appears
4. Test sending a small zap to yourself

### Current Lightning Address

Based on your main profile (npub1auq4l0a9...), you use:
- `supereagle3@primal.net`

**Make sure this same Lightning address is also set on the NostrEats platform pubkey (npub1d9r528...).**

## How Review Zaps Work

When a user submits a review:

1. User writes review and selects 86 or 420 sats
2. Review event is created with `platform` tag pointing to your pubkey
3. **User must manually zap the NostrEats platform pubkey** (this is the current implementation)
4. System validates the zap receipt matches:
   - Recipient = NostrEats platform pubkey
   - Amount = 86 or 420 sats
   - References the review or restaurant
5. Only reviews with valid zap receipts are displayed

## Future Enhancement: Automatic Zap Flow

Currently, users must manually send the zap after publishing a review. To make this automatic:

1. The review form should integrate the zap flow directly
2. Instead of zapping the restaurant/review, zap to the platform pubkey
3. Create the review event AFTER the zap is confirmed
4. Include the zap receipt reference in the review event

This would require modifying `ReviewForm.tsx` to use the zap flow similar to `ZapDialog.tsx`.

## Testing

To test the complete flow:

1. Ensure platform pubkey (npub1d9r528...) has Lightning address set
2. Log in as a different user
3. Add a restaurant
4. Write a review
5. Complete the zap payment (86 or 420 sats)
6. Verify the review appears on the restaurant page

All zaps should arrive at the Lightning address configured on npub1d9r528...
