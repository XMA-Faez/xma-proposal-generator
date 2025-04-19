# XMA Agency Proposal Generator

A Next.js application for creating and managing client proposals with Supabase authentication.

## Features

- Secure authentication with Supabase
- Role-based access control for admin users
- Proposal generation with custom packages and services
- Client management
- Shareable proposal links

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or bun
- Supabase account and project

### Setting Up Supabase

1. Create a new project in the [Supabase Dashboard](https://app.supabase.com/)
2. Set up the database schema:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Run the SQL schema from `supabase/schema.sql`
3. Configure authentication:
   - In the Supabase dashboard, go to Authentication → Settings
   - Enable Email authentication
   - Set up any other authentication providers you need
4. Get your API keys:
   - Navigate to Project Settings → API
   - Copy the `URL` and `anon key` 
   - Also copy the `service_role key` for admin setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/xma-proposal-generator.git
cd xma-proposal-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Create an `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

5. Create an admin user:
```bash
npm run seed:admin admin@xmaagency.com your-secure-password
# or
yarn seed:admin admin@xmaagency.com your-secure-password
# or
bun seed:admin admin@xmaagency.com your-secure-password
```

6. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

### Adding Initial Data

1. Log in with your admin account at `/login`
2. To add packages and services to your database:
   - Add packages with features in the Supabase dashboard or via SQL
   - Add services with pricing details in the Supabase dashboard or via SQL

### Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - React components
- `lib/` - Utility functions and services
- `public/` - Static assets
- `supabase/` - Supabase configuration and schema
- `scripts/` - Helper scripts for database setup
- `types/` - TypeScript type definitions

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to a Git repository
2. Import your project to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features and API.
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - learn about TailwindCSS styling.
- [React Query Documentation](https://tanstack.com/query) - learn about React Query data fetching.
