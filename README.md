<div align="center">

# 🛡️ SecureAware

### Enterprise Security Awareness Training Platform

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

A production-ready, multi-tenant SaaS platform that transforms your workforce into your strongest security asset through intelligent phishing simulations, adaptive training, and real-time risk analytics.

[Live Demo](https://secureaware.online) · [Features](#-features) · [Quick Start](#-quick-start) · [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🏢 Multi-Tenant Architecture
- **Organization Isolation** — Complete data separation between tenants
- **Custom Branding** — Each organization can upload their logo and display their name
- **Subscription Management** — Plan tracking, seat limits, billing, and event history
- **Invitation System** — Admins invite employees via secure token-based links

### 👑 Super Admin Portal
- **Organization Management** — Create, edit, suspend, and delete organizations
- **Admin Provisioning** — Create admin accounts for each organization
- **Global Analytics** — Cross-tenant stats, plan distribution, user counts
- **Subscription Control** — Manage plans, seat limits, billing, and payment events
- **Audit Logs** — Complete trail of all administrative actions

### 🔐 Admin Dashboard
- **User Management** — Create, edit, deactivate users with department assignments
- **Campaign Management** — Training campaigns, phishing simulations, assessments
- **Custom Quiz Builder** — Create, publish, and assign quizzes to departments
- **Risk Analytics** — Department-level risk scores, trend analysis, exportable reports
- **Contact Request Review** — Manage incoming demo and support requests
- **Settings** — SMTP email configuration, maintenance mode, branding
- **Subscription View** — Current plan, seat usage, billing details (read-only)

### 📚 Employee Learning Dashboard
- **Training Modules** — 15+ modules with 45+ detailed lessons across security topics
- **Interactive Lesson Viewer** — Rich content rendering with reading progress tracking
- **Quizzes & Assessments** — 11+ quizzes with 60+ questions and instant results
- **Phishing Simulations** — 8+ realistic phishing scenarios with red flag identification
- **Gamification** — Badges, certificates, risk scores, and leaderboards
- **Progress Tracking** — Module completion, quiz scores, and learning history

### 🌐 Public Marketing Site
- **Landing Page** — Hero section, features grid, testimonials, and plan comparison
- **About Page** — Company information and mission
- **Features Page** — Detailed platform capabilities
- **Contact Form** — Demo requests with admin notification
- **Plan Cards** — 4-tier plan comparison (Free, Starter, Professional, Enterprise)

### 🎨 UI/UX
- **Dark Cybersecurity Theme** — Professional dark mode with accent colors
- **Light Mode Support** — Full light/dark theme toggle with smooth transitions
- **Multilingual** — English, French, and Arabic with RTL support
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Animations** — Smooth page transitions with Framer Motion

### 🔒 Security
- **Role-Based Access Control** — Super Admin, Admin, Employee, Guest
- **Tenant Isolation** — All queries scoped to organization
- **HTTPS/SSL** — TLS encryption with HSTS
- **Secure Headers** — CSP, X-Frame-Options, X-Content-Type-Options
- **Input Validation** — Zod schemas on client and server
- **Password Hashing** — bcryptjs with 12 rounds
- **JWT Sessions** — 8-hour expiry with NextAuth.js
- **Audit Logging** — All administrative mutations tracked
- **Rate Limiting** — Nginx-level request throttling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (JWT strategy) |
| **Validation** | Zod |
| **Email** | Nodemailer (SMTP) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Containerization** | Docker & Docker Compose |
| **Reverse Proxy** | Nginx |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [Git](https://git-scm.com/downloads) installed

### 1. Clone & Configure

```bash
git clone https://github.com/mederbelsofiane/secureaware.git
cd secureaware
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://secadmin:SecurePass123@db:5432/security_awareness"
NEXTAUTH_SECRET="your-random-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Build & Start

```bash
docker compose up -d --build
```

Wait ~5-7 minutes for the first build.

### 3. Setup Database

```bash
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

### 4. Open the App

🌐 **http://localhost:3000**

---

## 🔑 Default Accounts

> ⚠️ **For development/testing only. Change passwords in production.**

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Super Admin** | `superadmin@secureaware.online` | `SuperAdmin123!@#` | `/super-admin` |
| **Org Admin** | `admin@secureaware.online` | `Admin123!@#` | `/admin` |
| **Employee** | `employee@secureaware.online` | `Employee123!` | `/dashboard` |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/              # Public marketing pages (home, about, features, contact)
│   ├── (auth)/                # Login and registration pages
│   ├── dashboard/             # Employee learning dashboard
│   ├── admin/                 # Organization admin dashboard
│   ├── super-admin/           # Super admin portal
│   ├── maintenance/           # Maintenance mode page
│   ├── api/                   # API routes
│   │   ├── auth/              #   Authentication (login, register, session)
│   │   ├── super-admin/       #   Super admin APIs (orgs, admins, audit-logs)
│   │   ├── admin/             #   Org admin APIs (subscription)
│   │   ├── organizations/     #   Organization management (logo upload)
│   │   ├── users/             #   User CRUD
│   │   ├── modules/           #   Training modules
│   │   ├── lessons/           #   Lesson content
│   │   ├── quizzes/           #   Quiz management & submission
│   │   ├── campaigns/         #   Campaign management
│   │   ├── departments/       #   Department management
│   │   ├── stats/             #   Dashboard statistics
│   │   ├── reports/           #   Analytics & reports
│   │   ├── settings/          #   Platform settings & maintenance
│   │   ├── invitations/       #   Employee invitation system
│   │   └── ...                #   Badges, activities, contacts, profile, leaderboard
│   ├── layout.tsx             # Root layout with theme/language providers
│   └── globals.css            # Global styles & design tokens
├── components/
│   ├── layout/                # Navbar, Footer, Sidebar
│   └── ui/                    # Reusable UI components (theme toggle, etc.)
├── hooks/                     # Custom hooks (auth, fetch, theme, language)
├── i18n/                      # Translations (en, fr, ar)
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── server-auth.ts         # Server-side auth helpers & tenant isolation
│   ├── db.ts                  # Prisma client
│   ├── validations/           # Zod schemas
│   ├── services/              # Email service (nodemailer)
│   └── maintenance.ts         # Maintenance mode logic
├── types/                     # TypeScript type definitions
└── middleware.ts              # Route protection middleware

prisma/
├── schema.prisma              # Database schema (13+ models)
└── seed.ts                    # Demo data seeder
```

---

## 🗄️ Database Schema

### Core Models
| Model | Description |
|-------|-------------|
| `Organization` | Multi-tenant org with plan, status, branding, billing |
| `User` | Users with roles (SUPER_ADMIN, ADMIN, EMPLOYEE, GUEST) |
| `Department` | Org departments with risk scores and completion rates |
| `Module` | Training modules (15 categories) |
| `Lesson` | Module lessons with rich content |
| `Quiz` | Assessments with questions and scoring |
| `Campaign` | Training campaigns and phishing simulations |
| `Badge` | Gamification badges |
| `Certificate` | Completion certificates |
| `PhishingExample` | Phishing simulation scenarios |
| `SubscriptionEvent` | Payment and plan change tracking |
| `Activity` | User activity tracking |
| `AuditLog` | Administrative action audit trail |
| `Setting` | Global platform settings |
| `OrgSetting` | Per-organization settings |
| `Invitation` | Employee invitation tokens |
| `ContactRequest` | Demo/contact form submissions |

---

## 🌍 API Routes

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user + create organization |
| GET/POST | `/api/auth/[...nextauth]` | Public | NextAuth.js handlers |

### Super Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/super-admin/stats` | Super Admin | Global platform statistics |
| GET/POST | `/api/super-admin/organizations` | Super Admin | List/create organizations |
| GET/PUT/DELETE | `/api/super-admin/organizations/[id]` | Super Admin | Org CRUD |
| GET/POST | `/api/super-admin/organizations/[id]/admins` | Super Admin | Manage org admins |
| PUT/DELETE | `/api/super-admin/organizations/[id]/admins/[adminId]` | Super Admin | Admin CRUD |
| GET/POST | `/api/super-admin/organizations/[id]/subscription` | Super Admin | Subscription management |
| PUT | `/api/super-admin/organizations/[id]/subscription/update` | Super Admin | Update plan/billing |
| GET | `/api/super-admin/audit-logs` | Super Admin | Audit log viewer |

### Organization Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | Admin | Dashboard statistics |
| GET/POST | `/api/users` | Admin | User management |
| GET/PUT/DELETE | `/api/users/[id]` | Admin | User CRUD |
| GET/POST | `/api/departments` | Admin | Department management |
| GET/POST | `/api/quizzes` | Admin | Quiz management |
| GET/PUT/DELETE | `/api/quizzes/[id]` | Admin | Quiz CRUD |
| POST | `/api/quizzes/[id]/assign` | Admin | Assign quizzes |
| GET/POST | `/api/campaigns` | Admin | Campaign management |
| GET/PUT/DELETE | `/api/campaigns/[id]` | Admin | Campaign CRUD |
| GET | `/api/reports` | Admin | Analytics data |
| GET/PUT | `/api/settings` | Admin | Platform settings |
| POST | `/api/settings/test-email` | Admin | Test SMTP configuration |
| GET | `/api/admin/subscription` | Admin | View subscription details |
| POST | `/api/organizations/logo` | Admin | Upload org logo |
| POST | `/api/invitations` | Admin | Invite employees |

### Employee
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats/employee` | Employee | Dashboard stats |
| GET | `/api/modules` | Auth | Training modules |
| GET | `/api/modules/[id]` | Auth | Module details |
| POST | `/api/modules/[id]/progress` | Auth | Update progress |
| GET | `/api/lessons/[id]` | Auth | Lesson content |
| POST | `/api/quizzes/[id]/submit` | Auth | Submit quiz |
| GET | `/api/leaderboard` | Auth | Rankings |
| GET/PUT | `/api/profile` | Auth | User profile |

---

## 🐳 Docker Commands

| Task | Command |
|------|--------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Rebuild | `docker compose down && docker compose up -d --build` |
| View logs | `docker compose logs -f app` |
| Push schema | `docker compose exec app npx prisma db push` |
| Seed data | `docker compose exec app npx prisma db seed` |
| Reset database | `docker compose down -v && docker compose up -d --build` |
| Clear build cache | `docker builder prune -af` |
| Shell access | `docker compose exec app sh` |

---

## 🚢 Production Deployment

### VPS Deployment

```bash
# On your VPS
git clone https://github.com/mederbelsofiane/secureaware.git
cd secureaware

# Configure environment
cp .env.example .env
nano .env  # Set production DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Build and start
docker compose up -d --build

# Wait ~5-7 minutes, then:
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |

---

## 🔧 Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data
npx prisma db seed

# Start dev server
npm run dev
```

### Useful Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 📄 License

MIT — See [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ by [SecureAware](https://secureaware.online)

</div>
