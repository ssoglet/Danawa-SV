# replit.md

## Overview

This is a **Korean automotive sales tracking dashboard** ("자동차 판매 레이더") that displays trending/surging car models based on Danawa sales data. The application tracks domestic (Korean) and imported car sales, calculating "surge scores" based on month-over-month changes, percentage growth, and rank movement. Users can filter by nation, month, minimum sales threshold, and exclude new entries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: Shadcn/ui component library (New York style) built on Radix UI primitives
- **Build Tool**: Vite with path aliases (`@/` for client source, `@shared/` for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Development**: Vite middleware for HMR in development, static file serving in production

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` - contains both database schemas and Zod validation schemas
- **Validation**: Zod schemas with drizzle-zod integration for type-safe API contracts
- **Current State**: Uses in-memory mock data generation in `server/storage.ts`; database tables defined but not actively used for radar data

### Scoring Algorithm
The "surge score" for ranking models uses a weighted z-score formula:
- 55% weight: Month-over-month absolute change
- 35% weight: Month-over-month percentage change (capped at 500%)
- 10% weight: Rank improvement

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including Shadcn primitives
    pages/        # Route pages (dashboard, not-found)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer (currently mock data)
  vite.ts         # Vite dev server integration
  static.ts       # Production static file serving
shared/           # Shared TypeScript types and schemas
  schema.ts       # Zod schemas and Drizzle table definitions
```

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: For schema migrations (`npm run db:push`)
- **connect-pg-simple**: Session storage (available but not currently used)

### UI/Component Libraries
- **Radix UI**: Full suite of accessible primitives (dialog, dropdown, tabs, etc.)
- **Shadcn/ui**: Pre-built component styling system
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality

### Data/State
- **TanStack React Query**: Async state management with caching
- **Zod**: Runtime type validation
- **date-fns**: Date formatting utilities

### Build/Dev Tools
- **Vite**: Frontend bundling with React plugin
- **esbuild**: Server-side bundling for production
- **TSX**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator