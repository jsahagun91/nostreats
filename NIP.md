# NostrEats Protocol Specification

NostrEats is a zap-only, Nostr-native restaurant discovery and review platform.

## Event Kinds

| Kind  | Purpose                   | Mutability  |
|-------|---------------------------|-------------|
| 30023 | Restaurant profile        | Replaceable |
| 30024 | Review                    | Immutable   |
| 30025 | Community signal          | Immutable   |
| 30026 | Ownership transfer notice | Immutable   |
| 30078 | Platform policy           | Replaceable |

## Restaurant Profile (kind: 30023)

Replaceable event containing restaurant information.

```json
{
  "kind": 30023,
  "pubkey": "<restaurant_pubkey>",
  "content": "Description of the restaurant.",
  "tags": [
    ["d", "<unique_identifier>"],
    ["name", "Restaurant Name"],
    ["about", "Short description"],
    ["phone", "+1-415-555-1234"],
    ["website", "https://example.com"],
    ["address", "123 Main St, City, State"],
    ["lat", "38.1074"],
    ["lng", "-122.5697"],
    ["status", "open"],
    ["claimed", "false"]
  ]
}
```

### Required Tags
- `d`: Unique identifier for the restaurant
- `name`: Restaurant name
- `lat`: Latitude coordinate
- `lng`: Longitude coordinate
- `status`: One of `open`, `closed`, `inactive`

### Optional Tags
- `about`: Short description
- `phone`: Contact phone number
- `website`: Restaurant website URL
- `address`: Full address string
- `claimed`: `true` or `false` indicating if claimed by owner

## Review Event (kind: 30024)

Immutable, zap-gated review event.

```json
{
  "kind": 30024,
  "pubkey": "<user_pubkey>",
  "content": "Review text content.",
  "tags": [
    ["a", "30023:<restaurant_pubkey>:<restaurant_d_tag>"],
    ["rating", "4"],
    ["zap_amount", "420"],
    ["platform", "<nostreats_pubkey>"],
    ["supersedes", "<previous_review_event_id>"]
  ]
}
```

### Required Tags
- `a`: Reference to the restaurant addressable event
- `rating`: Integer 1-5
- `zap_amount`: Must be 86 or 420 (sats)
- `platform`: NostrEats platform pubkey

### Optional Tags
- `supersedes`: Event ID of a previous review being updated

## Review Validation Rules

A review is valid only if:

1. Rating is between 1-5 (inclusive)
2. Zap amount is exactly 86 or 420 sats
3. A zap receipt (kind 9735) exists
4. Zap recipient is the NostrEats platform pubkey
5. Zap references the review event or restaurant
6. Review is the latest by that user for that restaurant

## Zap Policy

| Amount   | Meaning         |
|----------|-----------------|
| 86 sats  | Quick review    |
| 420 sats | Detailed review |

Only these amounts are accepted. Custom amounts are rejected.

## Platform Policy Event (kind: 30078)

```json
{
  "kind": 30078,
  "pubkey": "<nostreats_pubkey>",
  "content": "NostrEats platform policy",
  "tags": [
    ["d", "nostreats-policy"],
    ["allowed_zaps", "86,420"],
    ["effective_at", "2026-01-01"],
    ["version", "1.0"]
  ]
}
```

## Community Signal (kind: 30025)

Used for community-driven signals like closure claims, duplicate detection, or disputes.

```json
{
  "kind": 30025,
  "pubkey": "<user_pubkey>",
  "content": "Signal description",
  "tags": [
    ["a", "30023:<restaurant_pubkey>:<restaurant_d_tag>"],
    ["signal_type", "closure_claim"],
    ["alt", "Community signal for NostrEats restaurant"]
  ]
}
```

## Ownership Transfer (kind: 30026)

Published by old owner when transferring restaurant to new owner.

```json
{
  "kind": 30026,
  "pubkey": "<old_owner_pubkey>",
  "content": "Ownership transfer notice",
  "tags": [
    ["a", "30023:<restaurant_pubkey>:<restaurant_d_tag>"],
    ["new_owner", "<new_owner_pubkey>"],
    ["alt", "Ownership transfer notice for NostrEats restaurant"]
  ]
}
```
