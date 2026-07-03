# Office Hours

Office Hours is a simple check-in and check-out tracker for office attendance logs. Users can create API keys, call a tracking endpoint from iPhone or Android location automations, review logs in the app, manually add entries, and export filtered tracking data as CSV.

## Features

- Account login with Better Auth
- API key management from the profile page
- Tracking API for phone automation workflows
- Manual check-in and check-out entry
- Dashboard with activity totals and recent logs
- Tracking logs table with filtering by type and tag
- Timestamp sorting from latest to oldest by default
- CSV export with a hard cap of 10,000 rows
- Terms and privacy pages

## Tech Stack

- Next.js
- React
- TypeScript
- Drizzle ORM
- PostgreSQL
- Better Auth
- TanStack Query
- TanStack Table
- Tailwind CSS
- Bun

## Getting Started

Install dependencies:

```bash
bun install
```

Create an environment file:

```bash
cp .env.example .env
```

Update `.env` with your database, auth, OAuth, and email settings.

Push the database schema:

```bash
bun run db:push
```

Start the development server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Tracking API

Create an API key from the profile page, then call:

```text
POST /api/track
```

Headers:

```text
x-api-key: YOUR_API_KEY
content-type: application/json
```

Body:

```json
{
  "type": "check_in",
  "tag": "office"
}
```

`type` must be `check_in` or `check_out`. `tag` is optional.

Example:

```bash
curl -X POST http://localhost:3000/api/track \
  -H "x-api-key: YOUR_API_KEY" \
  -H "content-type: application/json" \
  -d '{"type":"check_in","tag":"office"}'
```

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript checks
bun run format       # Format source files
bun run db:push      # Push Drizzle schema
bun run db:studio    # Open Drizzle Studio
```

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
