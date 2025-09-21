# Overview

This is a Discord verification bot system built with a React frontend and Express backend. The application provides a comprehensive solution for Discord servers to implement member verification through referrals. Users can be verified by existing members, and the system tracks verification statistics and recent activity. The bot integrates directly with Discord's API to handle slash commands and manage server configurations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Library**: Comprehensive shadcn/ui component system built on Radix UI primitives, providing a complete set of accessible components (buttons, dialogs, forms, tables, etc.).

**Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes. The design system uses a neutral base color scheme.

**State Management**: TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic updates.

**Routing**: Wouter for lightweight client-side routing with minimal bundle size impact.

**Project Structure**: 
- Components organized in `client/src/components/` with UI components in `ui/` subdirectory
- Pages in `client/src/pages/`
- Shared utilities and hooks in respective directories
- Custom hooks for mobile detection and toast notifications

## Backend Architecture

**Framework**: Express.js with TypeScript, providing RESTful API endpoints.

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations. Uses Neon Database as the serverless PostgreSQL provider.

**Schema Design**: 
- Server configurations for Discord server settings
- Verification requests tracking user verification status
- Verification statistics for dashboard metrics
- All tables include proper timestamps and UUID primary keys

**Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation for development/demo purposes, easily replaceable with database implementation.

**API Structure**:
- `/api/server-config/:serverId` - Server configuration management
- `/api/verification-requests` - Verification request handling
- `/api/verification-stats/:serverId` - Statistics retrieval

## Discord Bot Integration

**Discord.js**: Full Discord API integration supporting slash commands, button interactions, and select menus.

**Bot Features**:
- `/configurar verificar` slash command for server setup
- Interactive embeds for verification process
- Button and select menu handlers for user interactions
- Real-time Discord server integration

**Architecture**: Bot runs alongside the web server, sharing the same storage layer for consistency.

## External Dependencies

**Database**: 
- Neon Database (serverless PostgreSQL)
- Drizzle ORM with Drizzle Kit for migrations
- Connection pooling through `@neondatabase/serverless`

**Discord Integration**:
- Discord.js v14 for bot functionality
- Discord OAuth integration capabilities

**UI Framework**:
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for consistent iconography

**Development Tools**:
- TypeScript for type safety
- ESBuild for production builds
- Vite for development server and hot reload
- Replit-specific plugins for development environment

**Validation**: 
- Zod for runtime type validation
- Drizzle-Zod for database schema validation
- React Hook Form with Zod resolvers for form validation

**Date Handling**: date-fns for date manipulation and formatting

**Session Management**: Built-in session handling with PostgreSQL session storage via `connect-pg-simple`