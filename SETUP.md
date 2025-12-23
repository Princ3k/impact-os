# Impact OS — Setup Guide

This guide will help you get Impact OS up and running locally and deploy it.

## Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- A Google Cloud account with Gemini API access ([ai.google.dev](https://ai.google.dev))
- For iOS: macOS with Xcode installed

---

## 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd impact-os
npm install
```

---

## 2. Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

This will create:
- `entries` table for daily work logs
- `reports` table for generated summaries
- Row Level Security (RLS) policies
- Necessary indexes

### Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended)

### Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

---

## 3. Set Up Google Gemini API

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click **Get API Key**
3. Create a new API key or use an existing one
4. Copy the API key

---

## 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

---

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the login page. Try signing in with your email to test the magic link authentication.

---

## 6. Deploy to Vercel

### Option A: Deploy with Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

**Important:** Make sure to add all environment variables from `.env.local` to your Vercel project settings.

---

## 7. iOS App Setup (Optional)

To wrap the web app as an iOS app using Capacitor:

### First-time Setup

```bash
# Add iOS platform
npm run ios:setup
```

### Development Workflow

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Update `capacitor.config.ts` to point to your local server:
   ```typescript
   server: {
     url: 'http://localhost:3000',
     cleartext: true
   }
   ```

3. Sync and open Xcode:
   ```bash
   npm run ios:sync
   npm run ios:open
   ```

4. In Xcode, select a simulator or device and click Run

### Production Build for iOS

1. Build your Next.js app:
   ```bash
   npm run build
   ```

2. Remove the development server config from `capacitor.config.ts`:
   ```typescript
   server: {
     // Comment out or remove for production
   }
   ```

3. Sync and open Xcode:
   ```bash
   npm run ios:sync
   npm run ios:open
   ```

4. Build and archive in Xcode for App Store submission

---

## Troubleshooting

### "Failed to fetch entries" error
- Check that your Supabase credentials are correct in `.env.local`
- Verify the database migration ran successfully
- Check browser console for detailed error messages

### "Failed to generate report" error
- Verify your Gemini API key is correct
- Check that you have API quota remaining
- Ensure you have entries from the last 7 days

### Magic link emails not sending
- Check Supabase Auth settings
- Verify email provider is enabled
- Check spam folder
- For production, configure a custom SMTP server in Supabase

### iOS build issues
- Ensure Xcode is installed and up to date
- Run `npm run ios:sync` after any code changes
- Check that you're using macOS (required for iOS development)

---

## Next Steps

- **Customize branding:** Update logos and colors in the components
- **Add analytics:** Integrate your preferred analytics service
- **Custom domain:** Configure a custom domain in Vercel
- **Email templates:** Customize magic link emails in Supabase
- **App Store:** Submit your iOS app to the App Store

---

## Support

For issues or questions:
- Check the [GitHub Issues](your-repo/issues)
- Review Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Review Capacitor docs: [capacitorjs.com/docs](https://capacitorjs.com/docs)
