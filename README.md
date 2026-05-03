# Qorithm

Master algorithms systematically. Qorithm is a modern platform designed to streamline competitive programming practice with structured learning paths, topic-wise tracking, distraction-free preparation, and seamless platform integrations.

## Key Features
- **Curated Problem Sheets**: Follow structured tracks to master algorithms step-by-step.
- **Unified Problem Catalog**: Filter problems by search and rating.
- **Progress Dashboard**: Track your solved problems, attempt history, and daily challenge (POTD) streaks.
- **Platform Integrations**: Automatically sync your solves from Codeforces and AtCoder.
- **Professional Admin Console**: KPI-driven admin view for managing users, problems, topics, and viewing global activity.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, shadcn/ui
- **Database ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon/Supabase)

## Getting Started

First, install dependencies:
```bash
npm install
```

Configure your environment variables by copying the example file:
```bash
cp .env.example .env.local
```

Initialize your database:
```bash
npm run db:push
npx tsx scripts/apply_schema.ts
npm run db:seed
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
