# MAM Meditation App - Project Rules

## Project Overview
Cross-platform spiritual wellness & meditation app (React Native CLI) with admin panel (React.js/Vite) and backend (Node.js/Express/Supabase).

## Architecture
- **Mobile**: `mobile/` - React Native CLI 0.76+, TypeScript strict, NativeWind v4, React Navigation v7, React Query v5, Zustand v4
- **Admin**: `admin/` - React.js (Vite), Tailwind CSS, Shadcn/UI, TanStack Table, Recharts, React Router v7
- **Backend**: `backend/` - Node.js v22, Express.js, Supabase (Postgres + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)

## Design System
- Primary: `#1B4332`, Secondary: `#2D6A4F`, Accent: `#40916C`
- Background: `#FAFAF5`, Surface: `#FFFFFF`
- Fonts: Inter (body), Playfair Display (headings/quotes)
- Spacing: 4px base unit
- Border radius: 12px cards, 8px buttons, 24px pills

## Development Rules

### Safety
- NEVER overwrite files outside `c:/Projects/MAM Project/`
- NEVER commit .env files, API keys, or secrets
- ALWAYS run tests after making changes
- ALWAYS create git commits before large refactors
- NEVER use `git reset --hard` or `git push --force` without explicit approval
- ALWAYS verify the target file exists before editing

### TypeScript
- Strict mode enabled - no `any` types
- Use named exports, not default exports
- Use ES module imports
- All function signatures must have type annotations

### React Native (Mobile)
- Functional components with hooks only
- Use NativeWind classes for styling (no inline StyleSheet unless necessary)
- React Query for all server state
- Zustand for client-only state
- Secure token storage via react-native-keychain (NEVER AsyncStorage for tokens)

### Backend
- All endpoints follow REST conventions
- Standard response envelope: `{ success, data, error, meta }`
- Input validation with Zod on every endpoint
- Auth middleware on all routes except /auth/*
- Rate limiting on sensitive endpoints (OTP, payments)

### Testing
- Jest for unit and integration tests
- React Native Testing Library for component tests
- Supertest for API endpoint tests
- Min 70% coverage for business logic
- Min 90% coverage for auth and payment modules

### Git
- Branch naming: `feature/`, `fix/`, `chore/` prefixes
- Atomic commits - one logical change per commit
- No committing node_modules, build artifacts, or .env files

## Key Documentation
- Implementation Plan: `docs/IMPLEMENTATION_PLAN.md`
- Progress Tracker: `docs/PROGRESS_TRACKER.md`
- Phase docs: `docs/phases/PHASE_*_*.md`

## Common Commands
```bash
# Mobile
cd mobile && npx react-native start          # Start Metro bundler
cd mobile && npx react-native run-android    # Run on Android
cd mobile && npx react-native run-ios        # Run on iOS
cd mobile && npm test                         # Run tests

# Admin
cd admin && npm run dev                       # Start dev server
cd admin && npm run build                     # Production build
cd admin && npm test                          # Run tests

# Backend
cd backend && npm run dev                     # Start with hot reload
cd backend && npm test                        # Run tests
cd backend && npm run test:integration        # Integration tests
```
