# CXO App Directory Portal

A secure Okta-style portal built with Next.js 14, TypeScript, and Tailwind CSS. Employees authenticate with username/password and launch external enterprise applications from a responsive tile grid. Super administrators can manage users, applications, and review an append-only audit log.

## Features

- 🔐 Credential-based authentication with Argon2id hashed passwords and HttpOnly session cookies
- 👥 Role-based access control (`SUPER_ADMIN`, `USER`) with protected admin routes
- 🧱 Responsive tile directory with search-as-you-type and multi-select category filters
- ⚙️ Admin tools for managing users (invite, edit, disable, reset password) and applications (CRUD with categories & featured flag)
- 📝 Append-only audit log covering auth events and CRUD actions
- 🛡️ CSRF protection, login rate limiting, content security policy headers, and Upstash-compatible throttling
- 🚨 Automatic account lockout after repeated failed logins with admin unlock controls
- 🧪 Vitest unit tests for security utilities and key UI components

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn (examples below use `npm`)

### Install dependencies

```bash
npm install
```

### Configure environment

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
| --- | --- |
| `DATABASE_PROVIDER` | `sqlite` (dev) or `postgresql` (production) |
| `DATABASE_URL` | SQLite file path or Postgres connection string |
| `AUTH_SECRET` | Random 32+ character string for signing session cookies |
| `RATE_LIMIT_REDIS_URL` | Optional Upstash Redis REST URL for production rate limiting |
| `RATE_LIMIT_REDIS_TOKEN` | Optional Upstash Redis REST token when not using default env vars |
| `NEXT_PUBLIC_APP_NAME` | Branding for the portal header |

For Postgres on Vercel, Prisma automatically uses the `DATABASE_URL` supplied by the Vercel Postgres integration.

### Database setup

Generate the Prisma client and apply migrations:

```bash
npx prisma migrate dev
```

Seed the database (creates the super admin and sample apps):

```bash
npm run seed
```

Super admin credentials after seeding:

- Username: `admin@example.com`
- Temporary password: `ChangeMe123!` (prompted to change on first login)

### Run the app

```bash
npm run dev
```

The portal is available at [http://localhost:3000](http://localhost:3000).

### Testing & Quality

```bash
npm run lint
npm run typecheck
npm run test
```

### Continuous Integration

- The provided GitHub Actions workflow installs dependencies with `npm ci --omit=optional` to avoid downloading platform-specific SWC binaries in network-restricted runners.
- The workflow also sets `SKIP_SWC_BINARY_DOWNLOAD_FOR_CI=true` so Next.js skips binary downloads entirely and falls back to the WASM implementation, which keeps installs reliable in private registries.

### Production build

```bash
npm run build
npm run start
```

## Deployment to Vercel

1. Push this repository to GitHub.
2. Create a new Vercel project and import the GitHub repository.
3. Add the **Vercel Postgres** integration (or Neon). Copy the generated `DATABASE_URL` into the project environment variables.
4. Set environment variables in Vercel:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=<provided by Vercel Postgres>`
   - `AUTH_SECRET=<32+ random characters>`
   - `NEXT_PUBLIC_APP_NAME=<your portal name>`
   - Optional: `RATE_LIMIT_REDIS_URL=<Upstash Redis REST URL>`
5. Deploy. Vercel runs `npm run build` automatically.
6. After the first deploy, run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
7. Seed production data (optional but recommended once):
   ```bash
   npm run seed
   ```
   Use Vercel’s “Run Command” feature or a scheduled job/task.

## Architecture Notes

- **Authentication**: Custom session management backed by Prisma `Session` model. Sessions are stored as hashed tokens and set with secure, HttpOnly cookies. CSRF protection is handled via double-submit tokens in forms and API headers.
- **Authorization**: Server components and API handlers enforce role checks (`requireUserSession`, `requireSuperAdmin`). Users flagged with `mustChangePassword` are redirected to a forced password update flow.
- **Rate Limiting**: `lib/rate-limit` provides an Upstash-backed sliding window limiter with an in-memory fallback for local development.
- **Audit Logging**: All significant auth, user, and app operations append a record to the `AuditLog` table.
- **Database**: SQLite in local development; Postgres in production. See `prisma/schema.prisma` for the full data model.
- **Styling**: Tailwind CSS with custom components for tiles, admin tables, dialogs, and controls.
- **Testing**: Vitest + Testing Library cover Argon2 password helpers and interactive UI elements.

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Run TypeScript compiler in check mode |
| `npm run test` | Execute Vitest unit tests |
| `npm run seed` | Seed the database with sample data |

## Security Checklist

- Argon2id password hashing with strong parameters
- HttpOnly, SameSite=Lax session cookies (Secure in production)
- CSRF protection on all mutating routes
- Login throttling with optional Upstash Redis backend
- Automatic lockout after repeated failed logins (self-resets after 15 minutes, super admins can manually unlock)
- Content Security Policy and security headers via Next.js middleware
- Account deactivation and forced password change support

## License

MIT License © 2024
