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

## Project Structure
- Next.js App Router with (admin) and (legal) route groups
- Supabase for authentication and data storage
- React components organized by feature area
- Tailwind CSS for styling