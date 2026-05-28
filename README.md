# Reltiva - Real Estate Property Listing Platform for Ghana

Reltiva is a modern property search and listing platform tailored for Ghana, bringing affordable housing options to everyday Ghanaians. Inspired by Zoopla and Rightmove, it features a web app and a mobile app sharing a unified backend database and API.

## Project Structure

```
reltiva/
├── web/                  # Next.js 14 App Router, NextAuth, Prisma, Web Frontend, and API routes
├── mobile/               # Expo React Native App (iOS and Android)
└── README.md             # This guide
```

## Tech Stack

- **Web Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + PWA
- **Mobile Frontend**: Expo (React Native) with TypeScript
- **Shared Backend**: Next.js API Routes (acting as a unified API for web and mobile)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials & Google OAuth)
- **Email**: Resend
- **Payments**: Paystack
- **Images**: Cloudinary
- **Maps**: Google Maps API

---

## Getting Started

### Prerequisites

- Node.js (v18.x or v20.x recommended)
- PostgreSQL database instance (local or hosted, e.g., Supabase / Railway)
- Expo Go app installed on your mobile device (for local mobile testing)

### 1. Web & Backend Setup

1. Navigate to the `web` directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment file and configure variables:
   ```bash
   cp .env.example .env
   ```
   *Modify `.env` to include your PostgreSQL connection string, NextAuth secrets, Paystack keys, etc.*

4. Set up the database schema & seed data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Run the web dev server:
   ```bash
   npm run dev
   ```
   *The web app will be available at `http://localhost:3000`.*

### 2. Mobile App Setup

1. Navigate to the `mobile` directory:
   ```bash
   cd ../mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Expo server:
   ```bash
   npm start
   ```
4. Scan the QR code in your terminal with your phone (using Expo Go for Android or Camera for iOS) to run the application.

---

## Deployment

- **Web / Backend API**: Vercel
- **Database**: Railway / Supabase
