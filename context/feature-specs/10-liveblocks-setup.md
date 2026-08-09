set up the realtime collaboration infrastructure using liveblocks.

## Configuration

configure the `liveblocks.config.ts` at the project root.

Define:


### Presence
- cursor position
- `isThinking` boolean

### UserMeta

- user ID
- display name
- avatar color
- cursor color

## liveblock client

Create a cached liveblocks node client in `lib`.
Add a helper that deterministically maps a user ID to a consistent color from a fixed palette.

## auth route

create `POST /api/liveblocks-auth`.

use the project ID as the liveblocks room ID.

this route must:

1. require clerk authentication
2.verify project access using the existing access helper
3.ensure the liveblocks  room exists (create only if needed)
4.return a session token with:

  - user name 
  - avatar
  - generated cursor color

return `403` for unauthorized project access.

## dependencies
