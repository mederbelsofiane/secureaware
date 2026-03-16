# SecureAware — Security Awareness Training Platform

A modern, production-ready security awareness training platform built with Next.js 14, TypeScript, PostgreSQL, and Prisma.

## Features

- **Public Marketing Site** — Hero, features, about, and contact pages
- **Employee Dashboard** — Training modules, quizzes, phishing simulations, certificates, leaderboard
- **Admin Dashboard** — User management, campaigns, custom quizzes, reports, contact request review
- **Role-Based Access Control** — Guest, Employee, and Admin roles with server-side enforcement
- **Custom Quiz Builder** — Create, edit, publish, and assign quizzes to departments
- **Phishing Training** — Interactive phishing email examples with red flag identification
- **Gamification** — Badges, certificates, risk scores, and leaderboards
- **Real-Time Analytics** — Charts, progress tracking, and exportable reports

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Validation**: Zod schemas (client + server)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd security-awareness-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed the database with demo data
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/security_awareness
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Demo Accounts

> ⚠️ **For development/testing only. Do not use in production.**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@secureaware.com | Admin123! |
| Employee | employee@secureaware.com | Employee123! |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public marketing pages
│   ├── (auth)/            # Login and register pages
│   ├── dashboard/         # Employee dashboard pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar, Layouts
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── validations/       # Zod schemas
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── server-auth.ts     # Server-side auth helpers
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript type definitions
└── middleware.ts          # Route protection middleware
```

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| GET | /api/stats | Admin | Admin dashboard stats |
| GET | /api/stats/employee | Employee | Employee dashboard stats |
| GET/POST | /api/users | Admin | List/create users |
| GET/PUT/DELETE | /api/users/[id] | Admin | User CRUD |
| GET | /api/modules | Auth | List training modules |
| GET | /api/modules/[id] | Auth | Module details |
| POST | /api/modules/[id]/progress | Employee | Update lesson progress |
| GET/POST | /api/quizzes | Auth/Admin | List/create quizzes |
| GET/PUT/DELETE | /api/quizzes/[id] | Auth/Admin | Quiz CRUD |
| POST | /api/quizzes/[id]/submit | Employee | Submit quiz answers |
| GET/POST | /api/quizzes/[id]/assign | Admin | Quiz assignments |
| GET | /api/quizzes/[id]/results | Admin | Quiz results |
| GET/POST | /api/campaigns | Admin | List/create campaigns |
| GET/PUT/DELETE | /api/campaigns/[id] | Admin | Campaign CRUD |
| GET/POST | /api/contacts | Public/Admin | Contact form / list requests |
| GET/PUT | /api/contacts/[id] | Admin | Contact request detail |
| GET | /api/departments | Auth | List departments |
| GET | /api/badges | Auth | List badges |
| GET | /api/activities | Auth | Recent activities |
| GET | /api/reports | Admin | Analytics data |
| GET/PUT | /api/profile | Employee | User profile |

## Security

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## License

MIT
