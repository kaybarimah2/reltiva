# Reltiva Tools & Services Reference Guide

Here is a summary of all the platforms, websites, and APIs configured for Reltiva, detailing why we use them and their roles in the system.

---

## 1. GitHub
- **Website**: [github.com](https://github.com)
- **Role**: Code Repository & Version Control.
- **Why we used it**: Holds the project source code files (`/web` and `/mobile`). It serves as the primary bridge to Vercel: whenever code is pushed to GitHub, Vercel automatically detects the update and rebuilds the website.

## 2. Vercel
- **Website**: [vercel.com](https://vercel.com)
- **Role**: Web App Hosting & Deployment.
- **Why we used it**: Hosts the Next.js web application live on the internet. It handles server-side rendering, hosts the API endpoints, and manages environment variables.

## 3. Supabase
- **Website**: [supabase.com](https://supabase.com)
- **Role**: PostgreSQL Database Hosting.
- **Why we used it**: Hosts the relational database that stores all Reltiva data (users, agents, listings, images, notifications, and enquiries). Next.js communicates with it via the `DATABASE_URL` connection string.

## 4. Expo & Expo Go
- **Website**: [expo.dev](https://expo.dev)
- **Role**: Mobile Application Development Framework.
- **Why we used it**: Used to develop the iOS and Android React Native mobile apps. The **Expo Go** app (downloadable from App Store / Google Play Store) allows you to scan a QR code in your terminal and run the mobile app locally on your physical device for testing.

## 5. Paystack
- **Website**: [paystack.com](https://paystack.com)
- **Role**: Payment Gateway.
- **Why we used it**: Processes agent subscription payments (e.g., GHS 200/month for Basic, GHS 500/month for Pro) using mobile money and cards in Ghana. Webhooks notify our server when payments succeed to automatically upgrade agent accounts.

## 6. Cloudinary
- **Website**: [cloudinary.com](https://cloudinary.com)
- **Role**: Media & Image Hosting Cloud.
- **Why we used it**: Stores the high-quality photos uploaded by agents when creating property listings. It automatically optimizes and serves these images fast to both the web and mobile apps.

## 7. Resend
- **Website**: [resend.com](https://resend.com)
- **Role**: Transactional Email Provider.
- **Why we used it**: Sends email alerts, such as verifying new user sign-ups, notifying agents when a buyer submits an enquiry, and sending password reset tokens.
