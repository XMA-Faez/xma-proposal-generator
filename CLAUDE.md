# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run seed:admin`: Create admin user (takes email and password arguments)

## Code Style Guidelines
- **TypeScript**: Strict typing required, follow tsconfig.json settings
- **ESLint**: Next.js core-web-vitals and typescript rules
- **React**: Use functional components with hooks
- **Imports**: Use absolute imports with '@/' prefix (e.g., `import { X } from '@/components/ui'`)
- **Components**: Follow established organization in components/ directory
- **API Routes**: Follow Next.js App Router conventions
- **Error Handling**: Use try/catch in API routes and async functions
- **Naming**: Use PascalCase for components, camelCase for functions and variables
- **Path Aliases**: Use '@/' for imports from project root

## High-Level Architecture

### Tech Stack
- **Next.js 15.3.1** with App Router - React framework
- **Supabase** - Backend (PostgreSQL + Auth + Row Level Security)
- **TypeScript** - Type safety with strict mode
- **Tailwind CSS v4** - Styling with custom configuration
- **React Query** (TanStack Query) - Server state management
- **Radix UI** - Accessible component primitives
- **React PDF** - PDF generation for proposals

### Authentication Flow
1. **Multi-layered security**:
   - Server: `supabase.auth.getUser()` for secure verification
   - Client: `AuthProvider` context for UI state
   - API: `requireAuth()` and `requireAdmin()` helpers
   - Middleware: Session cookie updates via `updateSession()`

2. **Role-based access control**:
   - `admin`: Full system access
   - `sales_rep`: Limited to own proposals
   - `deactivated`: Access revoked state

3. **Key auth files**:
   - `/lib/auth-helpers.ts` - Server auth utilities
   - `/lib/api-auth.ts` - API route protection
   - `/components/auth/AuthProvider.tsx` - Client auth context
   - `/middleware.ts` - Cookie handling

### Database Patterns
1. **Dual storage strategy**:
   - Normalized relational data for queries
   - JSONB snapshots for proposal rendering
   - This ensures historical proposals remain intact

2. **Row Level Security (RLS)**:
   - Database-level access control
   - Admins can see all data
   - Sales reps see only their own data

3. **Order ID generation**:
   - Format: `XMA-YYYY-MM-00001`
   - Sequential numbering per month
   - Handled in `/lib/orderIdGenerator.ts`

4. **Soft deletes**:
   - Use `archived_at` timestamp
   - Data is never permanently deleted

### Component Organization
- `/components/ui/` - Reusable UI components (shadcn/ui pattern)
- `/components/admin/` - Admin interface components
- `/components/proposal/` - Proposal creation and display
- `/components/auth/` - Authentication components

### API Route Patterns
All API routes should follow this pattern:
```typescript
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;
  
  // Route logic here
}
```

### State Management
1. **Server state**: React Query with 5-minute stale time
2. **Client state**: React Context (AuthProvider)
3. **URL state**: Query parameters for filters

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL
```

## Important Implementation Notes

### Supabase Client Usage
- Server Components: Use `createClient()` from `/utils/supabase/server`
- Client Components: Use `createBrowserClient()` from `/utils/supabase/client`
- Never use service role client in client components

### Proposal System
- Proposals have a dual storage approach (relational + JSONB)
- Always store complete proposal data in `proposal_data` field
- Use `encoded_data` for URL-based sharing
- Validity periods tracked with `expires_at` field

### Discount System
Three levels of discounts:
1. Package discounts (applied to selected package)
2. Service discounts (applied individually)
3. Overall discounts (applied to total)

Each can be percentage or fixed amount.

### Testing Note
**No automated tests exist** - TypeScript and ESLint errors are ignored in build configuration. Manual testing is required for all changes.